import asyncio
import textwrap
from argparse import ArgumentParser
from typing import Any

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from shared.listeners.nix_channels import enqueue_evaluation_job
from shared.listeners.nix_evaluation import evaluation_entrypoint
from shared.models import NixEvaluation
from shared.models.nix_evaluation import NixpkgsBranch


class Command(BaseCommand):
    help = (
        "Evaluate the given commit from a fetched branch and ingest the resulting data"
    )

    def add_arguments(self, parser: ArgumentParser) -> None:
        parser.add_argument(
            "commit",
            type=str,
            help="Nixpkgs commit to evaluate",
        )

    def handle(self, *args: Any, **kwargs: Any) -> str | None:
        try:
            branch = NixpkgsBranch.objects.get(head_sha1_commit=kwargs["commit"])
        except NixpkgsBranch.DoesNotExist:
            raise CommandError(
                textwrap.dedent("""
                Need a commit from a fetched branch!
                To fetch all branches, run:

                    manage fetch_all_channels
             """)
            )
        try:
            evaluation = NixEvaluation.objects.select_related("branch").get(
                branch=branch,
                commit_sha1=kwargs["commit"],
            )
        except NixEvaluation.DoesNotExist:
            enqueue_evaluation_job(branch)
            evaluation = NixEvaluation.objects.select_related("branch").get(
                branch=branch,
                commit_sha1=kwargs["commit"],
            )
        asyncio.run(
            evaluation_entrypoint(
                settings.DEFAULT_SLEEP_WAITING_FOR_EVALUATION_SLOT,
                evaluation,
            )
        )
