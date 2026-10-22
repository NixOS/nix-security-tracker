import logging
from collections.abc import Iterable
from enum import STRICT, IntFlag, auto
from typing import Any
from urllib.parse import urljoin

from django.core.exceptions import ValidationError
from django.db import IntegrityError, models, transaction
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

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


NIXPKGS_ISSUE_CODE_REGEX = r"NIXPKGS-[0-9]{4}-[0-9]{4,19}"


class GitHubItem(models.Model):
    class Kind(models.TextChoices):
        # GitHub's own type names, as its API reports them.
        ISSUE = "Issue", _("issue")
        PULL_REQUEST = "PullRequest", _("pull request")

    owner = models.CharField(max_length=255)
    repository = models.CharField(max_length=255)
    # Issues and pull requests share one number sequence per repository.
    number = models.PositiveIntegerField()
    kind = models.CharField(max_length=64, choices=Kind.choices)

    class Meta:  # type: ignore[override]
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "repository", "number"],
                name="githubitem_unique",
            ),
        ]

    @property
    def url(self) -> str:
        path = {
            self.Kind.ISSUE: "issues",
            self.Kind.PULL_REQUEST: "pull",
        }[self.Kind(self.kind)]
        return f"https://github.com/{self.owner}/{self.repository}/{path}/{self.number}"

    @property
    def state(self) -> "EventType":
        latest = max(self.events.all(), key=lambda e: e.occurred_at, default=None)
        if latest is None:
            return EventType.ISSUE | EventType.OPENED
        return EventType(latest.event_type)

    def add_events(self, events: Iterable["GitHubEvent"]) -> None:
        events = list(events)
        for event in events:
            event.item = self
            event.clean_fields(exclude=["item"])
        GitHubEvent.objects.bulk_create(events, ignore_conflicts=True)


class NixpkgsIssue(TimeStampMixin):
    """The Nixpkgs version of a cve."""

    code = models.CharField(max_length=len("NIXPKGS-YYYY-") + 19, unique=True)

    title = models.CharField(max_length=500, default="")

    # `suggestions` is defined in NixpkgsIssue as the related name to the nixpkgs_issue FK in CVEDerivationClusterProposal

    status = models.CharField(
        max_length=126,
        choices=IssueStatus.choices,
        default=IssueStatus.UNKNOWN,
    )

    github_items = models.ManyToManyField(GitHubItem, related_name="nixpkgs_issues")

    def __str__(self) -> str:
        return self.code

    @property
    def github_issue(self) -> GitHubItem | None:
        return next(
            (
                item
                for item in self.github_items.all()
                if item.kind == GitHubItem.Kind.ISSUE
            ),
            None,
        )

    @property
    def github_issue_url(self) -> str | None:
        item = self.github_issue
        return item.url if item else None

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
        cls, suggestions: list[CVEDerivationClusterProposal], title: str
    ) -> "NixpkgsIssue":
        """
        Create a NixpkgsIssue from a list of suggestions and save it in the database. Note
        that this doesn't create a corresponding GitHub issue; interaction with
        GitHub is handled separately in `shared.github`.
        """
        issue = cls.objects.create(
            title=title,
            # By default we set the status to affected; a human might later
            # change the status if it turns out we're not affected in the
            # end.
            status=IssueStatus.AFFECTED,
        )
        issue.suggestions.set(suggestions)
        return issue

    def publish(self) -> None:
        """
        Create a corresponding GitHub issue for this NixpkgsIssue and log the event.
        """
        from django.conf import settings

        from shared.github import create_gh_issue

        if not self.title:
            raise ValueError("Cannot publish a NixpkgsIssue with no title")

        tracker_issue_path = f"/issues/{self.code}"
        tracker_issue_link = urljoin(str(settings.BASE_URL), tracker_issue_path)

        suggestions = list(self.suggestions.select_related("cached").all())
        if not suggestions:
            raise ValueError("Cannot publish a NixpkgsIssue with no suggestions")

        github_issue = create_gh_issue(
            [s.cached for s in suggestions],
            self.title,
            tracker_issue_link,
        )

        self.github_items.add(
            GitHubItem.objects.create(
                owner=settings.GH_ORGANIZATION,
                repository=settings.GH_ISSUES_REPO,
                number=github_issue.number,
                kind=GitHubItem.Kind.ISSUE,
            )
        )

    @classmethod
    def publish_suggestions(
        cls, suggestions: list[CVEDerivationClusterProposal], title: str
    ) -> "NixpkgsIssue":
        with transaction.atomic():
            issue = cls.create_nixpkgs_issue(suggestions, title)
            issue.publish()
            # QuerySet.update() bypasses Model.save(), so Django's auto_now on
            # updated_at is never triggered here; set it explicitly so published
            # suggestions sort correctly (the suggestion list orders by -updated_at).
            CVEDerivationClusterProposal.objects.filter(
                pk__in=[s.pk for s in suggestions]
            ).update(
                status=CVEDerivationClusterProposal.Status.PUBLISHED,
                in_issue_draft=False,
                updated_at=timezone.now(),
            )
        return issue


@receiver(post_save, sender=NixpkgsIssue)
def generate_code(
    sender: type[NixpkgsIssue], instance: NixpkgsIssue, created: bool, **kwargs: Any
) -> None:
    if created:
        for attempt in range(1, 11):
            number = (
                sender.objects.filter(
                    created_at__year=instance.created_at.year,
                ).count()
                + attempt
            )
            instance.code = (
                f"NIXPKGS-{str(instance.created_at.year)}-{str(number).zfill(4)}"
            )
            try:
                instance.save()
                return
            except IntegrityError:
                continue
        raise RuntimeError(
            f"Failed to generate unique issue code for NixpkgsIssue pk={instance.pk}"
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


class GitHubEvent(models.Model):
    item = models.ForeignKey(
        GitHubItem, on_delete=models.CASCADE, related_name="events"
    )
    event_type = models.IntegerField(validators=[EventType.validator])

    created_at = models.DateTimeField(auto_now_add=True)
    # When the event happened on GitHub, as opposed to when it was recorded here.
    occurred_at = models.DateTimeField()

    class Meta:  # type: ignore[override]
        constraints = [
            models.UniqueConstraint(
                fields=["item", "event_type", "occurred_at"],
                name="githubevent_unique",
            ),
        ]


class GitHubSyncError(models.Model):
    item = models.ForeignKey(
        GitHubItem, on_delete=models.CASCADE, related_name="sync_errors"
    )
    error_type = models.CharField(max_length=64)
    message = models.TextField()

    first_seen = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)

    class Meta:  # type: ignore[override]
        constraints = [
            models.UniqueConstraint(
                fields=["item", "error_type"],
                name="githubsyncerror_unique",
            ),
        ]


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
