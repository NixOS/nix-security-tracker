from collections.abc import Callable

from django.contrib.auth.models import User
from django.test import Client
from django.urls import reverse
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.issue import NixpkgsIssue
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


def test_cannot_transition_from_published(
    client: Client,
    staff: User,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    no_js: bool,
) -> None:
    """
    Published suggestions must not change to any other status.

    We're testing the HTTP API directly here, since this is the level at which the error can happen.
    In practice this may occur by having two different tabs viewing the same suggestion:
    1. Accepts the suggestion and publishes the issue
    2. Doesn't update the state, accepts it again.
    """
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PUBLISHED,
    )
    NixpkgsIssue.create_nixpkgs_issue(suggestion)

    client.force_login(staff)
    url = reverse("webview:suggestion:update_status", args=[suggestion.pk])
    headers = {} if no_js else {"HTTP_HX_REQUEST": "true"}

    for new_status in CVEDerivationClusterProposal.Status:
        client.post(
            url,
            data={"new_status": new_status},
            **headers,  # type: ignore
        )
        suggestion.refresh_from_db()
        assert suggestion.status == CVEDerivationClusterProposal.Status.PUBLISHED, (
            f"Transition to {new_status!r} should have been blocked"
        )
