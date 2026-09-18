"""
Remove imported matching training-data from the local database.
"""

from __future__ import annotations

from typing import Any

import pgtrigger
from django.core.management.base import BaseCommand

from shared.matching_training_data.purge import purge_training_corpus


class Command(BaseCommand):
    help = (
        "Delete CVEs imported as matching training data and derivations on the "
        "synthetic benchmark channel. Does not remove the training organization "
        "or the benchmark channel/evaluation rows."
    )

    def handle(self, *args: Any, **options: Any) -> None:
        # Quiet the purge: pgpubsub delete triggers would otherwise enqueue work.
        with pgtrigger.ignore():
            totals = purge_training_corpus()

        self.stdout.write(
            self.style.SUCCESS(f"Purged matching training data: {totals}")
        )
