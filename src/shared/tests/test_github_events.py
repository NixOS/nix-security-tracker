from collections.abc import Iterator
from datetime import UTC, datetime

import pytest
import responses
from github import Github

from shared.ingest_github_events import sync_github_events
from shared.models.issue import (
    EventType,
    GitHubEvent,
    GitHubItem,
    GitHubSyncError,
    NixpkgsIssue,
)
from shared.tests.fake_github import (
    GRAPHQL_URL,
    ClosedEvent,
    FakeGitHub,
    Issue,
    ReopenedEvent,
)


@pytest.fixture
def fake_github() -> Iterator[FakeGitHub]:
    fake = FakeGitHub()
    with responses.RequestsMock() as mock:
        mock.add_callback(
            responses.POST,
            GRAPHQL_URL,
            callback=fake.handle,
        )
        yield fake


def test_closed_issue_records_close_time(
    issue: NixpkgsIssue, fake_github: FakeGitHub
) -> None:
    item = GitHubItem.objects.create(
        owner="NixOS",
        repository="nixpkgs",
        number=1,
        kind=GitHubItem.Kind.ISSUE,
    )
    item.nixpkgs_issues.add(issue)
    fake_github.items = [
        Issue(
            "NixOS/nixpkgs",
            1,
            created_at=datetime(2026, 10, 1),
            timeline=[
                ClosedEvent(
                    created_at=datetime(2026, 10, 2, 12),
                    state_reason="COMPLETED",
                ),
            ],
        ),
    ]

    sync_github_events(Github())

    assert GitHubEvent.objects.count() == 2

    opened = GitHubEvent.objects.get(
        item__nixpkgs_issues=issue,
        event_type=EventType.ISSUE | EventType.OPENED,
    )
    assert opened.occurred_at == datetime(2026, 10, 1, tzinfo=UTC)

    closed = GitHubEvent.objects.get(
        item__nixpkgs_issues=issue,
        event_type=EventType.ISSUE | EventType.CLOSED | EventType.COMPLETED,
    )
    assert closed.occurred_at == datetime(2026, 10, 2, 12, tzinfo=UTC)

    # Idempotency check
    sync_github_events(Github())
    assert GitHubEvent.objects.count() == 2


def test_reopened_issue_records_reopen_time(
    issue: NixpkgsIssue, fake_github: FakeGitHub
) -> None:
    item = GitHubItem.objects.create(
        owner="NixOS",
        repository="nixpkgs",
        number=1,
        kind=GitHubItem.Kind.ISSUE,
    )
    item.nixpkgs_issues.add(issue)
    fake_github.items = [
        Issue(
            "NixOS/nixpkgs",
            1,
            created_at=datetime(2026, 10, 1),
            timeline=[
                ClosedEvent(
                    created_at=datetime(2026, 10, 2, 12),
                    state_reason="COMPLETED",
                ),
                ReopenedEvent(created_at=datetime(2026, 10, 3, 12)),
            ],
        ),
    ]

    sync_github_events(Github())

    assert list(
        GitHubEvent.objects.filter(item__nixpkgs_issues=issue)
        .order_by("occurred_at")
        .values_list("event_type", "occurred_at")
    ) == [
        (EventType.ISSUE | EventType.OPENED, datetime(2026, 10, 1, tzinfo=UTC)),
        (
            EventType.ISSUE | EventType.CLOSED | EventType.COMPLETED,
            datetime(2026, 10, 2, 12, tzinfo=UTC),
        ),
        (EventType.ISSUE | EventType.OPENED, datetime(2026, 10, 3, 12, tzinfo=UTC)),
    ]


@pytest.mark.parametrize("missing", [{2}, {1, 3}])
def test_missing_issues_do_not_abort_sync(
    issue: NixpkgsIssue, fake_github: FakeGitHub, missing: set[int]
) -> None:
    numbers = {1, 2, 3}
    for number in numbers:
        GitHubItem.objects.create(
            owner="NixOS",
            repository="nixpkgs",
            number=number,
            kind=GitHubItem.Kind.ISSUE,
        ).nixpkgs_issues.add(issue)
    fake_github.items = [
        Issue("NixOS/nixpkgs", number, created_at=datetime(2026, 10, 1))
        for number in numbers - missing
    ]

    sync_github_events(Github())

    assert set(GitHubEvent.objects.values_list("item__number", flat=True)) == (
        numbers - missing
    )
    assert set(
        GitHubSyncError.objects.values_list("item__number", "error_type", "message")
    ) == {
        (
            number,
            "NOT_FOUND",
            f"Could not resolve to an Issue with the number of {number}.",
        )
        for number in missing
    }

    # Idempotency check
    sync_github_events(Github())
    assert GitHubSyncError.objects.count() == len(missing)


def test_reappearing_issue_clears_error(
    issue: NixpkgsIssue, fake_github: FakeGitHub
) -> None:
    item = GitHubItem.objects.create(
        owner="NixOS",
        repository="nixpkgs",
        number=1,
        kind=GitHubItem.Kind.ISSUE,
    )
    item.nixpkgs_issues.add(issue)

    sync_github_events(Github())
    assert GitHubSyncError.objects.filter(item=item).exists()

    fake_github.items = [
        Issue("NixOS/nixpkgs", 1, created_at=datetime(2026, 10, 1)),
    ]
    sync_github_events(Github())
    assert not GitHubSyncError.objects.filter(item=item).exists()
