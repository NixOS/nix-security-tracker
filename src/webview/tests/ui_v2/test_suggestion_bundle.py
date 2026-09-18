import re
from collections.abc import Callable

import pytest
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.linkage import CVEDerivationClusterProposal

from .routes import SUGGESTION_DETAIL, SUGGESTION_LIST

# Playwright's name= matching is a substring search, so "Bundle" would also match "Unbundle".
# This avoids the issue.
BUNDLE_BTN = re.compile(r"\bBundle\b")
UNBUNDLE_BTN = re.compile(r"\bUnbundle\b")


@pytest.mark.django_db
def test_bundle_button_only_visible_when_accepted(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    actions = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")
    expect(actions.get_by_role("button", name=BUNDLE_BTN)).to_be_hidden()


@pytest.mark.django_db
def test_bundle_and_unbundle_toggle(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Clicking "Bundle" adds the suggestion to the issue draft and flips the button to "Unbundle"; clicking it again removes the suggestion from the draft."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    actions = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")

    actions.get_by_role("button", name=BUNDLE_BTN).click()
    unbundle_button = actions.get_by_role("button", name=UNBUNDLE_BTN)
    expect(unbundle_button).to_be_visible()
    expect(actions.get_by_role("button", name=BUNDLE_BTN)).to_have_count(0)
    # Wait for the mutation to settle (button re-enables) before continuing.
    expect(unbundle_button).to_be_enabled()

    actions.get_by_role("button", name=UNBUNDLE_BTN).click()
    bundle_button = actions.get_by_role("button", name=BUNDLE_BTN)
    expect(bundle_button).to_be_visible()
    expect(actions.get_by_role("button", name=UNBUNDLE_BTN)).to_have_count(0)
    expect(bundle_button).to_be_enabled()


@pytest.mark.django_db
def test_bundle_from_list_updates_the_list_card_and_draft_filter(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Bundling a suggestion from the list page updates its card, and it then shows up when filtering the list down to the issue draft."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    as_committer.goto(live_server.url + SUGGESTION_LIST)
    card = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}")
    actions = card.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")

    actions.get_by_role("button", name=BUNDLE_BTN).click()
    unbundle_button = actions.get_by_role("button", name=UNBUNDLE_BTN)
    expect(unbundle_button).to_be_visible()
    expect(unbundle_button).to_be_enabled()

    filters = as_committer.get_by_test_id("suggestion-filters")
    filters.get_by_role("button", name="Issue draft").click()
    expect(as_committer.get_by_test_id(f"suggestion-{suggestion.pk}")).to_be_visible()


@pytest.mark.django_db
def test_bundle_shows_up_in_previously_cached_empty_draft_filter_without_reload(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """If the "Issue draft" filter was already visited (and cached empty) before bundling a suggestion, switching back to it afterwards must show the newly bundled suggestion without requiring a page reload."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )

    # Visit the (still empty) issue draft filter first, so its result gets cached.
    as_committer.goto(live_server.url + SUGGESTION_LIST + "?in_issue_draft=true")
    expect(as_committer.get_by_text("No suggestions found.")).to_be_visible()

    # Navigate to the unfiltered list (client-side, no reload) and bundle the suggestion.
    filters = as_committer.get_by_test_id("suggestion-filters")
    filters.get_by_role("button", name="Issue draft").click()
    card = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}")
    actions = card.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")
    bundle_button = actions.get_by_role("button", name=BUNDLE_BTN)
    bundle_button.click()
    expect(actions.get_by_role("button", name=UNBUNDLE_BTN)).to_be_enabled()

    # Switch back to the "Issue draft" filter (client-side, no reload): the previously
    # empty cached result for this exact filter must not be reused as-is.
    filters.get_by_role("button", name="Issue draft").click()
    expect(as_committer.get_by_test_id(f"suggestion-{suggestion.pk}")).to_be_visible()
    expect(as_committer.get_by_text("No suggestions found.")).to_have_count(0)


@pytest.mark.django_db
def test_bundle_shows_error_toast_on_backend_mismatch(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """If the suggestion is no longer accepted by the time Bundle is clicked, the backend rejects the request and an error toast is shown."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    actions = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")
    expect(actions.get_by_role("button", name=BUNDLE_BTN)).to_be_visible()

    # Simulate a UI/backend mismatch.
    suggestion.change_status(
        status=CVEDerivationClusterProposal.Status.REJECTED,
        rejection_reason=CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS,
    )

    actions.get_by_role("button", name=BUNDLE_BTN).click()

    expect(as_committer.get_by_text("Failed to bundle suggestion")).to_be_visible()
    # The optimistic update should have been rolled back: still shows "Bundle", not "Unbundle".
    expect(actions.get_by_role("button", name=BUNDLE_BTN)).to_be_visible()
    expect(actions.get_by_role("button", name=UNBUNDLE_BTN)).to_have_count(0)
