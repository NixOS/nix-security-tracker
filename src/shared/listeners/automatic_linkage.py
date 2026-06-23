# ============================================================================
# ⚠️ IMPORTANT: MATCHING ALGORITHM VERSIONING
#
# When modifying this module, you MUST bump
# CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION.
#
# Otherwise algorithm_version for matched proposal may become inconsistent.
# ============================================================================

import logging

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
from shared.models.linkage import CVEDerivationClusterProposal, ProvenanceFlags
from shared.models.nix_evaluation import NixChannel, NixDerivation, NixEvaluation

logger = logging.getLogger(__name__)


def produce_linkage_candidates(
    container: Container,
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

    if container.tags.filter(value="exclusively-hosted-service").exists():
        logger.info(
            "Container for '%s' is exclusively-hosted-service, rejecting without match.",
            container.cve,
        )
        CVEDerivationClusterProposal.objects.create(
            cve=container.cve,
            status=CVEDerivationClusterProposal.Status.REJECTED,
            rejection_reason=CVEDerivationClusterProposal.RejectionReason.EXCLUSIVELY_HOSTED_SERVICE,
            algorithm_version=CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION,
        )
        return True

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
        CVEDerivationClusterProposal.objects.create(
            cve=container.cve,
            status=CVEDerivationClusterProposal.Status.REJECTED,
            rejection_reason=CVEDerivationClusterProposal.RejectionReason.HARDWARE_ONLY_CPE,
            algorithm_version=CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION,
        )
        return True

    matches = produce_linkage_candidates(container, filtered_affected)
    if not matches.exists():
        logger.info("No derivations matching '%s', ignoring", container.cve)
        return False

    match_count = matches.count()
    if match_count > settings.MAX_MATCHES:
        logger.info(
            "Container for '%s' exceeds MAX_MATCHES (%d > %d), rejecting without match.",
            container.cve,
            match_count,
            settings.MAX_MATCHES,
        )
        CVEDerivationClusterProposal.objects.create(
            cve=container.cve,
            status=CVEDerivationClusterProposal.Status.REJECTED,
            rejection_reason=CVEDerivationClusterProposal.RejectionReason.MAX_MATCHES_EXCEEDED,
            rejection_match_count=match_count,
            rejection_max_matches_limit=settings.MAX_MATCHES,
            algorithm_version=CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION,
        )
        return True

    with_known_vuln = matches.filter(
        metadata__known_vulnerabilities__contains=[container.cve.cve_id],
    )

    if with_known_vuln.exists():
        proposal = CVEDerivationClusterProposal.objects.create(
            cve=container.cve,
            status=CVEDerivationClusterProposal.Status.REJECTED,
            rejection_reason=CVEDerivationClusterProposal.RejectionReason.KNOWN_VULNERABILITY,
            algorithm_version=CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION,
        )
        drvs_to_attach = with_known_vuln
    else:
        proposal = CVEDerivationClusterProposal.objects.create(
            cve=container.cve,
            algorithm_version=CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION,
        )
        drvs_to_attach = matches

    drvs_throughs = [
        CVEDerivationClusterProposal.derivations.through(
            proposal_id=proposal.pk,
            derivation_id=drv.pk,
            provenance_flags=ProvenanceFlags(
                getattr(drv, "package_match", 0) | getattr(drv, "product_match", 0)
            ),
        )
        for drv in drvs_to_attach
    ]

    # We create all the set in one shot.
    CVEDerivationClusterProposal.derivations.through.objects.bulk_create(drvs_throughs)

    if drvs_throughs:
        logger.info(
            "Matching suggestion for '%s': %d derivations found.",
            container.cve,
            len(drvs_throughs),
        )

    return True


@pgpubsub.post_insert_listener(ContainerChannel)
def build_new_links_following_new_containers(old: Container, new: Container) -> None:
    build_new_links(new)
