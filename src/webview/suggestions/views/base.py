from abc import ABC
from urllib.parse import urlparse

from django.contrib import messages
from django.http import HttpRequest, HttpResponse, HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect
from django.urls import resolve
from django.views.generic import TemplateView

from shared.auth import user_can_edit_suggestion
from shared.logs.events import RawEventType
from shared.logs.fetchers import fetch_suggestion_events
from shared.models.linkage import (
    CVEDerivationClusterProposal,
)
from webview.suggestions.context.types import SuggestionContext


def fetch_suggestion(suggestion_id: int) -> CVEDerivationClusterProposal:
    return get_object_or_404(CVEDerivationClusterProposal, id=suggestion_id)


def get_suggestion_context(
    suggestion: CVEDerivationClusterProposal,
    user_can_edit: bool,
    pre_fetched_events: list[RawEventType],
    is_compact: bool = False,
) -> SuggestionContext:
    return SuggestionContext(
        suggestion=suggestion,
        user_can_edit=user_can_edit,
        pre_fetched_events=pre_fetched_events,
        is_compact=is_compact,
    )


class SuggestionBaseView(TemplateView, ABC):
    """Base view for all suggestion-related views with common functionality."""

    def _handle_error(
        self,
        request: HttpRequest,
        suggestion_context: SuggestionContext,
        error_message: str,
    ) -> HttpResponse:
        """Handle error responses for both HTMX and standard requests."""
        suggestion_context.error_message = error_message
        if request.headers.get("HX-Request"):
            return self.render_to_response({"data": suggestion_context})
        else:
            # Without javascript, we use Django messages for the errors
            messages.error(request, error_message)
            return self._redirect_to_origin(request)

    def _redirect_to_origin(self, request: HttpRequest) -> HttpResponse:
        """Redirect to the origin URL or fallback to suggestions list."""
        # Get the current URL from HTMX header or referer
        current_url = self._get_origin_url(request)
        if not current_url:
            # Fallback to suggestions list if no origin provided
            return redirect("webview:suggestion:untriaged_suggestions")
        return redirect(current_url)

    def _get_origin_url(self, request: HttpRequest) -> str | None:
        """Get the origin URL from HTMX headers or HTTP referer."""
        current_url = request.headers.get("HX-Current-URL")
        if not current_url:
            current_url = request.META.get("HTTP_REFERER", "")
        return current_url

    def _is_origin_url_a_list(self, request: HttpRequest) -> bool:
        """Checks whether we come from one of the suggestion list views. Returns false when in doubt."""
        origin_url = self._get_origin_url(request)
        if not origin_url:
            return False

        # Extract path from URL
        try:
            # Resolve the URL to get view name
            parsed = urlparse(origin_url)
            resolved = resolve(parsed.path)

            # Check if it's one of our list views
            list_url_names = [
                "untriaged_suggestions",
                "accepted_suggestions",
                "dismissed_suggestions",
                "issue_list",
            ]

            return resolved.url_name in list_url_names
        except Exception:
            return False


class SuggestionContentEditBaseView(SuggestionBaseView, ABC):
    """Base view for package and maintainers operations."""

    http_method_names = ["post"]

    template_name = "suggestions/components/suggestion.html"

    class ForbiddenOperationError(Exception):
        """Raised when access is denied for content editing."""

        def __init__(self, response: HttpResponse) -> None:
            self.response = response

    # FIXME(@fricklerhandwerk): This conflates access control with database queries and bypasses the standard Django mechanism of overriding the respective view methods.
    # The main problem here is that it results in very inefficient queries, as we can't express fetching related data in one go.
    # A minor problem for now is obscured and coarse-grained access control, but there's no user story at the moment for which it's in the way.
    def _check_access_rights_and_get_suggestion(
        self,
        request: HttpRequest,
        suggestion_id: int,
        is_compact: bool = False,
    ) -> tuple[CVEDerivationClusterProposal, SuggestionContext]:
        user_can_edit = user_can_edit_suggestion(self.request.user)

        if not request.user or not user_can_edit:
            raise self.ForbiddenOperationError(HttpResponseForbidden())

        # Get suggestion context
        suggestion = fetch_suggestion(suggestion_id)
        events = fetch_suggestion_events([suggestion.pk])
        suggestion_context = get_suggestion_context(
            suggestion,
            user_can_edit=user_can_edit,
            pre_fetched_events=events[suggestion.pk],
            is_compact=is_compact,
        )

        # Validate that the suggestion status allows package editing
        if suggestion.is_frozen:
            raise self.ForbiddenOperationError(
                self._handle_error(
                    request,
                    suggestion_context,
                    "Content editing is not allowed for this suggestion status",
                )
            )

        return (suggestion, suggestion_context)
