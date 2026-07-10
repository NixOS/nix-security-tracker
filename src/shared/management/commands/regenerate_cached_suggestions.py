import logging
import time
from argparse import ArgumentParser
from typing import Any

from django.core.management.base import BaseCommand
from django.db.models import Exists, OuterRef, Q
from prometheus_client import CollectorRegistry, Gauge

from shared.cache_suggestions import cache_new_suggestions
from shared.metrics import write_metrics_textfile
from shared.models.cached import CachedSuggestions
from shared.models.linkage import CVEDerivationClusterProposal

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Regenerate cached suggestions"

    def add_arguments(self, parser: ArgumentParser) -> None:
        parser.add_argument(
            "--all",
            action="store_true",
            help="Regenerate all cached suggestions by purging existing cache first",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        if options.get("all"):
            label = "all"
            deleted_count, _ = CachedSuggestions.objects.all().delete()
            self.stdout.write(f"Purged {deleted_count} cached suggestion(s).")
            proposals = (
                CVEDerivationClusterProposal.objects.target_proposals()
                .order_by("-updated_at")
                .iterator()
            )
        else:
            label = "stale/missing"
            stale = CachedSuggestions.objects.stale()
            num_stale = stale.count()

            proposals = (
                CVEDerivationClusterProposal.objects.target_proposals()
                .filter(
                    Q(pk__in=stale.values("proposal_id"))
                    | ~Exists(
                        CachedSuggestions.objects.filter(proposal_id=OuterRef("pk"))
                    )
                )
                .order_by("-updated_at")
            )
            num_total = proposals.count()
            num_missing = num_total - num_stale
            self.stdout.write(
                f"Regenerating {num_total} entries "
                f"({num_stale} stale, {num_missing} missing)"
            )

        count = 0
        start = time.time()
        # FIXME(@fricklerhandwerk): Do this chunk-wise in bulk.
        for suggestion in proposals:
            cache_new_suggestions(suggestion)
            count += 1
        duration = time.time() - start

        registry = CollectorRegistry()
        Gauge(
            "sectracker_cache_regeneration_duration_seconds",
            "Duration of last cache regeneration run",
            registry=registry,
        ).set(duration)
        Gauge(
            "sectracker_cache_regeneration_suggestions",
            "Suggestions regenerated in last run",
            registry=registry,
        ).set(float(count))
        write_metrics_textfile("cache_regeneration", registry)

        self.stdout.write(
            f"Regenerated {count} {label} cached suggestions in {duration:.2f} seconds."
        )
