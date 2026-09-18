"""
Score matcher output against curated training-data labels.

Fingerprint identity is a derivation key shared with evaluation ingestion.
Call the linkage resolver only - do not persist new proposals.
"""

from __future__ import annotations

import math
from collections.abc import Iterable
from dataclasses import dataclass

from django.db.models import Q, QuerySet

from shared.evaluation import DerivationKey, derivation_as_key
from shared.listeners.automatic_linkage import (
    LinkageOutcome,
    resolve_linkage_candidates,
)
from shared.matching_training_data.serializers import (
    _TRAINING_ORG_UUID,
    BENCHMARK_CHANNEL_BRANCH,
    pick_first_container,
)
from shared.models.linkage import CVEDerivationClusterProposal, PackageOverlay


def label_sets(
    original_match: CVEDerivationClusterProposal,
) -> tuple[set[DerivationKey], set[str]]:
    """
    Return kept fingerprints and ignored package attributes for a proposal.
    """
    ignored = {
        overlay.package_attribute
        for overlay in original_match.package_overlays.all()
        if overlay.type == PackageOverlay.Type.IGNORED
    }
    if original_match.status == CVEDerivationClusterProposal.Status.REJECTED:
        return set(), ignored

    kept: set[DerivationKey] = set()
    for link in original_match.derivationclusterproposallink_set.select_related(
        "derivation__metadata"
    ):
        drv = link.derivation
        if drv.attribute in ignored:
            continue
        metadata = drv.metadata
        kept.add(
            derivation_as_key(
                drv_path=drv.derivation_path,
                attr=drv.attribute,
                name=drv.name,
                meta_name=metadata.name if metadata is not None else None,
            )
        )
    return kept, ignored


def snr(true_positives: int, false_positives: int) -> float:
    if true_positives < 0 or false_positives < 0:
        raise ValueError(
            f"true_positives and false_positives must be non-negative, "
            f"got {true_positives} and {false_positives}"
        )
    if false_positives > 0:
        return true_positives / false_positives
    if true_positives > 0:
        return math.inf
    return math.nan


@dataclass(frozen=True)
class ProposalScore:
    cve_id: str
    true_positives: int
    false_positives: int
    rejection_agree: bool
    snr: float


@dataclass(frozen=True)
class AggregateReport:
    proposals: int
    true_positives: int
    false_positives: int
    rejection_agree_count: int
    snr: float


def rematch(original: CVEDerivationClusterProposal) -> LinkageOutcome:
    """
    Re-run the matcher on the CVE container from a curated training match.
    """
    container = pick_first_container(original)
    if container is None:
        return LinkageOutcome()
    return resolve_linkage_candidates(container)


def score_proposal(
    original: CVEDerivationClusterProposal,
    new_match: LinkageOutcome,
) -> ProposalScore:
    """
    Compare a rematch outcome to curated labels for one training proposal.
    """
    kept, _ignored = label_sets(original)
    proposed: set[DerivationKey] = set()
    if new_match.derivations:
        proposed = {
            derivation_as_key(
                drv_path=drv.derivation_path,
                attr=drv.attribute,
                name=drv.name,
                meta_name=drv.metadata.name if drv.metadata is not None else None,
            )
            for drv in new_match.derivations
        }
    outcome_rejection = (
        new_match.rejection.reason if new_match.rejection is not None else None
    )

    true_positives = len(proposed & kept)
    false_positives = len(proposed - kept)
    return ProposalScore(
        cve_id=original.cve.cve_id,
        true_positives=true_positives,
        false_positives=false_positives,
        rejection_agree=original.rejection_reason == outcome_rejection,
        snr=snr(true_positives, false_positives),
    )


def aggregate(scores: Iterable[ProposalScore]) -> AggregateReport:
    scores_list = list(scores)
    true_positives = sum(s.true_positives for s in scores_list)
    false_positives = sum(s.false_positives for s in scores_list)
    return AggregateReport(
        proposals=len(scores_list),
        true_positives=true_positives,
        false_positives=false_positives,
        rejection_agree_count=sum(1 for s in scores_list if s.rejection_agree),
        snr=snr(true_positives, false_positives),
    )


def training_corpus_queryset() -> QuerySet[CVEDerivationClusterProposal]:
    """
    User-curated proposals from the synthetic benchmark or training import graph.
    """
    return (
        CVEDerivationClusterProposal.objects.user_curated()
        .filter(
            Q(
                derivationclusterproposallink__derivation__parent_evaluation__channel__channel_branch=BENCHMARK_CHANNEL_BRANCH
            )
            | Q(cve__assigner__uuid=_TRAINING_ORG_UUID)
        )
        .distinct()
        .select_related("cve")
        .prefetch_related(
            "package_overlays",
            "derivationclusterproposallink_set__derivation",
            "cve__container__tags",
            "cve__container__affected__cpes",
        )
        .order_by("pk")
    )
