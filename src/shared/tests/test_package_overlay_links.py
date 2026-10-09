from collections.abc import Callable

import pytest
from django.db.models import RestrictedError

from shared.models.linkage import CVEDerivationClusterProposal
from shared.models.nix_evaluation import NixDerivation
from shared.models.package import Package


def test_ignore_package_links_overlay_to_package(
    drv: NixDerivation,
    make_package: Callable[..., Package],
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """Ignoring an attribute with a known package links the overlay to it."""
    pkg = make_package(drv)

    cached_suggestion.ignore_package(drv.attribute)

    overlay = cached_suggestion.package_overlays.get(package_attribute=drv.attribute)
    assert overlay.package == pkg


def test_deleting_package_with_overlay_is_restricted(
    drv: NixDerivation,
    make_package: Callable[..., Package],
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """A package that overlays refer to cannot be deleted."""
    pkg = make_package(drv)
    cached_suggestion.ignore_package(drv.attribute)

    with pytest.raises(RestrictedError):
        pkg.delete()

    overlay = cached_suggestion.package_overlays.get(package_attribute=drv.attribute)
    assert overlay.package == pkg
