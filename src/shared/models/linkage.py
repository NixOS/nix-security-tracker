from enum import STRICT, IntFlag
from typing import Any

import pghistory
import pgtrigger
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q
from django.db.models.signals import post_delete, post_save
from django.db.utils import InternalError
from django.dispatch import receiver
from django.utils.functional import classproperty
from django.utils.translation import gettext_lazy as _

import shared.models.cached
from shared.models.cve import CveRecord, Reference
from shared.models.nix_evaluation import NixDerivation, NixMaintainer, TimeStampMixin


class SuggestionStatus(models.TextChoices):
    PENDING = "pending", _("pending")
    REJECTED = "rejected", _("rejected")
    ACCEPTED = "accepted", _("accepted")
    PUBLISHED = "published", _("published")


class CVEDerivationClusterProposalQuerySet(models.QuerySet):
    def target_proposals(self) -> "CVEDerivationClusterProposalQuerySet":
        """Return the set of proposals eligible for cache regeneration.

        Pending proposals are only regenerated for the current algorithm version —
        outdated-version pending proposals will be superseded by fresh ones once the
        algorithm runs again, so regenerating their caches would be wasted effort.

        Accepted and dismissed proposals are regenerated regardless of algorithm
        version, since triagers have already reviewed them and they must remain
        accessible in the UI.
        """

        return self.filter(
            Q(
                status=CVEDerivationClusterProposal.Status.PENDING,
                algorithm_version=CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION,
            )
            | ~Q(status=CVEDerivationClusterProposal.Status.PENDING)
        )


@pghistory.track(
    fields=["status", "rejection_reason"],
    model_name="CVEDerivationClusterProposalStatusEvent",
)
class CVEDerivationClusterProposal(TimeStampMixin):
    """
    A proposal to link a CVE to a set of derivations.
    """

    Status = SuggestionStatus
    objects = CVEDerivationClusterProposalQuerySet.as_manager()

    class RejectionReason(models.TextChoices):
        EXCLUSIVELY_HOSTED_SERVICE = (
            "exclusively_hosted_service",
            _("exclusively hosted service"),
        )
        NOT_IN_NIXPKGS = (
            "not_in_nixpkgs",
            _("not in Nixpkgs"),
        )
        HARDWARE_ONLY_CPE = (
            "hardware_only_cpe",
            _("hardware only"),
        )

    @classproperty
    def CURRENT_ALGORITHM_VERSION(cls) -> int:  # noqa: N802, N805
        return 0

    cached: "shared.models.cached.CachedSuggestions"

    cve = models.ForeignKey(
        CveRecord, related_name="derivation_links_proposals", on_delete=models.CASCADE
    )
    # NixDerivations of the same product and with a version in the affected range
    derivations = models.ManyToManyField(
        NixDerivation,
        related_name="cve_links_proposals",
        through="DerivationClusterProposalLink",
    )

    status = models.CharField(
        max_length=126, choices=Status.choices, default=Status.PENDING
    )

    comment = models.CharField(
        max_length=1000,
        null=True,
        blank=True,
        help_text=_(
            "Optional free text comment for additional notes, context, dismissal reason"
        ),
    )

    # Absence of rejection reason either means the suggestion is not is REJECTED status,
    # or that the rejection reason is provided in the free form comment section (implying it's non empty)
    rejection_reason = models.CharField(
        max_length=126,
        choices=RejectionReason.choices,
        null=True,
        blank=True,
        help_text=_("Reason for rejection (automatic or manual)"),
    )

    algorithm_version = models.IntegerField(
        default=0,
        help_text=_("Version of the matching algorithm that generated this proposal"),
    )

    @property
    def is_frozen(self) -> bool:
        return self.status not in [
            CVEDerivationClusterProposal.Status.PENDING,
            CVEDerivationClusterProposal.Status.ACCEPTED,
        ]

    @property
    def references(self) -> list[Reference]:
        """Get all unique references from all containers of the CVE attached to this suggestion."""
        return list(Reference.objects.filter(container__cve=self.cve).distinct())

    @property
    def is_cache_stale(self) -> bool:
        return not getattr(self, "cached", None) or self.cached.is_stale

    def ensure_fresh_cache(self) -> None:
        """Regenerate stale or missing cache for this suggestion."""
        if self.is_cache_stale:
            from shared.cache_suggestions import cache_new_suggestions

            cache_new_suggestions(self)
            self.refresh_from_db()

    def ignore_package(self, package: str) -> None:
        edit, created = self.package_overlays.get_or_create(
            package_attribute=package,
            defaults={"overlay_type": PackageOverlay.Type.IGNORED},
        )
        if not created and edit.overlay_type != PackageOverlay.Type.IGNORED:
            edit.overlay_type = PackageOverlay.Type.IGNORED
            edit.save()

    def restore_package(self, package: str) -> None:
        self.package_overlays.filter(
            package_attribute=package,
            overlay_type=PackageOverlay.Type.IGNORED,
        ).delete()

    def change_status(
        self,
        status: SuggestionStatus,
        rejection_reason: RejectionReason | None = None,
        comment: str | None = None,
    ) -> None:
        if status == self.status:
            raise ValidationError({"status": f"Already in status '{self.status}'"})

        self.status = status
        self.rejection_reason = rejection_reason
        if comment:
            self.comment = comment
        self.full_clean()
        try:
            self.save()
        except InternalError:
            raise ValidationError(
                {
                    "status": f"Invalid status transition from '{self.status}' to '{status}'"
                }
            )

    def clean(self) -> None:
        if self.status == SuggestionStatus.REJECTED:
            if self.rejection_reason is None and not self.comment:
                raise ValidationError(
                    {
                        "rejection_reason": "Rejecting a suggestion requires a reason or a comment"
                    }
                )
        else:
            if self.rejection_reason is not None:
                raise ValidationError(
                    {
                        "rejection_reason": "Cannot set rejection reason on suggeston that is not rejected"
                    }
                )

    class Meta:  # type: ignore[override]
        triggers = [
            pgtrigger.FSM(
                name="status_fsm",
                field="status",
                transitions=[
                    (SuggestionStatus.PENDING, SuggestionStatus.REJECTED),
                    (SuggestionStatus.PENDING, SuggestionStatus.ACCEPTED),
                    (SuggestionStatus.REJECTED, SuggestionStatus.ACCEPTED),
                    (SuggestionStatus.ACCEPTED, SuggestionStatus.REJECTED),
                    (SuggestionStatus.ACCEPTED, SuggestionStatus.PUBLISHED),
                    # FIXME(@fricklerhandwerk): It's not desirable to allow this, but it happens when we want to undo a status change ad hoc.
                    # The correct solution is to get rid of the concept of status altogether:
                    # Whatever is done to a piece of data will determine which filter it appears in.
                    # And then we can have a generic undo that will simply invert edit operations on the overlay data from the frontend.
                    (SuggestionStatus.ACCEPTED, SuggestionStatus.PENDING),
                    (SuggestionStatus.REJECTED, SuggestionStatus.PENDING),
                ],
            ),
        ]

    @property
    def is_active_algorithm_match(self) -> bool:
        return self.algorithm_version == self.CURRENT_ALGORITHM_VERSION


