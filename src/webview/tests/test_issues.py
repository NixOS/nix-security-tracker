from collections.abc import Callable
from unittest.mock import patch

import pytest
from django.urls import reverse
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.github import create_gh_issue
from shared.listeners.cache_suggestions import cache_new_suggestions
from shared.models.cve import (
    Container,
)
from shared.models.linkage import (
    CVEDerivationClusterProposal,
)
from shared.models.nix_evaluation import (
    NixDerivation,
)
from shared.tests.test_github_sync import MockGithub


@pytest.mark.parametrize(
    "title,description,expected_issue_title",
    [
        # 3/4 of all CVEs in the source data have empty title
        ("", "Test description", "Test description"),
        ("Dummy Title", None, "Dummy Title"),
        # Does not occur in practice
        ("", "", "Security issue (missing title)"),
    ],
)
def test_publish_gh_issue_empty_title(
    make_container: Callable[..., Container],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    drv: NixDerivation,
    live_server: LiveServer,
    as_staff: Page,
    no_js: bool,
    title: str,
    description: str | None,
    expected_issue_title: str,
) -> None:
    """Test that creating a GitHub issue will succeed and update the suggestion status, despite empty CVE title or description"""
    # [tag:test-github-create_issue-title]

    container = make_container(title=title, description=description)
    accepted_suggestion = make_suggestion(
        container=container, status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    cache_new_suggestions(accepted_suggestion)

    as_staff.goto(live_server.url + reverse("webview:suggestion:accepted_suggestions"))
    suggestion = as_staff.locator(f"#suggestion-{accepted_suggestion.cached.pk}")
    publish = suggestion.get_by_role("button", name="Publish issue")

    # FIXME(@fricklerhandwerk): Mock Github's `create_issue()` here, not our own procedure! [ref:todo-github-connection]
    # Then we can test in-context that the right arguments have been passed, using `mock.assert_called_with()`.
    with patch("webview.suggestions.views.status.create_gh_issue") as mock:
        mock.side_effect = lambda *args, **kwargs: create_gh_issue(
            *args,
            github=MockGithub(expected_issue_title=expected_issue_title),  # type: ignore
            **kwargs,
        )
        publish.click()
        if not no_js:
            link = as_staff.get_by_role("link", name="View")
            expect(link).to_be_visible()
        mock.assert_called()

    if no_js:
        error = as_staff.locator("#messages")
    else:
        error = suggestion.locator(".error-block")

    expect(error).to_have_count(0)

    if no_js:
        as_staff.goto(live_server.url + reverse("webview:issue_list"))
    else:
        link = as_staff.get_by_role("link", name="View")
        link.click()

    expect(suggestion).to_be_visible()

    issue_link = suggestion.locator("..").get_by_role("link", name="GitHub issue")
    expect(issue_link).to_be_visible()
    # FIXME(@fricklerhandwerk): Instrument the GitHub mock to produce a controlled link and check for that in the UI.
    # This would assert we're actually displaying the right URL.
    expect(issue_link).not_to_have_attribute("href", "")
