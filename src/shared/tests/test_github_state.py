from datetime import timedelta

import pytest
from django.utils import timezone

from shared.models.issue import EventType, GitHubItem


def test_closed_issue(db: None) -> None:
    item = GitHubItem.objects.create(
        owner="NixOS",
        repository="nixpkgs",
        number=1,
        kind=GitHubItem.Kind.ISSUE,
    )
    now = timezone.now()
    item.events.create(
        event_type=EventType.ISSUE | EventType.OPENED,
        occurred_at=now - timedelta(days=1),
    )
    item.events.create(
        event_type=EventType.ISSUE | EventType.CLOSED | EventType.COMPLETED,
        occurred_at=now,
    )

    assert item.state == EventType.ISSUE | EventType.CLOSED | EventType.COMPLETED


@pytest.mark.parametrize(
    "kind, flag",
    [
        (GitHubItem.Kind.ISSUE, EventType.ISSUE),
        (GitHubItem.Kind.PULL_REQUEST, EventType.PULL_REQUEST),
    ],
)
def test_item_without_events_is_open(
    db: None, kind: GitHubItem.Kind, flag: EventType
) -> None:
    item = GitHubItem.objects.create(
        owner="NixOS",
        repository="nixpkgs",
        number=1,
        kind=kind,
    )

    assert item.state == flag | EventType.OPENED
