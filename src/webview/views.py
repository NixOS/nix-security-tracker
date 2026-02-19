import logging
import re
import typing
from typing import Any, cast

from django.core.validators import RegexValidator
from django.db.models import Prefetch

from webview.suggestions.views.base import get_suggestion_context

if typing.TYPE_CHECKING:
    # prevent typecheck from failing on some historic type
    # https://stackoverflow.com/questions/60271481/django-mypy-valuesqueryset-type-hint
    from django.db.models.query import ValuesQuerySet

from django.db.models import (
    Case,
    F,
    Value,
    When,
)
from django.db.models.manager import BaseManager
from django.db.models.query import QuerySet
from django.shortcuts import get_object_or_404
from django.views.generic import DetailView, ListView, TemplateView

from shared.models import (
    CveRecord,
    EventType,
    IssueStatus,
    NixChannel,
    NixpkgsEvent,
    NixpkgsIssue,
)

logger = logging.getLogger(__name__)


class HomeView(TemplateView):
    template_name = "home_view.html"


class NixpkgsIssueView(DetailView):
    template_name = "issue_detail.html"
    model = NixpkgsIssue

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        validator = CveRecord._meta.get_field("cve_id").validators[0]
        if isinstance(validator, RegexValidator):
            self.pattern = re.compile(validator.regex)
        else:
            raise TypeError("Expected RegexValidator for CveRecord.cve_id")

    def get_object(self, queryset: QuerySet | None = None) -> NixpkgsIssue:
        issue = cast(
            NixpkgsIssue, get_object_or_404(self.model, code=self.kwargs.get("code"))
        )
        return issue

    def get_context_data(self, **kwargs: Any) -> Any:
        context = super().get_context_data(**kwargs)
        issue = self.get_object()

        # Fetch suggestion_context
        context["suggestion_context"] = get_suggestion_context(
            issue.suggestion, can_edit=False
        )
        context["suggestion_context"].show_status = False
        github_issue_opened = NixpkgsEvent.objects.filter(
            issue=issue,
            event_type=EventType.ISSUE | EventType.OPENED,
        ).first()
        context["github_issue"] = (
            github_issue_opened.url if github_issue_opened else None
        )

        return context


class NixpkgsIssueListView(ListView):
    template_name = "issue_list.html"
    model = NixpkgsIssue
    paginate_by = 10

    # TODO Because of how issue codes and cached issues are generated (post save / post insert), it is not trivial to ensure new issues get their code filled up in the cached issue (unless `manage regenerate_cached_issues` is run by hand). Since the view needs the issue code, for now, the cached issue is passed as an additional field instead of being the returned object.
    def get_queryset(self) -> BaseManager[NixpkgsIssue]:
        issues = (
            NixpkgsIssue.objects.all()
            .prefetch_related(
                Prefetch(
                    "events",
                    queryset=NixpkgsEvent.objects.filter(
                        event_type=EventType.ISSUE | EventType.OPENED,
                    ),
                ),
            )
            .order_by("-created")
        )
        return issues

    def get_context_data(self, **kwargs: Any) -> Any:
        context = super().get_context_data(**kwargs)
        context["adjusted_elided_page_range"] = context[
            "paginator"
        ].get_elided_page_range(context["page_obj"].number)

        # Fetch activity logs
        for issue in context["object_list"]:
            # FIXME(@fricklerhandwerk): We're assigning an object field that doesn't exist.
            # The horrible thing is that it still works, because somewhere in the template processing it does the equivalent of `object.__dict__` and there the key shows up again.
            issue.suggestion_context = get_suggestion_context(
                issue.suggestion, can_edit=False
            )

            issue.suggestion_context.show_status = False
            github_issue_opened = issue.events.first()
            issue.github_issue = (
                github_issue_opened.url if github_issue_opened else None
            )

        return context


class NixderivationPerChannelView(ListView):
    template_name = "affected_list.html"
    context_object_name = "affected_list"
    paginate_by = 4

    def _get_ordered_channels(self) -> "ValuesQuerySet[NixChannel, Any]":
        custom_order = Case(
            When(state=NixChannel.ChannelState.STABLE, then=Value(1)),
            When(state=NixChannel.ChannelState.UNSTABLE, then=Value(2)),
            When(state=NixChannel.ChannelState.DEPRECATED, then=Value(3)),
            default=Value(4),
        )

        ordered_channels = (
            NixChannel.objects.alias(custom_order=custom_order)
            .filter(custom_order__lt=4)
            .order_by("custom_order", "channel_branch")
            .values_list("channel_branch", flat=True)
        )

        return ordered_channels

    def get_queryset(self) -> Any:
        channel_filter_value = self.kwargs["channel"]
        channel = get_object_or_404(NixChannel, channel_branch=channel_filter_value)

        return (
            NixpkgsIssue.objects.prefetch_related(
                "cve", "derivations", "derivations__parent_evaluation"
            )
            .values(issue_id=F("id"), issue_code=F("code"), issue_status=F("status"))
            .filter(issue_status=IssueStatus.AFFECTED)
            .annotate(
                cve_id=F("cve__id"),
                cve_code=F("cve__cve_id"),
                cve_state=F("cve__state"),
                drv_id=F("derivations__id"),
                drv_name=F("derivations__name"),
                drv_system=F("derivations__system"),
                drv_path=F("derivations__derivation_path"),
                channel_id=F("derivations__parent_evaluation__channel_id"),
            )
            .filter(channel_id=channel.channel_branch)
        )

    def get_context_data(self, **kwargs: Any) -> Any:
        context = super().get_context_data(**kwargs)
        context["channels"] = self._get_ordered_channels()
        context["current_channel"] = self.kwargs["channel"]
        context["adjusted_elided_page_range"] = context[
            "paginator"
        ].get_elided_page_range(context["page_obj"].number)

        context["headers"] = ["ID", "PLATFORM", "ISSUE", "CVE", "CVE STATE"]

        return context
