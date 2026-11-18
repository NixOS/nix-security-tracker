from collections.abc import Callable
from datetime import timedelta

import pytest
from django.core.exceptions import ValidationError

from shared.cache_suggestions import cache_new_suggestions
from shared.logs.fetchers import fetch_status_events_for_package
from shared.models import PackageOverlayEvent  # type: ignore
from shared.models.cve import Version
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
    PackageOverlay,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import (
    NixDerivation,
    NixEvaluation,
    NixMaintainer,
)
from shared.models.package import Package, PackageAttrpath
from shared.package_clustering import cluster_packages

EXTRA = "extra"


@pytest.fixture
def extra_maintainer(make_maintainer: Callable[..., NixMaintainer]) -> NixMaintainer:
    return make_maintainer(github_id=999, github="extra-maintainer")


@pytest.fixture
def extra_drv(
    make_drv: Callable[..., NixDerivation],
    extra_maintainer: NixMaintainer,
) -> NixDerivation:
    """A derivation in the latest evaluation that the matcher did not link."""
    drv = make_drv(pname=EXTRA, maintainer=extra_maintainer)
    cluster_packages(NixDerivation.objects.filter(pk=drv.pk))
    return drv


def test_add_package(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
    extra_maintainer: NixMaintainer,
) -> None:
    cached_suggestion.add_packages([EXTRA])

    overlay = cached_suggestion.package_overlays.get(package_attribute=EXTRA)
    assert overlay.type == PackageOverlay.Type.ADDITIONAL
    assert overlay.package == extra_drv.package_link.package

    payload = cached_suggestion.cached.payload
    assert EXTRA not in payload["original_packages"]
    package = payload["packages"][EXTRA]
    assert package["derivation_ids"] == [extra_drv.pk]
    (on_branch,) = package["branches"].values()
    assert on_branch["version"] == "1.0"
    assert on_branch["status"] == Version.Status.AFFECTED

    maintainers = payload["categorized_maintainers"]
    assert extra_maintainer.github_id in {m["github_id"] for m in maintainers["active"]}


def test_added_package_survives_cache_regeneration(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
) -> None:
    cached_suggestion.add_packages([EXTRA])
    before = cached_suggestion.cached.payload["packages"]

    cache_new_suggestions(cached_suggestion)
    cached_suggestion.refresh_from_db()

    assert cached_suggestion.cached.payload["packages"] == before


def test_added_package_uses_latest_evaluation(
    cached_suggestion: CVEDerivationClusterProposal,
    make_drv: Callable[..., NixDerivation],
    make_evaluation: Callable[..., NixEvaluation],
) -> None:
    old = make_drv(
        pname=EXTRA,
        version="0.9",
        evaluation=make_evaluation(age=timedelta(days=1)),
    )
    new = make_drv(pname=EXTRA, version="2.0")
    cluster_packages(NixDerivation.objects.filter(pk__in=[old.pk, new.pk]))

    cached_suggestion.add_packages([EXTRA])

    package = cached_suggestion.cached.payload["packages"][EXTRA]
    assert package["derivation_ids"] == [new.pk]


