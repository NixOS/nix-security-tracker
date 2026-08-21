from collections.abc import Callable
from datetime import timedelta

from django.utils import timezone
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.cve import Container
from shared.models.issue import NixpkgsIssue

from .routes import ISSUE_LIST


def make_issues(
    count: int,
    make_container: Callable[..., Container],
    make_issue: Callable[..., NixpkgsIssue],
) -> list[NixpkgsIssue]:
    """Create `count` distinct issues, oldest (index 0) to newest (index count - 1)."""
    now = timezone.now()
    issues = []
    for i in range(count):
        container = make_container(cve_id=f"CVE-2026-{2000 + i}")
        issue = make_issue(container=container)
        NixpkgsIssue.objects.filter(pk=issue.pk).update(
            created_at=now - timedelta(days=count - i)
        )
        issue.refresh_from_db()
        issues.append(issue)
    return issues


def test_issue_list_loads(
    live_server: LiveServer,
    page: Page,
    issue: NixpkgsIssue,
) -> None:
    page.goto(live_server.url + ISSUE_LIST)
    expect(page.get_by_test_id(f"issue-{issue.code}")).to_be_visible()


def test_issue_list_no_pagination_controls_for_single_page(
    live_server: LiveServer,
    page: Page,
    issue: NixpkgsIssue,
) -> None:
    page.goto(live_server.url + ISSUE_LIST)
    expect(page.get_by_test_id(f"issue-{issue.code}")).to_be_visible()
    expect(page.get_by_role("button", name="Next page")).not_to_be_visible()


def test_issue_list_pagination_controls_appear_with_multiple_pages(
    live_server: LiveServer,
    page: Page,
    make_container: Callable[..., Container],
    make_issue: Callable[..., NixpkgsIssue],
) -> None:
    make_issues(15, make_container, make_issue)
    page.goto(live_server.url + ISSUE_LIST)
    expect(page.get_by_role("button", name="Next page")).to_be_visible()


def test_issue_list_page_navigation_shows_different_issues(
    live_server: LiveServer,
    page: Page,
    make_container: Callable[..., Container],
    make_issue: Callable[..., NixpkgsIssue],
) -> None:
    issues = make_issues(15, make_container, make_issue)
    newest = issues[-1]
    oldest = issues[0]

    page.goto(live_server.url + ISSUE_LIST)
    expect(page.get_by_test_id(f"issue-{newest.code}")).to_be_visible()
    expect(page.get_by_test_id(f"issue-{oldest.code}")).not_to_be_visible()

    page.get_by_role("button", name="Next page").click()
    expect(page.get_by_test_id(f"issue-{oldest.code}")).to_be_visible()
    expect(page.get_by_test_id(f"issue-{newest.code}")).not_to_be_visible()


def test_issue_list_links_to_detail_page(
    live_server: LiveServer,
    page: Page,
    issue: NixpkgsIssue,
) -> None:
    page.goto(live_server.url + ISSUE_LIST)
    card = page.get_by_test_id(f"issue-{issue.code}")
    card.get_by_role("link", name="Permalink").click()
    expect(page).to_have_url(live_server.url + ISSUE_LIST + f"/{issue.code}")
