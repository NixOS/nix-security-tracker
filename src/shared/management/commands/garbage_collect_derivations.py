from argparse import ArgumentParser
from itertools import chain
from typing import Any

from django.core.management.base import BaseCommand

from shared.models import (
    NixDerivation,
    NixDerivationMeta,
    NixEvaluation,
)


class Command(BaseCommand):
    help = "Remove derivations left over from crashed evaluations"

    def add_arguments(self, parser: ArgumentParser) -> None:
        parser.add_argument(
            "--batch_size",
            type=int,
            help="How many derivations to delete at once (determines output frequency)",
            default=10000,
        )

    def handle(self, *args: Any, **options: Any) -> None:
        # FIXME(@fricklerhandwerk): This assumes derivations are deleted when their metadata is deleted, which is the case at the time of writing.
        # Derivations should instead be protected, but currently we're not deduplicating any metadata.
        # Fix this logic when derivation metadata is deduplicated!
        # FIXME(@fricklerhandwerk): This orphans `NixDerivationOutput` row, which are currently already 100x redundant.
        # It's impractical to garbage-collect them without copying, so the fix would be to rewire all live derivations in a migration, and drop that table.
        metas = NixDerivation.objects.filter(
            parent_evaluation__state__in=[
                NixEvaluation.EvaluationState.CRASHED,
                NixEvaluation.EvaluationState.FAILED,
            ]
            # XXX(@fricklerhandwerk): We could exclude drvs from crashed evals that belong to accepted or published suggestions to be safe.
            # But checking the production database, all such instances have drvs from completed evals with the same attribute name,
            # and we're not creating any new problematic instances.
        ).values_list("metadata", flat=True)

        orphaned = NixDerivationMeta.objects.filter(
            derivation__isnull=True
        ).values_list("id", flat=True)

        all_metas = chain(metas, orphaned)

        self.stdout.write("Querying derivations from crashed and failed evaluations...")

        batch_size = options["batch_size"]
        metas_list = list(all_metas)
        total = len(metas_list)

        self.stdout.write(
            f"Found {metas.count()} derivations and {orphaned.count()} orphaned metadata entries"
        )

        for i in range(0, total, batch_size):
            batch = metas_list[i : i + batch_size]
            deleted, details = NixDerivationMeta.objects.filter(id__in=batch).delete()
            self.stdout.write(f"Deleted {i + batch_size}/{total} ({deleted} rows)")
            self.stdout.write(str(details))
