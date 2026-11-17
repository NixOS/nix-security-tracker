from typing import Any

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from shared.auth.github_state import GithubState


class Command(BaseCommand):
    help = "Update group memberships of all users from their GitHub team memberships"

    def handle(self, *args: Any, **options: Any) -> None:
        if not settings.SYNC_GITHUB_TEAMS:
            raise CommandError("SYNC_GITHUB_TEAMS is not enabled")

        GithubState().sync_groups_with_github_teams()
