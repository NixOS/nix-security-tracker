import datetime
import logging
from collections.abc import ItemsView
from typing import Any, TypedDict
from urllib.parse import quote

from cvss import CVSS3
from cvss.constants3 import METRICS_ABBREVIATIONS
from django import template
from django.template.context import Context

from shared.auth import isadmin, ismaintainer
from shared.listeners.cache_suggestions import CachedSuggestion, parse_drv_name
from shared.logs.batches import FoldedEventType
from shared.models.issue import NixpkgsIssue
from shared.models.linkage import (
    CVEDerivationClusterProposal,
)
from webview.models import Notification
from webview.suggestions.context.types import (
    MaintainerAddContext,
    MaintainerContext,
    MaintainerListContext,
    PackageListContext,
    SuggestionContext,
    SuggestionStubContext,
)

register = template.Library()

logger = logging.getLogger(__name__)


@register.filter
def reverse_keys(
    value: dict[str, CachedSuggestion.PackageOnPrimaryChannel],
) -> ItemsView[str, CachedSuggestion.PackageOnPrimaryChannel]:
    return dict(sorted(value.items(), reverse=True)).items()


class Package(TypedDict):
    description: str
    channels: dict[str, CachedSuggestion.PackageOnPrimaryChannel]


class PackageContext(TypedDict):
    attribute_name: str
    pdata: Package


class AffectedContext(TypedDict):
    affected: list[CachedSuggestion.AffectedProduct]


class SuggestionActivityLog(TypedDict):
    suggestion: CVEDerivationClusterProposal
    activity_log: list[FoldedEventType]
    oob_update: bool


class NotificationContext(TypedDict):
    notification: Notification
    current_page: (
        int | None
    )  # For no-js compatibility in multi-page notification center
    new_unread_count: int | None  # For oob update of unread notifications counter


class NotificationsBadgeContext(TypedDict):
    count: int
    oob_update: bool | None


class PackageSubscriptionsContext(TypedDict):
    package_subscriptions: list[str]
    error_message: str | None


class AutoSubscribeContext(TypedDict):
    auto_subscribe_enabled: bool
    error_message: str | None


@register.filter
def getitem(dictionary: dict, key: str) -> Any | None:
    return dictionary.get(key)


@register.filter
def getdrvname(drv: dict) -> str:
    hash = drv["drv_path"].split("-")[0].split("/")[-1]
    name = drv["drv_name"]
    return f"{name} {hash[:8]}"


@register.inclusion_tag("subscriptions/components/packages.html")
def package_subscriptions(
    package_subscriptions: list[str],
    error_message: str | None = None,
) -> PackageSubscriptionsContext:
    return {
        "package_subscriptions": package_subscriptions,
        "error_message": error_message,
    }


@register.inclusion_tag("subscriptions/components/auto_subscribe.html")
def auto_subscribe_toggle(
    auto_subscribe_enabled: bool,
    error_message: str | None = None,
) -> AutoSubscribeContext:
    return {
        "auto_subscribe_enabled": auto_subscribe_enabled,
        "error_message": error_message,
    }


@register.inclusion_tag("notifications/components/notification.html")
def notification(
    notification: Notification,
    current_page: int | None = None,
    new_unread_count: int | None = None,
) -> NotificationContext:
    return {
        "notification": notification,
        "current_page": current_page,
        "new_unread_count": new_unread_count,
    }


@register.inclusion_tag("notifications/components/notifications_badge.html")
def notifications_badge(
    count: int, oob_update: bool | None = None
) -> NotificationsBadgeContext:
    return {"count": count, "oob_update": oob_update}


@register.inclusion_tag("components/severity_badge.html")
def severity_badge(metrics: list[dict]) -> dict:
    """
    For now we return the first metric that has a sane looking raw JSON field.
    """
    for m in metrics:
        if "raw_cvss_json" in m and "vectorString" in m.get("raw_cvss_json", {}):
            parsed = CVSS3(m["raw_cvss_json"]["vectorString"])
            return {
                "vectorString": m["raw_cvss_json"]["vectorString"],
                "version": m["raw_cvss_json"]["version"],
                "metrics": {
                    # XXX(@fricklerhandwerk): Yes, the *value* description is also indexed by *key*!
                    f"{METRICS_ABBREVIATIONS[k]} ({k})": f"{parsed.get_value_description(k)} ({v})"
                    for k, v in parsed.metrics.items()
                    if not k.startswith("M")  # Don't display modified metrics
                },
            }
    return {}


