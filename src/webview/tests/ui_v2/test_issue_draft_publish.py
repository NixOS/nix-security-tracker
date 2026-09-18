from collections.abc import Callable

import pytest
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer
from pytest_mock import MockerFixture

from shared.models.linkage import CVEDerivationClusterProposal

from .routes import SUGGESTION_LIST


@pytest.mark.django_db
def test_panel_hidden_when_issue_draft_not_the_only_filter(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED, in_issue_draft=True
    )

    # No filter active at all.
    as_committer.goto(live_server.url + SUGGESTION_LIST)
    expect(as_committer.get_by_test_id("issue-draft-panel")).to_be_hidden()

    # "Issue draft" combined with a status filter (additive/shift-click selection).
    as_committer.goto(
        live_server.url + SUGGESTION_LIST + "?status=accepted&in_issue_draft=true"
    )
    expect(as_committer.get_by_test_id("issue-draft-panel")).to_be_hidden()

    # A status filter alone, no "Issue draft".
    as_committer.goto(live_server.url + SUGGESTION_LIST + "?status=accepted")
    expect(as_committer.get_by_test_id("issue-draft-panel")).to_be_hidden()

    # "Issue draft" combined with a package filter.
    as_committer.goto(
        live_server.url + SUGGESTION_LIST + "?in_issue_draft=true&package=hello"
    )
    expect(as_committer.get_by_test_id("issue-draft-panel")).to_be_hidden()


@pytest.mark.django_db
def test_panel_hidden_when_draft_is_empty(
    live_server: LiveServer,
    as_committer: Page,
) -> None:
    as_committer.goto(live_server.url + SUGGESTION_LIST + "?in_issue_draft=true")
    expect(as_committer.get_by_test_id("issue-draft-panel")).to_be_hidden()


@pytest.mark.django_db
def test_panel_visible_when_issue_draft_is_the_only_filter(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED, in_issue_draft=True
    )

    as_committer.goto(live_server.url + SUGGESTION_LIST)
    filters = as_committer.get_by_test_id("suggestion-filters")
    filters.get_by_role("button", name="Issue draft").click()

    panel = as_committer.get_by_test_id("issue-draft-panel")
    expect(panel).to_be_visible()
    expect(panel.get_by_role("textbox", name="Issue title")).to_be_visible()
    expect(panel.get_by_role("button", name="Reset draft")).to_be_visible()
    expect(panel.get_by_role("button", name="Publish")).to_be_visible()


@pytest.mark.django_db
def test_publish_button_disabled_until_title_is_entered(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED, in_issue_draft=True
    )

    as_committer.goto(live_server.url + SUGGESTION_LIST + "?in_issue_draft=true")
    panel = as_committer.get_by_test_id("issue-draft-panel")

    expect(panel.get_by_role("button", name="Publish")).to_be_disabled()
    panel.get_by_role("textbox", name="Issue title").fill("   ")
    expect(panel.get_by_role("button", name="Publish")).to_be_disabled()
    panel.get_by_role("textbox", name="Issue title").fill("A real title")
    expect(panel.get_by_role("button", name="Publish")).to_be_enabled()


@pytest.mark.django_db
def test_publish_draft_creates_one_issue_for_all_bundled_suggestions(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    mocker: MockerFixture,
) -> None:
    mock_issue = mocker.Mock()
    mock_issue.html_url = "https://github.com/NixOS/nixpkgs/issues/5678"
    mocker.patch("shared.github.create_gh_issue", return_value=mock_issue)

    suggestion1 = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED, in_issue_draft=True
    )
    suggestion2 = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED, in_issue_draft=True
    )

    as_committer.goto(live_server.url + SUGGESTION_LIST + "?in_issue_draft=true")
    expect(as_committer.get_by_test_id(f"suggestion-{suggestion1.pk}")).to_be_visible()
    expect(as_committer.get_by_test_id(f"suggestion-{suggestion2.pk}")).to_be_visible()

    panel = as_committer.get_by_test_id("issue-draft-panel")
    panel.get_by_role("textbox", name="Issue title").fill("Bundled security issue")
    panel.get_by_role("button", name="Publish").click()

    expect(as_committer.get_by_text("Issue bundle published")).to_be_visible()
    expect(as_committer.get_by_role("link", name="GitHub issue")).to_have_attribute(
        "href", mock_issue.html_url
    )

    # The draft is now empty, so the list (still filtered to the draft) is empty.
    expect(as_committer.get_by_test_id(f"suggestion-{suggestion1.pk}")).to_have_count(0)
    expect(as_committer.get_by_test_id(f"suggestion-{suggestion2.pk}")).to_have_count(0)


@pytest.mark.django_db
def test_reset_draft_removes_all_suggestions(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Clicking "Reset draft" clears the issue draft entirely."""
    suggestion1 = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED, in_issue_draft=True
    )
    suggestion2 = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED, in_issue_draft=True
    )

    as_committer.goto(live_server.url + SUGGESTION_LIST + "?in_issue_draft=true")
    expect(as_committer.get_by_test_id(f"suggestion-{suggestion1.pk}")).to_be_visible()
    expect(as_committer.get_by_test_id(f"suggestion-{suggestion2.pk}")).to_be_visible()

    panel = as_committer.get_by_test_id("issue-draft-panel")
    panel.get_by_role("button", name="Reset draft").click()

    expect(as_committer.get_by_test_id(f"suggestion-{suggestion1.pk}")).to_have_count(0)
    expect(as_committer.get_by_test_id(f"suggestion-{suggestion2.pk}")).to_have_count(0)


@pytest.mark.django_db
def test_publish_draft_updates_previously_cached_published_filter_without_reload(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    mocker: MockerFixture,
) -> None:
    """If the "Published" status filter was already visited (and cached empty) before publishing the issue draft, switching to it afterwards must show the newly published suggestions without requiring a page reload."""
    mock_issue = mocker.Mock()
    mock_issue.html_url = "https://github.com/NixOS/nixpkgs/issues/5678"
    mocker.patch("shared.github.create_gh_issue", return_value=mock_issue)

    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED, in_issue_draft=True
    )

    # Visit the (still empty) "Published" filter first, so its result gets cached.
    as_committer.goto(live_server.url + SUGGESTION_LIST + "?status=published")
    expect(as_committer.get_by_text("No suggestions found.")).to_be_visible()

    # Navigate (client-side, no reload) to the issue draft filter and publish it.
    filters = as_committer.get_by_test_id("suggestion-filters")
    filters.get_by_role("button", name="Issue draft").click()
    panel = as_committer.get_by_test_id("issue-draft-panel")
    panel.get_by_role("textbox", name="Issue title").fill("Bundled security issue")
    panel.get_by_role("button", name="Publish").click()
    expect(as_committer.get_by_text("Issue bundle published")).to_be_visible()

    # Switch back to the "Published" filter (client-side, no reload): the previously
    # cached empty result for this exact filter must not be reused as-is.
    filters.get_by_role("button", name="Published").click()
    expect(as_committer.get_by_test_id(f"suggestion-{suggestion.pk}")).to_be_visible()
    expect(as_committer.get_by_text("No suggestions found.")).to_have_count(0)
