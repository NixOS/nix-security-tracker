from typing import Any

from django.core.management.base import BaseCommand

from shared.github import get_gh
from shared.ingest_github_events import sync_github_events


class Command(BaseCommand):
    help = "Record what happened on GitHub to the issues we published"

    def handle(self, *args: Any, **options: Any) -> None:
        sync_github_events(get_gh())
