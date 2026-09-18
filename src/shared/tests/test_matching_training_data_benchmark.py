"""
Tests for offline matching benchmark against training labels.
"""

from __future__ import annotations

import math
from collections.abc import Callable
from io import StringIO

import pytest
from django.core.management import call_command

from shared.evaluation import derivation_as_key
from shared.matching_training_data import ensure_benchmark_evaluation
from shared.matching_training_data.benchmark import (
    AggregateReport,
    ProposalScore,
    aggregate,
    label_sets,
    rematch,
    score_proposal,
    snr,
)
from shared.models.cve import Container
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
    PackageOverlay,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import NixDerivation


def _proposal(
    container: Container,
    *derivations: NixDerivation,
    status: str = CVEDerivationClusterProposal.Status.ACCEPTED,
    rejection_reason: str | None = None,
    ignored: tuple[str, ...] = (),
) -> CVEDerivationClusterProposal:
    proposal = CVEDerivationClusterProposal.objects.create(
        cve=container.cve,
        status=status,
        rejection_reason=rejection_reason,
        algorithm_version=CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION,
    )
    for drv in derivations:
        DerivationClusterProposalLink.objects.create(
            proposal=proposal,
            derivation=drv,
            provenance_flags=int(ProvenanceFlags.PACKAGE_NAME_MATCH),
        )
    for attr in ignored:
        PackageOverlay.objects.create(
            suggestion=proposal,
            package_attribute=attr,
            type=PackageOverlay.Type.IGNORED,
        )
    return proposal


def test_snr() -> None:
    assert snr(4, 2) == 2.0
    assert snr(1, 0) == math.inf
    assert math.isnan(snr(0, 0))
    with pytest.raises(ValueError, match="non-negative"):
        snr(-1, 0)


def test_aggregate_snr() -> None:
    report = aggregate(
        [
            ProposalScore(
                cve_id="CVE-1",
                true_positives=2,
                false_positives=1,
                rejection_agree=True,
                snr=2.0,
            ),
            ProposalScore(
                cve_id="CVE-2",
                true_positives=0,
                false_positives=1,
                rejection_agree=False,
                snr=0.0,
            ),
        ]
    )
    assert report == AggregateReport(
        proposals=2,
        true_positives=2,
        false_positives=2,
        rejection_agree_count=1,
        snr=1.0,
    )


def test_accepted_kept_hit(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
) -> None:
    pkg = "benchtpuniq"
    drv = make_drv(pname=pkg, version="1.0", attribute=pkg)
    container = make_container(
        cve_id="CVE-2026-bench-tp", package_name=pkg, product=pkg
    )
    proposal = _proposal(container, drv)

    kept, ignored = label_sets(proposal)
    assert ignored == set()
    metadata = drv.metadata
    assert kept == {
        derivation_as_key(
            drv_path=drv.derivation_path,
            attr=drv.attribute,
            name=drv.name,
            meta_name=metadata.name if metadata is not None else None,
        )
    }

    score = score_proposal(proposal, rematch(proposal))
    assert score.true_positives == 1
    assert score.false_positives == 0
    assert score.rejection_agree


def test_ignored_overlay_counts_as_fp(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
) -> None:
    pkg = "benchfpuniq"
    tests_attr = f"{pkg}.tests"
    drv = make_drv(pname=pkg, version="1.0", attribute=pkg)
    tests_drv = make_drv(pname=f"{pkg}-tests", version="1.0", attribute=tests_attr)
    container = make_container(
        cve_id="CVE-2026-bench-fp", package_name=pkg, product=pkg
    )
    proposal = _proposal(container, drv, tests_drv, ignored=(tests_attr,))

    kept, ignored = label_sets(proposal)
    assert ignored == {tests_attr}
    tests_metadata = tests_drv.metadata
    assert (
        derivation_as_key(
            drv_path=tests_drv.derivation_path,
            attr=tests_drv.attribute,
            name=tests_drv.name,
            meta_name=tests_metadata.name if tests_metadata is not None else None,
        )
        not in kept
    )

    score = score_proposal(proposal, rematch(proposal))
    assert score.true_positives == 1
    assert score.false_positives == 1


def test_auto_reject_empty_no_fp(
    make_container: Callable[..., Container],
) -> None:
    container = make_container(
        cve_id="CVE-2026-bench-rej",
        package_name="zzz_no_such_bench_pkg_xyz",
        product="zzz_no_such_bench_pkg_xyz",
    )
    proposal = _proposal(
        container,
        status=CVEDerivationClusterProposal.Status.REJECTED,
        rejection_reason=CVEDerivationClusterProposal.RejectionReason.NO_MATCHES,
    )
    kept, _ = label_sets(proposal)
    assert kept == set()

    score = score_proposal(proposal, rematch(proposal))
    assert score.true_positives == 0
    assert score.false_positives == 0
    assert score.rejection_agree


def test_benchmark_matching_command_summary(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
) -> None:
    pkg = "benchcmduniq"
    evaluation = ensure_benchmark_evaluation()
    drv = make_drv(pname=pkg, version="1.0", attribute=pkg, evaluation=evaluation)
    container = make_container(
        cve_id="CVE-2026-bench-cmd", package_name=pkg, product=pkg
    )
    _proposal(container, drv)
    out = StringIO()
    call_command("benchmark_matching", stdout=out)
    text = out.getvalue()
    assert "Querying curated matching data..." in text
    assert "true_positives" in text
