"""Tests for fetch/import matching training-data management commands."""

from __future__ import annotations

import json
from collections.abc import Callable
from io import StringIO
from pathlib import Path
from typing import Any, cast
from unittest.mock import Mock, patch

import pytest
from django.core.management import call_command
from django.core.management.base import CommandError

from shared.matching_training_data import SCHEMA_VERSION
from shared.matching_training_data import serializers as mtd
from shared.matching_training_data.purge import purge_training_corpus
from shared.matching_training_data.serializers import (
    _TRAINING_ORG_UUID,
    BENCHMARK_CHANNEL_BRANCH,
)
from shared.models.cve import Container, CveRecord
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
    PackageOverlay,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import NixChannel, NixDerivation, NixEvaluation


def _export(proposal: CVEDerivationClusterProposal) -> dict[str, Any]:
    return cast(dict[str, Any], dict(mtd.CVEDerivationClusterProposal(proposal).data))


def _sample_api_record(cve_id: str = "CVE-2026-9001") -> dict[str, Any]:
    return {
        "schema_version": SCHEMA_VERSION,
        "cve_id": cve_id,
        "container": {
            "tags": [],
            "affected": [
                {
                    "vendor": "acme",
                    "product": "widget",
                    "package_name": "foo",
                    "cpes": ["cpe:2.3:a:acme:widget:1.0:*:*:*:*:*:*:*"],
                },
            ],
        },
        "status": "accepted",
        "rejection_reason": None,
        "comment": None,
        "rejection_match_count": None,
        "rejection_max_matches_limit": None,
        "algorithm_version": 1,
        "derivationclusterproposallink_set": [
            {
                "derivation": {
                    "attribute": "foo",
                    "name": "foo-1.0",
                    "system": "x86_64-linux",
                    "known_vulnerabilities": [],
                },
                "provenance_flags": int(ProvenanceFlags.PACKAGE_NAME_MATCH),
            },
        ],
        "package_overlays": [],
    }


def _json_response(payload: dict[str, Any], status_code: int = 200) -> Mock:
    resp = Mock()
    resp.status_code = status_code
    resp.json.return_value = payload
    resp.text = json.dumps(payload)
    return resp


def test_fetch_requires_token(tmp_path: Path) -> None:
    with pytest.raises(CommandError, match="MATCHING_TRAINING_DATA_TOKEN"):
        call_command(
            "fetch_matching_training_data",
            "--base-url",
            "https://tracker.example",
            "--output",
            str(tmp_path),
            stdout=StringIO(),
        )


