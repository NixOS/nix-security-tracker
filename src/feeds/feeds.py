from dataclasses import dataclass
from datetime import datetime
from typing import Any, cast

from django.contrib.syndication.views import Feed
from django.core.exceptions import ObjectDoesNotExist
from django.template.defaultfilters import truncatewords
from django.urls import reverse
from django.utils.feedgenerator import Atom1Feed
from django.utils.safestring import SafeText, mark_safe

from shared.logs.events import (
    RawCreationEvent,
    RawEventType,
    RawStatusEvent,
)
from shared.logs.fetchers import fetch_status_events_for_package
from shared.models.linkage import CVEDerivationClusterProposal
from shared.models.nix_evaluation import NixDerivation


@dataclass
class FeedItem:
    suggestion: CVEDerivationClusterProposal
    event: RawEventType


def _describe_event(event: RawEventType) -> str:
    """Return a human-readable label for a creation or status-change event."""
    if isinstance(event, RawCreationEvent):
        if event.rejection_reason:
            return f"created (auto-dismissed: {event.rejection_reason})"
        return "created"
    if isinstance(event, RawStatusEvent):
        match event.status_value:
            case CVEDerivationClusterProposal.Status.PENDING:
                return "pending"
            case CVEDerivationClusterProposal.Status.ACCEPTED:
                return "accepted"
            case CVEDerivationClusterProposal.Status.REJECTED:
                if event.rejection_reason:
                    return f"dismissed: {event.rejection_reason}"
                return "dismissed"
            case CVEDerivationClusterProposal.Status.PUBLISHED:
                return "published"
            case _:
                return event.status_value
    return "unknown"


class PackageFeed(Feed):
    feed_type = Atom1Feed

    def get_object(self, request: object, package_name: str) -> str:  # type: ignore[override]  # base returns None
        if not NixDerivation.objects.filter(attribute=package_name).exists():
            raise ObjectDoesNotExist(f"No package '{package_name}'")
        return package_name

    def title(self, package_name: str) -> str:
        return f"Activity involving package '{package_name}'"

    def link(self, package_name: str) -> str:
        return reverse(
            "webview:suggestion:suggestions_by_package",
            kwargs={"package_name": package_name},
        )

    def description(self, package_name: str) -> str:
        return f"Status changes for suggestions involving package '{package_name}' on Nixpkgs security tracker. Including creation of new suggestions, dismissal, acceptance, and publication. After a package is ignored on a suggestion, related events are no longer tracked."

    def items(self, package_name: str) -> list[FeedItem]:
        events = fetch_status_events_for_package(package_name)

        suggestion_ids = list({e.suggestion_id for e in events})
        suggestions = {
            s.pk: s
            for s in CVEDerivationClusterProposal.objects.filter(
                pk__in=suggestion_ids,
                cached__isnull=False,  # If we don't have the cached value at a given time, a next pull of the feed will fill it in when the cached value is ready
            ).select_related("cached", "cve")
        }

        return [
            FeedItem(suggestion=suggestions[e.suggestion_id], event=e)
            for e in events
            if e.suggestion_id in suggestions
            and not (
                isinstance(e, RawCreationEvent) and e.rejection_reason
            )  # We exclude auto-dismiss events
        ]

    def item_title(self, item: Any) -> SafeText:
        fi = cast(FeedItem, item)
        cve_id = fi.suggestion.cve.cve_id
        return mark_safe(f"{cve_id}: {_describe_event(fi.event)}")

    # Item links are used as ids by default but several feed items (events) can share the same suggestion, hence link.
    # We define item ids based on suggestion id, event type, and timestamp.
    def item_guid(self, item: Any) -> str:
        fi = cast(FeedItem, item)
        return (
            f"suggestion:{fi.suggestion.pk}"
            f"/{_describe_event(fi.event)}"
            f"/{fi.event.timestamp.isoformat()}"
        )

    # Our GUIDS are not permalinks
    item_guid_is_permalink = False

    def item_link(self, item: Any) -> str:
        fi = cast(FeedItem, item)
        return reverse(
            "webview:suggestion:detail",
            kwargs={"suggestion_id": fi.suggestion.pk},
        )

    def item_description(self, item: Any) -> str:
        fi = cast(FeedItem, item)
        cve_id = fi.suggestion.cve.cve_id
        cve_url = f"https://nvd.nist.gov/vuln/detail/{cve_id}"
        cve_title = None
        if fi.suggestion.cached.payload["title"]:
            cve_title = fi.suggestion.cached.payload["title"]
        elif fi.suggestion.cached.payload["description"]:
            cve_title = truncatewords(fi.suggestion.cached.payload["description"], 10)
        label = f"<strong>{_describe_event(fi.event)}</strong>"
        parts = [f'<a href="{cve_url}">{cve_id}</a>']
        if cve_title:
            parts.append(cve_title)
        parts.append(label)
        return "<ul>" + "".join(f"<li>{p}</li>" for p in parts) + "</ul>"

    def item_pubdate(self, item: FeedItem) -> datetime:
        return item.event.timestamp
