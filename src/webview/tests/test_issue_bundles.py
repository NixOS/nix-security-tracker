import re
from collections.abc import Callable
from contextlib import AbstractContextManager

from django.contrib.auth.models import User
from django.urls import reverse
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer
from pytest_mock import MockerFixture

from shared.models.issue import NixpkgsIssue
from shared.models.linkage import CVEDerivationClusterProposal

# Playwright's name= matching is a substring search, so "Bundle" would also
# match "Unbundle". Using a word-boundary regex avoids this without requiring
# an exact match that would break when buttons contain icons.
BUNDLE_BTN = re.compile(r"\bBundle\b")
UNBUNDLE_BTN = re.compile(r"\bUnbundle\b")


def test_staff_sees_issue_draft_link(
    as_staff: Page,
    live_server: LiveServer,
) -> None:
    """A logged-in staff user sees a link to the issue draft page in the header/menu."""
    as_staff.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))
    link = as_staff.get_by_role("link", name="Draft issue")
    expect(link).to_be_visible()
    # To accept query params such as `?compact`
    expect(link).to_have_attribute(
        "href", re.compile(r"^" + re.escape(reverse("webview:suggestion:issue_draft")))
    )
    as_staff.goto(live_server.url + reverse("webview:home"))
    link = as_staff.get_by_role("link", name="Draft issue")
    expect(link).to_be_visible()
    expect(link).to_have_attribute(
        "href", re.compile(r"^" + re.escape(reverse("webview:suggestion:issue_draft")))
    )


def test_draft_page_lists_suggestions_in_draft(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    as_staff: Page,
    live_server: LiveServer,
    no_js: bool,
) -> None:
    """When there is at least one suggestion in the draft, it appears in the draft page list."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED, in_issue_draft=True
    )
    as_staff.goto(live_server.url + reverse("webview:suggestion:issue_draft"))

    entry = as_staff.locator(f"#suggestion-{suggestion.pk}")
    expect(entry).to_be_visible()


def test_draft_page_shows_buttons_for_staff(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    as_staff: Page,
    live_server: LiveServer,
    no_js: bool,
) -> None:
    """When there is at least one suggestion in the draft and the user is allowed, a Reset/Publish button is shown."""
    make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        in_issue_draft=True,
    )

    as_staff.goto(live_server.url + reverse("webview:suggestion:issue_draft"))

    expect(as_staff.get_by_role("button", name="Publish")).to_be_visible()
    expect(as_staff.get_by_role("button", name="Reset draft")).to_be_visible()


def test_draft_page_buttons_hidden_when_draft_empty(
    as_staff: Page,
    live_server: LiveServer,
    no_js: bool,
) -> None:
    """When the draft is empty, the Reset/Publish button is not shown."""
    as_staff.goto(live_server.url + reverse("webview:suggestion:issue_draft"))

    expect(as_staff.get_by_role("button", name="Publish")).to_have_count(0)
    expect(as_staff.get_by_role("button", name="Reset draft")).to_have_count(0)


def test_draft_page_buttons_hidden_for_non_staff(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_user: Callable[..., User],
    logged_in_as: Callable[..., AbstractContextManager[Page]],
    live_server: LiveServer,
    no_js: bool,
) -> None:
    """A non-staff user does not see the Reset/Publish button even when the draft has suggestions."""
    make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        in_issue_draft=True,
    )
    non_staff = make_user(username="non_staff", is_staff=False, uid="2000")

    with logged_in_as(non_staff) as page:
        page.goto(live_server.url + reverse("webview:suggestion:issue_draft"))
        expect(page.get_by_role("button", name="Publish")).to_have_count(0)
        expect(page.get_by_role("button", name="Reset draft")).to_have_count(0)


def test_bundle_accepted_suggestion(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    as_staff: Page,
    live_server: LiveServer,
    no_js: bool,
) -> None:
    """Clicking 'Bundle' on an accepted suggestion adds it to the draft
    and replaces the button with 'Unbundle'."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )

    as_staff.goto(live_server.url + reverse("webview:suggestion:accepted_suggestions"))
    card = as_staff.locator(f"#suggestion-{suggestion.pk}")

    add_button = card.get_by_role("button", name=BUNDLE_BTN)
    expect(add_button).to_be_visible()
    add_button.click()

    # After clicking, the button should flip.
    expect(card.get_by_role("button", name=UNBUNDLE_BTN)).to_be_visible()
    expect(card.get_by_role("button", name=BUNDLE_BTN)).to_have_count(0)

    # And the suggestion must appear on the draft page.
    as_staff.goto(live_server.url + reverse("webview:suggestion:issue_draft"))
    expect(as_staff.locator(f"#suggestion-{suggestion.pk}")).to_be_visible()


