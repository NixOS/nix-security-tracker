from collections.abc import Callable

from django.core.management import call_command

from shared.models import (
    CVEDerivationClusterProposal,
    MaintainerOverlay,
    MaintainerOverlayEvent,
    PackageOverlay,
    PackageOverlayEvent,
)
from shared.models.cve import Container
from shared.models.nix_evaluation import NixMaintainer


def test_migrate_overlay_data(
    cve: Container,
    suggestion: CVEDerivationClusterProposal,
    make_maintainer: Callable[..., NixMaintainer],
) -> None:
    suggestion = CVEDerivationClusterProposal.objects.create(
        status="pending",
        cve=cve.cve,
    )

    maintainer_overlay_add = MaintainerOverlay.objects.create(
        overlay_type="add",
        maintainer=make_maintainer(github_id=123),
        suggestion=suggestion,
    )

    maintainer_overlay_event_add = MaintainerOverlayEvent.objects.create(
        id=1,
        overlay_type=maintainer_overlay_add.overlay_type,
        maintainer=maintainer_overlay_add.maintainer,
        suggestion=maintainer_overlay_add.suggestion,
        pgh_obj_id=maintainer_overlay_add.id,
        pgh_label="maintainers.add",
    )

    maintainer_overlay_remove = MaintainerOverlay.objects.create(
        overlay_type="remove",
        maintainer=make_maintainer(github_id=124),
        suggestion=suggestion,
    )

    maintainer_overlay_event_remove = MaintainerOverlayEvent.objects.create(
        id=2,
        overlay_type=maintainer_overlay_remove.overlay_type,
        maintainer=maintainer_overlay_remove.maintainer,
        suggestion=maintainer_overlay_remove.suggestion,
        pgh_obj_id=maintainer_overlay_remove.id,
        pgh_label="maintainers.remove",
    )

    package_overlay_remove = PackageOverlay.objects.create(
        overlay_type="remove", package_attribute="new attribute", suggestion=suggestion
    )

    package_overlay_event_remove = PackageOverlayEvent.objects.create(
        id=1,
        overlay_type=package_overlay_remove.overlay_type,
        package_attribute=package_overlay_remove.package_attribute,
        suggestion=package_overlay_remove.suggestion,
        pgh_obj_id=package_overlay_remove.id,
        pgh_label="package.remove",
    )
    package_overlay_event_add = PackageOverlayEvent.objects.create(
        id=1,
        overlay_type=package_overlay_remove.overlay_type,
        package_attribute=package_overlay_remove.package_attribute,
        suggestion=package_overlay_remove.suggestion,
        pgh_obj_id=package_overlay_remove.id,
        pgh_label="package.add",
    )

    call_command("migrate_overlay_data")

    maintainer_overlay_add.refresh_from_db()
    maintainer_overlay_remove.refresh_from_db()
    package_overlay_remove.refresh_from_db()
    maintainer_overlay_event_add.refresh_from_db()
    maintainer_overlay_event_remove.refresh_from_db()
    package_overlay_event_remove.refresh_from_db()
    package_overlay_event_add.refresh_from_db()

    assert maintainer_overlay_add.overlay_type == "additional"
    assert maintainer_overlay_remove.overlay_type == "ignored"
    assert package_overlay_remove.overlay_type == "ignored"

    assert maintainer_overlay_event_add.overlay_type == "additional"
    assert maintainer_overlay_event_remove.overlay_type == "ignored"
    assert package_overlay_event_remove.overlay_type == "ignored"

    assert maintainer_overlay_event_add.pgh_label == "maintainer.add"
    assert maintainer_overlay_event_remove.pgh_label == "maintainer.delete"
    assert package_overlay_event_remove.pgh_label == "package.ignore"
    assert package_overlay_event_add.pgh_label == "package.restore"