@pghistory.track(
    pghistory.ManualEvent("maintainer.add"),
    pghistory.ManualEvent("maintainer.delete"),
    pghistory.ManualEvent("maintainer.restore"),
    pghistory.ManualEvent("maintainer.ignore"),
)
class MaintainerOverlay(models.Model):
    """
    An element in the overlay set of maintainers of a suggestion.
    """

    class Type(models.TextChoices):
        ADDITIONAL = "additional", _("additional")
        IGNORED = "ignored", _("ignored")

    overlay_type = models.CharField(max_length=126, choices=Type.choices)
    maintainer = models.ForeignKey(NixMaintainer, on_delete=models.PROTECT)
    suggestion = models.ForeignKey(
        CVEDerivationClusterProposal,
        related_name="maintainer_overlays",
        on_delete=models.CASCADE,
    )

    class Meta:  # type: ignore[override]
        constraints = [
            # Ensures that a maintainer can only be added or removed once per
            # suggestion.
            models.UniqueConstraint(
                fields=["suggestion", "maintainer"],
                name="unique_maintainer_overlay_per_suggestion",
            )
        ]


@pghistory.track(
    pghistory.ManualEvent("package.restore"),
    pghistory.ManualEvent("package.ignore"),
)
class PackageOverlay(models.Model):
    """
    An element in the overlay set of packages of a suggestion.
    """

    class Type(models.TextChoices):
        IGNORED = "ignored", _("ignored")
        # ADDITIONAL reserved for future use if needed

    overlay_type = models.CharField(max_length=126, choices=Type.choices)
    package_attribute = models.CharField(max_length=255)
    suggestion = models.ForeignKey(
        CVEDerivationClusterProposal,
        related_name="package_overlays",
        on_delete=models.CASCADE,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["suggestion", "package_attribute"],
                name="unique_package_overlay_per_suggestion",
            )
        ]


