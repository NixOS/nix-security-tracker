import re
from collections.abc import Callable

from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.cve import Container
from shared.models.linkage import CVEDerivationClusterProposal

from .routes import SUGGESTION_DETAIL, SUGGESTION_LIST


def test_suggestion_list_defaults_to_detailed_view(
    live_server: LiveServer,
    page: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """By default, suggestions render in the detailed view (all sections shown)."""
    page.goto(live_server.url + SUGGESTION_LIST)
    card = page.get_by_test_id(f"suggestion-{cached_suggestion.pk}")
    expect(card).to_be_visible()
    expect(card.get_by_role("heading", name="Matching in nixpkgs")).to_be_visible()
    expect(card.get_by_role("heading", name="Maintainers")).to_be_visible()


def test_list_wide_toggle_switches_to_collapsed(
    live_server: LiveServer,
    page: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """Picking "Collapsed" in the list-wide toggle collapses every suggestion."""
    page.goto(live_server.url + SUGGESTION_LIST)
    page.get_by_test_id("suggestion-view-toggle").get_by_role(
        "button", name="Collapsed"
    ).click()

    collapsed = page.get_by_test_id(f"suggestion-{cached_suggestion.pk}-collapsed")
    expect(collapsed).to_be_visible()
    expect(collapsed).to_contain_text(cached_suggestion.cve.cve_id)
    expect(page.get_by_test_id(f"suggestion-{cached_suggestion.pk}")).to_have_count(0)
    expect(page).to_have_url(re.compile(r"[?&]suggestionView=collapsed"))


def test_list_wide_toggle_switches_to_compact(
    live_server: LiveServer,
    page: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Picking "Compact" shows references but hides packages/maintainers sections."""
    suggestion = make_cached_suggestion(
        container=make_container(
            cve_id="CVE-2026-4001",
            references=[("Ref text", "https://example.com/ref", [])],
        )
    )

    page.goto(live_server.url + SUGGESTION_LIST)
    page.get_by_test_id("suggestion-view-toggle").get_by_role(
        "button", name="Compact"
    ).click()

    card = page.get_by_test_id(f"suggestion-{suggestion.pk}")
    expect(card).to_be_visible()
    expect(card.get_by_role("link", name="Ref text")).to_be_visible()
    expect(card.get_by_role("heading", name="Matching in nixpkgs")).to_have_count(0)
    expect(card.get_by_role("heading", name="Maintainers")).to_have_count(0)


def test_list_wide_toggle_switches_to_tabs(
    live_server: LiveServer,
    page: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """Picking "Tabs" shows a tab list covering the suggestion's populated sections."""
    page.goto(live_server.url + SUGGESTION_LIST)
    page.get_by_test_id("suggestion-view-toggle").get_by_role(
        "button", name="Tabs"
    ).click()

    tabs = page.get_by_test_id(f"suggestion-{cached_suggestion.pk}-tabs")
    expect(tabs).to_be_visible()
    expect(tabs.get_by_role("tab", name="Matching in Nixpkgs")).to_be_visible()
    expect(tabs.get_by_role("tab", name="Maintainers")).to_be_visible()


def test_per_suggestion_override_only_affects_that_suggestion(
    live_server: LiveServer,
    page: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Overriding one suggestion's own view toggle leaves other suggestions alone."""
    first = make_cached_suggestion(container=make_container(cve_id="CVE-2026-4011"))
    second = make_cached_suggestion(container=make_container(cve_id="CVE-2026-4012"))

    page.goto(live_server.url + SUGGESTION_LIST)
    first_card = page.get_by_test_id(f"suggestion-{first.pk}")
    first_card.get_by_test_id(f"suggestion-{first.pk}-view-toggle").get_by_role(
        "button", name="Compact"
    ).click()

    expect(first_card.get_by_role("heading", name="Matching in nixpkgs")).to_have_count(
        0
    )
    second_card = page.get_by_test_id(f"suggestion-{second.pk}")
    expect(
        second_card.get_by_role("heading", name="Matching in nixpkgs")
    ).to_be_visible()


def test_filter_mismatch_collapsed_suggestion_can_be_unfolded(
    live_server: LiveServer,
    as_committer: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """A suggestion forced into "collapsed" by no longer matching the active
    filter can still be unfolded back to "Detailed" via its own toggle."""
    suggestion = make_cached_suggestion(
        container=make_container(cve_id="CVE-2026-4021"),
        status=CVEDerivationClusterProposal.Status.PENDING,
    )

    as_committer.goto(live_server.url + SUGGESTION_LIST + "?status=pending")
    card = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}")
    actions = card.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")
    actions.get_by_role("button", name="Accept").click()

    collapsed = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-collapsed")
    expect(collapsed).to_be_visible()
    collapsed.get_by_test_id(f"suggestion-{suggestion.pk}-view-toggle").get_by_role(
        "button", name="Detailed"
    ).click()

    unfolded = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}")
    expect(unfolded).to_be_visible()
    expect(unfolded.get_by_role("heading", name="Matching in nixpkgs")).to_be_visible()


def test_suggestion_detail_own_toggle_switches_to_tabs(
    live_server: LiveServer,
    page: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """On the detail page, the suggestion's own toggle switches its view."""
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{cached_suggestion.pk}")
    page.get_by_test_id(f"suggestion-{cached_suggestion.pk}-view-toggle").get_by_role(
        "button", name="Tabs"
    ).click()

    expect(
        page.get_by_test_id(f"suggestion-{cached_suggestion.pk}-tabs")
    ).to_be_visible()
