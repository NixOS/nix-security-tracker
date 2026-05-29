from collections.abc import Callable

from django.contrib.auth.models import User

from shared.models.linkage import CVEDerivationClusterProposal, ProvenanceFlags
from shared.models.nix_evaluation import (
    NixDerivation,
    NixMaintainer,
)
from shared.notify_users import create_package_subscription_notifications


def test_github_username_changed(
    user: User,
    make_maintainer_from_user: Callable[..., NixMaintainer],
    make_drv: Callable[..., NixDerivation],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """
    Check that notifications get sent even if the user's GitHub handle changed after first login.
    """
    maintainer = make_maintainer_from_user(user)
    drv = make_drv(maintainer=maintainer)
    # GitHub username could have changed between evaluations.
    maintainer.github = maintainer.github + "-new"
    maintainer.save()

    suggestion = make_cached_suggestion(drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH})
    notifications = create_package_subscription_notifications(suggestion)
    assert notifications
