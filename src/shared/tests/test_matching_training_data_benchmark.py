"""
Tests for offline matching benchmark against training labels.
"""

from __future__ import annotations

import json
import math
from collections import Counter
from collections.abc import Callable
from io import StringIO
from pathlib import Path
from typing import Any

import pytest
from django.core.management import call_command

from shared.evaluation import derivation_as_key
from shared.matching_training_data import ensure_benchmark_evaluation
from shared.matching_training_data.benchmark import (
    AggregateReport,
    ProposalScore,
    Tally,
    aggregate,
    label_sets,
    rematch,
    score_proposal,
    snr,
    snr_for_json,
    tally_matches,
)
from shared.matching_training_data.serializers import TRAINING_ORG_UUID
from shared.models.cve import Container, Organization
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
    PackageOverlay,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import NixDerivation
from shared.models.package import Package


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
            package=Package.objects.get_or_create(name=attr)[0],
            type=PackageOverlay.Type.IGNORED,
        )
    return proposal


def test_snr() -> None:
    assert snr(4, 2) == 2.0
    assert snr(1, 0) == math.inf
    assert math.isnan(snr(0, 0))
    with pytest.raises(ValueError, match="non-negative"):
        snr(-1, 0)


def test_snr_for_json() -> None:
    assert snr_for_json(1.5) == 1.5
    assert snr_for_json(math.inf) == "inf"
    assert snr_for_json(math.nan) == "nan"

    score = ProposalScore(
        cve_id="CVE-1",
        true_positives=1,
        false_positives=0,
        unreviewed=0,
        rejection_agree=True,
        snr=math.inf,
    )
    assert score.snr == math.inf
    assert score.model_dump(mode="json")["snr"] == "inf"
    assert (
        AggregateReport(
            proposals=0,
            true_positives=0,
            false_positives=0,
            unreviewed=0,
            rejection_agree_count=0,
            snr=math.nan,
        ).model_dump(mode="json")["snr"]
        == "nan"
    )


