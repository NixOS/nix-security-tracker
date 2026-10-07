import pytest
from django.db.models import RestrictedError

from shared.models.linkage import CVEDerivationClusterProposal
from shared.models.nix_evaluation import NixDerivation


def test_ignore_package_links_overlay_to_package(
    drv: NixDerivation,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """Ignoring an attribute with a known package links the overlay to it."""
    cached_suggestion.ignore_package(drv.attribute)

    overlay = cached_suggestion.package_overlays.get(package_attribute=drv.attribute)
    assert overlay.package == drv.package_link.package


def test_deleting_package_with_overlay_is_restricted(
    drv: NixDerivation,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """A package that overlays refer to cannot be deleted."""
    pkg = drv.package_link.package
    cached_suggestion.ignore_package(drv.attribute)

    with pytest.raises(RestrictedError):
        pkg.delete()

    overlay = cached_suggestion.package_overlays.get(package_attribute=drv.attribute)
    assert overlay.package == pkg
