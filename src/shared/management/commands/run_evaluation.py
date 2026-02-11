import asyncio
import textwrap
from argparse import ArgumentParser
from typing import Any

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from shared.listeners.nix_channels import enqueue_evaluation_job
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
            evaluation = NixEvaluation.objects.select_related("channel").get(
                commit_sha1=kwargs["commit"]
            )
        except NixEvaluation.DoesNotExist:
            enqueue_evaluation_job(channel)
            evaluation = NixEvaluation.objects.select_related("channel").get(
                commit_sha1=kwargs["commit"]
            )
        asyncio.run(
            evaluation_entrypoint(
                settings.DEFAULT_SLEEP_WAITING_FOR_EVALUATION_SLOT,
                evaluation,
            )
        )
