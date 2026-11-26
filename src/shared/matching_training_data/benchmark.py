"""
Score matcher output against curated training-data labels.

Fingerprint identity is a derivation key shared with evaluation ingestion.
Call the linkage resolver only - do not persist new proposals.
"""

from __future__ import annotations

import math
import random
from collections import Counter, defaultdict
from collections.abc import Iterable
from typing import Annotated, Any

from django.contrib.postgres.aggregates import BitOr
from django.db.models import Q, QuerySet
from pydantic import BaseModel, ConfigDict, Field, PlainSerializer, field_serializer

from shared.evaluation import DerivationKey, derivation_as_key
from shared.listeners.automatic_linkage import (
    LinkageOutcome,
    resolve_linkage_candidates,
)
from shared.matching_training_data.serializers import (
    BENCHMARK_RELEASE_BRANCH,
    TRAINING_ORG_UUID,
    pick_first_container,
)
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
    PackageOverlay,
    ProvenanceFlags,
    SuggestionStatus,
)


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


def snr_for_json(value: float) -> float | str:
    """
    Encode SNR for JSON.

    Finite values stay numbers.
    Infinity and NaN become strings, which JSON can store.
    """
    if math.isinf(value):
        return "inf"
    if math.isnan(value):
        return "nan"
    return value


Snr = Annotated[float, PlainSerializer(snr_for_json, when_used="json")]


class ProposalScore(BaseModel):
    model_config = ConfigDict(frozen=True)

    cve_id: str
    true_positives: int
    false_positives: int
    unreviewed: int
    rejection_agree: bool
    snr: Snr


class AggregateReport(BaseModel):
    model_config = ConfigDict(frozen=True)

    proposals: int
    true_positives: int
    false_positives: int
    unreviewed: int
    rejection_agree_count: int
    snr: Snr


class BenchmarkReport(BaseModel):
    """
    Aggregate and per-CVE scores written by the benchmark command.
    """

    model_config = ConfigDict(frozen=True)

    aggregate: AggregateReport
    scores: list[ProposalScore]


class Tally[Key](BaseModel):
    """
    How often each value of some property occurs among the curated matches, before and after curation.
    """

    matched: Counter[Key] = Field(
        default_factory=Counter,
        description="""
        Occurrences in the linked set, before any curation.
        """,
    )
    kept: Counter[Key] = Field(
        default_factory=Counter,
        description="""
        Occurrences remaining after curation.
        Always zero for rejected suggestions, because rejection discards the whole match.
        """,
    )
    ignored: Counter[Key] = Field(
        default_factory=Counter,
        description="""
        Occurrences the curator explicitly ignored.
        Ignore decisions on packages the suggestion does not link are not counted.
        """,
    )

    @field_serializer("matched", "kept", "ignored")
    def serialize_counter(self, counter: Counter[Key]) -> dict[Any, int]:
        """
        Name the flags in reports, since their numeric values are meaningless to readers.
        """
        return {
            key.name if isinstance(key, ProvenanceFlags) else key: count
            for key, count in sorted(counter.items())
        }


class MatchTallies(BaseModel):
    attribute_counts: dict[SuggestionStatus, Tally[int]] = Field(
        default_factory=dict,
        description="""
        Number of suggestions per number of distinct attribute names.
        For example, `{1: 5, 3: 2}` means five suggestions with one name and two suggestions with three names.
        """,
    )
    provenance: dict[SuggestionStatus, Tally[ProvenanceFlags]] = Field(
        default_factory=dict,
        description="""
        Number of attribute names per provenance flag, showing which reasons for a match tend to survive curation.
        An attribute name with several flags counts towards each of them.
        """,
    )


def tally_matches(proposals: QuerySet[CVEDerivationClusterProposal]) -> MatchTallies:
    statuses = dict(proposals.values_list("pk", "status"))
    flags_by_proposal: defaultdict[int, dict[str, int]] = defaultdict(dict)
    for row in (
        DerivationClusterProposalLink.objects.filter(proposal__in=statuses)
        .values("proposal_id", "derivation__attribute")
        .annotate(flags=BitOr("provenance_flags"))
        .order_by()
        .iterator(chunk_size=10_000)
    ):
        flags_by_proposal[row["proposal_id"]][row["derivation__attribute"]] = row[
            "flags"
        ]
    ignored_by_suggestion: defaultdict[int, set[str]] = defaultdict(set)
    for suggestion_id, attribute in PackageOverlay.objects.filter(
        suggestion__in=statuses, type=PackageOverlay.Type.IGNORED
    ).values_list("suggestion_id", "package_attribute"):
        ignored_by_suggestion[suggestion_id].add(attribute)

    tallies = MatchTallies()
    flag_bits = [(flag, flag.value) for flag in ProvenanceFlags]
    for proposal_id, proposal_status in statuses.items():
        flags_by_attribute = flags_by_proposal[proposal_id]
        matched = set(flags_by_attribute)
        ignored = matched & ignored_by_suggestion[proposal_id]
        kept = (
            set()
            if proposal_status == CVEDerivationClusterProposal.Status.REJECTED
            else matched - ignored
        )
        status = SuggestionStatus(proposal_status)
        attribute_counts = tallies.attribute_counts.setdefault(status, Tally[int]())
        attribute_counts.matched[len(matched)] += 1
        attribute_counts.kept[len(kept)] += 1
        attribute_counts.ignored[len(ignored)] += 1
        provenance = tallies.provenance.setdefault(status, Tally[ProvenanceFlags]())
        for attribute, attribute_flags in flags_by_attribute.items():
            for flag, bit in flag_bits:
                if attribute_flags & bit:
                    provenance.matched[flag] += 1
                    if attribute in kept:
                        provenance.kept[flag] += 1
                    if attribute in ignored:
                        provenance.ignored[flag] += 1
    return tallies


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
    reviewed = {
        derivation_as_key(
            drv_path=link.derivation.derivation_path,
            attr=link.derivation.attribute,
            name=link.derivation.name,
            meta_name=link.derivation.metadata.name
            if link.derivation.metadata is not None
            else None,
        )
        for link in original.derivationclusterproposallink_set.select_related(
            "derivation__metadata"
        )
    }
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
    false_positives = len(proposed & reviewed - kept)
    return ProposalScore(
        cve_id=original.cve.cve_id,
        true_positives=true_positives,
        false_positives=false_positives,
        unreviewed=len(proposed - reviewed),
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
        unreviewed=sum(s.unreviewed for s in scores_list),
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
                derivationclusterproposallink__derivation__parent_evaluation__on_branches__name=BENCHMARK_RELEASE_BRANCH
            )
            | Q(cve__assigner__uuid=TRAINING_ORG_UUID)
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


def sample_corpus(
    proposals: QuerySet[CVEDerivationClusterProposal], size: int
) -> QuerySet[CVEDerivationClusterProposal]:
    pks = list(proposals.values_list("pk", flat=True))
    return proposals.filter(pk__in=random.Random(0).sample(pks, min(size, len(pks))))
