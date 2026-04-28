from abc import ABC, abstractmethod
from datetime import datetime
from typing import Literal, TypedDict

from django.conf import settings
from pydantic import BaseModel


class RawEvent(BaseModel, ABC):
    """Base class for raw events from the database."""

    suggestion_id: int
    timestamp: datetime
    # TODO(@florentc): there is no username for non-user initiated events.
    # Maybe we'll want to have different types for user generated events and other events in the future.
    username: str | None

    @abstractmethod
    def is_canceled_by(
        self,
        other: "RawEvent",
    ) -> bool:
        """Check if this event is canceled by another event.

        Must be implemented by subclasses to define specific cancellation logic.
        """
        pass

    def precedes_close_related_event(
        self,
        other: "RawEvent",
    ) -> bool:
        """Checks if the event is followed by one related to the same suggestion by the same user within a given time window"""
        return (
            self.username == other.username
            and self.suggestion_id == other.suggestion_id
            and (other.timestamp - self.timestamp).total_seconds()
            <= settings.DEBOUNCE_ACTIVITY_LOG_SECONDS
        )


class RawCreationEvent(RawEvent):
    """Raw suggestion creation event, with optional dismissal reason in case of auto-dismissal."""

    username: str | None = None
    action: Literal["create"] = "create"
    rejection_reason: str | None

    def is_canceled_by(self, other: "RawEvent") -> bool:
        """Creation events are not cancellable"""
        return False


class RawStatusEvent(RawEvent):
    """Raw status change event."""

    action: Literal["insert", "update"]
    status_value: str
    rejection_reason: str | None

    def is_canceled_by(self, other: "RawEvent") -> bool:
        """Status events don't cancel each other."""
        return False


class RawPackageEvent(RawEvent):
    """Raw package change event."""

    action: Literal["package.restore", "package.ignore"]
    package_attribute: str

    def is_canceled_by(self, other: "RawEvent") -> bool:
        """Check if this package event is canceled by another package event."""
        if not self.precedes_close_related_event(other):
            return False

        if isinstance(other, RawPackageEvent):
            return self.package_attribute == other.package_attribute and {
                self.action,
                other.action,
            } == {"package.restore", "package.ignore"}

        return False


class Maintainer(TypedDict):
    name: str
    email: str | None
    github: str
    matrix: str | None
    github_id: int


class RawMaintainerEvent(RawEvent):
    """Raw maintainer change event."""

    action: Literal[
        "maintainer.add", "maintainer.delete", "maintainer.ignore", "maintainer.restore"
    ]
    maintainer: Maintainer

    def is_canceled_by(
        self,
        other: "RawEvent",
    ) -> bool:
        """Check if this maintainer event is canceled by another maintainer event."""
        if not self.precedes_close_related_event(other):
            return False

        if isinstance(other, RawMaintainerEvent):
            return self.maintainer["github_id"] == other.maintainer["github_id"] and (
                {
                    self.action,
                    other.action,
                }
                == {
                    "maintainer.add",
                    "maintainer.delete",
                }
                or {
                    self.action,
                    other.action,
                }
                == {
                    "maintainer.ignore",
                    "maintainer.restore",
                }
            )

        return False


# NOTE(@florentc): A true deduplicated reference has tags but this is just to keep track in the user displayed activity log
class Reference(TypedDict):
    url: str
    name: str


class RawReferenceEvent(RawEvent):
    """Raw reference change event."""

    action: Literal["reference.ignore", "reference.restore"]
    reference: Reference

    def is_canceled_by(
        self,
        other: "RawEvent",
    ) -> bool:
        if not self.precedes_close_related_event(other):
            return False

        if isinstance(other, RawReferenceEvent):
            return self.reference["url"] == other.reference["url"] and {
                self.action,
                other.action,
            } == {
                "reference.restore",
                "reference.ignore",
            }

        return False


RawEventType = (
    RawCreationEvent
    | RawStatusEvent
    | RawPackageEvent
    | RawMaintainerEvent
    | RawReferenceEvent
)


def sort_events_chronologically(events: list[RawEventType]) -> list[RawEventType]:
    """
    Sort a list of raw events chronologically by their timestamp.
    """
    return sorted(events, key=lambda event: event.timestamp)


def remove_canceling_events(
    events: list[RawEventType], sort: bool = False
) -> list[RawEventType]:
    """
    Remove consecutive events that cancel each other out within a time window.
    Events must be sorted chronologically. Use the sort flag if not.
    """
    filtered_events = []
    i = 0

    events = sort_events_chronologically(events) if sort else events

    while i < len(events):
        if i + 1 < len(events) and events[i].is_canceled_by(events[i + 1]):
            # Skip both events
            i += 2
        else:
            # Keep this event
            filtered_events.append(events[i])
            i += 1

    return filtered_events
