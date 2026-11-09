from collections.abc import Callable

import pytest

from shared.models.issue import EventType as E
from shared.models.issue import GitHubItem, NixpkgsIssue


@pytest.mark.parametrize(
    "issue_events, pull_request_events, closed",
    [
        # Open GitHub issue without closing pull requests
        ([E.ISSUE_OPENED], [], False),
        # Closed GitHub issue without closing pull requests
        ([E.ISSUE_OPENED, E.ISSUE_COMPLETED], [], True),
        # Closed GitHub issue with all closing pull requests closed
        (
            [E.ISSUE_OPENED, E.ISSUE_COMPLETED],
            [
                [E.PULL_REQUEST_OPENED, E.PULL_REQUEST_MERGED],
                [E.PULL_REQUEST_OPENED, E.PULL_REQUEST_CLOSED],
            ],
            True,
        ),
        # Closed GitHub issue with one closing pull request still open
        (
            [E.ISSUE_OPENED, E.ISSUE_COMPLETED],
            [
                [E.PULL_REQUEST_OPENED, E.PULL_REQUEST_MERGED],
                [E.PULL_REQUEST_OPENED],
            ],
            False,
        ),
        # Open GitHub issue with a merged pull request
        (
            [E.ISSUE_OPENED],
            [[E.PULL_REQUEST_OPENED, E.PULL_REQUEST_MERGED]],
            False,
        ),
        # GitHub issue not synced yet
        ([], [], False),
        # Closed GitHub issue with an unsynced closing pull request
        ([E.ISSUE_OPENED, E.ISSUE_COMPLETED], [[]], False),
    ],
)
def test_issue_closed_state(
    make_issue: Callable[..., NixpkgsIssue],
    make_github_item: Callable[..., GitHubItem],
    issue_events: list[E],
    pull_request_events: list[list[E]],
    closed: bool,
) -> None:
    issue = make_issue()
    github_issue = make_github_item(1, GitHubItem.Kind.ISSUE, *issue_events)
    issue.github_items.add(github_issue)
    for number, events in enumerate(pull_request_events, start=2):
        pull_request = make_github_item(number, GitHubItem.Kind.PULL_REQUEST, *events)
        pull_request.closes.create(issue=github_issue)

    assert NixpkgsIssue.objects.closed().filter(pk=issue.pk).exists() is closed
    assert NixpkgsIssue.objects.open().filter(pk=issue.pk).exists() is not closed


def test_issue_without_github_issue_is_open(
    make_issue: Callable[..., NixpkgsIssue],
) -> None:
    issue = make_issue()

    assert not NixpkgsIssue.objects.closed().filter(pk=issue.pk).exists()
    assert NixpkgsIssue.objects.open().filter(pk=issue.pk).exists()
