import time
from argparse import ArgumentDefaultsHelpFormatter, ArgumentParser
from datetime import timedelta
from typing import Any

from django.core.management.base import BaseCommand, CommandParser, DjangoHelpFormatter
from django.db import connection, models
from django.db.models import (
    Q,
    QuerySet,
)
from django.utils import timezone
from pgpubsub.models import Notification
from prometheus_client import CollectorRegistry, Gauge

from shared.channels import NixEvaluationUpdateChannel, SuggestionRefreshChannel
from shared.metrics import write_metrics_textfile
from shared.models import (  # type: ignore
    CVEDerivationClusterProposalStatusEvent,
    DerivationClusterProposalLinkEvent,
)
from shared.models.linkage import CVEDerivationClusterProposal
from shared.models.nix_evaluation import (
    NixDerivation,
    NixDerivationMeta,
    NixEvaluation,
)
from shared.models.package import PackageAttrpath

DEFAULT_CUTOFF_DAYS = 365 // 2


def _merge(into: dict[str, int], other: dict[str, int]) -> dict[str, int]:
    for k, v in other.items():
        into[k] = into.get(k, 0) + v
    return into


class Command(BaseCommand):
    help = "Garbage collect stale proposals, derivations, and evaluations"

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
            "--batch-size",
            type=int,
            default=50000,
            help="Number of records to delete per batch",
        )
        parser.add_argument(
            "--cutoff-days",
            type=int,
            default=DEFAULT_CUTOFF_DAYS,
            help="Number of days for data cutoff",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        cutoff = timezone.now() - timedelta(days=options["cutoff_days"])
        batch_size: int = options["batch_size"]

        # The order here is intentional and required.
        # Each step satisfies the cascading constraints that gate the next step.
        # `pghistory` events are never auto-deleted — each step explicitly clears relevant events first.

        deleted: dict[str, int] = {}
        step_durations: dict[str, float] = {}
        start_total = time.time()

        steps: list[tuple[str, str, Any]] = [
            (
                "stale_matches",
                "Deleting stale matches",
                lambda: self._delete_stale_matches(cutoff, batch_size),
            ),
            (
                "unmatched_derivations",
                "Deleting unmatched derivations",
                lambda: self._delete_unmatched_derivations(batch_size),
            ),
            (
                "empty_evaluations",
                "Deleting empty evaluations",
                lambda: self._delete_empty_evaluations(cutoff, batch_size),
            ),
            (
                "stale_attrpaths",
                "Pruning stale package attrpaths",
                lambda: self._prune_stale_package_attrpaths(batch_size),
            ),
            (
                "stale_triggers",
                "Deleting stale rematching triggers",
                lambda: self._delete_stale_triggers(),
            ),
        ]

        for i, (name, label, fn) in enumerate(steps, start=1):
            self.stdout.write(f"[{i}/{len(steps)}] {label}")
            step_start = time.time()
            _merge(deleted, fn())
            step_durations[name] = time.time() - step_start

        self._write_metrics(time.time() - start_total, step_durations, deleted)

        self.stdout.write(self.style.SUCCESS("Garbage collection complete."))

    def _write_metrics(
        self,
        total_duration: float,
        step_durations: dict[str, float],
        deleted: dict[str, int],
    ) -> None:
        registry = CollectorRegistry()
        duration_gauge = Gauge(
            "sectracker_garbage_collect_duration_seconds",
            "Duration of last garbage collection run by step",
            ["step"],
            registry=registry,
        )
        duration_gauge.labels(step="total").set(total_duration)
        for step, duration in step_durations.items():
            duration_gauge.labels(step=step).set(duration)

        deleted_gauge = Gauge(
            "sectracker_garbage_collect_deleted",
            "Rows deleted in last garbage collection run by model",
            ["model"],
            registry=registry,
        )
        for model_label, count in deleted.items():
            deleted_gauge.labels(model=model_label).set(float(count))

        write_metrics_textfile("garbage_collection", registry)

    def _delete_stale_matches(self, cutoff: Any, batch_size: int) -> dict[str, int]:
        candidates = (
            CVEDerivationClusterProposal.objects.filter(
                Q(created_at__lt=cutoff)
                | Q(cve__date_published__lt=cutoff)
                | Q(
                    cve__date_published__isnull=True,
                    cve__date_reserved__lt=cutoff,
                ),
            )
            .filter(
                status=CVEDerivationClusterProposal.Status.PENDING,
                # No user input must be attached
                maintainer_overlays__isnull=True,
                package_overlays__isnull=True,
                reference_url_overlays__isnull=True,
            )
            .distinct()
        )

        totals: dict[str, int] = {}
        deleted = self._purge_events(
            DerivationClusterProposalLinkEvent,
            pgh_obj__proposal_id__in=candidates.values_list("id", flat=True),
        )
        _merge(totals, deleted)
        self.stdout.write(
            self.style.SUCCESS(
                f"Deleted for link events on stale suggestions: {deleted}"
            )
        )

        _merge(
            totals,
            self._delete_in_batches(
                qs=candidates,
                model=CVEDerivationClusterProposal,
                pk_field="id",
                label="stale suggestions",
                batch_size=batch_size,
                event_model=CVEDerivationClusterProposalStatusEvent,
            ),
        )
        return totals

    def _delete_unmatched_derivations(self, batch_size: int) -> dict[str, int]:
        failed_crashed = NixDerivation.objects.filter(
            parent_evaluation__state__in=[
                NixEvaluation.EvaluationState.FAILED,
                NixEvaluation.EvaluationState.CRASHED,
            ],
        )

        totals: dict[str, int] = {}
        _merge(
            totals,
            self._delete_in_batches(
                qs=failed_crashed,
                model=NixDerivation,
                pk_field="id",
                label="derivations from failed evaluations",
                batch_size=batch_size,
            ),
        )

        # This set is O(500k), not great but still faster than a subquery.
        linked_ids = set(
            NixDerivation.objects.filter(
                cve_links_proposals__isnull=False,
            ).values_list("id", flat=True)
        )
        stale_evaluations = NixEvaluation.objects.filter(
            state=NixEvaluation.EvaluationState.COMPLETED,
        ).exclude(pk__in=NixEvaluation.objects.latest_completed_per_branch())

        _merge(
            totals,
            self._delete_in_batches(
                qs=NixDerivation.objects.filter(
                    parent_evaluation__in=stale_evaluations,
                ).exclude(id__in=linked_ids),
                model=NixDerivation,
                pk_field="id",
                label="unmatched derivations from stale evaluations",
                batch_size=batch_size,
            ),
        )

        _merge(
            totals,
            self._delete_in_batches(
                qs=NixDerivationMeta.objects.filter(derivation__isnull=True),
                model=NixDerivationMeta,
                pk_field="id",
                label="orphaned derivation metadata",
                batch_size=batch_size,
            ),
        )
        return totals

    def _delete_empty_evaluations(self, cutoff: Any, batch_size: int) -> dict[str, int]:
        candidates = NixEvaluation.objects.filter(
            state__in=[
                NixEvaluation.EvaluationState.FAILED,
                NixEvaluation.EvaluationState.CRASHED,
            ],
            derivations__isnull=True,
        )

        return self._delete_in_batches(
            qs=candidates,
            model=NixEvaluation,
            pk_field="id",
            label="evaluations",
            batch_size=batch_size,
        )

    def _delete_stale_triggers(self) -> dict[str, int]:
        """
        Reclaim rematching trigger notifications that the listener never drained.
        Anything older than a day cannot represent live work, since a healthy live listener drains within seconds and the next evaluation would re-emit fresh triggers for anything still relevant.
        """
        channels = [SuggestionRefreshChannel, NixEvaluationUpdateChannel]
        # The producer-side of each channel type records the channel identifier under a different convention.
        # Both spellings need to be matched to reach all orphaned rows.
        names = [n for c in channels for n in (c.name(), c.listen_safe_name())]
        cutoff = timezone.now() - timedelta(hours=24)
        _, details = Notification.objects.filter(
            channel__in=names, created_at__lt=cutoff
        ).delete()
        self.stdout.write(
            self.style.SUCCESS(f"Deleted stale rematching triggers: {details}")
        )
        return details

    def _prune_stale_package_attrpaths(self, batch_size: int) -> dict[str, int]:
        return self._delete_in_batches(
            qs=PackageAttrpath.objects.stale(),
            model=PackageAttrpath,
            pk_field="attrpath",
            label="stale package attrpaths",
            batch_size=batch_size,
        )

    def _purge_events(
        self,
        event_model: type[models.Model],
        **filter_kwargs: Any,
    ) -> dict[str, int]:
        table_name = event_model._meta.db_table

        try:
            with connection.cursor() as cursor:
                # Disable the append-only trigger as we have "append-only" trigger
                # that prevents updates and deletes.
                # let temporarily disable it.
                cursor.execute(f"ALTER TABLE {table_name} DISABLE TRIGGER ALL")

            _, details = event_model.objects.filter(**filter_kwargs).delete()
            return details
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
        event_model: type[models.Model] | None = None,
    ) -> dict[str, int]:
        totals: dict[str, int] = {}
        batch_num = 1
        skipped_pks: set[Any] = set()

        while True:
            batch_qs = qs
            if skipped_pks:
                batch_qs = batch_qs.exclude(**{f"{pk_field}__in": skipped_pks})
            batch_pks = batch_qs.values_list(pk_field, flat=True)[:batch_size]
            if not batch_pks:
                break

            batch_details: dict[str, int] = {}
            if event_model is not None:
                batch_details.update(
                    self._purge_events(
                        event_model,
                        pgh_obj_id__in=batch_pks,
                    )
                )

            try:
                _, details = model.objects.filter(
                    **{f"{pk_field}__in": batch_pks}
                ).delete()
            except models.ProtectedError:
                self.stdout.write(
                    self.style.WARNING(
                        f"Batch {batch_num} skipped for {label}: protected by a concurrent write"
                    )
                )
                skipped_pks.update(batch_pks)
                continue
            for model_label, count in details.items():
                batch_details[model_label] = batch_details.get(model_label, 0) + count
            for model_label, count in batch_details.items():
                totals[model_label] = totals.get(model_label, 0) + count
            self.stdout.write(f"Batch {batch_num} deleted for {label}: {batch_details}")
            batch_num += 1

        self.stdout.write(self.style.SUCCESS(f"Deleted for {label}: {totals}"))
        return totals
