import logging
import re
from typing import Any

from django.core.validators import RegexValidator
from django.db.models import Prefetch
from django.db.models.manager import BaseManager
from django.db.models.query import QuerySet
from django.views.generic import DetailView, ListView, TemplateView

from shared.logs.fetchers import fetch_suggestion_events
from shared.models import (
    CveRecord,
    EventType,
    NixpkgsEvent,
    NixpkgsIssue,
)
from webview.suggestions.views.base import get_suggestion_context

logger = logging.getLogger(__name__)


class HomeView(TemplateView):
    template_name = "home_view.html"


class NixpkgsIssueView(DetailView):
    template_name = "issue_detail.html"
    model = NixpkgsIssue
    slug_field = "code"
    slug_url_kwarg = "code"

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        validator = CveRecord._meta.get_field("cve_id").validators[0]
        if isinstance(validator, RegexValidator):
            self.pattern = re.compile(validator.regex)
        else:
            raise TypeError("Expected RegexValidator for CveRecord.cve_id")

    def get_queryset(self) -> QuerySet[NixpkgsIssue]:
        return (
            super()
            .get_queryset()
            .prefetch_related(
                "suggestion__cached",
                "suggestion__cve__container__references__tags",
            )
        )

    def get_context_data(self, **kwargs: Any) -> Any:
        context = super().get_context_data(**kwargs)
        issue = self.object

        # Fetch suggestion_context
        events = fetch_suggestion_events([issue.suggestion_id])
        context["suggestion_context"] = get_suggestion_context(
            issue.suggestion,
            user_can_edit=False,
            pre_fetched_events=events[issue.suggestion_id],
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
                "suggestion__cached",
                "suggestion__cve__container__references__tags",
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
        suggestion_ids = [issue.suggestion_id for issue in context["object_list"]]
        events_by_suggestion = fetch_suggestion_events(suggestion_ids)
        for issue in context["object_list"]:
            # FIXME(@fricklerhandwerk): We're assigning an object field that doesn't exist.
            # The horrible thing is that it still works, because somewhere in the template processing it does the equivalent of `object.__dict__` and there the key shows up again.
            # FIXME(@fricklerhandwerk): That call runs queries as a side effect, but the data should be prefetched.
            issue.suggestion_context = get_suggestion_context(
                issue.suggestion,
                user_can_edit=False,
                pre_fetched_events=events_by_suggestion[issue.suggestion_id],
            )

            issue.suggestion_context.show_status = False
            github_issue_opened = issue.events.first()
            issue.github_issue = (
                github_issue_opened.url if github_issue_opened else None
            )

        return context