def test_aggregate_snr() -> None:
    report = aggregate(
        [
            ProposalScore(
                cve_id="CVE-1",
                true_positives=2,
                false_positives=1,
                unreviewed=0,
                rejection_agree=True,
                snr=2.0,
            ),
            ProposalScore(
                cve_id="CVE-2",
                true_positives=0,
                false_positives=1,
                unreviewed=0,
                rejection_agree=False,
                snr=0.0,
            ),
        ]
    )
    assert report == AggregateReport(
        proposals=2,
        true_positives=2,
        false_positives=2,
        unreviewed=0,
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


def test_matches_never_shown_to_the_curator_are_unreviewed(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
) -> None:
    pkg = "benchnewuniq"
    kept = make_drv(pname=pkg, attribute=pkg)
    ignored = make_drv(pname=f"{pkg}-doc", attribute=f"{pkg}-doc")
    make_drv(pname=f"{pkg}-extra", attribute=f"{pkg}-extra")
    container = make_container(
        cve_id="CVE-2026-bench-new", package_name=pkg, product=None
    )
    proposal = _proposal(container, kept, ignored, ignored=(f"{pkg}-doc",))

    score = score_proposal(proposal, rematch(proposal))
    assert (score.true_positives, score.false_positives, score.unreviewed) == (1, 1, 1)


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


def test_rematch_sees_benchmark_derivations(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
) -> None:
    pkg = "benchvisibleuniq"
    drv = make_drv(
        pname=pkg,
        version="1.0",
        attribute=pkg,
        evaluation=ensure_benchmark_evaluation(),
    )
    container = make_container(
        cve_id="CVE-2026-bench-visible", package_name=pkg, product=pkg
    )
    proposal = _proposal(container, drv)

    score = score_proposal(proposal, rematch(proposal))
    assert score.true_positives == 1


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
    err = StringIO()
    call_command("benchmark_matching", stdout=out, stderr=err)
    assert "Querying curated matching data..." in err.getvalue()
    assert "true_positives" in out.getvalue()


def test_benchmark_matching_writes_json_report(
    tmp_path: Path,
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
) -> None:
    pkg = "benchjsonuniq"
    drv = make_drv(pname=pkg, version="1.0", attribute=pkg)
    container = make_container(
        cve_id="CVE-2026-bench-json", package_name=pkg, product=pkg
    )
    org, _created = Organization.objects.get_or_create(
        uuid=TRAINING_ORG_UUID,
        defaults={"short_name": "training"},
    )
    container.cve.assigner = org
    container.cve.save(update_fields=["assigner"])
    _proposal(container, drv)

    report_path = tmp_path / "nested" / "report.json"
    call_command(
        "benchmark_matching",
        "--quiet",
        "--output",
        str(report_path),
    )

    # One accepted link to the package the CVE names.
    # The matcher sees that same package, so the hit is clean and SNR is infinite.
    assert json.loads(report_path.read_text()) == {
        "aggregate": {
            "proposals": 1,
            "true_positives": 1,
            "false_positives": 0,
            "unreviewed": 0,
            "rejection_agree_count": 1,
            "snr": "inf",
        },
        "scores": [
            {
                "cve_id": "CVE-2026-bench-json",
                "true_positives": 1,
                "false_positives": 0,
                "unreviewed": 0,
                "rejection_agree": True,
                "snr": "inf",
            }
        ],
    }


def add_to_training_corpus(container: Container) -> None:
    org, _created = Organization.objects.get_or_create(
        uuid=TRAINING_ORG_UUID,
        defaults={"short_name": "training"},
    )
    container.cve.assigner = org
    container.cve.save(update_fields=["assigner"])


@pytest.mark.parametrize(
    "derivations, overlays, status, matched, kept, ignored",
    [
        # Attribute names are counted once however many systems carry them.
        pytest.param(
            [("foo", "x86_64-linux"), ("foo", "aarch64-linux")],
            (),
            CVEDerivationClusterProposal.Status.ACCEPTED,
            1,
            1,
            0,
            id="name-counted-once-across-systems",
        ),
        pytest.param(
            [("foo", "x86_64-linux"), ("foo.tests", "x86_64-linux")],
            ("foo.tests",),
            CVEDerivationClusterProposal.Status.ACCEPTED,
            2,
            1,
            1,
            id="ignored-name-is-not-kept",
        ),
        # An ignored package the suggestion does not link is not counted.
        pytest.param(
            [("baz", "x86_64-linux")],
            ("gone",),
            CVEDerivationClusterProposal.Status.PUBLISHED,
            1,
            1,
            0,
            id="ignore-on-unlinked-package-not-counted",
        ),
        pytest.param(
            [("qux", "x86_64-linux")],
            (),
            CVEDerivationClusterProposal.Status.REJECTED,
            1,
            0,
            0,
            id="rejection-keeps-nothing",
        ),
    ],
)
def test_tally_matches_counts_attribute_names(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
    derivations: list[tuple[str, str]],
    overlays: tuple[str, ...],
    status: CVEDerivationClusterProposal.Status,
    matched: int,
    kept: int,
    ignored: int,
) -> None:
    proposal = _proposal(
        make_container(cve_id="CVE-2026-lbl", package_name="a"),
        *(
            make_drv(pname=attribute, attribute=attribute, system=system)
            for attribute, system in derivations
        ),
        status=status,
        rejection_reason=(
            CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS
            if status == CVEDerivationClusterProposal.Status.REJECTED
            else None
        ),
        ignored=overlays,
    )

    assert tally_matches(
        CVEDerivationClusterProposal.objects.filter(pk=proposal.pk)
    ).attribute_counts == {
        status: Tally[int](
            matched=Counter({matched: 1}),
            kept=Counter({kept: 1}),
            ignored=Counter({ignored: 1}),
        )
    }


def test_tally_matches_counts_provenance_per_flag(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
) -> None:
    container = make_container(cve_id="CVE-2026-lbl-flags", package_name="a")
    proposal = _proposal(container, ignored=("noisy",))
    for attr, system, flags in (
        (
            "good",
            "x86_64-linux",
            ProvenanceFlags.CPE_MATCH | ProvenanceFlags.PRODUCT_MATCH,
        ),
        (
            "good",
            "aarch64-linux",
            ProvenanceFlags.CPE_MATCH | ProvenanceFlags.PRODUCT_MATCH,
        ),
        (
            "noisy",
            "x86_64-linux",
            ProvenanceFlags.CPE_MATCH | ProvenanceFlags.PACKAGE_NAME_MATCH,
        ),
    ):
        DerivationClusterProposalLink.objects.create(
            proposal=proposal,
            derivation=make_drv(pname=attr, attribute=attr, system=system),
            provenance_flags=int(flags),
        )

    # An attribute name with several flags counts towards each of them.
    # Each attribute name counts once, however many systems carry it.
    assert tally_matches(
        CVEDerivationClusterProposal.objects.filter(pk=proposal.pk)
    ).provenance == {
        CVEDerivationClusterProposal.Status.ACCEPTED: Tally[ProvenanceFlags](
            matched=Counter(
                {
                    ProvenanceFlags.CPE_MATCH: 2,
                    ProvenanceFlags.PRODUCT_MATCH: 1,
                    ProvenanceFlags.PACKAGE_NAME_MATCH: 1,
                }
            ),
            kept=Counter(
                {
                    ProvenanceFlags.CPE_MATCH: 1,
                    ProvenanceFlags.PRODUCT_MATCH: 1,
                    ProvenanceFlags.PACKAGE_NAME_MATCH: 0,
                }
            ),
            ignored=Counter(
                {
                    ProvenanceFlags.CPE_MATCH: 1,
                    ProvenanceFlags.PRODUCT_MATCH: 0,
                    ProvenanceFlags.PACKAGE_NAME_MATCH: 1,
                }
            ),
        )
    }


def test_tally_matches_accumulates_per_status(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
) -> None:
    proposals = [
        _proposal(
            make_container(cve_id=cve_id, package_name="a"),
            make_drv(pname=cve_id, attribute=cve_id),
        )
        for cve_id in ("CVE-2026-lbl-one", "CVE-2026-lbl-two")
    ]

    tallies = tally_matches(
        CVEDerivationClusterProposal.objects.filter(
            pk__in=[proposal.pk for proposal in proposals]
        )
    )

    assert tallies.attribute_counts[
        CVEDerivationClusterProposal.Status.ACCEPTED
    ].matched == Counter({1: 2})


def test_tally_only_does_not_run_the_matcher(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
) -> None:
    container = make_container(cve_id="CVE-2026-lbl-norun", package_name="a")
    add_to_training_corpus(container)
    _proposal(container, make_drv(pname="a", attribute="a"))

    def fail(*args: Any, **kwargs: Any) -> None:
        raise AssertionError("matcher ran")

    monkeypatch.setattr("shared.management.commands.benchmark_matching.rematch", fail)
    monkeypatch.setattr(
        "shared.matching_training_data.benchmark.resolve_linkage_candidates", fail
    )
    path = tmp_path / "labels.json"
    call_command("benchmark_matching", "--tally-only", "--quiet", "--output", str(path))

    assert "scores" not in json.loads(path.read_text())
