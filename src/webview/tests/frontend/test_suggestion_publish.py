import re
from collections.abc import Callable

import pytest
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer
from pytest_mock import MockerFixture

from shared.models.linkage import CVEDerivationClusterProposal

from .routes import SUGGESTION_DETAIL, SUGGESTION_LIST


@pytest.mark.django_db
def test_publish_button_only_visible_when_accepted(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    actions = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")
    expect(actions.get_by_role("button", name="Publish")).to_be_hidden()


@pytest.mark.django_db
def test_publish_button_hidden_once_bundled(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED, in_issue_draft=True
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    actions = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")

    expect(actions.get_by_role("button", name="Unbundle")).to_be_visible()
    expect(actions.get_by_role("button", name="Publish")).to_be_hidden()


@pytest.mark.django_db
def test_publish_creates_issue_and_shows_success_toast_with_links(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    mocker: MockerFixture,
) -> None:
    """Clicking "Publish" creates a GitHub issue and shows a success toast linking to both the tracker issue and the GitHub issue."""
    mock_issue = mocker.Mock()
    mock_issue.html_url = "https://github.com/NixOS/nixpkgs/issues/1234"
    mocker.patch("shared.github.create_gh_issue", return_value=mock_issue)

    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    actions = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")

    actions.get_by_role("button", name="Publish").click()

    expect(as_committer.get_by_text("Issue published")).to_be_visible()
    expect(as_committer.get_by_role("link", name="GitHub issue")).to_have_attribute(
        "href", mock_issue.html_url
    )

    # The success toast uses the theme's light green, the counterpart to error toasts.
    toast = as_committer.get_by_text("Issue published").locator("..")
    expect(toast).to_have_class(re.compile(r"\bbg-green-light\b"))

    tracker_link = as_committer.get_by_role("link", name="Issue detail on the tracker")
    expect(tracker_link).to_be_visible()

    # The suggestion is now published: no more status actions.
    expect(actions).to_be_hidden()


@pytest.mark.django_db
def test_publish_keeps_suggestion_in_place_dimmed_instead_of_disappearing(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    mocker: MockerFixture,
) -> None:
    """Publishing a suggestion from a list filtered to "accepted" keeps the card visible (dimmed, since it no longer matches the filter) instead of making it disappear."""
    mock_issue = mocker.Mock()
    mock_issue.html_url = "https://github.com/NixOS/nixpkgs/issues/1234"
    mocker.patch("shared.github.create_gh_issue", return_value=mock_issue)

    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    as_committer.goto(live_server.url + SUGGESTION_LIST + "?status=accepted")
    card = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}")
    expect(card).to_be_visible()

    actions = card.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")
    actions.get_by_role("button", name="Publish").click()

    expect(as_committer.get_by_text("Issue published")).to_be_visible()
    # Once published, the suggestion no longer matches the "accepted" filter, so
    # `SuggestionList` forces it to the collapsed view (a distinct data-testid)
    dimmed_card = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-collapsed")
    expect(dimmed_card).to_be_visible()
    expect(dimmed_card).to_have_class(re.compile(r"\bborder-dashed\b"))


@pytest.mark.django_db
def test_publish_shows_error_toast_on_backend_mismatch(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """If the suggestion is no longer accepted by the time Publish is clicked (e.g. a concurrent change), the backend rejects the request and an error toast is shown."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    as_committer.goto(live_server.url + SUGGESTION_LIST)
    card = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}")
    actions = card.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")
    expect(actions.get_by_role("button", name="Publish")).to_be_visible()

    # Simulate a UI/backend mismatch.
    suggestion.change_status(
        status=CVEDerivationClusterProposal.Status.REJECTED,
        rejection_reason=CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS,
    )

    actions.get_by_role("button", name="Publish").click()

    expect(as_committer.get_by_text("Failed to publish issue")).to_be_visible()
    # No optimistic update happens for publish, so the button remains as-is.
    expect(actions.get_by_role("button", name="Publish")).to_be_visible()