def test_unbundle_suggestion(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    as_staff: Page,
    live_server: LiveServer,
    no_js: bool,
) -> None:
    """Unbundling a suggestion flips its button on the accepted page and removes it
    from the draft page. Unbundling directly from the draft page also removes it."""
    suggestion1 = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        in_issue_draft=True,
    )
    suggestion2 = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        in_issue_draft=True,
    )

    # Unbundle suggestion1 from the accepted suggestions page.
    as_staff.goto(live_server.url + reverse("webview:suggestion:accepted_suggestions"))
    card1 = as_staff.locator(f"#suggestion-{suggestion1.pk}")
    remove_button = card1.get_by_role("button", name=UNBUNDLE_BTN)
    expect(remove_button).to_be_visible()
    remove_button.click()

    # Button flips back to Bundle.
    expect(card1.get_by_role("button", name=BUNDLE_BTN)).to_be_visible()
    expect(card1.get_by_role("button", name=UNBUNDLE_BTN)).to_have_count(0)

    # On the draft page, suggestion1 is gone but suggestion2 is still there.
    as_staff.goto(live_server.url + reverse("webview:suggestion:issue_draft"))
    expect(as_staff.locator(f"#suggestion-{suggestion1.pk}")).to_have_count(0)
    expect(as_staff.locator(f"#suggestion-{suggestion2.pk}")).to_be_visible()

    # Unbundle suggestion2 directly from the draft page.
    as_staff.locator(f"#suggestion-{suggestion2.pk}").get_by_role(
        "button", name=UNBUNDLE_BTN
    ).click()
    expect(as_staff.locator(f"#suggestion-{suggestion2.pk}")).to_have_count(0)


def test_reset_draft_removes_all_suggestions(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    as_staff: Page,
    live_server: LiveServer,
    no_js: bool,
) -> None:
    """Clicking 'Reset draft' removes all suggestions from the draft and
    reloads the draft page, which then shows no suggestions."""
    suggestion1 = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        in_issue_draft=True,
    )
    suggestion2 = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        in_issue_draft=True,
    )

    as_staff.goto(live_server.url + reverse("webview:suggestion:issue_draft"))

    # Both suggestions are visible before the reset.
    expect(as_staff.locator(f"#suggestion-{suggestion1.pk}")).to_be_visible()
    expect(as_staff.locator(f"#suggestion-{suggestion2.pk}")).to_be_visible()

    as_staff.get_by_role("button", name="Reset draft").click()

    # After the reset the draft page is shown and lists no suggestions.
    expect(as_staff).to_have_url(
        live_server.url + reverse("webview:suggestion:issue_draft")
    )
    expect(as_staff.locator(f"#suggestion-{suggestion1.pk}")).to_have_count(0)
    expect(as_staff.locator(f"#suggestion-{suggestion2.pk}")).to_have_count(0)


