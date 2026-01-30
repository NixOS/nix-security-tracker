from typing import Any

from django.http import HttpRequest, HttpResponse
from django.shortcuts import redirect
from django.urls import reverse
from django.views.generic import DetailView

from shared.models.issue import NixpkgsIssue
from shared.models.linkage import (
    CVEDerivationClusterProposal,
)

from .base import SuggestionBaseView, get_suggestion_context


class SuggestionDetailView(DetailView, SuggestionBaseView):
    """Individual suggestion detail page."""

    model = CVEDerivationClusterProposal
    template_name = "suggestions/suggestion_detail.html"
    pk_url_kwarg = "suggestion_id"

    def get_context_data(self, **kwargs: Any) -> dict[str, Any]:
        context = super().get_context_data(**kwargs)
        context.update({"suggestion_context": get_suggestion_context(self.object)})  # type: ignore
        return context

    def get(self, request: HttpRequest, suggestion_id: int) -> HttpResponse:
        self.object = self.get_object()
        if self.object.status == CVEDerivationClusterProposal.Status.PUBLISHED:
            issue = NixpkgsIssue.objects.get(suggestion=self.object)
            return redirect(
                reverse("webview:issue_detail", kwargs={"code": issue.code})
            )
        return super().get(request, suggestion_id)
