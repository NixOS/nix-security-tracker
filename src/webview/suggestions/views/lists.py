from abc import ABC
from typing import Any

from django.core.paginator import Paginator
from django.db.models import Q
from django.http import Http404

from shared.models.linkage import (
    CVEDerivationClusterProposal,
)

from .base import SuggestionBaseView, get_suggestion_context


class SuggestionListView(SuggestionBaseView, ABC):
    """Base list view for suggestions filtered by a specific status."""

    template_name = "suggestions/suggestion_list.html"
    paginate_by = 10
    status_filter = None  # To be defined in concrete classes
    package_filter: str | None = None  # To be defined in concrete classes

    def get_context_data(self, **kwargs: Any) -> dict[str, Any]:
        """Get paginated suggestions for the specific status."""
        context = super().get_context_data(**kwargs)

        # Get suggestions with the specific status
        query_filters = Q()
        if self.status_filter is not None:
            query_filters &= Q(status=self.status_filter)
        if self.package_filter is not None:
            query_filters &= Q(cached__payload__packages__has_key=self.package_filter)
        suggestions = CVEDerivationClusterProposal.objects.filter(
            query_filters
        ).order_by("-updated_at", "-created_at")

        # Pagination first
        paginator = Paginator(suggestions, self.paginate_by)
        page_number = self.request.GET.get("page", 1)
        page_obj = paginator.get_page(page_number)

        # Convert suggestions to SuggestionContext objects for the current page
        suggestion_contexts = []
        # FIXME(@fricklerhandwerk): This is very slow, it should batch all related queries.
        for suggestion in page_obj.object_list:
            suggestion_context = get_suggestion_context(suggestion)
            suggestion_context.show_status = (
                self.status_filter
                is None  # We don't show status in lists already filtered by status
            )
            suggestion_contexts.append(suggestion_context)

        context.update(
            {
                "suggestion_contexts": suggestion_contexts,
                "page_obj": page_obj,
                "status_filter": self.status_filter,
                "package_filter": self.package_filter,
                "adjusted_elided_page_range": paginator.get_elided_page_range(),
                "is_paginated": True,
            }
        )

        return context


class UntriagedSuggestionsView(SuggestionListView):
    status_filter = CVEDerivationClusterProposal.Status.PENDING


class AcceptedSuggestionsView(SuggestionListView):
    status_filter = CVEDerivationClusterProposal.Status.ACCEPTED


class RejectedSuggestionsView(SuggestionListView):
    status_filter = CVEDerivationClusterProposal.Status.REJECTED


class PublishedSuggestionsView(SuggestionListView):
    status_filter = CVEDerivationClusterProposal.Status.PUBLISHED


class SuggestionsByPackageView(SuggestionListView):
    def get_context_data(self, **kwargs: Any) -> dict[str, Any]:
        self.package_filter = self.kwargs.get("package_name")
        status_param = self.request.GET.get("status")
        try:
            self.status_filter = (
                CVEDerivationClusterProposal.Status(status_param)
                if status_param
                else None
            )
        except ValueError:
            raise Http404
        return super().get_context_data(**kwargs)