def test_fetch_paginates_and_writes_pages(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("MATCHING_TRAINING_DATA_TOKEN", "secret-token")
    page1 = _sample_api_record("CVE-2026-0001")
    page2 = _sample_api_record("CVE-2026-0002")
    next_url = (
        "https://tracker.example/api/v1/matching-training-data?page=2&page_size=100"
    )

    responses = [
        _json_response(
            {
                "count": 2,
                "next": next_url,
                "previous": None,
                "results": [page1],
            }
        ),
        _json_response(
            {
                "count": 2,
                "next": None,
                "previous": next_url.replace("page=2", "page=1"),
                "results": [page2],
            }
        ),
    ]

    with patch("requests.get", side_effect=responses) as get_mock:
        call_command(
            "fetch_matching_training_data",
            "--base-url",
            "https://tracker.example",
            "--output",
            str(tmp_path),
            stdout=StringIO(),
        )

    assert get_mock.call_count == 2
    first_call = get_mock.call_args_list[0]
    assert first_call.kwargs["headers"]["Authorization"] == "Bearer secret-token"
    assert first_call.args[0] == "https://tracker.example/api/v1/matching-training-data"
    assert first_call.kwargs["params"]["page_size"] == 100

    second_call = get_mock.call_args_list[1]
    assert second_call.args[0] == next_url
    assert second_call.kwargs["params"] is None

    page_files = sorted(tmp_path.glob("page-*.json"))
    assert [p.name for p in page_files] == ["page-00001.json", "page-00002.json"]
    assert json.loads(page_files[0].read_text()) == [page1]
    assert json.loads(page_files[1].read_text()) == [page2]

    manifest = json.loads((tmp_path / "manifest.json").read_text())
    assert manifest["count"] == 2
    assert manifest["pages"] == 2
    assert manifest["schema_version"] == SCHEMA_VERSION
    assert manifest["base_url"] == "https://tracker.example"


def test_fetch_http_error(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("MATCHING_TRAINING_DATA_TOKEN", "secret-token")
    with patch("requests.get", return_value=_json_response({"detail": "nope"}, 403)):
        with pytest.raises(CommandError, match="HTTP 403"):
            call_command(
                "fetch_matching_training_data",
                "--base-url",
                "https://tracker.example",
                "--output",
                str(tmp_path),
                stdout=StringIO(),
            )


def test_fetch_refuses_nonempty_output(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("MATCHING_TRAINING_DATA_TOKEN", "secret-token")
    (tmp_path / "stale.json").write_text("{}", encoding="utf-8")
    with pytest.raises(CommandError, match="not empty"):
        call_command(
            "fetch_matching_training_data",
            "--base-url",
            "https://tracker.example",
            "--output",
            str(tmp_path),
            stdout=StringIO(),
        )


def test_fetch_respects_limit(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("MATCHING_TRAINING_DATA_TOKEN", "secret-token")
    page1 = _sample_api_record("CVE-2026-lim-1")
    page2 = _sample_api_record("CVE-2026-lim-2")
    next_url = (
        "https://tracker.example/api/v1/matching-training-data?page=2&page_size=100"
    )
    responses = [
        _json_response(
            {
                "count": 2,
                "next": next_url,
                "previous": None,
                "results": [page1],
            }
        ),
        _json_response(
            {
                "count": 2,
                "next": None,
                "previous": None,
                "results": [page2],
            }
        ),
    ]

    with patch("requests.get", side_effect=responses) as get_mock:
        call_command(
            "fetch_matching_training_data",
            "--base-url",
            "https://tracker.example",
            "--output",
            str(tmp_path),
            "--limit",
            "1",
            stdout=StringIO(),
        )

    assert get_mock.call_count == 1
    page_files = sorted(tmp_path.glob("page-*.json"))
    assert [p.name for p in page_files] == ["page-00001.json"]
    assert json.loads(page_files[0].read_text()) == [page1]
    manifest = json.loads((tmp_path / "manifest.json").read_text())
    assert manifest["count"] == 1
    assert manifest["limit"] == 1
    assert manifest["total_available"] == 2


def test_import_roundtrip_from_page_files(
    tmp_path: Path,
    make_container: Callable[..., Container],
    make_channel: Callable[..., NixChannel],
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
) -> None:
    channel = make_channel(
        channel_branch="nixos-unstable",
        state=NixChannel.ChannelState.UNSTABLE,
    )
    evaluation = make_evaluation(channel=channel)
    drv = make_drv(
        evaluation=evaluation,
        pname="foobar",
        version="1.2.3",
        attribute="foobar",
    )
    ignored = make_drv(
        evaluation=evaluation,
        pname="foobar-tests",
        version="1.2.3",
        attribute="foobar.tests",
    )
    container = make_container(
        cve_id="CVE-2026-cmd-1",
        package_name="foobar",
        product="foobar",
        cpes=["cpe:2.3:a:example:foobar:1.2.3:*:*:*:*:*:*:*"],
    )
    proposal = CVEDerivationClusterProposal.objects.create(
        cve=container.cve,
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        algorithm_version=CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION,
    )
    DerivationClusterProposalLink.objects.create(
        proposal=proposal,
        derivation=drv,
        provenance_flags=int(ProvenanceFlags.PACKAGE_NAME_MATCH),
    )
    DerivationClusterProposalLink.objects.create(
        proposal=proposal,
        derivation=ignored,
        provenance_flags=int(ProvenanceFlags.PACKAGE_NAME_MATCH),
    )
    PackageOverlay.objects.create(
        suggestion=proposal,
        package_attribute="foobar.tests",
        type=PackageOverlay.Type.IGNORED,
    )

    original = _export(proposal)
    (tmp_path / "page-00001.json").write_text(
        json.dumps([original], indent=2) + "\n",
        encoding="utf-8",
    )

    CveRecord.objects.filter(cve_id="CVE-2026-cmd-1").delete()

    call_command(
        "import_matching_training_data",
        "--input",
        str(tmp_path),
        stdout=StringIO(),
    )

    imported = CVEDerivationClusterProposal.objects.get(cve__cve_id="CVE-2026-cmd-1")
    assert _export(imported) == original
    assert NixChannel.objects.filter(channel_branch=BENCHMARK_CHANNEL_BRANCH).exists()


def test_import_command_is_idempotent(tmp_path: Path, db: None) -> None:
    record = _sample_api_record("CVE-2026-cmd-idem")
    (tmp_path / "page-00001.json").write_text(
        json.dumps([record], indent=2) + "\n",
        encoding="utf-8",
    )

    call_command(
        "import_matching_training_data",
        "--input",
        str(tmp_path),
        stdout=StringIO(),
    )
    call_command(
        "import_matching_training_data",
        "--input",
        str(tmp_path),
        stdout=StringIO(),
    )

    assert (
        CVEDerivationClusterProposal.objects.filter(
            cve__cve_id="CVE-2026-cmd-idem"
        ).count()
        == 1
    )


def test_import_bad_schema_version(tmp_path: Path, db: None) -> None:
    record = _sample_api_record("CVE-2026-cmd-bad")
    record["schema_version"] = SCHEMA_VERSION + 1
    (tmp_path / "page-00001.json").write_text(
        json.dumps([record], indent=2) + "\n",
        encoding="utf-8",
    )

    with pytest.raises(CommandError, match="CVE-2026-cmd-bad"):
        call_command(
            "import_matching_training_data",
            "--input",
            str(tmp_path),
            stdout=StringIO(),
        )


def test_import_respects_limit(tmp_path: Path, db: None) -> None:
    records = [
        _sample_api_record("CVE-2026-cmd-lim-1"),
        _sample_api_record("CVE-2026-cmd-lim-2"),
    ]
    (tmp_path / "page-00001.json").write_text(
        json.dumps(records, indent=2) + "\n",
        encoding="utf-8",
    )

    call_command(
        "import_matching_training_data",
        "--input",
        str(tmp_path),
        "--limit",
        "1",
        stdout=StringIO(),
    )

    assert (
        CVEDerivationClusterProposal.objects.filter(
            cve__cve_id__startswith="CVE-2026-cmd-lim-"
        ).count()
        == 1
    )


def test_purge_removes_imported_training_data(tmp_path: Path, db: None) -> None:
    record = _sample_api_record("CVE-2026-cmd-purge")
    (tmp_path / "page-00001.json").write_text(
        json.dumps([record], indent=2) + "\n",
        encoding="utf-8",
    )

    call_command(
        "import_matching_training_data",
        "--input",
        str(tmp_path),
        stdout=StringIO(),
    )
    assert CveRecord.objects.filter(cve_id="CVE-2026-cmd-purge").exists()
    assert NixDerivation.objects.filter(
        parent_evaluation__channel__channel_branch=BENCHMARK_CHANNEL_BRANCH
    ).exists()

    call_command("purge_matching_training_data", stdout=StringIO())

    assert not CveRecord.objects.filter(cve_id="CVE-2026-cmd-purge").exists()
    assert not CVEDerivationClusterProposal.objects.filter(
        cve__cve_id="CVE-2026-cmd-purge"
    ).exists()
    assert not NixDerivation.objects.filter(
        parent_evaluation__channel__channel_branch=BENCHMARK_CHANNEL_BRANCH
    ).exists()
    assert NixChannel.objects.filter(channel_branch=BENCHMARK_CHANNEL_BRANCH).exists()


def test_purge_training_corpus_empty(db: None) -> None:
    assert not CveRecord.objects.filter(assigner__uuid=_TRAINING_ORG_UUID).exists()
    assert not NixDerivation.objects.filter(
        parent_evaluation__channel__channel_branch=BENCHMARK_CHANNEL_BRANCH
    ).exists()

    result = purge_training_corpus()

    assert result == {}
    assert not CveRecord.objects.filter(assigner__uuid=_TRAINING_ORG_UUID).exists()
    assert not NixDerivation.objects.filter(
        parent_evaluation__channel__channel_branch=BENCHMARK_CHANNEL_BRANCH
    ).exists()
