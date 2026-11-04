from collections.abc import Callable

import pytest
from django.db.models import RestrictedError

from shared.logs.events import RawPackageEvent
from shared.logs.fetchers import fetch_suggestion_events
from shared.models.linkage import CVEDerivationClusterProposal, ProvenanceFlags
from shared.models.nix_evaluation import NixDerivation


def test_ignore_package_links_overlay_to_package(
    drv: NixDerivation,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """Ignoring a package links the overlay to it."""
    pkg = drv.package_link.package
    cached_suggestion.ignore_package(pkg.id)

    overlay = cached_suggestion.package_overlays.get()
    assert overlay.package == pkg


def test_deleting_package_with_overlay_is_restricted(
    drv: NixDerivation,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """A package that overlays refer to cannot be deleted."""
    pkg = drv.package_link.package
    cached_suggestion.ignore_package(pkg.id)
    # Links to suggestions protect the package as well, so drop them to only check the overlay.
    cached_suggestion.package_links.all().delete()

    with pytest.raises(RestrictedError):
        pkg.delete()

    overlay = cached_suggestion.package_overlays.get()
    assert overlay.package == pkg


def test_package_events_link_to_package(
    drv: NixDerivation,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """Activity log package events carry the package of their overlay, even after it's restored."""
    pkg = drv.package_link.package
    cached_suggestion.ignore_package(pkg.id)
    cached_suggestion.restore_package(pkg.id)

    events = fetch_suggestion_events([cached_suggestion.pk])[cached_suggestion.pk]
    package_events = [e for e in events if isinstance(e, RawPackageEvent)]

    assert {e.action for e in package_events} == {"package.ignore", "package.restore"}
    for event in package_events:
        assert event.package == {
            "id": pkg.id,
            "name": pkg.name,
            "homepage": pkg.homepage,
        }


def test_package_with_several_attrpaths_is_ignored_as_one(
    make_drv: Callable[..., NixDerivation],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Attribute paths of the same package show up as one package, and ignoring it hides all of them."""
    drv = make_drv(pname="foo", attribute="foo")
    alias = make_drv(pname="foo", attribute="fooAlias")
    suggestion = make_cached_suggestion(
        drvs={
            drv: ProvenanceFlags.PACKAGE_NAME_MATCH,
            alias: ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
    )
    pkg = drv.package_link.package
    assert alias.package_link.package == pkg

    [original] = suggestion.cached.payload["original_packages"]
    assert original["id"] == pkg.id
    assert [a["attrpath"] for a in original["attrpaths"]] == ["foo", "fooAlias"]

    suggestion.ignore_package(pkg.id)
    suggestion.refresh_from_db()

    assert suggestion.cached.payload["packages"] == []
    assert [p["id"] for p in suggestion.cached.payload["original_packages"]] == [pkg.id]
