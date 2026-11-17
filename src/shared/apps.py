from functools import cached_property
from typing import TYPE_CHECKING

from django.apps import AppConfig

if TYPE_CHECKING:
    from shared.auth.github_state import GithubState


class SharedConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "shared"

    def ready(self) -> None:
        import shared.listeners  # noqa

        # Registers the sign-up receiver that assigns groups to new users.
        # Must not touch GitHub or the database: `ready()` runs in every process,
        # including each web server worker and each management command.
        # The full sync runs separately, via `manage sync_github_teams`.
        import shared.auth.github_state  # noqa

    @cached_property
    def github_state(self) -> "GithubState":
        """
        GitHub organisation and team handles, fetched on first use and kept for the process lifetime.
        """
        from shared.auth.github_state import GithubState

        return GithubState()
