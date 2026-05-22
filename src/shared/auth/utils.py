from typing import Any

from django.conf import settings
from django.db.models import F

from shared.models import NixMaintainer


# Request utilities
def isadmin(user: Any) -> bool:
    return user.is_staff or user.groups.filter(name=settings.DB_SECURITY_TEAM).exists()


def iscommitter(user: Any) -> bool:
    return user.groups.filter(name=settings.DB_COMMITTERS_TEAM).exists()


def ismaintainer(user: Any) -> bool:
    return NixMaintainer.objects.filter(
        github_id=user.socialaccount_set.get(provider="github").uid,
        nixderivationmeta__derivation__parent_evaluation__commit_sha1=F(
            "nixderivationmeta__derivation__parent_evaluation__channel__head_sha1_commit"
        ),
    ).exists()


def user_can_edit_suggestion(user: Any) -> bool:
    return isadmin(user) or iscommitter(user)