def test_status_change_removes_suggestion_from_draft(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    as_staff: Page,
    live_server: LiveServer,
    no_js: bool,
) -> None:
    """When a suggestion in the draft is dismissed from the draft page,
    it disappears from the draft list."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        in_issue_draft=True,
    )

    as_staff.goto(live_server.url + reverse("webview:suggestion:issue_draft"))
    card = as_staff.locator(f"#suggestion-{suggestion.pk}")
    expect(card).to_be_visible()

    card.locator("textarea").fill("Dummy comment")
    card.get_by_role("button", name="Dismiss").click()

    expect(as_staff.locator(f"#suggestion-{suggestion.pk}")).to_have_count(0)


def test_publish_draft_creates_github_issue_and_redirects(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_container: Callable,
    make_drv: Callable,
    mocker: MockerFixture,
    as_staff: Page,
    live_server: LiveServer,
    no_js: bool,
) -> None:
    """
    Clicking 'Publish' on the draft page:
    - creates a GitHub issue mentioning all bundled suggestions;
    - empties the draft;
    - redirects to the published issue page on the tracker.
    """
    container1 = make_container(cve_id="CVE-2025-0001")
    container2 = make_container(cve_id="CVE-2025-0002")
    suggestion1 = make_cached_suggestion(
        container=container1,
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        in_issue_draft=True,
    )
    suggestion2 = make_cached_suggestion(
        container=container2,
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        in_issue_draft=True,
    )

    mock_issue = mocker.Mock()
    mock_issue.html_url = "https://github.com/NixOS/nixpkgs/issues/999"
    mock_create = mocker.patch("shared.github.create_gh_issue", return_value=mock_issue)

    as_staff.goto(live_server.url + reverse("webview:suggestion:issue_draft"))
    as_staff.get_by_placeholder("Issue title").fill("Test bundle issue")
    as_staff.get_by_role("button", name="Publish").click()

    # Redirected to the published issue page.
    expect(as_staff).to_have_url(re.compile(r"/issues/"))

    # Draft is now empty.
    as_staff.goto(live_server.url + reverse("webview:suggestion:issue_draft"))
    expect(as_staff.locator(f"#suggestion-{suggestion1.pk}")).to_have_count(0)
    expect(as_staff.locator(f"#suggestion-{suggestion2.pk}")).to_have_count(0)

    # GitHub issue creation was called once and both CVE IDs were included.
    mock_create.assert_called_once()
    published_cve_ids = [s.proposal.cve.cve_id for s in mock_create.call_args.args[0]]
    assert suggestion1.cve.cve_id in published_cve_ids
    assert suggestion2.cve.cve_id in published_cve_ids
    assert mock_create.call_args.args[1] == "Test bundle issue"


def test_published_bundle_shows_github_link_and_all_suggestions(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    mocker: MockerFixture,
    as_staff: Page,
    live_server: LiveServer,
    no_js: bool,
) -> None:
    """A published bundle issue page shows the GitHub issue link and all
    suggestions that were part of the bundle."""
    from shared.models.issue import EventType, NixpkgsEvent

    suggestion1 = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PUBLISHED,
    )
    suggestion2 = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PUBLISHED,
    )

    github_url = "https://github.com/NixOS/nixpkgs/issues/42"
    issue = NixpkgsIssue.create_nixpkgs_issue(
        [suggestion1, suggestion2], title="Test bundle"
    )
    NixpkgsEvent.objects.create(
        issue=issue,
        event_type=EventType.ISSUE | EventType.OPENED,
        url=github_url,
    )

    as_staff.goto(live_server.url + reverse("webview:issue_detail", args=[issue.code]))
    card = as_staff.locator(f"#issue-{issue.code}")

    # GitHub issue link is visible.
    github_link = card.get_by_role("link", name="GitHub issue")
    expect(github_link).to_be_visible()
    expect(github_link).to_have_attribute("href", github_url)

    # Both suggestions are listed.
    expect(card.locator(f"#suggestion-{suggestion1.pk}")).to_be_visible()
    expect(card.locator(f"#suggestion-{suggestion2.pk}")).to_be_visible()


def test_draft_is_shared_across_users(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_user: Callable[..., User],
    logged_in_as: Callable[..., AbstractContextManager[Page]],
    live_server: LiveServer,
    no_js: bool,
) -> None:
    """The issue draft is global: both users see the same content, and changes
    made by one user are immediately visible to the other."""
    suggestion1 = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        in_issue_draft=True,
    )
    suggestion2 = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        in_issue_draft=True,
    )

    staff1 = make_user(username="staff1", is_staff=True, uid="1000")
    staff2 = make_user(username="staff2", is_staff=True, uid="2000")
    draft_url = live_server.url + reverse("webview:suggestion:issue_draft")

    with logged_in_as(staff1) as page1, logged_in_as(staff2) as page2:
        # Both users see both suggestions.
        page1.goto(draft_url)
        page2.goto(draft_url)
        expect(page1.locator(f"#suggestion-{suggestion1.pk}")).to_be_visible()
        expect(page1.locator(f"#suggestion-{suggestion2.pk}")).to_be_visible()
        expect(page2.locator(f"#suggestion-{suggestion1.pk}")).to_be_visible()
        expect(page2.locator(f"#suggestion-{suggestion2.pk}")).to_be_visible()

        # User 1 unbundles suggestion1.
        page1.locator(f"#suggestion-{suggestion1.pk}").get_by_role(
            "button", name=UNBUNDLE_BTN
        ).click()
        expect(page1.locator(f"#suggestion-{suggestion1.pk}")).to_have_count(0)

        # User 2 reloads and no longer sees suggestion1.
        page2.reload()
        expect(page2.locator(f"#suggestion-{suggestion1.pk}")).to_have_count(0)
        expect(page2.locator(f"#suggestion-{suggestion2.pk}")).to_be_visible()
