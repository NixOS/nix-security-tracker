from collections.abc import Callable
from typing import Any, cast

import pytest
from rest_framework.exceptions import ValidationError

from shared.listeners.automatic_linkage import resolve_linkage_candidates
from shared.matching_training_data import serializers
from shared.matching_training_data.serializers import (
    BENCHMARK_CHANNEL_BRANCH,
    SCHEMA_VERSION,
    ensure_benchmark_evaluation,
)
from shared.models.cve import Container, CveRecord, Tag
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
    PackageOverlay,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import NixChannel, NixDerivation, NixEvaluation


def test_serializer_export_validates_like_api_payload(
    make_container: Callable[..., Container],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
) -> None:
    """Export from fixtures, then re-validate, same path as the training-data API."""
    foo = make_drv(pname="foo", attribute="foo")
    foo_tests = make_drv(pname="foo-tests", attribute="foo.tests")
    proposal = make_suggestion(
        container=make_container(cve_id="CVE-2026-9999", package_name="foo"),
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        algorithm_version=1,
        drvs={
            foo: ProvenanceFlags.PACKAGE_NAME_MATCH,
            foo_tests: ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
    )
    PackageOverlay.objects.create(
        suggestion=proposal,
        package_attribute="foo.tests",
        type=PackageOverlay.Type.IGNORED,
    )

    record = serializers.CVEDerivationClusterProposal(proposal).data
    serializer = serializers.CVEDerivationClusterProposal(data=record)
    assert serializer.is_valid(), serializer.errors
    validated = cast(dict[str, Any], serializer.validated_data)
    assert validated["schema_version"] == SCHEMA_VERSION
    assert validated["cve_id"] == "CVE-2026-9999"
    assert len(validated["derivationclusterproposallink_set"]) == 2
    assert validated["package_overlays"][0]["type"] == PackageOverlay.Type.IGNORED


def test_schema_version_rejected(
    make_container: Callable[..., Container],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    proposal = make_suggestion(
        container=make_container(cve_id="CVE-2026-bad-ver"),
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        algorithm_version=1,
    )
    record = dict(serializers.CVEDerivationClusterProposal(proposal).data)
    record["schema_version"] = SCHEMA_VERSION + 1
    serializer = serializers.CVEDerivationClusterProposal(data=record)
    with pytest.raises(ValidationError):
        serializer.is_valid(raise_exception=True)


def test_user_curated_proposals_excludes_pending(
    make_container: Callable[..., Container],
) -> None:
    pending_container = make_container(cve_id="CVE-2026-pend")
    accepted_container = make_container(cve_id="CVE-2026-acc")

    pending = CVEDerivationClusterProposal.objects.create(
        cve=pending_container.cve,
        status=CVEDerivationClusterProposal.Status.PENDING,
        algorithm_version=1,
    )
    accepted = CVEDerivationClusterProposal.objects.create(
        cve=accepted_container.cve,
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        algorithm_version=1,
    )

    curated_pks = set(
        CVEDerivationClusterProposal.objects.user_curated().values_list("pk", flat=True)
    )
    untouched_pks = set(
        CVEDerivationClusterProposal.objects.untouched().values_list("pk", flat=True)
    )
    assert pending.pk not in curated_pks
    assert accepted.pk in curated_pks
    assert pending.pk in untouched_pks
    assert accepted.pk not in untouched_pks


def test_export_import_export_roundtrip(
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
        cve_id="CVE-2026-4242",
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
    original = dict(serializers.CVEDerivationClusterProposal(proposal).data)
    assert original["schema_version"] == SCHEMA_VERSION
    assert original["cve_id"] == "CVE-2026-4242"
    assert original["status"] == "accepted"
    assert original["ignored_packages"] == ["foobar.tests"]
    kept = {
        (d["attribute"], d["name"], d["system"]) for d in original["kept_derivations"]
    }
    assert ("foobar", "foobar-1.2.3", "x86_64-linux") in kept
    assert ("foobar.tests", "foobar-tests-1.2.3", "x86_64-linux") not in kept

    CveRecord.objects.filter(cve_id="CVE-2026-4242").delete()
    assert not CVEDerivationClusterProposal.objects.filter(
        cve__cve_id="CVE-2026-4242"
    ).exists()

    serializer = serializers.CVEDerivationClusterProposal(data=original)
    assert serializer.is_valid(), serializer.errors
    imported = cast(CVEDerivationClusterProposal, serializer.save())
    assert imported.cve.cve_id == "CVE-2026-4242"
    assert imported.status == CVEDerivationClusterProposal.Status.ACCEPTED
    assert imported.derivations.count() == 2
    assert imported.package_overlays.filter(package_attribute="foobar.tests").exists()
    assert NixChannel.objects.filter(channel_branch=BENCHMARK_CHANNEL_BRANCH).exists()

    reexported = serializers.CVEDerivationClusterProposal(imported).data
    assert reexported == original

    imported_container = imported.cve.container.first()
    assert imported_container is not None
    outcome = resolve_linkage_candidates(imported_container)
    assert outcome is not None


def test_export_import_auto_reject_without_links(
    make_container: Callable[..., Container],
) -> None:
    container = make_container(cve_id="CVE-2026-0007", package_name="zzz")
    tag, _ = Tag.objects.get_or_create(value="exclusively-hosted-service")
    container.tags.add(tag)

    proposal = CVEDerivationClusterProposal.objects.create(
        cve=container.cve,
        status=CVEDerivationClusterProposal.Status.REJECTED,
        rejection_reason=CVEDerivationClusterProposal.RejectionReason.EXCLUSIVELY_HOSTED_SERVICE,
        algorithm_version=CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION,
    )

    original = dict(serializers.CVEDerivationClusterProposal(proposal).data)
    assert original["kept_derivations"] == []
    assert original["derivationclusterproposallink_set"] == []
    assert "exclusively-hosted-service" in original["container"]["tags"]

    CveRecord.objects.filter(cve_id="CVE-2026-0007").delete()
    serializer = serializers.CVEDerivationClusterProposal(data=original)
    assert serializer.is_valid(), serializer.errors
    imported = cast(CVEDerivationClusterProposal, serializer.save())
    reexported = serializers.CVEDerivationClusterProposal(imported).data
    assert reexported == original

    imported_container = imported.cve.container.first()
    assert imported_container is not None
    outcome = resolve_linkage_candidates(imported_container)
    assert outcome.rejection is not None
    assert (
        outcome.rejection.reason
        == CVEDerivationClusterProposal.RejectionReason.EXCLUSIVELY_HOSTED_SERVICE
    )


def test_import_is_idempotent_by_cve_id(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
) -> None:
    container = make_container(cve_id="CVE-2026-1111", package_name="foo")
    proposal = CVEDerivationClusterProposal.objects.create(
        cve=container.cve,
        status=CVEDerivationClusterProposal.Status.PUBLISHED,
        algorithm_version=1,
    )
    DerivationClusterProposalLink.objects.create(
        proposal=proposal,
        derivation=make_drv(pname="foo", attribute="foo"),
        provenance_flags=int(ProvenanceFlags.PACKAGE_NAME_MATCH),
    )
    record = serializers.CVEDerivationClusterProposal(proposal).data

    first_ser = serializers.CVEDerivationClusterProposal(data=record)
    assert first_ser.is_valid(), first_ser.errors
    first = cast(CVEDerivationClusterProposal, first_ser.save())

    second_ser = serializers.CVEDerivationClusterProposal(data=record)
    assert second_ser.is_valid(), second_ser.errors
    second = cast(CVEDerivationClusterProposal, second_ser.save())

    assert first.pk != second.pk
    assert (
        CVEDerivationClusterProposal.objects.filter(cve__cve_id="CVE-2026-1111").count()
        == 1
    )


def test_ensure_benchmark_evaluation_idempotency(db: None) -> None:
    first = ensure_benchmark_evaluation()
    second = ensure_benchmark_evaluation()
    assert first.channel.channel_branch == BENCHMARK_CHANNEL_BRANCH
    assert first.channel_id == second.channel_id
    assert first.pk == second.pk
