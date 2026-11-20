import logging
from typing import Any

from allauth.account.signals import user_signed_up
from allauth.socialaccount.models import SocialLogin
from django.dispatch import receiver
from github.NamedUser import NamedUser

from shared.auth.github_state import get_github_state

logger = logging.getLogger(__name__)


@receiver(user_signed_up)
def set_groups_for_new_user(sociallogin: SocialLogin, **kwargs: dict[str, Any]) -> None:
    """
    Setup group memberships for a newly created user.
    """
    if sociallogin.account:
        gh_state = get_github_state()

        github_id: int = int(sociallogin.account.uid)
        gh_named_user: NamedUser = gh_state.github.get_user_by_id(user_id=github_id)

        if gh_state.security_team.has_in_members(gh_named_user):
            sociallogin.account.user.groups.add(gh_state.security_group)

        if gh_state.committers_team.has_in_members(gh_named_user):
            sociallogin.account.user.groups.add(gh_state.committers_group)

    else:
        logger.error("Found a user sign up that didn't set an account.")
