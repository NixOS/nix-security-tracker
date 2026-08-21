from collections.abc import Callable

import pytest
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.issue import NixpkgsIssue
from shared.models.linkage import CVEDerivationClusterProposal

from .routes import ISSUE_DETAIL, SUGGESTION_DETAIL, SUGGESTION_LIST


@pytest.mark.django_db
def test_status_actions_hidden_for_anonymous(
    live_server: LiveServer,
    page: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Anonymous users can see the status but not Accept/Dismiss actions."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    expect(page.get_by_text("Untriaged")).to_be_visible()
    actions = page.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")
    expect(actions).to_be_hidden()


@pytest.mark.django_db
def test_accept_and_dismiss_visible_for_committer_when_pending(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Committers see both Accept and Dismiss for a pending suggestion."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    actions = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")
    expect(actions.get_by_role("button", name="Accept")).to_be_visible()
    expect(actions.get_by_role("button", name="Dismiss")).to_be_visible()


@pytest.mark.django_db
def test_only_accept_visible_when_rejected(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """A rejected suggestion can only be accepted, not dismissed again."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.REJECTED,
        rejection_reason=CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS,
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    actions = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")
    expect(actions.get_by_role("button", name="Accept")).to_be_visible()
    expect(actions.get_by_role("button", name="Dismiss")).to_be_hidden()


@pytest.mark.django_db
def test_only_dismiss_visible_when_accepted(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """An accepted suggestion can be dismissed but not "accepted" again."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    actions = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")
    expect(actions.get_by_role("button", name="Accept")).to_be_hidden()
    expect(actions.get_by_role("button", name="Dismiss")).to_be_visible()


@pytest.mark.django_db
def test_no_status_actions_when_published(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """A published suggestion is frozen: no status actions are shown."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PUBLISHED
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    actions = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")
    expect(actions).to_be_hidden()


@pytest.mark.django_db
def test_published_status_links_to_issue(
    live_server: LiveServer,
    page: Page,
    make_issue: Callable[..., NixpkgsIssue],
) -> None:
    """A published suggestion's status shows an "Issue" link to its issue detail page."""
    issue = make_issue()
    suggestion = issue.suggestions.get()
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")

    expect(page.get_by_text("Published")).to_be_visible()
    link = page.get_by_role("link", name="Issue")
    expect(link).to_be_visible()
    expect(link).to_have_attribute("href", ISSUE_DETAIL + f"/{issue.code}")


@pytest.mark.django_db
def test_accept_transitions_status_and_logs_activity(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Clicking Accept transitions the suggestion to accepted and records an
    activity log entry."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    actions = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")

    actions.get_by_role("button", name="Accept").click()

    expect(as_committer.get_by_text("Accepted")).to_be_visible()
    expect(actions.get_by_role("button", name="Accept")).to_be_hidden()
    expect(actions.get_by_role("button", name="Dismiss")).to_be_visible()

    activity_log = as_committer.get_by_test_id(
        f"suggestion-{suggestion.pk}-activity-log"
    )
    activity_log.locator("summary").click()
    expect(activity_log.get_by_text("accepted", exact=False)).to_be_visible()


@pytest.mark.django_db
def test_dismiss_not_in_nixpkgs_transitions_and_shows_reason(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Dismissing with "Not in nixpkgs" transitions to rejected and shows the reason."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    actions = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")

    actions.get_by_role("button", name="Dismiss").click()
    as_committer.get_by_role("menuitem", name="Not in nixpkgs").click()

    expect(as_committer.get_by_text("Dismissed")).to_be_visible()
    expect(as_committer.get_by_text("not in Nixpkgs")).to_be_visible()


@pytest.mark.django_db
def test_dismiss_with_comment_disabled_without_existing_comment(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """The "With comment" dismiss option is disabled when there is no comment yet,
    since the backend requires either a rejection reason or a comment."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    actions = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")

    actions.get_by_role("button", name="Dismiss").click()

    expect(as_committer.get_by_role("menuitem", name="With comment")).to_have_attribute(
        "data-disabled", ""
    )


@pytest.mark.django_db
def test_dismiss_with_comment_works_once_comment_is_set(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Once a comment is saved, "With comment" becomes usable and dismisses
    without requiring a rejection reason."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")

    textarea = as_committer.locator("textarea")
    textarea.fill("dismissal note")
    expect(textarea).to_have_attribute("data-save-state", "saved")

    actions = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")
    actions.get_by_role("button", name="Dismiss").click()
    as_committer.get_by_role("menuitem", name="With comment").click()

    expect(as_committer.get_by_text("Dismissed")).to_be_visible()


@pytest.mark.django_db
def test_accept_shows_error_toast_on_backend_mismatch(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    actions = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")
    expect(actions.get_by_role("button", name="Accept")).to_be_visible()

    # Simulate a UI/backend mismatch
    suggestion.change_status(status=CVEDerivationClusterProposal.Status.ACCEPTED)

    actions.get_by_role("button", name="Accept").click()

    expect(as_committer.get_by_text("Failed to change status")).to_be_visible()
    # The optimistic update should have been rolled back to "pending"
    expect(as_committer.get_by_text("Untriaged")).to_be_visible()


@pytest.mark.django_db
def test_accept_from_list_updates_the_list_card(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Accepting a suggestion from the list page updates its card in the list, not just its activity log."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_LIST)
    card = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}")
    actions = card.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")

    actions.get_by_role("button", name="Accept").click()

    expect(card.get_by_text("Accepted")).to_be_visible()
    expect(actions.get_by_role("button", name="Accept")).to_be_hidden()
    expect(actions.get_by_role("button", name="Dismiss")).to_be_visible()


@pytest.mark.django_db
def test_dismiss_with_comment_enabled_after_typing_comment_from_list(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Writing a comment on a suggestion from the list page enables the "With comment" dismiss option."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_LIST)
    card = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}")

    textarea = card.locator("textarea")
    textarea.fill("dismissal note")
    expect(textarea).to_have_attribute("data-save-state", "saved")

    actions = card.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")
    actions.get_by_role("button", name="Dismiss").click()
    expect(
        as_committer.get_by_role("menuitem", name="With comment")
    ).not_to_have_attribute("data-disabled", "")
