from django.contrib.messages import get_messages
from django.test import Client
from django.urls import reverse

from shared.models.linkage import CVEDerivationClusterProposal


def test_dismiss_requires_comment_htmx(
    db: None,
    authenticated_client: Client,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """Test that dismissing a suggestion requires a comment (HTMX case)"""
    url = reverse("webview:suggestions_view")

    # Try to dismiss without a comment using HTMX
    response = authenticated_client.post(
        url,
        {
            "suggestion_id": cached_suggestion.pk,
            "new_status": "rejected",
            "comment": "",  # Empty comment
        },
        HTTP_HX_REQUEST="true",  # Simulate HTMX request
    )

    # Should return 200 with error_message in context for HTMX
    assert response.status_code == 200
    assert "error_message" in response.context
    assert response.context["error_message"] == "You must provide a dismissal comment"


def test_dismiss_requires_comment_no_js(
    authenticated_client: Client, cached_suggestion: CVEDerivationClusterProposal
) -> None:
    """Test that dismissing a suggestion requires a comment (no-JS case)"""
    url = reverse("webview:suggestions_view")

    # Try to dismiss without a comment (non-JS behavior)
    response = authenticated_client.post(
        url,
        {
            "suggestion_id": cached_suggestion.pk,
            "new_status": "rejected",
            "comment": "",  # Empty comment
            "no-js": "",  # Indicate non-JS mode
        },
    )

    # Should redirect back to the same page
    assert response.status_code == 302

    # Follow the redirect and check for Django messages
    follow_response = authenticated_client.get(url)
    assert follow_response.status_code == 200

    # Check that the correct error message was added to Django messages
    messages = list(get_messages(follow_response.wsgi_request))
    assert len(messages) == 1
    assert str(messages[0]) == "You must provide a dismissal comment"

    # Verify the suggestion is still in the suggestions view (not dismissed)
    suggestions = follow_response.context["object_list"]
    our_suggestion = next(
        (s for s in suggestions if s.proposal_id == cached_suggestion.pk), None
    )
    assert our_suggestion is not None, "Suggestion should still be in pending status"


def test_dismiss_with_comment_succeeds(
    authenticated_client: Client, cached_suggestion: CVEDerivationClusterProposal
) -> None:
    """Test that dismissing with a comment works and the comment appears in the view context"""

    url = reverse("webview:suggestions_view")
    dismissal_comment = (
        "This suggestion is not relevant because the package is deprecated."
    )

    # Dismiss with a comment
    response = authenticated_client.post(
        url,
        {
            "suggestion_id": cached_suggestion.pk,
            "new_status": "rejected",
            "comment": dismissal_comment,
        },
    )

    # Should succeed
    assert response.status_code == 200

    # Verify the suggestion appears in dismissed view with the comment
    dismissed_response = authenticated_client.get(reverse("webview:dismissed_view"))
    assert dismissed_response.status_code == 200

    # Find the suggestion in the context
    suggestions = dismissed_response.context["object_list"]
    our_suggestion = next(
        (s for s in suggestions if s.proposal_id == cached_suggestion.pk), None
    )
    assert our_suggestion is not None

    # Verify the comment appears in the suggestion context
    suggestion_in_context = dismissed_response.context["object_list"][0].proposal
    assert suggestion_in_context.comment == dismissal_comment


def test_accept_without_comment_succeeds(
    authenticated_client: Client, cached_suggestion: CVEDerivationClusterProposal
) -> None:
    """Test that accepting a suggestion without a comment is allowed"""
    url = reverse("webview:suggestions_view")

    # Accept without a comment
    response = authenticated_client.post(
        url,
        {
            "suggestion_id": cached_suggestion.pk,
            "new_status": "accepted",
            "comment": "",  # Empty comment
        },
    )

    # Should succeed
    assert response.status_code == 200

    # Verify the suggestion appears in drafts view
    drafts_response = authenticated_client.get(reverse("webview:drafts_view"))
    assert drafts_response.status_code == 200

    # Find our suggestion in the context
    suggestions = drafts_response.context["object_list"]
    suggestion = next(
        (s for s in suggestions if s.proposal_id == cached_suggestion.pk), None
    )
    assert suggestion is not None


def test_accept_with_comment_shows_comment_in_context(
    authenticated_client: Client, cached_suggestion: CVEDerivationClusterProposal
) -> None:
    """Test that accepting with a comment shows the comment in the view context"""
    url = reverse("webview:suggestions_view")
    acceptance_comment = "This looks good, creating draft issue."

    # Accept with a comment
    response = authenticated_client.post(
        url,
        {
            "suggestion_id": cached_suggestion.pk,
            "new_status": "accepted",
            "comment": acceptance_comment,
        },
    )

    # Should succeed
    assert response.status_code == 200

    # Verify the suggestion appears in drafts view with the comment
    drafts_response = authenticated_client.get(reverse("webview:drafts_view"))
    assert drafts_response.status_code == 200

    # Find the suggestion in the context and verify the comment
    suggestion = drafts_response.context["object_list"][0].proposal
    assert suggestion.comment == acceptance_comment


def test_updating_comment_on_existing_suggestion(
    authenticated_client: Client, cached_suggestion: CVEDerivationClusterProposal
) -> None:
    """Test that updating a comment on an existing suggestion works"""
    # First accept with initial comment
    initial_comment = "Initial comment"
    url = reverse("webview:suggestions_view")

    authenticated_client.post(
        url,
        {
            "suggestion_id": cached_suggestion.pk,
            "new_status": "accepted",
            "comment": initial_comment,
        },
    )

    # Now update just the comment (no status change)
    updated_comment = "Updated comment with more details"
    drafts_url = reverse("webview:drafts_view")

    response = authenticated_client.post(
        drafts_url,
        {
            "suggestion_id": cached_suggestion.pk,
            "comment": updated_comment,
            # No new_status means just updating comment
        },
    )

    # Should succeed
    assert response.status_code == 200

    # Verify the updated comment appears in the context
    drafts_response = authenticated_client.get(drafts_url)
    assert drafts_response.status_code == 200

    suggestion = drafts_response.context["object_list"][0].proposal
    assert suggestion.comment == updated_comment
