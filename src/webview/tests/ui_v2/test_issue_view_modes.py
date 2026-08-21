import re
from collections.abc import Callable

from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.cve import Container
from shared.models.issue import NixpkgsIssue
from shared.models.linkage import CVEDerivationClusterProposal

from .routes import ISSUE_DETAIL, ISSUE_LIST


def make_issue_with_suggestions(
    cve_ids: list[str],
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    title: str = "Issue title",
) -> NixpkgsIssue:
    """Create an issue backed by one published, cached suggestion per given CVE id."""
    suggestions = [
        make_cached_suggestion(
            container=make_container(cve_id=cve_id),
            status=CVEDerivationClusterProposal.Status.PUBLISHED,
        )
        for cve_id in cve_ids
    ]
    return NixpkgsIssue.create_nixpkgs_issue(suggestions, title)


def test_issue_detail_own_suggestions_toggle_switches_view(
    live_server: LiveServer,
    page: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    issue = make_issue_with_suggestions(
        ["CVE-2026-6031", "CVE-2026-6032"], make_container, make_cached_suggestion
    )
    suggestion = issue.suggestions.first()
    page.goto(live_server.url + ISSUE_DETAIL + f"/{issue.code}")
    page.get_by_test_id(f"issue-{issue.code}-suggestions-view-toggle").get_by_role(
        "button", name="Tabs"
    ).click()

    expect(page.get_by_test_id(f"suggestion-{suggestion.pk}-tabs")).to_be_visible()


def test_issue_list_defaults_to_collapsed_with_no_suggestions_shown(
    live_server: LiveServer,
    page: Page,
    issue: NixpkgsIssue,
) -> None:
    """By default, an issue list shows collapsed issue cards with no suggestions."""
    suggestion = issue.suggestions.get()
    page.goto(live_server.url + ISSUE_LIST)
    expect(page.get_by_test_id(f"issue-{issue.code}")).to_be_visible()
    expect(page.get_by_test_id(f"suggestion-{suggestion.pk}")).to_have_count(0)


def test_issue_list_wide_toggle_switches_to_expanded(
    live_server: LiveServer,
    page: Page,
    issue: NixpkgsIssue,
) -> None:
    """Picking "Expanded" in the issue-list-wide toggle reveals every issue's suggestions
    (collapsed by default)."""
    suggestion = issue.suggestions.get()
    page.goto(live_server.url + ISSUE_LIST)

    page.get_by_test_id("issue-view-toggle").get_by_role(
        "button", name="Expanded"
    ).click()

    expect(page.get_by_test_id(f"suggestion-{suggestion.pk}-collapsed")).to_be_visible()
    expect(page).to_have_url(re.compile(r"[?&]issueView=expanded"))


def test_issue_list_wide_suggestion_toggle_affects_every_issue(
    live_server: LiveServer,
    page: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """The list-wide suggestions toggle applies to every issue's suggestions at once."""
    first = make_issue_with_suggestions(
        ["CVE-2026-6001"], make_container, make_cached_suggestion
    )
    second = make_issue_with_suggestions(
        ["CVE-2026-6002"], make_container, make_cached_suggestion
    )

    page.goto(live_server.url + ISSUE_LIST + "?issueView=expanded")
    page.get_by_test_id("suggestion-view-toggle").get_by_role(
        "button", name="Compact"
    ).click()

    for suggestion in (first.suggestions.get(), second.suggestions.get()):
        card = page.get_by_test_id(f"suggestion-{suggestion.pk}")
        expect(card).to_be_visible()
        expect(card.get_by_role("heading", name="Matching in nixpkgs")).to_have_count(0)


def test_per_issue_suggestion_override_only_affects_that_issue(
    live_server: LiveServer,
    page: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Overriding one issue's suggestions toggle leaves other issues' suggestions alone."""
    # `first` needs at least two suggestions for its own suggestions-view-toggle to be shown (a lone suggestion already exposes its own view toggle).
    first = make_issue_with_suggestions(
        ["CVE-2026-6011", "CVE-2026-6013"], make_container, make_cached_suggestion
    )
    second = make_issue_with_suggestions(
        ["CVE-2026-6012"], make_container, make_cached_suggestion
    )

    page.goto(live_server.url + ISSUE_LIST + "?issueView=expanded")
    first_card = page.get_by_test_id(f"issue-{first.code}")
    first_card.get_by_test_id(
        f"issue-{first.code}-suggestions-view-toggle"
    ).get_by_role("button", name="Compact").click()

    for suggestion in first.suggestions.all():
        first_suggestion_card = page.get_by_test_id(f"suggestion-{suggestion.pk}")
        expect(
            first_suggestion_card.get_by_role("heading", name="Matching in nixpkgs")
        ).to_have_count(0)
    second_suggestion_card = page.get_by_test_id(
        f"suggestion-{second.suggestions.get().pk}-collapsed"
    )
    # Untouched by the override, the second issue's suggestion stays at the list-wide
    # default: collapsed.
    expect(second_suggestion_card).to_be_visible()


def test_per_suggestion_override_within_an_issue_only_affects_that_suggestion(
    live_server: LiveServer,
    page: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Overriding one suggestion's own toggle leaves its sibling suggestion, in the same
    issue, at the inherited view mode."""
    issue = make_issue_with_suggestions(
        ["CVE-2026-6021", "CVE-2026-6022"], make_container, make_cached_suggestion
    )
    first, second = issue.suggestions.order_by("pk")

    page.goto(live_server.url + ISSUE_LIST + "?issueView=expanded")
    page.get_by_test_id(f"suggestion-{first.pk}-view-toggle").get_by_role(
        "button", name="Compact"
    ).click()

    first_card = page.get_by_test_id(f"suggestion-{first.pk}")
    second_card = page.get_by_test_id(f"suggestion-{second.pk}-collapsed")
    expect(first_card.get_by_role("heading", name="Matching in nixpkgs")).to_have_count(
        0
    )
    # Untouched by the override, the sibling suggestion stays at the inherited (collapsed)
    # view mode.
    expect(second_card).to_be_visible()
