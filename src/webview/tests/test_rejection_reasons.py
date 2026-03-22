from collections.abc import Callable

from django.contrib.auth.models import User
from django.urls import reverse
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.linkage import CVEDerivationClusterProposal


def test_dismiss_as_not_in_nixpkgs(
    live_server: LiveServer,
    staff: User,
    as_staff: Page,
    cached_suggestion: CVEDerivationClusterProposal,
    no_js: bool,
) -> None:
    """Test that dismissing without a comment works when setting the reason to
    'not in nixpkgs', and that the reason is displayed in the suggestion and
    activity log."""

    suggestion = as_staff.locator(f"#suggestion-{cached_suggestion.pk}")
    suggestion_status = as_staff.locator(f"#suggestion-{cached_suggestion.pk}-status")
    suggestion_activity_log = as_staff.locator(
        f"#suggestion-activity-log-{cached_suggestion.pk}"
    )
    reason = CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS
    reason_label = (
        CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS.label.__str__()
    )

    as_staff.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))
    suggestion.locator("select[name='rejection_reason']").select_option(reason)
    suggestion.get_by_role("button", name="Dismiss").click()
    if no_js:
        as_staff.goto(
            live_server.url + reverse("webview:suggestion:dismissed_suggestions")
        )
    else:
        link = as_staff.get_by_role("link", name="View")
        link.click()
    # Test that dismissal happened without commenting first
    expect(suggestion).to_be_visible()
    # Test the dismissal reason is displayed
    expect(suggestion_status.get_by_text(reason_label)).to_be_visible()
    # Test there is an associated activity log entry
    suggestion_activity_log.click()
    entry = (
        suggestion_activity_log.filter(has_text=staff.username)
        .filter(has_text="dismissed")
        .filter(has_text=reason_label)
    )
    expect(entry).to_be_visible()


def test_undo_preserves_rejection_reason(
    live_server: LiveServer,
    as_staff: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    no_js: bool,
) -> None:
    """Test that the rejection reason is preserved when undoing a status change from "dismissed" """
    if not no_js:
        reason = CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS
        reason_label = (
            CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS.label.__str__()
        )
        cached_suggestion = make_cached_suggestion(
            status=CVEDerivationClusterProposal.Status.REJECTED, rejection_reason=reason
        )
        as_staff.goto(
            live_server.url + reverse("webview:suggestion:dismissed_suggestions")
        )
        suggestion = as_staff.locator(f"#suggestion-{cached_suggestion.pk}")
        suggestion_status = as_staff.locator(
            f"#suggestion-{cached_suggestion.pk}-status"
        )
        # Verify that the dismissal reason is visible initially
        expect(suggestion_status.get_by_text(reason_label)).to_be_visible()
        # Accept the suggestion
        suggestion.get_by_role("button", name="Accept").click()
        # Undo the action
        suggestion.get_by_role("button", name="Undo").click()
        # Verify that the dismissal reason is still visible
        expect(suggestion_status.get_by_text(reason_label)).to_be_visible()
