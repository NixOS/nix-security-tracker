from django.db import transaction
from django.http import HttpRequest, HttpResponse, HttpResponseForbidden
from django.urls import reverse

from shared.auth import can_publish_github_issue
from shared.github import create_gh_issue
from shared.models import (
    NixpkgsIssue,
)
from shared.models.issue import EventType, NixpkgsEvent
from shared.models.linkage import (
    CVEDerivationClusterProposal,
)
from webview.suggestions.context.types import SuggestionStubContext

from .base import (
    SuggestionBaseView,
    fetch_activity_log,
    fetch_suggestion,
    get_suggestion_context,
)


class UpdateSuggestionStatusView(SuggestionBaseView):
    """Handle suggestion status changes (accept/reject/publish)."""

    http_method_names = ["post"]

    template_name = "suggestions/components/suggestion.html"

    def post(self, request: HttpRequest, suggestion_id: int) -> HttpResponse:
        """Handle status change requests."""
        if not request.user or not can_publish_github_issue(request.user):
            return HttpResponseForbidden()

        # Get suggestion context
        suggestion = fetch_suggestion(suggestion_id)
        suggestion_context = get_suggestion_context(suggestion)

        # Get form data
        new_status = request.POST.get("new_status")
        new_comment = request.POST.get("comment", "").strip()
        undo_status_change = request.POST.get(
            "undo_status_change"
        )  # This is set if the status change comes from clicking "Undo"

        # Validate status change
        if not new_status:
            return self._handle_error(request, suggestion_context, "Missing new status")

        if new_status == suggestion.status:
            return self._handle_error(
                request, suggestion_context, "Cannot change to same status"
            )

        # Handle status changes (except publish which needs special handling)
        github_issue_link = None  # Will be used if we publish
        undo_status_target = (
            suggestion.status
        )  # We keep track of the previous status to provide an undo action
        if new_status == "rejected":
            # When undoing a status change, there is no comment form input so we don't expect it
            if not new_comment and not undo_status_change:
                return self._handle_error(
                    request, suggestion_context, "You must provide a dismissal comment"
                )
            suggestion.status = CVEDerivationClusterProposal.Status.REJECTED
        else:
            if new_status == "accepted":
                suggestion.status = CVEDerivationClusterProposal.Status.ACCEPTED
            elif new_status == "published":
                try:
                    with transaction.atomic():
                        tracker_issue = NixpkgsIssue.create_nixpkgs_issue(suggestion)
                        tracker_issue_link = request.build_absolute_uri(
                            reverse("webview:issue_detail", args=[tracker_issue.code])
                        )
                        github_issue_link = create_gh_issue(
                            suggestion_context.suggestion.cached,
                            tracker_issue_link,
                            new_comment,
                        ).html_url
                        NixpkgsEvent.objects.create(
                            issue=tracker_issue,
                            event_type=EventType.ISSUE | EventType.OPENED,
                            url=github_issue_link,
                        )
                        suggestion.status = (
                            CVEDerivationClusterProposal.Status.PUBLISHED
                        )
                        suggestion.save()
                        undo_status_target = None  # We disable the undo button in case we have published. There is no turning back.
                except Exception:
                    return self._handle_error(
                        request, suggestion_context, "Unable to publish this suggestion"
                    )

        # Update comment if provided, unless this is an "undo" status change in which no new comment is expected
        if new_comment and not undo_status_change:
            suggestion.comment = new_comment

        suggestion.save()

        # Refresh activity_log
        suggestion_context.activity_log = fetch_activity_log(suggestion.pk)

        # Refresh packages and maintainers edit status
        suggestion_context.package_list_context.editable = suggestion.is_editable

        maintainers = suggestion_context.maintainer_list_context
        maintainers.editable = suggestion.is_editable
        for maintainer_context in (
            maintainers.active + maintainers.ignored + maintainers.additional
        ):
            maintainer_context.editable = suggestion.is_editable

        if self._is_origin_url_a_list(request):
            # We don't display the status in lists (they are "by status" lists already)
            suggestion_context.show_status = False
            if not undo_status_change:
                # If we come from a suggestion list, we don't update the component in
                # place because the list would mix suggestions of different statuses.
                # Instead, we show only a stub of the suggestion.
                #
                # However, if the status change is an "undo", then we want to show the
                # full suggestion again.
                suggestion_context.suggestion_stub_context = SuggestionStubContext(
                    suggestion,
                    issue_link=github_issue_link,
                    undo_status_target=undo_status_target,
                )
        elif new_status == "published":
            # NOTE(@florentc): This treats the case where we are in detail view
            # for a suggestion and we publish it. In that case, with htmx, we
            # don't want to replace the component in place because what we want
            # to display from now on in a issue, not a suggestion. We therefore
            # trigger a reload of the page on the client side, which will it
            # turn redirect to the issue detail page.
            # This is weird pattern break until we figure out what we want
            # exactly regarding suggestion lifecycle on one side, and issue
            # lifecycle on the other
            if request.headers.get("HX-Request"):
                # For HTMX requests, use HX-Redirect header to trigger client-side redirect
                response = HttpResponse()
                response["HX-Redirect"] = self._get_origin_url(request) or reverse(
                    "webview:issue_list"
                )
                return response

        if request.headers.get("HX-Request"):
            return self.render_to_response({"data": suggestion_context})
        else:
            return self._redirect_to_origin(request)
