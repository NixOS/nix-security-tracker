from collections import defaultdict
from itertools import batched
from typing import Any

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction

from shared.models.nix_evaluation import NixDerivation, NixEvaluation
from shared.package_clustering import set_package_maintainers


class Command(BaseCommand):
    help = "Backfill package maintainers from the latest completed evaluation of the tracking branch."

    def add_arguments(self, parser: Any) -> None:
        parser.add_argument(
            "--batch-size",
            type=int,
            default=1000,
            help="Number of packages to process per batch.",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        evaluation = (
            NixEvaluation.objects.filter(
                state=NixEvaluation.EvaluationState.COMPLETED,
                on_branches__name=settings.TRACKING_BRANCH,
            )
            .order_by("-updated_at")
            .first()
        )
        if evaluation is None:
            self.stdout.write(
                "No completed evaluation on the tracking branch; nothing to do."
            )
            return

        maintainer_sources: dict[int, set[int]] = defaultdict(set)
        for package_id, metadata_id in (
            NixDerivation.objects.filter(
                parent_evaluation=evaluation,
                package_link__isnull=False,
                metadata__isnull=False,
            )
            .values_list("package_link__package_id", "metadata_id")
            .iterator()
        ):
            maintainer_sources[package_id].add(metadata_id)

        self.stdout.write(
            f"Setting maintainers of {len(maintainer_sources)} packages from {evaluation}..."
        )
        for package_ids in batched(maintainer_sources, options["batch_size"]):
            with transaction.atomic():
                set_package_maintainers(
                    {
                        package_id: maintainer_sources[package_id]
                        for package_id in package_ids
                    }
                )

        self.stdout.write(self.style.SUCCESS("Done."))
