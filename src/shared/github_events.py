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
            first=100,
            item_types=["CLOSED_EVENT", "REOPENED_EVENT"],
        )
        timeline.page_info.has_next_page()
        nodes = timeline.nodes
        nodes.__fragment__(cls.closed)
        nodes.__fragment__(cls.reopened)
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
