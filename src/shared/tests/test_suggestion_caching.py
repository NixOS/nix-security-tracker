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
    NixpkgsBranch,
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

    branch, package = next(
        iter(value.payload["packages"][drv1.attribute]["package"]["branches"].items())
    )

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
    maintainer_ids = cached.payload["packages"][drv_rolling.attribute]["package"][
        "maintainer_ids"
    ]
    expected = ["rolling-maintainer"] if rolling_has_maintainers else []
    assert [
        cached.payload["maintainers"][str(github_id)]["maintainer"]["github"]
        for github_id in maintainer_ids
    ] == expected


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
    cve: Container,
    drv: NixDerivation,
) -> None:
    """
    The cached payload must surface the description after clustering.
    """
    suggestion = CVEDerivationClusterProposal.objects.create(cve=cve.cve)
    DerivationClusterProposalLink.objects.create(
        proposal=suggestion,
        derivation=drv,
        provenance_flags=ProvenanceFlags.PACKAGE_NAME_MATCH,
    )
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
        cached.payload["packages"][drv.attribute]["package"]["description"]
        == expected_description
    )


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


def test_cache_description_falls_back_to_meta(
    cve: Container,
    drv: NixDerivation,
) -> None:
    """
    When no PackageDerivation exists, the cached payload falls back to NixDerivationMeta.description.
    """
    suggestion = CVEDerivationClusterProposal.objects.create(cve=cve.cve)
    DerivationClusterProposalLink.objects.create(
        proposal=suggestion,
        derivation=drv,
        provenance_flags=ProvenanceFlags.PACKAGE_NAME_MATCH,
    )
    assert drv.metadata

    cache_new_suggestions(suggestion)

    cached = CachedSuggestions.objects.get(proposal=suggestion)
    assert (
        cached.payload["packages"][drv.attribute]["package"]["description"]
        == drv.metadata.description
    )


def test_cache_attribute_package_groups(
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """
    Attributes of the same package are grouped together, with information from the package.
    Grouping is about original packages, so ignoring an attribute doesn't change it.
    """
    # Same pname and homepage, hence the same package after clustering.
    foo = make_drv(pname="foo", attribute="foo", homepage="https://foo.example")
    foo_alias = make_drv(
        pname="foo", attribute="pkgsStatic.foo", homepage="https://foo.example"
    )
    bar = make_drv(pname="bar", attribute="bar", homepage="https://bar.example")
    suggestion = make_suggestion(
        drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH for drv in [foo, foo_alias, bar]}
    )
    cache_new_suggestions(suggestion)

    foo_package = Package.objects.get(name="foo")
    bar_package = Package.objects.get(name="bar")
    expected = [
        {
            "package_id": bar_package.pk,
            "name": "bar",
            "homepage": "https://bar.example",
            "description": bar_package.description,
            "attributes": ["bar"],
        },
        {
            "package_id": foo_package.pk,
            "name": "foo",
            "homepage": "https://foo.example",
            "description": foo_package.description,
            "attributes": ["foo", "pkgsStatic.foo"],
        },
    ]
    suggestion.cached.refresh_from_db()
    assert suggestion.cached.payload["attribute_package_groups"] == expected

    suggestion.ignore_packages(["pkgsStatic.foo"])
    suggestion.cached.refresh_from_db()
    assert (
        suggestion.cached.payload["packages"]["pkgsStatic.foo"]["status"] == "ignored"
    )
    assert suggestion.cached.payload["attribute_package_groups"] == expected


def test_cache_clusters_unlinked_derivations(
    cve: Container,
    drv: NixDerivation,
) -> None:
    """
    Caching clusters derivations not yet linked to a package, so they are grouped by package.
    """
    suggestion = CVEDerivationClusterProposal.objects.create(cve=cve.cve)
    DerivationClusterProposalLink.objects.create(
        proposal=suggestion,
        derivation=drv,
        provenance_flags=ProvenanceFlags.PACKAGE_NAME_MATCH,
    )

    cache_new_suggestions(suggestion)

    package = Package.objects.get()
    cached = CachedSuggestions.objects.get(proposal=suggestion)
    assert cached.payload["attribute_package_groups"] == [
        {
            "package_id": package.pk,
            "name": package.name,
            "homepage": package.homepage,
            "description": package.description,
            "attributes": [drv.attribute],
        }
    ]


def test_cache_maintainer_of_several_packages_appears_once(
    make_maintainer: Callable[..., NixMaintainer],
    make_drv: Callable[..., NixDerivation],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    shared = make_maintainer(github_id=999, github="shared")
    suggestion = make_cached_suggestion(
        drvs={
            make_drv(
                pname="first", maintainer=shared
            ): ProvenanceFlags.PACKAGE_NAME_MATCH,
            make_drv(
                pname="second", maintainer=shared
            ): ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
    )
    assert suggestion.cached.payload["maintainers"] == {
        "999": {
            "maintainer": {
                "name": shared.name,
                "email": shared.email,
                "github": shared.github,
                "matrix": shared.matrix,
                "github_id": shared.github_id,
            },
            "status": "active",
            "orphan": False,
        }
    }


def test_cache_adding_a_maintainer_twice_keeps_one_entry(
    make_maintainer: Callable[..., NixMaintainer],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    maintainer: NixMaintainer,
) -> None:
    extra = make_maintainer(github_id=555, github="extra")
    suggestion = make_cached_suggestion()

    suggestion.add_maintainer(extra.github)
    suggestion.add_maintainer(extra.github)

    suggestion.cached.refresh_from_db()
    maintainers = suggestion.cached.payload["maintainers"]
    assert {k: e["status"] for k, e in maintainers.items()} == {
        str(maintainer.github_id): "active",
        "555": "added",
    }
