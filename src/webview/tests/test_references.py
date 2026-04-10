import re
from collections.abc import Callable
from typing import Any

import pytest
from django.contrib.auth.models import User
from django.urls import reverse
from github import Github
from github.Issue import Issue as GithubIssue
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer
from pytest_mock import MockerFixture

from shared.github import create_gh_issue
from shared.models.cve import Container
from shared.models.linkage import (
    CVEDerivationClusterProposal,
)


@pytest.mark.parametrize(
    "status, editable, endpoint",
    [
        (CVEDerivationClusterProposal.Status.PENDING, True, "untriaged_suggestions"),
        (CVEDerivationClusterProposal.Status.REJECTED, False, "dismissed_suggestions"),
        (CVEDerivationClusterProposal.Status.ACCEPTED, True, "accepted_suggestions"),
        (CVEDerivationClusterProposal.Status.PENDING, True, "detail"),
        (CVEDerivationClusterProposal.Status.REJECTED, False, "detail"),
        (CVEDerivationClusterProposal.Status.ACCEPTED, True, "detail"),
    ],
)
def test_ignore_restore_references(
    live_server: LiveServer,
    as_staff: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_container: Callable[..., Container],
    editable: bool,
    status: CVEDerivationClusterProposal.Status,
    endpoint: str,
) -> None:
    """Test ignoring and restoring a package"""
    container = make_container(
        references=[
            ("Foo", "https://foo.fake", ["tag1", "tag2"]),
            ("", "https://bar.fake", ["tag2", "tag3"]),
        ]
    )
    suggestion = make_cached_suggestion(
        status=status,
        container=container,
    )

    if endpoint == "detail":
        as_staff.goto(
            live_server.url
            + reverse(
                "webview:suggestion:detail", kwargs={"suggestion_id": suggestion.pk}
            )
        )
    else:
        as_staff.goto(live_server.url + reverse(f"webview:suggestion:{endpoint}"))

    # Check both references are initially visible under active references
    references = as_staff.locator(f"#suggestion-{suggestion.pk}-references")
    active_references = as_staff.locator(
        f"#suggestion-{suggestion.pk}-active-references"
    )
    ignored_references = as_staff.locator(
        f"#suggestion-{suggestion.pk}-ignored-references"
    )
    expect(active_references.get_by_text("Foo")).to_be_visible()
    expect(active_references.get_by_text("https://bar.fake")).to_be_visible()
    expect(ignored_references).not_to_be_visible()

    reference1 = references.get_by_role("listitem").filter(
        has_text="Foo",
    )

    reference1_ignore_button = reference1.get_by_role("button", name="Ignore")

    if not editable:
        # Expect no ignore button to be visible if edition is disallowed
        expect(reference1_ignore_button).not_to_be_visible()
        return
    else:
        # Click ignore and open the list of ignored references
        reference1_ignore_button.click()
        as_staff.locator(f"#suggestion-{suggestion.pk}").get_by_text(
            re.compile("Ignored references"),
        ).click()

    # Check reference 1 now appears under the ignored references
    expect(active_references.get_by_text("Foo")).not_to_be_visible()
    expect(active_references.get_by_text("https://bar.fake")).to_be_visible()
    expect(ignored_references.get_by_text("Foo")).to_be_visible()

    # Click restore on reference 1
    reference1_restore_button = reference1.get_by_role("button", name="Restore")
    reference1_restore_button.click()

    # Expect to be back in initial state
    expect(active_references.get_by_text("Foo")).to_be_visible()
    expect(active_references.get_by_text("https://bar.fake")).to_be_visible()
    expect(ignored_references).not_to_be_visible()


def test_ignore_reference_displayed_in_activity_log(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_container: Callable[..., Container],
) -> None:
    """Test ignoring and restoring a package"""
    container = make_container(
        references=[
            ("Foo", "https://foo.fake", ["tag1", "tag2"]),
            ("", "https://bar.fake", ["tag2", "tag3"]),
        ]
    )
    suggestion = make_cached_suggestion(container=container)
    as_staff.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))

    references = as_staff.locator(f"#suggestion-{suggestion.pk}-references")
    reference1 = references.get_by_role("listitem").filter(has_text="Foo")
    reference1.get_by_role("button", name="Ignore").click()

    # Check the action appears in the activity log
    activity_log = as_staff.locator(f"#suggestion-activity-log-{suggestion.pk}")
    activity_log.click()
    activity_log.get_by_text(staff.username)
    entry = (
        activity_log.filter(has_text=staff.username)
        .filter(has_text="ignored reference")
        .filter(has_text="Foo")
    )
    expect(entry).to_be_visible()


# FIXME(@florentc): The mock issue thing is mostly copy pasted from test_issues.py
# This should be refactored in resuable code fashion
def test_only_active_references_displayed_in_published_issue(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    no_js: bool,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_container: Callable[..., Container],
    mocker: MockerFixture,
) -> None:
    """Test references appears in the generated issue, unless they have been ignored"""
    container = make_container(
        references=[
            ("Foo", "https://foo.fake", ["tag1", "tag2"]),
            ("", "https://bar.fake", ["tag2", "tag3"]),
        ]
    )
    suggestion = make_cached_suggestion(
        container=container, status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    as_staff.goto(live_server.url + reverse("webview:suggestion:accepted_suggestions"))

    references = as_staff.locator(f"#suggestion-{suggestion.pk}-references")
    reference1 = references.get_by_role("listitem").filter(has_text="Foo")
    reference1.get_by_role("button", name="Ignore").click()
    expect(reference1).not_to_be_visible()
    suggestion_component = as_staff.locator(f"#suggestion-{suggestion.pk}")
    publish = suggestion_component.get_by_role("button", name="Publish issue")

    # Mocking GitHub
    mock_repo = mocker.Mock()
    mock_issue = mocker.Mock()
    mock_issue.html_url = "https://fake.url"  # NOTE(@florentc): We need to define it because the view expects it
    mock_repo.create_issue.return_value = mock_issue
    mock_github = mocker.Mock()
    mock_github.get_repo.return_value = mock_repo

    # FIXME(@florentc): We can't mock get_gh with patch because it is evaluated
    # in module (as a default param) so we mock the entire create_gh_issue to
    # which we pass our mock github object [ref:todo-github-connection]
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

    # NOTE(@florentc): In js mode, we wait for the end of status change to be
    # sure publication has happened
    if not no_js:
        expect(publish).not_to_be_visible()

    # Check published issue content
    mock_repo.create_issue.assert_called_once()
    issue_body = mock_repo.create_issue.call_args[1]["body"]
    assert "Foo" not in issue_body
    assert "https://bar.fake" in issue_body
