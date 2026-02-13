import logging
from enum import STRICT, IntFlag, auto
from typing import Any

from django.core.exceptions import ValidationError
from django.db import IntegrityError, models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _

from shared.models.cve import text_length
from shared.models.linkage import CVEDerivationClusterProposal
from shared.models.nix_evaluation import TimeStampMixin

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
    code = models.CharField(max_length=len("NIXPKGS-YYYY-") + 19, unique=True)

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
        for attempt in range(1, 11):
            number = (
                sender.objects.filter(
                    created__year=instance.created.year,
                ).count()
                + attempt
            )
            instance.code = (
                f"NIXPKGS-{str(instance.created.year)}-{str(number).zfill(4)}"
            )
            try:
                instance.save()
                return
            except IntegrityError:
                continue
        raise RuntimeError(
            f"Failed to generate unique issue code for '{instance.suggestion.cve.cve_id}'"
        )


class EventType(IntFlag, boundary=STRICT):
    ISSUE = auto()
    PULL_REQUEST = auto()
    OPENED = auto()
    CLOSED = auto()
    COMPLETED = auto()
    NOT_PLANNED = auto()
    DUPLICATE = auto()
    MERGED = auto()

    @classmethod
    def valid(cls, value: int) -> bool:
        flags = cls(value)

        if cls.OPENED in flags:
            return value in (cls.OPENED | cls.ISSUE, cls.OPENED | cls.PULL_REQUEST)

        if cls.CLOSED in flags:
            if cls.ISSUE in flags:
                return value in (
                    cls.CLOSED | cls.ISSUE | cls.COMPLETED,
                    cls.CLOSED | cls.ISSUE | cls.NOT_PLANNED,
                    cls.CLOSED | cls.ISSUE | cls.DUPLICATE,
                )
            if cls.PULL_REQUEST in flags:
                return value in (
                    cls.CLOSED | cls.PULL_REQUEST,
                    cls.CLOSED | cls.PULL_REQUEST | cls.MERGED,
                )
            return False

        return False

    @classmethod
    def validator(cls, value: int) -> None:
        if not cls.valid(value):
            raise ValidationError(f"Invalid event type: 0b{value:b}")


class NixpkgsEvent(TimeStampMixin):
    issue = models.ForeignKey(
        NixpkgsIssue, on_delete=models.CASCADE, related_name="events"
    )
    event_type = models.IntegerField(validators=[EventType.validator])
    url = models.URLField()


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
