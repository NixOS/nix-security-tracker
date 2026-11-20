from typing import Any

from django.core.management.base import BaseCommand

from shared.auth.github_state import GithubState


class Command(BaseCommand):
    help = "Update group memberships of all users from their GitHub team memberships"

    def handle(self, *args: Any, **options: Any) -> None:
        GithubState().sync_groups_with_github_teams()