@pghistory.track(
    pghistory.ManualEvent("reference.restore"),
    pghistory.ManualEvent("reference.ignore"),
)
class ReferenceUrlOverlay(models.Model):
    """
    A single manual overlay of the list of references of a suggestion.
    These overlays are per url, so one overlay may apply to several references which share the same URL.
    """

    class Type(models.TextChoices):
        IGNORED = "ignored", _("ignored")
        # ADDITIONAL reserved for future use if needed

    type = models.CharField(max_length=126, choices=Type.choices)
    reference_url = models.URLField(max_length=2048, blank=True)
    deduplicated_name = models.CharField(
        max_length=512, blank=True
    )  # Used as a base for the activity log events
    suggestion = models.ForeignKey(
        CVEDerivationClusterProposal,
        related_name="reference_url_overlays",
        on_delete=models.CASCADE,
    )

    class Meta:  # type: ignore[override]
        constraints = [
            # Ensures that a reference can only be added or removed once per
            # suggestion.
            models.UniqueConstraint(
                fields=["suggestion", "reference_url"],
                name="unique_reference_url_overlay_per_suggestion",
            )
        ]


@receiver(post_save, sender=PackageOverlay)
def track_package_overlay_save(
    sender: type[PackageOverlay],
    instance: PackageOverlay,
    created: bool,
    **kwargs: Any,
) -> None:
    if created:
        pghistory.create_event(
            obj=instance,
            label="package.ignore",
        )


@receiver(post_delete, sender=PackageOverlay)
def track_package_overlay_delete(
    sender: type[PackageOverlay], instance: PackageOverlay, **kwargs: Any
) -> None:
    pghistory.create_event(
        obj=instance,
        label="package.restore",
    )


@receiver(post_save, sender=MaintainerOverlay)
def track_maintainer_overlay_save(
    sender: type[MaintainerOverlay],
    instance: MaintainerOverlay,
    created: bool,
    **kwargs: Any,
) -> None:
    if created:
        label = (
            "maintainer.add"
            if instance.overlay_type == MaintainerOverlay.Type.ADDITIONAL
            else "maintainer.ignore"
        )
        pghistory.create_event(
            obj=instance,
            label=label,
        )


@receiver(post_delete, sender=MaintainerOverlay)
def track_maintainer_overlay_delete(
    sender: type[MaintainerOverlay], instance: MaintainerOverlay, **kwargs: Any
) -> None:
    label = (
        "maintainer.delete"
        if instance.overlay_type == MaintainerOverlay.Type.ADDITIONAL
        else "maintainer.restore"
    )
    pghistory.create_event(
        obj=instance,
        label=label,
    )


@receiver(post_save, sender=ReferenceUrlOverlay)
def track_reference_overlay_save(
    sender: type[ReferenceUrlOverlay],
    instance: ReferenceUrlOverlay,
    created: bool,
    **kwargs: Any,
) -> None:
    if created:
        if instance.type == ReferenceUrlOverlay.Type.IGNORED:
            pghistory.create_event(
                obj=instance,
                label="reference.ignore",
            )


@receiver(post_delete, sender=ReferenceUrlOverlay)
def track_reference_overlay_delete(
    sender: type[ReferenceUrlOverlay], instance: ReferenceUrlOverlay, **kwargs: Any
) -> None:
    if instance.type == ReferenceUrlOverlay.Type.IGNORED:
        pghistory.create_event(
            obj=instance,
            label="reference.restore",
        )


class ProvenanceFlags(IntFlag, boundary=STRICT):
    PACKAGE_NAME_MATCH = 1 << 0
    PRODUCT_MATCH = 1 << 6
    VERSION_CONSTRAINT_INRANGE = 1 << 1
    VERSION_CONSTRAINT_OUTOFRANGE = 1 << 2
    NO_SOURCE_VERSION_CONSTRAINT = 1 << 3
    # Whether the hardware constraint is matched for this derivation.
    HARDWARE_CONSTRAINT_INRANGE = 1 << 4
    KERNEL_CONSTRAINT_INRANGE = 1 << 5


# CVEDerivationClusterProposal `derivations` changes have to be tracked via its `through` model.
@pghistory.track(
    pghistory.InsertEvent("derivations.add"),
    pghistory.DeleteEvent("derivations.remove"),
)
class DerivationClusterProposalLink(models.Model):
    """
    A link between a NixDerivation and a CVEDerivationClusterProposal.
    """

    proposal = models.ForeignKey(CVEDerivationClusterProposal, on_delete=models.CASCADE)

    derivation = models.ForeignKey(NixDerivation, on_delete=models.PROTECT)

    # TODO: how to design the integrity here?
    # we probably want to add a fancy check here.
    provenance_flags = models.IntegerField()
