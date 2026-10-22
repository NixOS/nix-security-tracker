"""
Typed views on the parts of GitHub's GraphQL API we query.

Each class pairs the fragment that requests a piece of data with the code that interprets the response, so the query and its consumer cannot drift apart.
Fragments for single items are static and built once.
The repository fragment is built per batch, since GraphQL offers no lookup of several issues by number in one field, and each requested issue therefore gets its own aliased field.
"""

from collections.abc import Iterable, Iterator
from functools import cache
from typing import Any

import github_graphql as schema
from django.utils.functional import classproperty
from sgqlc.operation import Fragment

from shared.models.issue import EventType, GitHubEvent


class TruncatedError(Exception):
    def __init__(self, number: int, what: str) -> None:
        super().__init__(f"{what} of #{number}")
        self.number = number
        self.what = what


def nodes(page: Any, number: int, what: str) -> list[Any]:
    # FIXME(@fricklerhandwerk): Fetch the remaining pages here instead of giving up, once lists that long occur.
    if page.page_info.has_next_page:
        raise TruncatedError(number, what)
    return page.nodes or []


class PullRequest:
    @classproperty
    @cache
    def closed(cls) -> Fragment:
        fragment = Fragment(schema.ClosedEvent, "PullRequestClosed")
        fragment.created_at()
        return fragment

    @classproperty
    @cache
    def reopened(cls) -> Fragment:
        fragment = Fragment(schema.ReopenedEvent, "PullRequestReopened")
        fragment.created_at()
        return fragment

    @classproperty
    @cache
    def merged(cls) -> Fragment:
        fragment = Fragment(schema.MergedEvent, "PullRequestMerged")
        fragment.created_at()
        return fragment

    @classproperty
    @cache
    def fragment(cls) -> Fragment:
        fragment = Fragment(schema.PullRequest, "PullRequestHistory")
        fragment.number()
        fragment.created_at()
        fragment.base_repository.name_with_owner()
        timeline = fragment.timeline_items(
            first=20,
            item_types=["CLOSED_EVENT", "REOPENED_EVENT", "MERGED_EVENT"],
        )
        timeline.page_info.has_next_page()
        nodes = timeline.nodes
        nodes.__fragment__(cls.closed)
        nodes.__fragment__(cls.reopened)
        nodes.__fragment__(cls.merged)
        return fragment

    def __init__(self, data: schema.PullRequest) -> None:
        self.data = data

    @property
    def number(self) -> int:
        return self.data.number

    @property
    def repository(self) -> str | None:
        if repository := self.data.base_repository:
            return repository.name_with_owner
        return None

    def events(self) -> Iterator[GitHubEvent]:
        yield GitHubEvent(
            event_type=EventType.PULL_REQUEST | EventType.OPENED,
            occurred_at=self.data.created_at,
        )
        timeline = nodes(self.data.timeline_items, self.number, "timeline")
        # GitHub records a merge as both a merge and a close, the close at the same moment or shortly after.
        # Recording both would leave two latest events in unknown order, and a merged pull request may end up showing as merely closed.
        # We therefore filter those cases.
        # A merged pull request can't be reopened, so the merge's close is its last one.
        merge_close = (
            next(
                (
                    node
                    for node in reversed(timeline)
                    if isinstance(node, schema.ClosedEvent)
                ),
                None,
            )
            if any(isinstance(node, schema.MergedEvent) for node in timeline)
            else None
        )
        for node in timeline:
            match node:
                case schema.MergedEvent():
                    yield GitHubEvent(
                        event_type=EventType.PULL_REQUEST
                        | EventType.CLOSED
                        | EventType.MERGED,
                        occurred_at=node.created_at,
                    )
                case schema.ClosedEvent() if node is merge_close:
                    continue
                case schema.ClosedEvent():
                    yield GitHubEvent(
                        event_type=EventType.PULL_REQUEST | EventType.CLOSED,
                        occurred_at=node.created_at,
                    )
                case schema.ReopenedEvent():
                    yield GitHubEvent(
                        event_type=EventType.PULL_REQUEST | EventType.OPENED,
                        occurred_at=node.created_at,
                    )
                case _:
                    raise ValueError(f"Unexpected timeline item: {type(node).__name__}")


class Issue:
    @classproperty
    @cache
    def closed(cls) -> Fragment:
        fragment = Fragment(schema.ClosedEvent, "IssueClosed")
        fragment.created_at()
        fragment.state_reason()
        return fragment

    @classproperty
    @cache
    def reopened(cls) -> Fragment:
        fragment = Fragment(schema.ReopenedEvent, "IssueReopened")
        fragment.created_at()
        return fragment

    @classproperty
    @cache
    def fragment(cls) -> Fragment:
        fragment = Fragment(schema.Issue, "IssueHistory")
        fragment.number()
        fragment.created_at()
        timeline = fragment.timeline_items(
            first=20,
            item_types=["CLOSED_EVENT", "REOPENED_EVENT"],
        )
        timeline.page_info.has_next_page()
        nodes = timeline.nodes
        nodes.__fragment__(cls.closed)
        nodes.__fragment__(cls.reopened)
        closing = fragment.closed_by_pull_requests_references(
            first=10, include_closed_prs=True
        )
        closing.page_info.has_next_page()
        closing.nodes.__fragment__(PullRequest.fragment)
        return fragment

    def __init__(self, data: schema.Issue) -> None:
        self.data = data

    @property
    def number(self) -> int:
        return self.data.number

    def events(self) -> Iterator[GitHubEvent]:
        yield GitHubEvent(
            event_type=EventType.ISSUE | EventType.OPENED,
            occurred_at=self.data.created_at,
        )
        for node in nodes(self.data.timeline_items, self.number, "timeline"):
            match node:
                case schema.ClosedEvent():
                    match node.state_reason:
                        case "COMPLETED":
                            reason = EventType.COMPLETED
                        case "NOT_PLANNED":
                            reason = EventType.NOT_PLANNED
                        case "DUPLICATE":
                            reason = EventType.DUPLICATE
                        case _:
                            raise ValueError(
                                f"Unexpected close reason: {node.state_reason}"
                            )
                    yield GitHubEvent(
                        event_type=EventType.ISSUE | EventType.CLOSED | reason,
                        occurred_at=node.created_at,
                    )
                case schema.ReopenedEvent():
                    yield GitHubEvent(
                        event_type=EventType.ISSUE | EventType.OPENED,
                        occurred_at=node.created_at,
                    )
                case _:
                    raise ValueError(f"Unexpected timeline item: {type(node).__name__}")

    def closing_pull_requests(self) -> Iterator[PullRequest]:
        for node in nodes(
            self.data.closed_by_pull_requests_references,
            self.number,
            "closing pull requests",
        ):
            yield PullRequest(node)


class Repository:
    @staticmethod
    def alias(number: int) -> str:
        return f"issue{number}"

    @classmethod
    def fragment(cls, numbers: Iterable[int]) -> Fragment:
        fragment = Fragment(schema.Repository, "RepositoryIssues")
        for number in numbers:
            fragment.issue(number=number, __alias__=cls.alias(number)).__fragment__(
                Issue.fragment
            )
        return fragment

    def __init__(self, data: schema.Repository) -> None:
        self.data = data

    def issues(self, numbers: Iterable[int]) -> Iterator[Issue]:
        for number in numbers:
            if data := getattr(self.data, self.alias(number)):
                yield Issue(data)
