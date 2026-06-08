from argparse import ArgumentParser
from typing import Any

from django.core.management.base import BaseCommand
from django.db.models import Max

from shared.models.nix_evaluation import NixDerivation, NixEvaluation
from shared.package_clustering import cluster_packages


class Command(BaseCommand):
    help = "Backfill package assignments for existing derivations."

    def add_arguments(self, parser: ArgumentParser) -> None:
        parser.add_argument(
            "--batch-size",
            type=int,
            default=10_000,
            help="Number of rows to process per batch.",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        batch_size: int = options["batch_size"]
        # Snapshot the cutoff before any work begins.
        # Evaluations that complete after this moment are left to the post-eval listener.
        # Evaluations completed at or before the cutoff are the backfill's domain
        # this includes any evaluation whose listener fired but crashed before clustering.
        cutoff = NixEvaluation.objects.filter(
            state=NixEvaluation.EvaluationState.COMPLETED
        ).aggregate(latest=Max("updated_at"))["latest"]
        if cutoff is None:
            self.stdout.write("No completed evaluations; nothing to do.")
            return
        unmatched = NixDerivation.objects.filter(
            package_link__isnull=True,
            parent_evaluation__state=NixEvaluation.EvaluationState.COMPLETED,
            parent_evaluation__updated_at__lte=cutoff,
        )
        total = unmatched.count()
        self.stdout.write(f"Clustering {total} derivations...")
        # The backfill never updates existing package metadata, that is the listener's job.
        # update_packages=False ensures we only assign derivations to packages without
        # touching homepage/description, regardless of channel type.
        result = cluster_packages(
            unmatched, update_packages=False, batch_size=batch_size
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Clustered {result.derivations_processed} derivations: "
                f"updated {result.packages_updated}, created {result.packages_created} pacakges, "
                f"updated {result.attrpaths_updated}, created {result.attrpaths_created} attrpaths."
            )
        )
