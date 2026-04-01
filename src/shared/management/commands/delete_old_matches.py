from argparse import ArgumentParser
from datetime import timedelta
from typing import Any

from django.core.management.base import BaseCommand
from django.db.models import Q
from django.utils import timezone

from shared.models.linkage import CVEDerivationClusterProposal


class Command(BaseCommand):
    help = (
        "Delete CVE matches (proposals) linked to CVEs published more than 1 year ago"
    )

    def add_arguments(self, parser: ArgumentParser) -> None:
        parser.add_argument(
            "--batch-size",
            type=int,
            default=1000,
            help="Number of proposals to delete per batch (default: 1000)",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            default=False,
            help="Report what would be deleted without making any changes",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        cutoff = timezone.now() - timedelta(days=365)
        batch_size: int = options["batch_size"]
        dry_run: bool = options["dry_run"]

        if dry_run:
            self.stdout.write("Dry run -- no data will be deleted.")

        # Primary anchor: date_published.
        # Fallback: date_reserved for CVEs that were never formally published.
        old_proposals = CVEDerivationClusterProposal.objects.filter(
            Q(cve__date_published__lt=cutoff)
            | Q(
                cve__date_published__isnull=True,
                cve__date_reserved__lt=cutoff,
            ),
            status=CVEDerivationClusterProposal.Status.PENDING,
        )

        total = old_proposals.count()
        self.stdout.write(
            f"Found {total} proposal(s) linked to CVEs older than 1 year (cutoff: {cutoff.date()})."
        )

        if total == 0 or dry_run:
            return

        # We process in batches to avoid fetching all PKs into memory at once.
        # Since we are deleting records, the records matching the filter will shrink,
        # so we always just fetch the first batch_size records until none are left.
        # This keeps the execution strictly incremental, scaling perfectly for large tables.
        deleted_total = 0
        batch_num = 1

        while True:
            batch_pks = list(old_proposals.values_list("pk", flat=True)[:batch_size])
            if not batch_pks:
                break

            deleted, details = CVEDerivationClusterProposal.objects.filter(
                pk__in=batch_pks
            ).delete()

            deleted_total += deleted
            self.stdout.write(
                f"Deleted batch {batch_num}: {deleted} row(s). Details: {details}"
            )
            batch_num += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Deleted {deleted_total} row(s) in total across all related tables."
            )
        )
