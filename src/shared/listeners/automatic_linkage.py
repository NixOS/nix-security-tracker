# ============================================================================
# ⚠️ IMPORTANT: MATCHING ALGORITHM VERSIONING
#
# When modifying this module, you MUST bump
# CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION.
#
# Otherwise algorithm_version for matched proposal may become inconsistent.
# ============================================================================

import logging
from dataclasses import dataclass, field

import pgpubsub
from django.conf import settings
from django.db import models
from django.db.models import (
    Case,
    Exists,
    IntegerField,
    OuterRef,
    Q,
    Value,
    When,
)

from shared.channels import ContainerChannel
from shared.models.cve import Container, Cpe
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import NixChannel, NixDerivation, NixEvaluation

logger = logging.getLogger(__name__)


@dataclass
class Rejection:
    reason: CVEDerivationClusterProposal.RejectionReason
    # Populated when match limit exceeded
    match_count: int = 0
    max_matches_limit: int = 0


@dataclass
class LinkageOutcome:
    """
    Result of evaluating a container's linkage candidates.

    - rejection=None      no rejection; derivations holds links to attach
    - rejection set       container warrants a rejected proposal
    - derivations=None    no links should be attached
    - derivations=non-empty  links to attach
    """

    rejection: Rejection | None = None
    derivations: models.QuerySet | None = field(default=None)


def resolve_linkage_candidates(container: Container) -> LinkageOutcome:
    """
    Evaluate a container and return what derivation links it should have.
    Used by both initial link creation and suggestion refresh.
    """
    if container.tags.filter(value="exclusively-hosted-service").exists():
        logger.info(
            "Container for '%s' is exclusively-hosted-service, rejecting without match.",
            container.cve,
        )
        return LinkageOutcome(
            rejection=Rejection(
                reason=CVEDerivationClusterProposal.RejectionReason.EXCLUSIVELY_HOSTED_SERVICE,
            ),
        )

    # FIXME(@fricklerhandwerk): This only works because we're validating syntax on ingestion.
    # Use a proper parsing library such as https://github.com/nilp0inter/cpe to work on structured data.
    # That particular one looks like the best candidate, but appears unmaintained (or could just be very stable); needs thorough review before adopting it.
    has_any_cpe = Exists(Cpe.objects.filter(affectedproduct=OuterRef("pk")))
    has_non_hardware_cpe = Exists(
        Cpe.objects.filter(affectedproduct=OuterRef("pk")).exclude(
            name__istartswith="cpe:2.3:h:"
        )
    )
    filtered_affected = container.affected.exclude(has_any_cpe & ~has_non_hardware_cpe)

    if container.affected.exists() and not filtered_affected.exists():
        logger.info(
            "Container for '%s' has only hardware CPEs, rejecting without match.",
            container.cve,
        )
        return LinkageOutcome(
            rejection=Rejection(
                reason=CVEDerivationClusterProposal.RejectionReason.HARDWARE_ONLY_CPE,
            ),
        )

    matches = produce_linkage_candidates(filtered_affected)

    if not matches.exists():
        logger.info("No derivations matching '%s'.", container.cve)
        return LinkageOutcome(
            rejection=Rejection(
                reason=CVEDerivationClusterProposal.RejectionReason.NO_MATCHES,
            ),
        )

    match_count = matches.count()
    if match_count > settings.MAX_MATCHES:
        logger.info(
            "Container for '%s' exceeds MAX_MATCHES (%d > %d), rejecting without match.",
            container.cve,
            match_count,
            settings.MAX_MATCHES,
        )
        return LinkageOutcome(
            rejection=Rejection(
                reason=CVEDerivationClusterProposal.RejectionReason.MAX_MATCHES_EXCEEDED,
                match_count=match_count,
                max_matches_limit=settings.MAX_MATCHES,
            ),
        )

    with_known_vuln = matches.filter(
        metadata__known_vulnerabilities__contains=[container.cve.cve_id],
    )

    if with_known_vuln.exists():
        return LinkageOutcome(
            rejection=Rejection(
                reason=CVEDerivationClusterProposal.RejectionReason.KNOWN_VULNERABILITY,
            ),
            derivations=with_known_vuln,
        )

    return LinkageOutcome(derivations=matches)


