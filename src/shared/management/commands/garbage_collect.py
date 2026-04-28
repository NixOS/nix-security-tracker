from argparse import ArgumentDefaultsHelpFormatter, ArgumentParser
from datetime import timedelta
from typing import Any

from django.core.management.base import BaseCommand, CommandParser, DjangoHelpFormatter
from django.db import connection, models
from django.db.models import QuerySet
from django.utils import timezone

from shared.models import (  # type: ignore
    CVEDerivationClusterProposalStatusEvent,
    DerivationClusterProposalLinkEvent,
)
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
)
from shared.models.nix_evaluation import (
    NixChannel,
    NixDerivation,
    NixDerivationMeta,
    NixEvaluation,
)


class Command(BaseCommand):
    help = "Garbage collect stale proposals, derivations, evaluations and channels"

    # FIXME(@fricklerhandwerk): Use this for all management commands from a single source of truth.
    def create_parser(
        self, prog_name: str, subcommand: str, **kwargs: Any
    ) -> CommandParser:
        parser = super().create_parser(prog_name, subcommand, **kwargs)

        class DefaultsHelpFormatter(DjangoHelpFormatter, ArgumentDefaultsHelpFormatter):
            """
            Print default values for arguments.
            This needs mixing with `DjangoHelpFormatter` to keep printing the custom arguments first.
            """

            pass

        parser.formatter_class = DefaultsHelpFormatter
        return parser

    def add_arguments(self, parser: ArgumentParser) -> None:
        parser.add_argument(
            "--dry-run",
            action="store_true",
            default=False,
            help="Report what would be deleted without making any changes",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=50000,
            help="Number of records to delete per batch",
        )
        parser.add_argument(
            "--cutoff-days",
            type=int,
            default=365,
            help="Number of days for data cutoff",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        cutoff = timezone.now() - timedelta(days=options["cutoff_days"])
        dry_run: bool = options["dry_run"]
        batch_size: int = options["batch_size"]

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f"Dry run — no data will be deleted. Cutoff date: {cutoff.date()}"
                )
            )

        # The order here is intentional and required.
        # Each step satisfies the cascading constraints that gate the next step.
        # `pghistory` events are never auto-deleted — each step explicitly clears relevant events first.

        self.stdout.write("\n[1/4] Deleting stale matches")
        self._delete_stale_matches(cutoff, batch_size, dry_run)
        self.stdout.write("\n[1/4] Stale proposals cleanup completed")
        self.stdout.write("\n[2/4] deleting unmatched derivations")
        self._delete_unmatched_derivations(cutoff, batch_size, dry_run)
        self.stdout.write("\n[3/4] delete empty evaluations")
        self._delete_empty_evaluations(cutoff, batch_size, dry_run)
        self.stdout.write("\n[4/4] deleting inactive channels")
        self._delete_inactive_channels(batch_size, dry_run)

        self.stdout.write(self.style.SUCCESS("\nGarbage collection complete."))

    def _delete_stale_matches(
        self, cutoff: Any, batch_size: int, dry_run: bool
    ) -> None:
        candidates = CVEDerivationClusterProposal.objects.filter(
            created_at__lt=cutoff,
            status=CVEDerivationClusterProposal.Status.PENDING,
            # No user input must be attached
            maintainer_overlays__isnull=True,
            package_overlays__isnull=True,
            reference_url_overlays__isnull=True,
        ).distinct()

        total = candidates.count()
        self.stdout.write(f"Found {total} eligible proposals.")

        if total == 0 or dry_run:
            return

        proposal_ids = list(candidates.values_list("id", flat=True))
        link_ids = list(
            DerivationClusterProposalLink.objects.filter(
                proposal_id__in=proposal_ids
            ).values_list("id", flat=True)
        )

        self._purge_events(
            CVEDerivationClusterProposalStatusEvent,
            pgh_obj_id__in=proposal_ids,
            label="proposal status events",
        )
        self._purge_events(
            DerivationClusterProposalLinkEvent,
            pgh_obj_id__in=link_ids,
            label="derivation link events",
        )

        self._delete_in_batches(
            qs=candidates,
            model=CVEDerivationClusterProposal,
            pk_field="id",
            label="proposals",
            batch_size=batch_size,
        )

    def _delete_unmatched_derivations(
        self, cutoff: Any, batch_size: int, dry_run: bool
    ) -> None:
        failed_crashed = NixDerivation.objects.filter(
            parent_evaluation__state__in=[
                NixEvaluation.EvaluationState.FAILED,
                NixEvaluation.EvaluationState.CRASHED,
            ],
        )

        completed_unmatched = NixDerivation.objects.filter(
            parent_evaluation__updated_at__lt=cutoff,
            parent_evaluation__state=NixEvaluation.EvaluationState.COMPLETED,
            cve_links_proposals__isnull=True,
        )

        candidates = failed_crashed | completed_unmatched

        meta_ids = list(
            candidates.filter(metadata__isnull=False).values_list(
                "metadata_id", flat=True
            )
        )

        self._delete_in_batches(
            qs=candidates,
            model=NixDerivation,
            pk_field="id",
            label="derivations",
            batch_size=batch_size,
            dry_run=dry_run,
        )

        meta_candidates = NixDerivationMeta.objects.filter(pk__in=meta_ids)
        self._delete_in_batches(
            qs=meta_candidates,
            model=NixDerivationMeta,
            pk_field="id",
            label="derivation metas",
            batch_size=batch_size,
            dry_run=dry_run,
        )

    def _delete_empty_evaluations(
        self, cutoff: Any, batch_size: int, dry_run: bool
    ) -> None:
        candidates = NixEvaluation.objects.filter(
            state__in=[
                NixEvaluation.EvaluationState.FAILED,
                NixEvaluation.EvaluationState.CRASHED,
            ],
            derivations__isnull=True,
        )

        self._delete_in_batches(
            qs=candidates,
            model=NixEvaluation,
            pk_field="id",
            label="evaluations",
            batch_size=batch_size,
            dry_run=dry_run,
        )

    def _delete_inactive_channels(self, batch_size: int, dry_run: bool) -> None:
        candidates = (
            NixChannel.objects.filter(
                state__in=[
                    NixChannel.ChannelState.END_OF_LIFE,
                    NixChannel.ChannelState.DEPRECATED,
                ]
            )
            .exclude(evaluations__derivations__cve_links_proposals__isnull=False)
            .exclude(
                # No user input must be attached.
                # Currently only ignored/additional maintainers relate directly to derivations.
                evaluations__derivations__metadata__maintainers__maintaineroverlay__isnull=False
            )
            .exclude(evaluations__derivations__isnull=False)
            .exclude(evaluations__isnull=False)
            .distinct()
        )

        total = candidates.count()
        self.stdout.write(f"Found {total} eligible inactive channels.")

        if total == 0 or dry_run:
            return

        self._delete_in_batches(
            qs=candidates,
            model=NixChannel,
            pk_field="channel_branch",
            label="channels",
            batch_size=batch_size,
        )

    def _purge_events(
        self,
        event_model: type[models.Model],
        label: str,
        **filter_kwargs: Any,
    ) -> None:
        table_name = event_model._meta.db_table

        try:
            with connection.cursor() as cursor:
                # Disable the append-only trigger as we have "append-only" trigger
                # that prevents updates and deletes.
                # let temporarily disable it.
                cursor.execute(f"ALTER TABLE {table_name} DISABLE TRIGGER ALL")

            deleted, _ = event_model.objects.filter(**filter_kwargs).delete()
            self.stdout.write(f"Purged {deleted} {label}.")
        finally:
            with connection.cursor() as cursor:
                cursor.execute(f"ALTER TABLE {table_name} ENABLE TRIGGER ALL")

    def _delete_in_batches(
        self,
        qs: QuerySet,
        model: type[models.Model],
        pk_field: str,
        label: str,
        batch_size: int,
        dry_run: bool = False,
    ) -> None:
        total = qs.count()
        self.stdout.write(f"Found {total} eligible {label}.")

        if total == 0 or dry_run:
            return

        deleted_total = 0
        batch_num = 1

        while True:
            batch_pks = list(qs.values_list(pk_field, flat=True)[:batch_size])
            if not batch_pks:
                break

            deleted, _ = model.objects.filter(**{f"{pk_field}__in": batch_pks}).delete()
            deleted_total += deleted
            self.stdout.write(
                f"Batch {batch_num}: deleted {deleted_total}/{total} {label}."
            )
            batch_num += 1

        self.stdout.write(self.style.SUCCESS(f"Done. Deleted {deleted_total} {label}."))
