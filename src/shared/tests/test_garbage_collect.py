from collections.abc import Callable
from datetime import timedelta
from enum import Enum
from io import StringIO

import pytest
from django.core.management import call_command

from shared.management.commands.garbage_collect import DEFAULT_CUTOFF_DAYS
from shared.models.cve import Container, CveRecord
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
    MaintainerOverlay,
    PackageOverlay,
    ProvenanceFlags,
    ReferenceUrlOverlay,
)
from shared.models.nix_evaluation import (
    NixChannel,
    NixDerivation,
    NixDerivationMeta,
    NixEvaluation,
    NixMaintainer,
)
from shared.models.package import Package, PackageAttrpath, PackageDerivation
from shared.package_clustering import cluster_packages


def test_cve_record_not_deleted_with_stale_proposal(
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """CveRecord and Container survive when their stale proposal is removed."""
    make_suggestion(age=timedelta(days=400))

    call_command("garbage_collect", stdout=StringIO())

    assert CVEDerivationClusterProposal.objects.count() == 0
    assert CveRecord.objects.count() == 1
    assert Container.objects.count() == 1


@pytest.mark.parametrize(
    "suggestion_data, remaining_suggestions, remaining_links",
    [
        (
            {
                "status": CVEDerivationClusterProposal.Status.PENDING,
                "age": timedelta(days=400),
            },
            0,
            0,
        ),
        (
            {
                "status": CVEDerivationClusterProposal.Status.ACCEPTED,
                "age": timedelta(days=400),
            },
            1,
            1,
        ),
        (
            {
                "status": CVEDerivationClusterProposal.Status.PENDING,
                "age": timedelta(days=100),
            },
            1,
            1,
        ),
        (
            {
                "status": CVEDerivationClusterProposal.Status.REJECTED,
                "rejection_reason": CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS,
                "age": timedelta(days=400),
            },
            1,
            1,
        ),
    ],
)
def test_delete_only_pending_proposals(
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    suggestion_data: dict[str, str],
    remaining_suggestions: int,
    remaining_links: int,
) -> None:
    make_suggestion(
        **suggestion_data,
    )

    call_command("garbage_collect", stdout=StringIO())

    assert CVEDerivationClusterProposal.objects.count() == remaining_suggestions
    assert DerivationClusterProposalLink.objects.count() == remaining_links


@pytest.mark.parametrize(
    "overlay_type",
    [
        "maintainer",
        "package",
        "reference",
    ],
)
def test_preserves_proposal_with_maintainer_overlay(
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    maintainer: NixMaintainer,
    overlay_type: str,
) -> None:
    """Old PENDING proposal with user data attached is preserved."""
    suggestion = make_suggestion(age=timedelta(days=400))

    if overlay_type == "maintainer":
        MaintainerOverlay.objects.create(
            overlay_type=MaintainerOverlay.Type.ADDITIONAL,
            maintainer=maintainer,
            suggestion=suggestion,
        )
    elif overlay_type == "package":
        PackageOverlay.objects.create(
            overlay_type=PackageOverlay.Type.IGNORED,
            package_attribute="foo",
            suggestion=suggestion,
        )
    elif overlay_type == "reference":
        ReferenceUrlOverlay.objects.create(
            type=ReferenceUrlOverlay.Type.IGNORED,
            reference_url="https://reference.com",
            deduplicated_name="test",
            suggestion=suggestion,
        )
    else:
        pytest.fail(f"Unknown overlay type: {overlay_type}")

    call_command("garbage_collect", stdout=StringIO())

    assert CVEDerivationClusterProposal.objects.count() == 1


def test_dry_run_preserves_stale_proposal(
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """--dry-run reports the count but makes no deletions."""
    make_suggestion(age=timedelta(days=400))

    out = StringIO()
    call_command("garbage_collect", "--dry-run", stdout=out)

    assert CVEDerivationClusterProposal.objects.count() == 1
    assert "Dry run" in out.getvalue()


# FIXME(@fricklerhandwerk): Use the constraints declared here in the actual code, that would simplify it a lot.
class GarbageCollect(Enum):
    ALWAYS = "always"
    WHEN_OLD = "when_old"
    NEVER = "never"


@pytest.mark.parametrize("old", [True, False])
@pytest.mark.parametrize(
    ("channel_state", "keep_channel"),
    [
        (NixChannel.ChannelState.END_OF_LIFE, False),
        (NixChannel.ChannelState.DEPRECATED, False),
        (NixChannel.ChannelState.BETA, True),
        (NixChannel.ChannelState.STABLE, True),
        (NixChannel.ChannelState.UNSTABLE, True),
        (NixChannel.ChannelState.STAGING, True),
    ],
)
@pytest.mark.parametrize(
    # `can_have_*` encodes invariants about code not under test here.
    # We rely on them hold true, to avoid testing uninteresting states.
    ("eval_state", "keep_eval", "gc", "can_have_drvs", "can_have_matches"),
    [
        (
            NixEvaluation.EvaluationState.WAITING,
            True,
            GarbageCollect.NEVER,
            False,
            False,
        ),
        (
            NixEvaluation.EvaluationState.IN_PROGRESS,
            True,
            GarbageCollect.NEVER,
            True,
            False,
        ),
        (
            NixEvaluation.EvaluationState.CRASHED,
            False,
            GarbageCollect.ALWAYS,
            True,
            False,
        ),
        (
            NixEvaluation.EvaluationState.FAILED,
            False,
            GarbageCollect.ALWAYS,
            True,
            False,
        ),
        (
            NixEvaluation.EvaluationState.COMPLETED,
            True,
            GarbageCollect.WHEN_OLD,
            True,
            True,
        ),
    ],
)
def test_deletes_empty_old_evaluations(
    make_channel: Callable[..., NixChannel],
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    channel_state: NixChannel.ChannelState,
    eval_state: NixEvaluation.EvaluationState,
    keep_eval: bool,
    keep_channel: bool,
    gc: GarbageCollect,
    can_have_drvs: bool,
    can_have_matches: bool,
    old: bool,
) -> None:
    """
    Old unmatched Derivation and its NixDerivationMeta are both deleted; NixMaintainer survives.
    Empty evaluations are deleted unless completed or not started.
    Empty channels are deleted.
    """
    channel = make_channel(state=channel_state, branch=channel_state)
    evaluation = make_evaluation(
        channel=channel,
        state=eval_state,
        age=timedelta(days=400) if old else timedelta(0),
    )

    assert NixEvaluation.objects.filter(pk=evaluation.pk).exists()

    if can_have_drvs:
        drv = make_drv(evaluation=evaluation)
        meta_pk = drv.metadata_id
        assert NixDerivation.objects.filter(pk=drv.pk).exists()
        assert NixDerivationMeta.objects.filter(pk=meta_pk).exists()

        if can_have_matches:
            make_suggestion(
                drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH},
                age=timedelta(days=400) if old else timedelta(0),
            )

    initial_maintainer_count = NixMaintainer.objects.count()

    call_command("garbage_collect", stdout=StringIO())

    # NixMaintainer lookup rows are never deleted
    assert NixMaintainer.objects.count() == initial_maintainer_count

    if can_have_drvs:
        keep_drvs = gc is GarbageCollect.NEVER or (
            gc is GarbageCollect.WHEN_OLD and not old
        )
        assert NixDerivation.objects.filter(pk=drv.pk).exists() is keep_drvs  # type: ignore[reportPossiblyUnbound]
        assert NixDerivationMeta.objects.filter(pk=meta_pk).exists() is keep_drvs  # type: ignore[reportPossiblyUnbound]

        assert NixEvaluation.objects.filter(pk=evaluation.pk).exists() is (
            keep_eval or keep_drvs
        )
        assert NixChannel.objects.filter(pk=channel.pk).exists() is (
            keep_channel or keep_eval
        )
    else:
        assert NixEvaluation.objects.filter(pk=evaluation.pk).exists() is keep_eval
        assert NixChannel.objects.filter(pk=channel.pk).exists() is (
            keep_channel or keep_eval
        )


def test_only_old_proposals_deleted_recent_kept(
    make_container: Callable[..., Container],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """When both old and recent proposals exist, only the old one is removed."""
    old_container = make_container(cve_id="CVE-2020-0001")
    make_suggestion(container=old_container, age=timedelta(days=400))

    recent_container = make_container(cve_id="CVE-2025-0001")
    make_suggestion(container=recent_container)
    # recent proposal's created_at is timezone.now() — no ageing needed

    assert CVEDerivationClusterProposal.objects.count() == 2

    call_command("garbage_collect", stdout=StringIO())

    assert CVEDerivationClusterProposal.objects.count() == 1
    assert CVEDerivationClusterProposal.objects.filter(
        cve=recent_container.cve
    ).exists()


def test_no_duplicate_evaluations(evaluation: NixEvaluation) -> None:
    call_command("garbage_collect", stdout=StringIO())
    assert NixEvaluation.objects.count() == 1


def test_when_there_is_duplicate_evaluation(
    evaluation: NixEvaluation,
    make_channel: Callable[..., NixChannel],
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    first_drv = make_drv(evaluation=evaluation)
    first_suggestion = make_suggestion(
        drvs={first_drv: ProvenanceFlags.PACKAGE_NAME_MATCH}
    )
    first_meta_id = first_drv.metadata_id

    duplicate_eval = make_evaluation(
        channel=make_channel(release="25.11", branch="nixos-25.11"),
        commit_sha1=evaluation.commit_sha1,
        state=NixEvaluation.EvaluationState.COMPLETED,
    )
    duplicate_drv = make_drv(evaluation=duplicate_eval)
    duplicate_suggestion = make_suggestion(
        drvs={duplicate_drv: ProvenanceFlags.PACKAGE_NAME_MATCH}
    )
    duplicate_meta_id = duplicate_drv.metadata_id

    assert evaluation.id < duplicate_eval.id
    call_command("garbage_collect", stdout=StringIO())

    # Canonical evaluation and its data survive.
    assert NixEvaluation.objects.filter(id=evaluation.id).exists()
    assert NixDerivation.objects.filter(id=first_drv.id).exists()
    assert NixDerivationMeta.objects.filter(id=first_meta_id).exists()
    assert DerivationClusterProposalLink.objects.filter(
        proposal=first_suggestion
    ).exists()

    # Duplicate evaluation and all its data are removed.
    assert not NixEvaluation.objects.filter(id=duplicate_eval.id).exists()
    assert not NixDerivation.objects.filter(id=duplicate_drv.id).exists()
    assert not NixDerivationMeta.objects.filter(id=duplicate_meta_id).exists()
    assert not DerivationClusterProposalLink.objects.filter(
        proposal=duplicate_suggestion
    ).exists()


def test_garbage_collect_prunes_stale_package_attrpaths(
    make_channel: Callable[..., NixChannel],
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
) -> None:
    channel = make_channel(state=NixChannel.ChannelState.END_OF_LIFE)
    evaluation = make_evaluation(
        channel=channel,
        state=NixEvaluation.EvaluationState.COMPLETED,
        age=timedelta(days=DEFAULT_CUTOFF_DAYS + 1),
    )
    drv = make_drv(evaluation=evaluation)
    cluster_packages(NixDerivation.objects.filter(pk=drv.pk))
    assert PackageAttrpath.objects.filter(attrpath=drv.attribute).exists()

    call_command("garbage_collect", stdout=StringIO())

    assert not NixDerivation.objects.filter(pk=drv.pk).exists()
    assert not PackageAttrpath.objects.filter(attrpath=drv.attribute).exists()


def test_garbage_collect_preserves_linked_attrpaths(
    make_channel: Callable[..., NixChannel],
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    channel = make_channel(state=NixChannel.ChannelState.END_OF_LIFE)
    evaluation = make_evaluation(
        channel=channel,
        state=NixEvaluation.EvaluationState.COMPLETED,
        age=timedelta(days=DEFAULT_CUTOFF_DAYS + 1),
    )
    drv = make_drv(evaluation=evaluation)
    cluster_packages(NixDerivation.objects.filter(pk=drv.pk))
    make_suggestion(
        drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH},
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
    )

    call_command("garbage_collect", stdout=StringIO())

    assert NixDerivation.objects.filter(pk=drv.pk).exists()
    assert PackageDerivation.objects.filter(derivation=drv).exists()
    assert PackageAttrpath.objects.filter(attrpath=drv.attribute).exists()


def test_garbage_collect_preserves_attrpath_with_live_link(
    make_channel: Callable[..., NixChannel],
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    channel = make_channel(state=NixChannel.ChannelState.END_OF_LIFE)
    evaluation = make_evaluation(
        channel=channel,
        state=NixEvaluation.EvaluationState.COMPLETED,
        age=timedelta(days=DEFAULT_CUTOFF_DAYS + 1),
    )
    drv_orphan = make_drv(evaluation=evaluation, attribute="shared-attr")
    drv_linked = make_drv(evaluation=evaluation, attribute="shared-attr")
    cluster_packages(
        NixDerivation.objects.filter(pk__in=[drv_orphan.pk, drv_linked.pk])
    )
    make_suggestion(
        drvs={drv_linked: ProvenanceFlags.PACKAGE_NAME_MATCH},
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
    )

    call_command("garbage_collect", stdout=StringIO())

    assert not NixDerivation.objects.filter(pk=drv_orphan.pk).exists()
    assert NixDerivation.objects.filter(pk=drv_linked.pk).exists()
    assert PackageDerivation.objects.filter(derivation=drv_linked).exists()
    assert PackageAttrpath.objects.filter(attrpath="shared-attr").exists()


def test_garbage_collect_dry_run_preserves_stale_package_attrpaths(
    drv: NixDerivation,
    make_package: Callable[..., Package],
) -> None:
    make_package(drv)
    assert PackageAttrpath.objects.filter(attrpath=drv.attribute).exists()

    out = StringIO()
    call_command("garbage_collect", "--dry-run", stdout=out)

    assert PackageAttrpath.objects.filter(attrpath=drv.attribute).exists()
    assert "stale package attrpath" in out.getvalue().lower()
