import logging
from typing import Any

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _

from shared.models.cve import text_length
from shared.models.linkage import CVEDerivationClusterProposal

logger = logging.getLogger(__name__)

###
#
# Nixpkgs related models
#
##


class IssueStatus(models.TextChoices):
    UNKNOWN = "U", _("unknown")
    AFFECTED = "A", _("affected")
    NOTAFFECTED = "NA", _("notaffected")
    NOTFORUS = "O", _("notforus")
    WONTFIX = "W", _("wontfix")


class NixpkgsIssue(models.Model):
    """The Nixpkgs version of a cve."""

    created = models.DateField(auto_now_add=True)
    code = models.CharField(max_length=len("NIXPKGS-YYYY-") + 19)

    suggestion = models.OneToOneField(
        CVEDerivationClusterProposal, on_delete=models.PROTECT
    )

    status = models.CharField(
        max_length=text_length(IssueStatus),
        choices=IssueStatus.choices,
        default=IssueStatus.UNKNOWN,
    )

    def __str__(self) -> str:
        return self.code

    @property
    def status_string(self) -> str:
        mapping = {
            IssueStatus.UNKNOWN: "unknown",
            IssueStatus.AFFECTED: "affected",
            IssueStatus.NOTAFFECTED: "not affected",
            IssueStatus.NOTFORUS: "not relevant for us",
            IssueStatus.WONTFIX: "won't fix",
        }
        return mapping.get(self.status, mapping[IssueStatus.UNKNOWN])  # type: ignore

    @classmethod
    def create_nixpkgs_issue(
        cls, suggestion: CVEDerivationClusterProposal
    ) -> "NixpkgsIssue":
        """
        Create a NixpkgsIssue from a suggestion and save it in the database. Note
        that this doesn't create a corresponding GitHub issue; interaction with
        GitHub is handled separately in `shared.github`.
        """

        issue = cls.objects.create(
            # By default we set the status to affected; a human might later
            # change the status if it turns out we're not affected in the
            # end.
            status=IssueStatus.AFFECTED,
            suggestion=suggestion,
        )
        issue.save()
        return issue


@receiver(post_save, sender=NixpkgsIssue)
def generate_code(
    sender: type[NixpkgsIssue], instance: NixpkgsIssue, created: bool, **kwargs: Any
) -> None:
    if created:
        number = sender.objects.filter(
            created__year=instance.created.year, pk__lte=instance.pk
        ).count()
        instance.code = f"NIXPKGS-{str(instance.created.year)}-{str(number).zfill(4)}"
        instance.save()


class NixpkgsEvent(models.Model):
    class EventType(models.TextChoices):
        ISSUED = "I", _("issue opened")
        PR_OPENED = "P", _("PR opened")
        PR_MERGED = "M", _("PR merged")

    issue = models.ForeignKey(NixpkgsIssue, on_delete=models.CASCADE)
    reference = models.TextField()


class NixpkgsAdvisory(models.Model):
    class AdvisoryStatus(models.TextChoices):
        DRAFT = "DRAFT", _("draft")
        RELEASED = "RELEASED", _("released")
        REVISED = "REVISED", _("revised")

    class AdvisorySeverity(models.TextChoices):
        UNKNOWN = "UNKNOWN", _("unknown")
        LOW = "LOW", _("low")
        MEDIUM = "MEDIUM", _("medium")
        HIGH = "HIGH", _("high")
        CRITICAL = "CRITICAL", _("critical")

    issues = models.ManyToManyField(NixpkgsIssue)
