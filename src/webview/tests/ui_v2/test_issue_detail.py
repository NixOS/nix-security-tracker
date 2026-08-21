from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.issue import EventType, NixpkgsEvent, NixpkgsIssue

from .routes import ISSUE_DETAIL


def test_issue_detail_loads(
    live_server: LiveServer,
    page: Page,
    issue: NixpkgsIssue,
) -> None:
    page.goto(live_server.url + ISSUE_DETAIL + f"/{issue.code}")
    card = page.get_by_test_id(f"issue-{issue.code}")
    expect(card).to_be_visible()
    expect(page.get_by_test_id(f"issue-{issue.code}-title")).to_have_text(issue.title)


def test_issue_detail_shows_inlined_suggestion(
    live_server: LiveServer,
    page: Page,
    issue: NixpkgsIssue,
) -> None:
    suggestion = issue.suggestions.get()
    page.goto(live_server.url + ISSUE_DETAIL + f"/{issue.code}")
    expect(page.get_by_test_id(f"suggestion-{suggestion.pk}")).to_be_visible()
    expect(page.get_by_text(suggestion.cve.cve_id, exact=False)).to_be_visible()


def test_issue_detail_shows_github_issue_link(
    live_server: LiveServer,
    page: Page,
    issue: NixpkgsIssue,
) -> None:
    NixpkgsEvent.objects.create(
        issue=issue,
        event_type=EventType.ISSUE | EventType.OPENED,
        url="https://github.com/NixOS/nixpkgs/issues/1",
    )
    page.goto(live_server.url + ISSUE_DETAIL + f"/{issue.code}")
    expect(page.get_by_role("link", name="GitHub issue")).to_have_attribute(
        "href", "https://github.com/NixOS/nixpkgs/issues/1"
    )


def test_issue_detail_not_found(
    live_server: LiveServer,
    page: Page,
) -> None:
    page.goto(live_server.url + ISSUE_DETAIL + "/NIXPKGS-2099-9999")
    expect(page.get_by_text("Issue not found.")).to_be_visible()
