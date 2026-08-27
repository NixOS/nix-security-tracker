from typing import Any

import pgpubsub
from django.core.management.base import BaseCommand

from shared.channels import SuggestionRefreshChannel
from shared.models.linkage import CVEDerivationClusterProposal


class Command(BaseCommand):
    help = "Dispatch a re-match of untriaged suggestions when there's a newer matching algorithm."

    def handle(self, *args: Any, **options: Any) -> None:
        stale_pks = CVEDerivationClusterProposal.objects.filter(
            status__in=[
                CVEDerivationClusterProposal.Status.PENDING,
                CVEDerivationClusterProposal.Status.ACCEPTED,
            ],
            algorithm_version__lt=CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION,
        ).values_list("pk", flat=True)

        if not stale_pks:
            self.stdout.write("No stale suggestions; nothing to do.")
            return

        for pk in stale_pks.iterator():
            pgpubsub.notify(SuggestionRefreshChannel, pk=pk)

        self.stdout.write(
            self.style.SUCCESS(
                f"Dispatched {stale_pks.count()} stale suggestion(s) for rematch."
            )
        )
