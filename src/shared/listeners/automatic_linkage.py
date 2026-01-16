import logging

import pgpubsub
from django.conf import settings
from django.db.models import Case, F, IntegerField, Q, Value, When, Window
from django.db.models.functions import RowNumber

from shared.channels import ContainerChannel
from shared.models.cve import Container
from shared.models.linkage import CVEDerivationClusterProposal, ProvenanceFlags
from shared.models.nix_evaluation import (
    NixDerivation,
    NixEvaluation,
)

logger = logging.getLogger(__name__)


def produce_linkage_candidates(
    container: Container,
) -> dict[NixDerivation, ProvenanceFlags]:
    latest_complete_channels = (
        NixEvaluation.objects.filter(
            state=NixEvaluation.EvaluationState.COMPLETED,
        )
        .annotate(
            row_num=Window(
                expression=RowNumber(),
                partition_by=[F("channel")],
                order_by=F("updated_at").desc(),
            ),
        )
        .filter(row_num=1)
    )

    package_names = (
        container.affected.exclude(package_name__isnull=True)
        .values_list("package_name", flat=True)
        .distinct()
    )
    products = (
        container.affected.exclude(product__isnull=True)
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
        return {}

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
    candidates: dict[NixDerivation, ProvenanceFlags] = {}
    # TODO: improve accuracy by using bigrams similarity with a `| Q(...)` query.
    matches = NixDerivation.objects.filter(
        package_q | product_q,
        parent_evaluation__in=list(latest_complete_channels),
    ).annotate(**annotations)
    for drv in matches.iterator():
        flags = getattr(drv, "package_match", 0) | getattr(drv, "product_match", 0)
        candidates[drv] = ProvenanceFlags(flags)

    # TODO: restrain further the list by checking all version constraints.
    # TODO: restrain further the list by checking hardware constraints or kernel constraints.
    # Remove anything that says that it's *not* the list of potential kernel that are in use:
    # macOS, Linux, Windows, *BSD.
    # TODO: teach it about newcomers kernels such as Redox.

    return candidates


def build_new_links(container: Container) -> bool:
    if container.cve.triaged:
        logger.info(
            "Container received for '%s', but already triaged, skipping linkage.",
            container.cve,
        )
        return False

    if CVEDerivationClusterProposal.objects.filter(cve=container.cve).exists():
        logger.info("Suggestion already exists for '%s', skipping", container.cve)
        return False

    drvs = produce_linkage_candidates(container)
    if not drvs:
        logger.info("No derivations matching '%s', ignoring", container.cve)
        return False

    if len(drvs) > settings.MAX_MATCHES:
        logger.warning(
            "More than '%d' derivations matching '%s', ignoring",
            settings.MAX_MATCHES,
            container.cve,
        )
        return False

    proposal = CVEDerivationClusterProposal.objects.create(cve=container.cve)

    drvs_throughs = [
        CVEDerivationClusterProposal.derivations.through(
            proposal_id=proposal.pk, derivation_id=drv.pk, provenance_flags=flags
        )
        for drv, flags in drvs.items()
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
