from django.urls import reverse
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.linkage import CVEDerivationClusterProposal


def test_undo_status_change_from_untriaged(
    live_server: LiveServer,
    as_staff: Page,
    cached_suggestion: CVEDerivationClusterProposal,
    no_js: bool,
) -> None:
    """Test undoing a status change from untriaged restores the suggestion to untriaged"""
    if not no_js:
        as_staff.goto(
            live_server.url + reverse("webview:suggestion:untriaged_suggestions")
        )
        suggestion = as_staff.locator(f"#suggestion-{cached_suggestion.pk}")
        accept = suggestion.get_by_role("button", name="Accept")
        accept.click()
        undo = suggestion.get_by_role("button", name="Undo")
        undo.click()
        expect(suggestion).to_be_visible()
        # We check that we are back to untriaged status from the presence of the Accept button
        expect(accept).to_be_visible()
