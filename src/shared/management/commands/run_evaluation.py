import asyncio
import textwrap
from argparse import ArgumentParser
from typing import Any

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from shared.listeners.nix_evaluation import evaluation_entrypoint
from shared.models import NixChannel, NixEvaluation


class Command(BaseCommand):
    help = (
        "Evaluate the given commit from a fetched channel and ingest the resulting data"
    )

    def add_arguments(self, parser: ArgumentParser) -> None:
        parser.add_argument(
            "commit",
            type=str,
            help="Nixpkgs commit to evaluate",
        )

    def handle(self, *args: Any, **kwargs: Any) -> str | None:
        try:
            channel = NixChannel.objects.get(head_sha1_commit=kwargs["commit"])
        except NixChannel.DoesNotExist:
            raise CommandError(
                textwrap.dedent("""
                Need a commit from a fetched channel!
                To fetch all channels, run:

                    manage fetch_all_channels
             """)
            )
        try:
            evaluation = NixEvaluation.objects.get(commit_sha1=kwargs["commit"])
        except NixEvaluation.DoesNotExist:
            evaluation, _ = NixEvaluation.objects.get_or_create(
                commit_sha1=kwargs["commit"],
                defaults={"state": NixEvaluation.EvaluationState.WAITING},
            )
            evaluation.on_branches.add(channel.release_branch)
        asyncio.run(
            evaluation_entrypoint(
                settings.DEFAULT_SLEEP_WAITING_FOR_EVALUATION_SLOT,
                evaluation,
            )
        )
