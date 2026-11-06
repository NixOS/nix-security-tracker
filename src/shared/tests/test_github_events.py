from collections.abc import Iterator
from datetime import UTC, datetime, timedelta

import pytest
import responses
from github import Github

from shared.ingest_github_events import BATCH_SIZE, sync_github_events
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
    MergedEvent,
    PullRequest,
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


def test_full_batch_stays_within_node_limit(
    issue: NixpkgsIssue, fake_github: FakeGitHub
) -> None:
    numbers = range(1, BATCH_SIZE + 1)
    for number in numbers:
        GitHubItem.objects.create(
            owner="NixOS",
            repository="nixpkgs",
            number=number,
            kind=GitHubItem.Kind.ISSUE,
        ).nixpkgs_issues.add(issue)
    fake_github.items = [
        Issue("NixOS/nixpkgs", number, created_at=datetime(2026, 10, 1))
        for number in numbers
    ]

    sync_github_events(Github())

    assert GitHubEvent.objects.count() == len(numbers)


def test_truncated_timeline_skips_issue(
    issue: NixpkgsIssue, fake_github: FakeGitHub
) -> None:
    for number in (1, 2):
        GitHubItem.objects.create(
            owner="NixOS",
            repository="nixpkgs",
            number=number,
            kind=GitHubItem.Kind.ISSUE,
        ).nixpkgs_issues.add(issue)
    fake_github.items = [
        Issue(
            "NixOS/nixpkgs",
            1,
            created_at=datetime(2026, 10, 1),
            timeline=[
                ClosedEvent(
                    created_at=datetime(2026, 10, 1) + timedelta(hours=n),
                    state_reason="COMPLETED",
                )
                if n % 2
                else ReopenedEvent(
                    created_at=datetime(2026, 10, 1) + timedelta(hours=n)
                )
                for n in range(1, 102)
            ],
        ),
        Issue("NixOS/nixpkgs", 2, created_at=datetime(2026, 10, 1)),
    ]

    sync_github_events(Github())

    assert set(GitHubEvent.objects.values_list("item__number", flat=True)) == {2}
    assert set(GitHubSyncError.objects.values_list("item__number", "error_type")) == {
        (1, "TRUNCATED")
    }
    assert "timeline of NixOS/nixpkgs#1" in GitHubSyncError.objects.get().message


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


def test_closing_pull_request_is_tracked(
    issue: NixpkgsIssue, fake_github: FakeGitHub
) -> None:
    item = GitHubItem.objects.create(
        owner="NixOS",
        repository="nixpkgs",
        number=1,
        kind=GitHubItem.Kind.ISSUE,
    )
    item.nixpkgs_issues.add(issue)
    pull_request = PullRequest("NixOS/nixpkgs", 2, created_at=datetime(2026, 10, 2))
    github_issue = Issue(
        "NixOS/nixpkgs",
        1,
        created_at=datetime(2026, 10, 1),
        closed_by=[pull_request],
    )
    fake_github.items = [github_issue, pull_request]

    sync_github_events(Github())

    closing = GitHubItem.objects.get(number=2)
    assert closing.kind == GitHubItem.Kind.PULL_REQUEST
    assert set(GitHubItem.objects.filter(closes__issue=item)) == {closing}

    github_issue.closed_by = []
    sync_github_events(Github())

    assert not item.closed_by.exists()
    assert GitHubItem.objects.filter(number=2).exists()


