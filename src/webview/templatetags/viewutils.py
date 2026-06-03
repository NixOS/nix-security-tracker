import datetime
from collections.abc import ItemsView
from typing import Any, TypedDict
from urllib.parse import quote, urlencode

from cvss import CVSS3, CVSS4, constants3, constants4
from django import template
from django.conf import settings
from django.template.context import Context

from shared.cache_suggestions import CachedSuggestion
from shared.logs.batches import FoldedEventType
from shared.models.cve import Metric
from shared.models.issue import NixpkgsIssue
from shared.models.linkage import (
    CVEDerivationClusterProposal,
)
from webview.notifications.context import NotificationContext
from webview.suggestions.context.types import (
    MaintainerAddContext,
    MaintainerContext,
    MaintainerListContext,
    PackageListContext,
    ReferenceContext,
    ReferenceListContext,
    SuggestionContext,
    SuggestionStubContext,
)

register = template.Library()


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
    is_compact: bool


class SuggestionActivityLog(TypedDict):
    suggestion: CVEDerivationClusterProposal
    activity_log: list[FoldedEventType]
    oob_update: bool


class NotificationsBadgeContext(TypedDict):
    count: int
    oob_update: bool | None


class PackageSubscriptionsContext(TypedDict):
    package_subscriptions: list[str]
    error_message: str | None


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
) -> dict:
    return {
        "auto_subscribe_enabled": auto_subscribe_enabled,
        "error_message": error_message,
    }


@register.inclusion_tag("subscriptions/components/email_notifications_toggler.html")
def email_notifications_toggler(
    enabled: bool,
    error_message: str | None = None,
) -> dict:
    return {
        "enabled": enabled,
        "error_message": error_message,
    }


@register.inclusion_tag("subscriptions/components/email_setter.html")
def email_setter(
    notification_email: str,
    maintainer_email: str,
    error_message: str | None = None,
) -> dict:
    return {
        "notification_email": notification_email,
        "maintainer_email": maintainer_email,
        "error_message": error_message,
    }


@register.inclusion_tag("notifications/components/notification.html")
def notification(
    data: NotificationContext,
) -> dict:
    return {
        "data": data,
    }


@register.inclusion_tag("notifications/components/notifications_badge.html")
def notifications_badge(
    count: int, oob_update: bool | None = None
) -> NotificationsBadgeContext:
    return {"count": count, "oob_update": oob_update}


CVSS_PARSERS = {
    Metric.Format.V40: (CVSS4, constants4.METRICS_ABBREVIATIONS),
    Metric.Format.V31: (CVSS3, constants3.METRICS_ABBREVIATIONS),
    Metric.Format.V30: (CVSS3, constants3.METRICS_ABBREVIATIONS),
}


@register.inclusion_tag("components/severity_badge.html")
def severity_badge(metrics: list[dict]) -> dict:
    """
    For now we return the first metric that has a sane looking raw JSON field.
    """
    # FIXME(@fricklerhandwerk): This just returns the first metric that works.
    # We may want to be precise about what to show here though.
    for metric in metrics:
        fmt = metric.get("format", "")
        for prefix, (parser, abbreviations) in CVSS_PARSERS.items():
            if fmt.startswith(prefix):
                parsed = parser(metric["vector_string"])
                score, *_ = parsed.scores()
                severity, *_ = parsed.severities()

                result = {
                    "cvss": metric
                    | {
                        "version": Metric.Format(fmt).label,
                        "base_score": score,
                        "base_severity": severity.upper(),
                    }
                }

                result["human_readable"] = {
                    # XXX(@fricklerhandwerk): Yes, the *value* description is also indexed by *key*, not by the value itself!
                    f"{abbreviations[k]} ({k})": f"{parsed.get_value_description(k)} ({v})"
                    for k, v in parsed.metrics.items()
                }
                return result
    return {}


@register.filter
def iso(date: datetime.datetime) -> str:
    if isinstance(date, str):
        date = datetime.datetime.fromisoformat(date)
    return date.replace(microsecond=0).isoformat()


@register.inclusion_tag("components/issue.html", takes_context=True)
def issue(
    context: Context,
    issue: NixpkgsIssue,
    suggestion_contexts: list[SuggestionContext],
    github_issue: str | None,
    show_permalink: bool = False,
) -> dict:
    return {
        "issue": issue,
        "show_permalink": show_permalink,
        "suggestion_contexts": suggestion_contexts,
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
    is_compact: bool = False,
) -> AffectedContext:
    return {
        "affected": affected,
        "is_compact": is_compact,
    }


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


@register.inclusion_tag("suggestions/components/suggestion_stub.html")
def suggestion_stub(
    data: SuggestionStubContext,
) -> dict:
    return {
        "data": data,
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


@register.inclusion_tag("suggestions/components/reference.html")
def reference(
    data: ReferenceContext,
) -> dict:
    return {
        "data": data,
    }


@register.inclusion_tag("suggestions/components/reference_list.html")
def reference_list(
    data: ReferenceListContext,
) -> dict:
    return {
        "data": data,
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


@register.simple_tag
def gh_issues_url() -> str:
    base = f"https://github.com/{settings.GH_ORGANIZATION}/{settings.GH_ISSUES_REPO}/issues"
    labels = " ".join(f'label:"{label}"' for label in settings.GH_ISSUES_LABELS)
    query = f"is:issue state:open {labels}".strip()
    return f"{base}?{urlencode({'q': query})}"


@register.simple_tag(takes_context=True)
def toggle_param(context: Context, param_name: str, param_value: str = "") -> str:
    """Toggle a query parameter while preserving others."""
    request = context["request"]
    params = request.GET.copy()

    if param_name in params:
        del params[param_name]
    else:
        params[param_name] = param_value

    return f"?{params.urlencode()}"
