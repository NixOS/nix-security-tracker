from collections.abc import Callable
from datetime import timedelta

import pytest

from shared.cache_suggestions import cache_new_suggestions
from shared.models.cached import CachedSuggestions
from shared.models.cve import Container
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import (
    NixChannel,
    NixDerivation,
    NixEvaluation,
    NixMaintainer,
)
from shared.models.package import Package
from shared.package_clustering import cluster_packages


# The Pydantic class for the cached value gives us some assurance about the shape of the data, but ultimately we probabyly want property tests here.
def test_caching_newest_package(
    cve: Container,
    make_channel: Callable[..., NixChannel],
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    suggestion: CVEDerivationClusterProposal,
) -> None:
    """
    Check that when aggregating derivations from a suggestion, only the newest one for a given package name (== attribute path) and a given channel is used.
    """

    # Use a primary channel, since otherwise the overall version won't be captured.
    # FIXME(@fricklerhandwerk): This shouldn't be something to keep track of. [ref:channel-structure]
    primary_channel = make_channel(branch="nixos-26.05")
    # Order of creation matters for triggering the bug.
    # This is brittle because it assumes things about the database, but it seems that derivations are scanned in insertion order of their evaluations.
    eval_new = make_evaluation(channel=primary_channel)
    eval_old = make_evaluation(channel=primary_channel)
    # Overwrite the timestamp without triggering the `save()` hook that would write the current time again
    target_time = eval_old.created_at - timedelta(hours=1)
    NixEvaluation.objects.filter(pk=eval_old.pk).update(
        created_at=target_time,
        updated_at=target_time,
    )
    # Use different versions. We'll assert over those since that's what's primarily visible to users
    drv2 = make_drv(evaluation=eval_new, version="2.0")
    drv1 = make_drv(evaluation=eval_old, version="1.0")

    suggestion = CVEDerivationClusterProposal.objects.create(
        status="pending",
        cve=cve.cve,
    )

    DerivationClusterProposalLink.objects.create(
        proposal=suggestion,
        derivation=drv1,
        provenance_flags=ProvenanceFlags.PACKAGE_NAME_MATCH,
    )

    DerivationClusterProposalLink.objects.create(
        proposal=suggestion,
        derivation=drv2,
        provenance_flags=ProvenanceFlags.PACKAGE_NAME_MATCH,
    )

    cached = CachedSuggestions.objects.filter(proposal=suggestion)
    assert not cached.exists()
    cache_new_suggestions(suggestion)
    value = cached.get()
    assert cve.cve.cve_id == value.payload["cve_id"]

    channel, package = next(
        iter(value.payload["packages"][drv1.attribute]["channels"].items())
    )

    assert package["major_version"] == "2.0"


@pytest.mark.parametrize("stable_is_older", [True, False])
@pytest.mark.parametrize("stable_has_maintainers", [True, False])
@pytest.mark.parametrize("rolling_has_maintainers", [True, False])
def test_maintainers_come_from_rolling_release_channel(
    cve: Container,
    make_channel: Callable[..., NixChannel],
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    make_maintainer: Callable[..., NixMaintainer],
    stable_is_older: bool,
    stable_has_maintainers: bool,
    rolling_has_maintainers: bool,
) -> None:
    """
    The rolling-release channel is the source of truth for maintainers.
    Its maintainers must appear regardless of evaluation order,
    and stable-only maintainers must never appear.
    """
    stable_channel = make_channel(release="26.05")
    rolling_channel = make_channel()
    stable_age = timedelta(hours=1) if stable_is_older else timedelta(0)
    rolling_age = timedelta(0) if stable_is_older else timedelta(hours=1)
    eval_stable = make_evaluation(channel=stable_channel, age=stable_age)
    eval_rolling = make_evaluation(channel=rolling_channel, age=rolling_age)

    rolling_maintainer = make_maintainer(github_id=1001, github="rolling-maintainer")
    stable_maintainer = make_maintainer(github_id=1002, github="stable-maintainer")

    drv_stable = make_drv(evaluation=eval_stable, maintainer=stable_maintainer)
    drv_rolling = make_drv(evaluation=eval_rolling, maintainer=rolling_maintainer)
    assert drv_stable.metadata is not None and drv_rolling.metadata is not None
    if not stable_has_maintainers:
        drv_stable.metadata.maintainers.clear()
    if not rolling_has_maintainers:
        drv_rolling.metadata.maintainers.clear()

    suggestion = CVEDerivationClusterProposal.objects.create(
        status="pending",
        cve=cve.cve,
    )
    for drv in (drv_stable, drv_rolling):
        DerivationClusterProposalLink.objects.create(
            proposal=suggestion,
            derivation=drv,
            provenance_flags=ProvenanceFlags.PACKAGE_NAME_MATCH,
        )

    cache_new_suggestions(suggestion)
    cached = CachedSuggestions.objects.get(proposal=suggestion)
    maintainers = cached.payload["packages"][drv_rolling.attribute]["maintainers"]
    expected = ["rolling-maintainer"] if rolling_has_maintainers else []
    assert [m["github"] for m in maintainers] == expected


def test_cache_stale_check(
    suggestion: CVEDerivationClusterProposal,
) -> None:
    cache_new_suggestions(suggestion)
    cached = CachedSuggestions.objects.get(proposal=suggestion)
    assert cached.schema_version == CachedSuggestions.CURRENT_SCHEMA_VERSION
    assert cached.is_stale is False

    cached.schema_version = CachedSuggestions.CURRENT_SCHEMA_VERSION - 1  # type: ignore
    cached.save()
    assert cached.is_stale is True


def test_cache_description_from_package(
    suggestion: CVEDerivationClusterProposal,
) -> None:
    """
    The cached payload must surface the description after clustering.
    """
    drv = suggestion.derivations.first()
    assert drv
    assert drv.metadata
    expected_description = drv.metadata.description

    cluster_packages(NixDerivation.objects.filter(pk=drv.pk))

    # Without these the failure below is ambiguous between cache and clustering.
    drv.metadata.refresh_from_db()
    assert drv.metadata.description is None
    assert Package.objects.get().description == expected_description

    cache_new_suggestions(suggestion)

    cached = CachedSuggestions.objects.get(proposal=suggestion)
    assert (
        cached.payload["packages"][drv.attribute]["description"] == expected_description
    )


def test_cache_description_falls_back_to_meta(
    suggestion: CVEDerivationClusterProposal,
) -> None:
    """
    When no PackageDerivation exists, the cached payload falls back to NixDerivationMeta.description.
    """
    drv = suggestion.derivations.first()
    assert drv
    assert drv.metadata

    cache_new_suggestions(suggestion)

    cached = CachedSuggestions.objects.get(proposal=suggestion)
    assert (
        cached.payload["packages"][drv.attribute]["description"]
        == drv.metadata.description
    )