@pytest.mark.parametrize("close_delay", [timedelta(0), timedelta(seconds=1)])
def test_closing_pull_request_records_history(
    issue: NixpkgsIssue, fake_github: FakeGitHub, close_delay: timedelta
) -> None:
    GitHubItem.objects.create(
        owner="NixOS",
        repository="nixpkgs",
        number=1,
        kind=GitHubItem.Kind.ISSUE,
    ).nixpkgs_issues.add(issue)
    pull_request = PullRequest(
        "NixOS/nixpkgs",
        2,
        created_at=datetime(2026, 10, 2),
        timeline=[
            ClosedEvent(created_at=datetime(2026, 10, 3), state_reason="COMPLETED"),
            ReopenedEvent(created_at=datetime(2026, 10, 4)),
            MergedEvent(created_at=datetime(2026, 10, 5)),
            ClosedEvent(
                created_at=datetime(2026, 10, 5) + close_delay,
                state_reason="COMPLETED",
            ),
        ],
    )
    fake_github.items = [
        Issue(
            "NixOS/nixpkgs",
            1,
            created_at=datetime(2026, 10, 1),
            closed_by=[pull_request],
        ),
        pull_request,
    ]

    sync_github_events(Github())

    assert list(
        GitHubEvent.objects.filter(item__number=2)
        .order_by("occurred_at")
        .values_list("event_type", "occurred_at")
    ) == [
        (EventType.PULL_REQUEST | EventType.OPENED, datetime(2026, 10, 2, tzinfo=UTC)),
        (EventType.PULL_REQUEST | EventType.CLOSED, datetime(2026, 10, 3, tzinfo=UTC)),
        (EventType.PULL_REQUEST | EventType.OPENED, datetime(2026, 10, 4, tzinfo=UTC)),
        (
            EventType.PULL_REQUEST | EventType.CLOSED | EventType.MERGED,
            datetime(2026, 10, 5, tzinfo=UTC),
        ),
    ]


def test_foreign_closing_pull_request_is_ignored(
    issue: NixpkgsIssue, fake_github: FakeGitHub
) -> None:
    item = GitHubItem.objects.create(
        owner="NixOS",
        repository="nixpkgs",
        number=1,
        kind=GitHubItem.Kind.ISSUE,
    )
    item.nixpkgs_issues.add(issue)
    foreign = PullRequest("someone/elsewhere", 2, created_at=datetime(2026, 10, 2))
    fake_github.items = [
        Issue(
            "NixOS/nixpkgs",
            1,
            created_at=datetime(2026, 10, 1),
            closed_by=[foreign],
        ),
        foreign,
    ]

    sync_github_events(Github())

    assert not item.closed_by.exists()
    assert not GitHubItem.objects.filter(number=2).exists()


def test_failed_issue_keeps_closing_pull_requests(
    issue: NixpkgsIssue, fake_github: FakeGitHub
) -> None:
    item = GitHubItem.objects.create(
        owner="NixOS",
        repository="nixpkgs",
        number=1,
        kind=GitHubItem.Kind.ISSUE,
    )
    item.nixpkgs_issues.add(issue)
    pull_request = PullRequest("NixOS/nixpkgs", 2, created_at=datetime(2026, 10, 2))
    fake_github.items = [
        Issue(
            "NixOS/nixpkgs",
            1,
            created_at=datetime(2026, 10, 1),
            closed_by=[pull_request],
        ),
        pull_request,
    ]
    sync_github_events(Github())

    fake_github.items = []
    sync_github_events(Github())

    assert set(GitHubItem.objects.filter(closes__issue=item)) == {
        GitHubItem.objects.get(number=2)
    }


@pytest.mark.parametrize(
    ("closed_by", "where"),
    [
        (
            [
                PullRequest("NixOS/nixpkgs", n, created_at=datetime(2026, 10, 2))
                for n in range(2, 103)
            ],
            "closing pull requests of NixOS/nixpkgs#1",
        ),
        (
            [
                PullRequest(
                    "NixOS/nixpkgs",
                    2,
                    created_at=datetime(2026, 10, 2),
                    timeline=[
                        ClosedEvent(
                            created_at=datetime(2026, 10, 2) + timedelta(hours=n),
                            state_reason="COMPLETED",
                        )
                        if n % 2
                        else ReopenedEvent(
                            created_at=datetime(2026, 10, 2) + timedelta(hours=n)
                        )
                        for n in range(1, 102)
                    ],
                )
            ],
            "timeline of NixOS/nixpkgs#2",
        ),
    ],
)
def test_truncated_closing_data_skips_issue(
    issue: NixpkgsIssue,
    fake_github: FakeGitHub,
    closed_by: list[PullRequest],
    where: str,
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
            closed_by=closed_by,
        ),
        *closed_by,
    ]

    sync_github_events(Github())

    assert not item.closed_by.exists()
    error = GitHubSyncError.objects.get(item=item)
    assert error.error_type == "TRUNCATED"
    assert where in error.message
