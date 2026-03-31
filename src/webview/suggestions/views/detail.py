from typing import Any

from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse
from django.views.generic import DetailView, View

from shared.auth import user_can_edit_suggestion
from shared.listeners.cache_suggestions import cache_new_suggestions
from shared.logs.fetchers import fetch_suggestion_events
from shared.models.cached import CachedSuggestions
from shared.models.issue import NixpkgsIssue
from shared.models.linkage import (
    CVEDerivationClusterProposal,
)

from .base import get_suggestion_context


class SuggestionDetailView(DetailView):
    model = CVEDerivationClusterProposal
    template_name = "suggestions/suggestion_detail.html"
    pk_url_kwarg = "suggestion_id"

    def get_context_data(self, **kwargs: Any) -> dict[str, Any]:
        context = super().get_context_data(**kwargs)
        user_can_edit = user_can_edit_suggestion(self.request.user)
        events = fetch_suggestion_events([self.object.pk])
        context.update(
            {
                "suggestion_context": get_suggestion_context(
                    self.object,  # type: ignore
                    user_can_edit=user_can_edit,
                    pre_fetched_events=events[self.object.pk],
                )
            }
        )
        return context

    def get(self, request: HttpRequest, suggestion_id: int) -> HttpResponse:
        self.object = self.get_object()
        if not CachedSuggestions.objects.filter(proposal=self.object).exists():
            cache_new_suggestions(self.object)  # type: ignore
        if self.object.status == CVEDerivationClusterProposal.Status.PUBLISHED:
            issue = NixpkgsIssue.objects.get(suggestion=self.object)
            return redirect(
                reverse("webview:issue_detail", kwargs={"code": issue.code})
            )
        return super().get(request, suggestion_id)


class SuggestionDetailByCveView(View):
    """Redirect to suggestion detail by CVE ID."""

    def get(self, request: HttpRequest, cve_id: str) -> HttpResponse:
        suggestion = get_object_or_404(CVEDerivationClusterProposal, cve__cve_id=cve_id)
        return redirect(
            reverse(
                "webview:suggestion:detail", kwargs={"suggestion_id": suggestion.pk}
            )
        )