def build_derivation_links(
    proposal: CVEDerivationClusterProposal,
    derivations: models.QuerySet,
) -> list[DerivationClusterProposalLink]:
    """Build DerivationClusterProposalLink."""
    return [
        DerivationClusterProposalLink(
            proposal=proposal,
            derivation=drv,
            provenance_flags=ProvenanceFlags(
                getattr(drv, "package_match", 0) | getattr(drv, "product_match", 0)
            ),
        )
        for drv in derivations
    ]


def produce_linkage_candidates(
    filtered_affected: models.QuerySet,
) -> models.QuerySet:
    latest_complete_channels = NixEvaluation.objects.filter(
        channel__state__in=NixChannel.TRACKED_STATES,
    ).latest_completed_per_channel()

    package_names = (
        filtered_affected.exclude(package_name__isnull=True)
        .values_list("package_name", flat=True)
        .distinct()
    )
    products = (
        filtered_affected.exclude(product__isnull=True)
        .values_list("product", flat=True)
        .distinct()
    )

    package_q = Q()
    for name in package_names:
        package_q |= Q(name__icontains=name)

    product_q = Q()
    for product in products:
        product_q |= Q(name__icontains=product)

    # This does not seem to happen in practice though
    if not package_q | product_q:
        return NixDerivation.objects.none()

    annotations = {}
    if package_q:
        annotations["package_match"] = Case(
            When(package_q, then=Value(ProvenanceFlags.PACKAGE_NAME_MATCH)),
            default=Value(0),
            output_field=IntegerField(),
        )
    if product_q:
        annotations["product_match"] = Case(
            When(product_q, then=Value(ProvenanceFlags.PRODUCT_MATCH)),
            default=Value(0),
            output_field=IntegerField(),
        )

    # Methodology:
    # We start with a large list and we remove things as we sort out that list.
    # Our initialization must be as large as possible.
    # TODO: record what is used to expand the candidate list.
    # TODO: improve accuracy by using bigrams similarity with a `| Q(...)` query.
    matches = (
        NixDerivation.objects.exclude(
            # Test derivations are a Nixpkgs implementation detail and never represent software to be distributed.
            attribute__startswith="tests.",
        )
        .filter(
            package_q | product_q,
            parent_evaluation__in=list(latest_complete_channels),
        )
        .select_related("metadata")
        .annotate(**annotations)
    )

    # TODO: restrain further the list by checking all version constraints.
    # TODO: restrain further the list by checking hardware constraints or kernel constraints.
    # Remove anything that says that it's *not* the list of potential kernel that are in use:
    # macOS, Linux, Windows, *BSD.
    # TODO: teach it about newcomers kernels such as Redox.

    return matches


def build_new_links(container: Container) -> bool:
    if container.cve.triaged:
        logger.info(
            "Container received for '%s', but already triaged, skipping linkage.",
            container.cve,
        )
        return False

    if CVEDerivationClusterProposal.objects.filter(
        cve=container.cve,
        algorithm_version=CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION,
    ).exists():
        logger.info("Suggestion already exists for '%s', skipping", container.cve)
        return False

    outcome = resolve_linkage_candidates(container)

    proposal = CVEDerivationClusterProposal.objects.create(
        cve=container.cve,
        status=(
            CVEDerivationClusterProposal.Status.REJECTED
            if outcome.rejection
            else CVEDerivationClusterProposal.Status.PENDING
        ),
        rejection_reason=outcome.rejection.reason if outcome.rejection else None,
        rejection_match_count=outcome.rejection.match_count or None
        if outcome.rejection
        else None,
        rejection_max_matches_limit=outcome.rejection.max_matches_limit or None
        if outcome.rejection
        else None,
        algorithm_version=CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION,
    )

    if outcome.derivations:
        links = build_derivation_links(proposal, outcome.derivations)
        DerivationClusterProposalLink.objects.bulk_create(links)
        logger.info(
            "Matching suggestion for '%s': %d derivations found.",
            container.cve,
            len(links),
        )

    return True


@pgpubsub.post_insert_listener(ContainerChannel)
def build_new_links_following_new_containers(old: Container, new: Container) -> None:
    build_new_links(new)
