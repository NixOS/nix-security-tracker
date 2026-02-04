from collections.abc import Callable
from typing import Any
from unittest.mock import patch

import pytest
from django.urls import reverse
from github import Github
from github.Issue import Issue as GithubIssue
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer
from pytest_mock import MockerFixture

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


@pytest.mark.parametrize(
    "ignore_package",
    [True, False],
)
def test_maintainer_of_active_package_mentioned_in_issue(
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    live_server: LiveServer,
    as_staff: Page,
    no_js: bool,
    mocker: MockerFixture,
    ignore_package: bool,
) -> None:
    """Test that the body of a created issue mentions the maintainer, unless the package has been ignored."""

    accepted_suggestion = make_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    cache_new_suggestions(accepted_suggestion)

    as_staff.goto(live_server.url + reverse("webview:suggestion:accepted_suggestions"))
    suggestion = as_staff.locator(f"#suggestion-{accepted_suggestion.pk}")
    publish = suggestion.get_by_role("button", name="Publish issue")
    active_packages = as_staff.locator(
        f"#suggestion-{accepted_suggestion.cached.pk}-active-packages"
    )
    ignore_package_button = active_packages.get_by_role("button", name="Ignore")
    drv = accepted_suggestion.derivations.first()
    assert drv

    # Case where we ignore the package
    if ignore_package:
        expect(active_packages.get_by_text(drv.attribute)).to_be_visible()
        ignore_package_button.click()
        # NOTE(@florentc): Necessary to avoid race condition on clicking "View" later
        expect(active_packages.get_by_text(drv.attribute)).not_to_be_visible()

    # Mocking GitHub
    mock_repo = mocker.Mock()
    mock_issue = mocker.Mock()
    mock_issue.html_url = "https://fake.url"  # NOTE(@florentc): We need to define it because the view expects it
    mock_repo.create_issue.return_value = mock_issue
    mock_github = mocker.Mock()
    mock_github.get_repo.return_value = mock_repo

    # NOTE(@florentc): We can't mock get_gh with patch because it is evaluated
    # in module (as a default param) so we mock the entire create_gh_issue to
    # which we pass our mock github object
    def mock_create_gh_issue(*args: Any, **kwargs: Any) -> GithubIssue:
        return create_gh_issue(*args, github=mock_github, **kwargs)

    # NOTE(@florentc): During issue creation, info of maintainers is refreshed
    # by querying the GitHub API, we mock it to use what we have already. Since
    # we want to check who ends up in the generated list of maintainers in the
    # issue body, we can't just mock a constant return value for everyone
    def mock_get_maintainer_username(
        maintainer: dict, github: Github = mock_github
    ) -> str:
        return maintainer["github"]

    mocker.patch(
        "webview.suggestions.views.status.create_gh_issue", mock_create_gh_issue
    )
    mocker.patch("shared.github.get_maintainer_username", mock_get_maintainer_username)

    # Publish the issue
    publish.click()

    if no_js:
        as_staff.goto(live_server.url + reverse("webview:issue_list"))
    else:
        link = suggestion.get_by_role("link", name="View")
        link.click()
    # NOTE(@florentc): We wait to be sure publication has happened
    expect(suggestion).to_be_visible()

    mock_repo.create_issue.assert_called_once()
    issue_body = mock_repo.create_issue.call_args[1]["body"]
    maintainer_handle = drv.metadata.maintainers.first().github

    if ignore_package:
        assert f"@{maintainer_handle}" not in issue_body
    else:
        assert f"@{maintainer_handle}" in issue_body