def test_add_package_without_current_derivations(
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """An attribute that is known but no longer evaluated is still shown."""
    pkg = Package.objects.create(name="gone", homepage="https://example.org/gone")
    PackageAttrpath.objects.create(package=pkg, attrpath="gone")

    cached_suggestion.add_packages(["gone"])

    package = cached_suggestion.cached.payload["packages"]["gone"]
    assert package["branches"] == {}
    assert package["derivation_ids"] == []


def test_add_package_unknown_attribute(
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    with pytest.raises(
        ValidationError, match="Unknown package attributes: does-not-exist"
    ):
        cached_suggestion.add_packages(["does-not-exist"])
    assert not cached_suggestion.package_overlays.exists()


def test_add_package_already_original(
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
) -> None:
    with pytest.raises(ValidationError, match="already part of the suggestion"):
        cached_suggestion.add_packages([drv.attribute])


def test_add_package_already_ignored_original(
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
) -> None:
    """Ignored original packages are restored, not added."""
    cached_suggestion.ignore_packages([drv.attribute])
    with pytest.raises(ValidationError, match="already part of the suggestion"):
        cached_suggestion.add_packages([drv.attribute])


def test_add_package_twice(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
) -> None:
    cached_suggestion.add_packages([EXTRA])
    with pytest.raises(ValidationError, match="Packages already added"):
        cached_suggestion.add_packages([EXTRA])


def test_remove_package(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
    extra_maintainer: NixMaintainer,
) -> None:
    cached_suggestion.add_packages([EXTRA])
    cached_suggestion.remove_packages([EXTRA])

    assert not cached_suggestion.package_overlays.exists()
    payload = cached_suggestion.cached.payload
    assert EXTRA not in payload["packages"]
    all_maintainers = {
        m["github_id"]
        for category in payload["categorized_maintainers"].values()
        for m in category
    }
    assert extra_maintainer.github_id not in all_maintainers


def test_remove_package_not_added(
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
) -> None:
    with pytest.raises(ValidationError, match="not added manually"):
        cached_suggestion.remove_packages([drv.attribute])


def test_ignore_added_package(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
) -> None:
    """Added packages are not part of the original packages and cannot be ignored."""
    cached_suggestion.add_packages([EXTRA])
    with pytest.raises(ValidationError, match="remove them instead"):
        cached_suggestion.ignore_packages([EXTRA])


def test_add_and_ignore_coexist(
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
    extra_drv: NixDerivation,
) -> None:
    cached_suggestion.ignore_packages([drv.attribute])
    cached_suggestion.add_packages([EXTRA])

    packages = cached_suggestion.cached.payload["packages"]
    assert set(packages) == {EXTRA}

    cached_suggestion.restore_packages([drv.attribute])
    packages = cached_suggestion.cached.payload["packages"]
    assert set(packages) == {drv.attribute, EXTRA}


def test_add_remove_events(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
) -> None:
    cached_suggestion.add_packages([EXTRA])
    cached_suggestion.remove_packages([EXTRA])

    labels = list(
        PackageOverlayEvent.objects.filter(suggestion_id=cached_suggestion.pk)
        .order_by("pgh_id")
        .values_list("pgh_label", flat=True)
    )
    assert labels == ["package.add", "package.delete"]


def test_package_feed_includes_added_package(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
) -> None:
    assert fetch_status_events_for_package(EXTRA) == []

    cached_suggestion.add_packages([EXTRA])

    events = fetch_status_events_for_package(EXTRA)
    assert {e.suggestion_id for e in events} == {cached_suggestion.pk}


def matcher_finds(suggestion: CVEDerivationClusterProposal, drv: NixDerivation) -> None:
    """Simulate a rematch that links `drv` to the suggestion."""
    DerivationClusterProposalLink.objects.create(
        proposal=suggestion,
        derivation=drv,
        provenance_flags=ProvenanceFlags.PACKAGE_NAME_MATCH,
    )
    cache_new_suggestions(suggestion)
    suggestion.refresh_from_db()


def test_added_package_found_by_matcher_stays_added(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
) -> None:
    cached_suggestion.add_packages([EXTRA])
    matcher_finds(cached_suggestion, extra_drv)

    assert EXTRA in cached_suggestion.cached.payload["original_packages"]
    assert EXTRA in cached_suggestion.added_package_attributes()

    cached_suggestion.remove_packages([EXTRA])
    assert EXTRA not in cached_suggestion.added_package_attributes()
    assert EXTRA in cached_suggestion.cached.payload["packages"]


def test_ignore_added_package_found_by_matcher(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
) -> None:
    """Ignoring a package that is both added and matched replaces the addition."""
    cached_suggestion.add_packages([EXTRA])
    matcher_finds(cached_suggestion, extra_drv)

    cached_suggestion.ignore_packages([EXTRA])

    overlay = cached_suggestion.package_overlays.get(package_attribute=EXTRA)
    assert overlay.type == PackageOverlay.Type.IGNORED
    assert EXTRA not in cached_suggestion.cached.payload["packages"]
    labels = list(
        PackageOverlayEvent.objects.filter(suggestion_id=cached_suggestion.pk)
        .order_by("pgh_id")
        .values_list("pgh_label", flat=True)
    )
    assert labels == ["package.add", "package.ignore"]

    cached_suggestion.restore_packages([EXTRA])
    assert not cached_suggestion.package_overlays.exists()
    assert EXTRA in cached_suggestion.cached.payload["packages"]
