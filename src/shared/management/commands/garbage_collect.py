from argparse import ArgumentDefaultsHelpFormatter, ArgumentParser
from datetime import timedelta
from typing import Any

from django.core.management.base import BaseCommand, CommandParser, DjangoHelpFormatter
from django.db import connection, models
from django.db.models import (
    Case,
    Exists,
    IntegerField,
    OuterRef,
    Q,
    QuerySet,
    When,
)
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
from shared.models.package import PackageAttrpath

DEFAULT_CUTOFF_DAYS = 365 // 2


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

        # FIXME(@fricklerhandwerk): Make the numbering implicit, otherwise we'll have noisy diffs every time something changes here.
        self.stdout.write("\n[1/6] Deleting stale matches")
        self._delete_stale_matches(cutoff, batch_size)
        self.stdout.write("\n[2/6] Purging obsolete channel links")
        self._purge_obsolete_channel_links(batch_size)
        self.stdout.write("\n[3/6] Deleting unmatched derivations")
        self._delete_unmatched_derivations(batch_size)
        self.stdout.write("\n[4/6] Deleting empty evaluations")
        self._delete_empty_evaluations(cutoff, batch_size)
        self.stdout.write("\n[5/6] Deleting inactive channels")
        self._delete_inactive_channels(batch_size)
        self.stdout.write("\n[6/6] Pruning stale package attrpaths")
        self._prune_stale_package_attrpaths(batch_size)

        self.stdout.write(self.style.SUCCESS("\nGarbage collection complete."))

    def _delete_stale_matches(self, cutoff: Any, batch_size: int) -> None:
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

        deleted = self._purge_events(
            DerivationClusterProposalLinkEvent,
            pgh_obj__proposal_id__in=candidates.values_list("id", flat=True),
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Deleted for link events on stale suggestions: {deleted}"
            )
        )

        self._delete_in_batches(
            qs=candidates,
            model=CVEDerivationClusterProposal,
            pk_field="id",
            label="stale suggestions",
            batch_size=batch_size,
            event_model=CVEDerivationClusterProposalStatusEvent,
        )

    def _purge_obsolete_channel_links(self, batch_size: int) -> None:
        """
        For each `(suggestion, attribute)`, keep only the derivatons from the most current channel.
        Links to derivations from older channels with the same attribute count as obsolete if a more current channel is present.

        This procedure can be removed once we evaluate the tip of each release branch once and match only against those.
        """

        # This priority corresponds to how far evaluated commits are behind `master`.
        priority = Case(
            When(
                derivation__parent_evaluation__channel__channel_branch__endswith="-small",
                then=0,
            ),
            When(
                derivation__parent_evaluation__channel__channel_branch__startswith="nixos-",
                then=1,
            ),
            # Stable releases can be considered even older and ordered lexicographically.
            default=2,
            output_field=IntegerField(),
        )

        # We only need the latest version of a "package" at matching time.
        # A "package" currently merely constsists of derivations grouped by attribute path.
        # Some channels in old suggestions appear multiple times, we take only the latest evaluation for each.
        # We only introduced taking the latest evaluation at some point after going live.
        latest_link = (
            DerivationClusterProposalLink.objects.annotate(priority=priority)
            .filter(
                proposal_id=OuterRef("proposal_id"),
                derivation__attribute=OuterRef("derivation__attribute"),
                derivation__parent_evaluation__channel__release_branch=OuterRef(
                    "derivation__parent_evaluation__channel__release_branch"
                ),
            )
            .filter(
                Q(priority__lt=OuterRef("priority"))
                | Q(
                    priority=OuterRef("priority"),
                    derivation__parent_evaluation__created_at__gt=OuterRef(
                        "derivation__parent_evaluation__created_at"
                    ),
                )
            )
        )

        candidates = DerivationClusterProposalLink.objects.annotate(
            priority=priority
        ).filter(Exists(latest_link))

        self._delete_in_batches(
            qs=candidates,
            model=DerivationClusterProposalLink,
            pk_field="id",
            label="obsolete channel links",
            batch_size=batch_size,
            event_model=DerivationClusterProposalLinkEvent,
        )

    def _delete_unmatched_derivations(self, batch_size: int) -> None:
        failed_crashed = NixDerivation.objects.filter(
            parent_evaluation__state__in=[
                NixEvaluation.EvaluationState.FAILED,
                NixEvaluation.EvaluationState.CRASHED,
            ],
        )

        self._delete_in_batches(
            qs=failed_crashed,
            model=NixDerivation,
            pk_field="id",
            label="derivations from failed evaluations",
            batch_size=batch_size,
        )

        # This set is O(500k), not great but still faster than a subquery.
        linked_ids = set(
            NixDerivation.objects.filter(
                cve_links_proposals__isnull=False,
            ).values_list("id", flat=True)
        )
        stale_evaluations = NixEvaluation.objects.filter(
            state=NixEvaluation.EvaluationState.COMPLETED,
        ).exclude(pk__in=NixEvaluation.objects.latest_completed_per_channel())

        self._delete_in_batches(
            qs=NixDerivation.objects.filter(
                parent_evaluation__in=stale_evaluations,
            ).exclude(id__in=linked_ids),
            model=NixDerivation,
            pk_field="id",
            label="unmatched derivations from stale evaluations",
            batch_size=batch_size,
        )

        self._delete_in_batches(
            qs=NixDerivationMeta.objects.filter(derivation__isnull=True),
            model=NixDerivationMeta,
            pk_field="id",
            label="orphaned derivation metadata",
            batch_size=batch_size,
        )

    def _delete_empty_evaluations(self, cutoff: Any, batch_size: int) -> None:
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
        )

    def _delete_inactive_channels(self, batch_size: int) -> None:
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

        self._delete_in_batches(
            qs=candidates,
            model=NixChannel,
            pk_field="channel_branch",
            label="channels",
            batch_size=batch_size,
        )

    def _prune_stale_package_attrpaths(self, batch_size: int) -> None:
        self._delete_in_batches(
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
    ) -> None:
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