@register.filter
def iso(date: datetime.datetime) -> str:
    if isinstance(date, str):
        date = datetime.datetime.fromisoformat(date)
    return date.replace(microsecond=0).isoformat()


@register.filter
def versioned_package_name(package_entry: dict[str, Any]) -> str:
    _, version = parse_drv_name(package_entry["name"])
    return f"pkgs.{package_entry['attribute']} {version}"


def is_admin(user: Any) -> bool:
    if user is None or user.is_anonymous:
        return False
    else:
        return isadmin(user)


@register.filter
def is_maintainer(user: Any) -> bool:
    if user is None or user.is_anonymous:
        return False
    else:
        return ismaintainer(user)


@register.filter
def is_maintainer_or_admin(user: Any) -> bool:
    return is_maintainer(user) or is_admin(user)


@register.inclusion_tag("components/issue.html", takes_context=True)
def issue(
    context: Context,
    issue: NixpkgsIssue,
    suggestion_context: SuggestionContext,
    github_issue: str | None,
    show_permalink: bool = False,
) -> dict:
    return {
        "issue": issue,
        "show_permalink": show_permalink,
        "suggestion_context": suggestion_context,
        "github_issue": github_issue,
        "page_obj": context.get("page_obj", None),
        "status_filter": "published",  # Needed in context for the suggestion component
        "user": context["user"],
    }


@register.inclusion_tag("components/nixpkgs_package.html")
def nixpkgs_package(attribute_name: str, pdata: Package) -> PackageContext:
    return {"attribute_name": quote(attribute_name, safe=""), "pdata": pdata}


@register.inclusion_tag("components/affected_products.html")
def affected_products(
    affected: list[CachedSuggestion.AffectedProduct],
) -> AffectedContext:
    return {"affected": affected}


@register.inclusion_tag("components/suggestion_activity_log.html")
def suggestion_activity_log(
    suggestion: CVEDerivationClusterProposal,
    activity_log: list[FoldedEventType],
    oob_update: bool = False,
) -> SuggestionActivityLog:
    return {
        "suggestion": suggestion,
        "activity_log": activity_log,
        "oob_update": oob_update,
    }


@register.inclusion_tag("components/status_icon.html")
def status_icon(status: str) -> dict[str, str]:
    icon_mapping = {
        "pending": "icon-inbox",
        "rejected": "icon-bin",
        "accepted": "icon-draft",
        "published": "icon-github",
    }
    return {
        "icon_class": icon_mapping.get(status, "icon-inbox")
    }  # Default to inbox icon


@register.inclusion_tag("suggestions/components/suggestion.html", takes_context=True)
def suggestion(
    context: Context,
    data: SuggestionContext,
) -> dict:
    return {
        "data": data,
        "user": context["user"],
    }


@register.inclusion_tag(
    "suggestions/components/suggestion_stub.html", takes_context=True
)
def suggestion_stub(
    context: Context,
    data: SuggestionStubContext,
) -> dict:
    return {
        "data": data,
        "user": context["user"],
    }


@register.inclusion_tag("suggestions/components/package_list.html", takes_context=True)
def package_list(
    context: Context,
    data: PackageListContext,
) -> dict[str, Any]:
    """
    Renders the nixpkgs package list for suggestions with ignore/restore functionality.
    """
    return {
        "data": data,
        "user": context["user"],
    }


@register.inclusion_tag("suggestions/components/maintainer.html", takes_context=True)
def maintainer(
    context: Context,
    data: MaintainerContext,
) -> dict:
    return {
        "data": data,
        "user": context["user"],
    }


@register.inclusion_tag(
    "suggestions/components/maintainers_list.html", takes_context=True
)
def maintainer_list(
    context: Context,
    data: MaintainerListContext,
) -> dict:
    return {
        "data": data,
        "user": context["user"],
    }


@register.inclusion_tag("suggestions/components/maintainer_add.html")
def maintainer_add(
    data: MaintainerAddContext,
) -> dict:
    return {"data": data}
