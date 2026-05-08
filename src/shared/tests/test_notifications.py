from collections.abc import Callable

from django.contrib.auth.models import User

from shared.models.nix_evaluation import (
    NixDerivation,
    NixMaintainer,
)
from webview.models import Notification


def test_github_username_changed(
    user: User,
    make_maintainer_from_user: Callable[..., NixMaintainer],
    make_drv: Callable[..., NixDerivation],
    make_package_notification: Callable[..., list[Notification]],
) -> None:
    """
    Check that notifications get sent even if the user's GitHub handle changed after first login.
    """
    maintainer = make_maintainer_from_user(user)
    drv = make_drv(maintainer=maintainer)
    # GitHub username could have changed between evaluations.
    maintainer.github = maintainer.github + "-new"
    maintainer.save()
    notifications = make_package_notification(drv)
    assert notifications
