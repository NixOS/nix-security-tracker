from collections.abc import Callable
from datetime import timedelta

import pytest

from shared.cache_suggestions import cache_new_suggestions
from shared.models.cached import CachedSuggestions
from shared.models.cve import Container
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import (
    NixChannel,
    NixDerivation,
    NixEvaluation,
    NixMaintainer,
    NixpkgsBranch,
)
from shared.models.package import Package


# The Pydantic class for the cached value gives us some assurance about the shape of the data, but ultimately we probabyly want property tests here.
def test_caching_newest_package(
    cve: Container,
    make_channel: Callable[..., NixChannel],
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """
    Check that when aggregating derivations from a suggestion, only the newest one for a given package name (== attribute path) and a given channel is used.
    """

    # Use a primary channel, since otherwise the overall version won't be captured.
    # FIXME(@fricklerhandwerk): This shouldn't be something to keep track of. [ref:channel-structure]
    primary_channel = make_channel(channel_branch="nixos-26.05")
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

    suggestion = make_suggestion(
        container=cve,
        drvs={
            drv1: ProvenanceFlags.PACKAGE_NAME_MATCH,
            drv2: ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
    )

    cached = CachedSuggestions.objects.filter(proposal=suggestion)
    assert not cached.exists()
    cache_new_suggestions(suggestion)
    value = cached.get()
    assert cve.cve.cve_id == value.payload["cve_id"]

    [cached_package] = value.payload["packages"]
    assert cached_package["id"] == drv1.package_link.package_id
    [attrpath] = cached_package["attrpaths"]
    branch, package = next(iter(attrpath["branches"].items()))

    assert package["version"] == "2.0"


@pytest.mark.parametrize("stable_is_older", [True, False])
@pytest.mark.parametrize("stable_has_maintainers", [True, False])
@pytest.mark.parametrize("rolling_has_maintainers", [True, False])
def test_maintainers_come_from_rolling_release_channel(
    cve: Container,
    make_branch: Callable[..., NixpkgsBranch],
    make_channel: Callable[..., NixChannel],
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    make_maintainer: Callable[..., NixMaintainer],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    stable_is_older: bool,
    stable_has_maintainers: bool,
    rolling_has_maintainers: bool,
) -> None:
    """
    The rolling-release channel is the source of truth for maintainers.
    Its maintainers must appear regardless of evaluation order,
    and stable-only maintainers must never appear.
    """
    stable_channel = make_channel(
        channel_branch="nixos-26.05-small",
        release_branch=make_branch(name="release-26.05"),
    )
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

    suggestion = make_suggestion(
        container=cve,
        drvs={
            drv_stable: ProvenanceFlags.PACKAGE_NAME_MATCH,
            drv_rolling: ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
    )

    cache_new_suggestions(suggestion)
    cached = CachedSuggestions.objects.get(proposal=suggestion)
    [package] = cached.payload["packages"]
    assert package["id"] == drv_rolling.package_link.package_id
    maintainers = package["maintainers"]
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
    drv: NixDerivation,
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """
    The cached payload must surface the description after clustering.
    """
    assert drv.metadata
    expected_description = drv.metadata.description

    suggestion = make_suggestion()

    # Without these the failure below is ambiguous between cache and clustering.
    drv.metadata.refresh_from_db()
    assert drv.metadata.description is None
    assert Package.objects.get().description == expected_description

    cache_new_suggestions(suggestion)

    cached = CachedSuggestions.objects.get(proposal=suggestion)
    [package] = cached.payload["packages"]
    assert package["id"] == drv.package_link.package_id
    assert package["description"] == expected_description


def test_ensure_fresh_cache_builds_when_missing(
    suggestion: CVEDerivationClusterProposal,
) -> None:
    """Test that the cache created when no row exists."""
    assert not CachedSuggestions.objects.filter(proposal=suggestion).exists()

    suggestion.ensure_fresh_cache()

    assert CachedSuggestions.objects.filter(proposal=suggestion).exists()


def test_ensure_fresh_cache_noop_when_fresh(
    suggestion: CVEDerivationClusterProposal,
) -> None:
    """Test that cache does not rebuild when the cache is already fresh."""
    cache_new_suggestions(suggestion)
    original_updated_at = CachedSuggestions.objects.get(proposal=suggestion).updated_at

    suggestion.ensure_fresh_cache()

    assert (
        CachedSuggestions.objects.get(proposal=suggestion).updated_at
        == original_updated_at
    )


# FIXME(@fricklerhandwerk): [ref:invalid-cves] This tests a thing that shouldn't be possible in the first place; fix the underlying problem.
def test_cache_skipped_without_title_or_description(
    make_container: Callable[..., Container],
) -> None:
    container = make_container(
        title=None, description=None, package_name=None, product=None
    )
    suggestion = CVEDerivationClusterProposal.objects.create(
        status=CVEDerivationClusterProposal.Status.REJECTED,
        rejection_reason=CVEDerivationClusterProposal.RejectionReason.NO_MATCHES,
        cve=container.cve,
    )

    cache_new_suggestions(suggestion)

    assert not CachedSuggestions.objects.filter(proposal=suggestion).exists()


def test_cache_lists_linked_packages_only(
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """
    Packages come from the suggestion's package links, not from its derivations.
    """
    suggestion = make_suggestion(package_links=False)

    cache_new_suggestions(suggestion)

    cached = CachedSuggestions.objects.get(proposal=suggestion)
    assert cached.payload["original_packages"] == []


def test_cache_keeps_versions_per_attrpath(
    cve: Container,
    make_channel: Callable[..., NixChannel],
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """
    Several versions of the same package on one branch are all kept, each under its attribute path.
    """
    evaluation = make_evaluation(channel=make_channel(channel_branch="nixos-26.05"))
    old = make_drv(evaluation=evaluation, pname="foo", version="1.0", attribute="foo_1")
    new = make_drv(evaluation=evaluation, pname="foo", version="2.0", attribute="foo_2")
    suggestion = make_suggestion(
        container=cve,
        drvs={
            old: ProvenanceFlags.PACKAGE_NAME_MATCH,
            new: ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
    )

    cache_new_suggestions(suggestion)

    cached = CachedSuggestions.objects.get(proposal=suggestion)
    [package] = cached.payload["packages"]
    versions = {
        a["attrpath"]: {b["version"] for b in a["branches"].values()}
        for a in package["attrpaths"]
    }
    assert versions == {"foo_1": {"1.0"}, "foo_2": {"2.0"}}
