from abc import ABC
from typing import Any

from django.core.paginator import Paginator
from django.db.models import Q
from django.db.models.query import QuerySet
from django.http import Http404
from django.views.generic import ListView

from shared.auth import user_can_edit_suggestion
from shared.logs.fetchers import fetch_suggestion_events
from shared.models.linkage import (
    CVEDerivationClusterProposal,
)

from .base import get_suggestion_context


class SuggestionListView(ListView, ABC):
    """Base list view for suggestions filtered by a specific status."""

    template_name = "suggestions/suggestion_list.html"
    paginate_by = 10
    status_filter: CVEDerivationClusterProposal.Status | None = None
    package_filter: str | None = None  # To be defined in concrete classes

    @property
    def is_compact(self) -> bool:
        """Whether to show compact suggestions in the list"""
        compact_param = self.request.GET.get("compact")
        if compact_param is not None:
            return compact_param.lower() not in ("false", "0", "no", "off")
        else:
            return False

    def get_queryset(self) -> QuerySet[CVEDerivationClusterProposal]:
        self.package_filter = self.kwargs.get("package_name")
        if self.status_filter is None:
            status_param = self.request.GET.get("status")
            try:
                self.status_filter = (
                    CVEDerivationClusterProposal.Status(status_param)
                    if status_param
                    else None
                )
            except ValueError:
                raise Http404
        query_filters = Q()
        if self.status_filter is not None:
            query_filters &= Q(status=self.status_filter)
        if self.package_filter is not None:
            query_filters &= Q(cached__payload__packages__has_key=self.package_filter)
        return (
            CVEDerivationClusterProposal.objects.select_related(
                "cached",
            )
            .prefetch_related("cve__container__references__tags")
            .filter(query_filters)
            .order_by("-updated_at", "-created_at")
        )

    def get_context_data(self, **kwargs: Any) -> dict[str, Any]:
        """Get paginated suggestions for the specific status."""
        context = super().get_context_data(**kwargs)

        suggestions = self.object_list

        # Pagination first
        paginator = Paginator(suggestions, self.paginate_by)
        page_number = self.request.GET.get("page", 1)
        page_obj = paginator.get_page(page_number)

        # Convert suggestions to SuggestionContext objects for the current page
        suggestion_contexts = []
        user_can_edit = user_can_edit_suggestion(self.request.user)
        is_compact = self.is_compact
        suggestion_ids = [s.pk for s in page_obj.object_list]
        events_by_suggestion = fetch_suggestion_events(suggestion_ids)
        for suggestion in page_obj.object_list:
            suggestion_context = get_suggestion_context(
                suggestion,
                user_can_edit=user_can_edit,
                is_compact=is_compact,
                pre_fetched_events=events_by_suggestion[suggestion.pk],
            )
            suggestion_context.show_status = (
                self.status_filter
                is None  # We don't show status in lists already filtered by status
            )
            suggestion_contexts.append(suggestion_context)

        context.update(
            {
                "suggestions": suggestion_contexts,
                "page_obj": page_obj,
                "status_filter": self.status_filter,
                "package_filter": self.package_filter,
                "is_compact": self.is_compact,
                "adjusted_elided_page_range": paginator.get_elided_page_range(
                    page_obj.number
                ),
                "result_count": suggestions.count(),
                "is_paginated": True,
            }
        )

        return context
