from enum import STRICT, IntFlag
from typing import Any

import pghistory
from django.db import models
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _

import shared.models.cached
from shared.models.cve import CveRecord
from shared.models.nix_evaluation import NixDerivation, NixMaintainer, TimeStampMixin


def text_length(choices: type[models.TextChoices]) -> int:
    return max(map(len, choices.values))


@pghistory.track(fields=["status"])
class CVEDerivationClusterProposal(TimeStampMixin):
    """
    A proposal to link a CVE to a set of derivations.
    """

    class Status(models.TextChoices):
        PENDING = "pending", _("pending")
        REJECTED = "rejected", _("rejected")
        ACCEPTED = "accepted", _("accepted")
        PUBLISHED = "published", _("published")

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
        max_length=text_length(Status), choices=Status.choices, default=Status.PENDING
    )

    comment = models.CharField(
        max_length=1000,
        default="",
        help_text=_(
            "Optional free text comment for additional notes, context, dismissal reason"
        ),
    )

    @property
    def is_editable(self) -> bool:
        return self.status in [
            CVEDerivationClusterProposal.Status.PENDING,
            CVEDerivationClusterProposal.Status.ACCEPTED,
        ]

    def ignore_package(self, package: str) -> None:
        edit, created = self.package_edits.get_or_create(
            package_attribute=package,
            defaults={"edit_type": PackageEdit.EditType.REMOVE},
        )
        if not created and edit.edit_type != PackageEdit.EditType.REMOVE:
            edit.edit_type = PackageEdit.EditType.REMOVE
            edit.save()

    def restore_package(self, package: str) -> None:
        self.package_edits.filter(
            package_attribute=package,
            edit_type=PackageEdit.EditType.REMOVE,
        ).delete()


@pghistory.track(
    pghistory.ManualEvent("maintainers.add"),
    pghistory.ManualEvent("maintainers.remove"),
)
class MaintainersEdit(models.Model):
    """
    A single manual edit of the list of maintainers of a suggestion.
    """

    class EditType(models.TextChoices):
        ADD = "add", _("add")
        REMOVE = "remove", _("remove")

    edit_type = models.CharField(
        max_length=text_length(EditType), choices=EditType.choices
    )
    maintainer = models.ForeignKey(NixMaintainer, on_delete=models.CASCADE)
    suggestion = models.ForeignKey(
        CVEDerivationClusterProposal,
        related_name="maintainers_edits",
        on_delete=models.CASCADE,
    )

    class Meta:  # type: ignore[override]
        constraints = [
            # Ensures that a maintainer can only be added or removed once per
            # suggestion.
            models.UniqueConstraint(
                fields=["suggestion", "maintainer"],
                name="unique_maintainer_edit_per_suggestion",
            )
        ]


@pghistory.track(
    pghistory.ManualEvent("package.add"),
    pghistory.ManualEvent("package.remove"),
)
class PackageEdit(models.Model):
    """
    A single manual edit of the list of packages of a suggestion.
    """

    class EditType(models.TextChoices):
        REMOVE = "remove", _("remove")
        # ADD reserved for future use if needed

    edit_type = models.CharField(
        max_length=text_length(EditType), choices=EditType.choices
    )
    package_attribute = models.CharField(max_length=255)
    suggestion = models.ForeignKey(
        CVEDerivationClusterProposal,
        related_name="package_edits",
        on_delete=models.CASCADE,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["suggestion", "package_attribute"],
                name="unique_package_edit_per_suggestion",
            )
        ]


@receiver(post_save, sender=PackageEdit)
def track_package_edit_save(
    sender: type[PackageEdit],
    instance: PackageEdit,
    created: bool,
    **kwargs: Any,
) -> None:
    if created:
        # TODO Adapt when PackageEdit supports more than REMOVE
        pghistory.create_event(
            obj=instance,
            label="package.remove",
        )


@receiver(post_delete, sender=PackageEdit)
def track_package_edit_delete(
    sender: type[PackageEdit], instance: PackageEdit, **kwargs: Any
) -> None:
    # TODO Adapt when PackageEdit supports more than REMOVE
    pghistory.create_event(
        obj=instance,
        label="package.add",
    )


@receiver(post_save, sender=MaintainersEdit)
def track_maintainers_edit_save(
    sender: type[MaintainersEdit],
    instance: MaintainersEdit,
    created: bool,
    **kwargs: Any,
) -> None:
    if created:
        label = (
            "maintainers.add"
            if instance.edit_type == MaintainersEdit.EditType.ADD
            else "maintainers.remove"
        )
        pghistory.create_event(
            obj=instance,
            label=label,
        )


@receiver(post_delete, sender=MaintainersEdit)
def track_maintainers_edit_delete(
    sender: type[MaintainersEdit], instance: MaintainersEdit, **kwargs: Any
) -> None:
    label = (
        "maintainers.remove"
        if instance.edit_type == MaintainersEdit.EditType.ADD
        else "maintainers.add"
    )
    pghistory.create_event(
        obj=instance,
        label=label,
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

    derivation = models.ForeignKey(NixDerivation, on_delete=models.CASCADE)

    # TODO: how to design the integrity here?
    # we probably want to add a fancy check here.
    provenance_flags = models.IntegerField()
