import re
from collections.abc import Callable
from datetime import timedelta
from urllib.parse import urlencode

from django.utils import timezone
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.cve import Container
from shared.models.linkage import CVEDerivationClusterProposal, ProvenanceFlags
from shared.models.nix_evaluation import NixDerivation

from .routes import SUGGESTION_LIST


def make_suggestions(
    count: int,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> list[CVEDerivationClusterProposal]:
    """Create `count` distinct, cached suggestions, oldest (index 0) to newest (index count - 1)."""
    now = timezone.now()
    suggestions = []
    for i in range(count):
        container = make_container(
            cve_id=f"CVE-2026-{1000 + i}", title=f"Suggestion {i}"
        )
        suggestion = make_cached_suggestion(container=container)
        # Deterministic ordering, independent of wall-clock timing between creations.
        CVEDerivationClusterProposal.objects.filter(pk=suggestion.pk).update(
            created_at=now - timedelta(days=count - i),
            updated_at=now - timedelta(days=count - i),
        )
        suggestion.refresh_from_db()
        suggestions.append(suggestion)
    return suggestions


def test_suggestion_list_loads(
    live_server: LiveServer,
    page: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """The suggestion list page loads and shows a suggestion."""
    page.goto(live_server.url + SUGGESTION_LIST)
    expect(page.get_by_test_id(f"suggestion-{cached_suggestion.pk}")).to_be_visible()


def test_suggestion_list_no_pagination_controls_for_single_page(
    live_server: LiveServer,
    page: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """Pagination controls are hidden when there's only one page of results."""
    page.goto(live_server.url + SUGGESTION_LIST)
    expect(page.get_by_test_id(f"suggestion-{cached_suggestion.pk}")).to_be_visible()
    expect(page.get_by_role("button", name="Next page")).not_to_be_visible()


def test_suggestion_list_pagination_controls_appear_with_multiple_pages(
    live_server: LiveServer,
    page: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Pagination controls appear once there's more than one page of results."""
    make_suggestions(15, make_container, make_cached_suggestion)
    page.goto(live_server.url + SUGGESTION_LIST)
    expect(page.get_by_role("button", name="Next page")).to_be_visible()


def test_suggestion_list_page_navigation_shows_different_suggestions(
    live_server: LiveServer,
    page: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Navigating to the next page shows different suggestions, most recent first."""
    suggestions = make_suggestions(15, make_container, make_cached_suggestion)
    newest = suggestions[-1]
    oldest = suggestions[0]

    page.goto(live_server.url + SUGGESTION_LIST)
    expect(page.get_by_test_id(f"suggestion-{newest.pk}")).to_be_visible()
    expect(page.get_by_test_id(f"suggestion-{oldest.pk}")).not_to_be_visible()

    page.get_by_role("button", name="Next page").click()
    expect(page.get_by_test_id(f"suggestion-{oldest.pk}")).to_be_visible()
    expect(page.get_by_test_id(f"suggestion-{newest.pk}")).not_to_be_visible()


def test_suggestion_list_status_filter_via_query_param(
    live_server: LiveServer,
    page: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """A `status` query param only shows suggestions in that status."""
    pending = make_cached_suggestion(
        container=make_container(cve_id="CVE-2026-3001"),
        status=CVEDerivationClusterProposal.Status.PENDING,
    )
    accepted = make_cached_suggestion(
        container=make_container(cve_id="CVE-2026-3002"),
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
    )

    page.goto(
        live_server.url + SUGGESTION_LIST + "?" + urlencode({"status": "accepted"})
    )
    expect(page.get_by_test_id(f"suggestion-{accepted.pk}")).to_be_visible()
    expect(page.get_by_test_id(f"suggestion-{pending.pk}")).not_to_be_visible()


def test_suggestion_list_status_toggle_click_filters_and_updates_url(
    live_server: LiveServer,
    page: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Clicking a status toggle solo-selects it, filtering the list and the URL."""
    pending = make_cached_suggestion(
        container=make_container(cve_id="CVE-2026-3011"),
        status=CVEDerivationClusterProposal.Status.PENDING,
    )
    accepted = make_cached_suggestion(
        container=make_container(cve_id="CVE-2026-3012"),
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
    )

    page.goto(live_server.url + SUGGESTION_LIST)
    expect(page.get_by_test_id(f"suggestion-{pending.pk}")).to_be_visible()
    expect(page.get_by_test_id(f"suggestion-{accepted.pk}")).to_be_visible()

    filters = page.get_by_test_id("suggestion-filters")
    filters.get_by_role("button", name="Accepted").click()

    expect(page.get_by_test_id(f"suggestion-{accepted.pk}")).to_be_visible()
    expect(page.get_by_test_id(f"suggestion-{pending.pk}")).not_to_be_visible()
    expect(page).to_have_url(re.compile(r"[?&]status=accepted"))


def test_suggestion_list_status_shift_click_adds_to_multi_selection(
    live_server: LiveServer,
    page: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Shift-clicking a second status adds it to the selection; a plain click then solos back."""
    pending = make_cached_suggestion(
        container=make_container(cve_id="CVE-2026-3021"),
        status=CVEDerivationClusterProposal.Status.PENDING,
    )
    accepted = make_cached_suggestion(
        container=make_container(cve_id="CVE-2026-3022"),
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
    )
    rejected = make_cached_suggestion(
        container=make_container(cve_id="CVE-2026-3023"),
        status=CVEDerivationClusterProposal.Status.REJECTED,
        rejection_reason=CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS,
    )

    page.goto(live_server.url + SUGGESTION_LIST)
    filters = page.get_by_test_id("suggestion-filters")

    filters.get_by_role("button", name="Accepted").click()
    filters.get_by_role("button", name="Dismissed").click(modifiers=["Shift"])

    expect(page.get_by_test_id(f"suggestion-{accepted.pk}")).to_be_visible()
    expect(page.get_by_test_id(f"suggestion-{rejected.pk}")).to_be_visible()
    expect(page.get_by_test_id(f"suggestion-{pending.pk}")).not_to_be_visible()

    # A plain click back on "Accepted" solos back to just that status.
    filters.get_by_role("button", name="Accepted").click()
    expect(page.get_by_test_id(f"suggestion-{accepted.pk}")).to_be_visible()
    expect(page.get_by_test_id(f"suggestion-{rejected.pk}")).not_to_be_visible()


def test_suggestion_list_in_issue_draft_filter(
    live_server: LiveServer,
    page: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Toggling "Issue draft" only shows suggestions in the draft."""
    in_draft = make_cached_suggestion(
        container=make_container(cve_id="CVE-2026-3031"),
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        in_issue_draft=True,
    )
    not_in_draft = make_cached_suggestion(
        container=make_container(cve_id="CVE-2026-3032"),
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        in_issue_draft=False,
    )

    page.goto(live_server.url + SUGGESTION_LIST)
    filters = page.get_by_test_id("suggestion-filters")
    filters.get_by_role("button", name="Issue draft").click()

    expect(page.get_by_test_id(f"suggestion-{in_draft.pk}")).to_be_visible()
    expect(page.get_by_test_id(f"suggestion-{not_in_draft.pk}")).not_to_be_visible()
    expect(page).to_have_url(re.compile(r"[?&]in_issue_draft=true"))


def test_suggestion_list_package_filter(
    live_server: LiveServer,
    page: Page,
    make_drv: Callable[..., NixDerivation],
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Typing in the package filter only shows suggestions with that active package."""
    package1 = make_drv(pname="foo")
    package2 = make_drv(pname="bar")
    matching = make_cached_suggestion(
        container=make_container(cve_id="CVE-2026-3041"),
        drvs={package1: ProvenanceFlags.PACKAGE_NAME_MATCH},
    )
    other = make_cached_suggestion(
        container=make_container(cve_id="CVE-2026-3042"),
        drvs={package2: ProvenanceFlags.PACKAGE_NAME_MATCH},
    )

    page.goto(live_server.url + SUGGESTION_LIST)
    page.get_by_label("Filter by package").fill(package1.attribute)

    expect(page.get_by_test_id(f"suggestion-{matching.pk}")).to_be_visible()
    expect(page.get_by_test_id(f"suggestion-{other.pk}")).not_to_be_visible()


def test_suggestion_list_deep_link_preselects_filter_widgets(
    live_server: LiveServer,
    page: Page,
    make_drv: Callable[..., NixDerivation],
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Loading the list with filter query params pre-selects the corresponding widgets."""
    package = make_drv(pname="foo")
    make_cached_suggestion(
        container=make_container(cve_id="CVE-2026-3051"),
        drvs={package: ProvenanceFlags.PACKAGE_NAME_MATCH},
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        in_issue_draft=True,
    )

    query = urlencode(
        {"status": "accepted", "in_issue_draft": "true", "package": package.attribute}
    )
    page.goto(live_server.url + SUGGESTION_LIST + "?" + query)

    filters = page.get_by_test_id("suggestion-filters")
    expect(filters.get_by_role("button", name="Accepted")).to_have_attribute(
        "data-state", "on"
    )
    expect(filters.get_by_role("button", name="Issue draft")).to_have_attribute(
        "data-state", "on"
    )
    expect(page.get_by_label("Filter by package")).to_have_value(package.attribute)


def test_suggestion_list_shows_collapsed_card_after_mutation_stops_matching_filter(
    live_server: LiveServer,
    as_committer: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Accepting a suggestion while filtered to "pending" collapses its card
    instead of just removing it, showing status/CVE id/title/permalink."""
    suggestion = make_cached_suggestion(
        container=make_container(
            cve_id="CVE-2026-3061", title="Collapsible suggestion"
        ),
        status=CVEDerivationClusterProposal.Status.PENDING,
    )

    as_committer.goto(
        live_server.url + SUGGESTION_LIST + "?" + urlencode({"status": "pending"})
    )
    card = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}")
    expect(card).to_be_visible()

    actions = card.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")
    actions.get_by_role("button", name="Accept").click()

    collapsed = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-collapsed")
    expect(collapsed).to_be_visible()
    expect(collapsed).to_contain_text("CVE-2026-3061")
    expect(collapsed).to_contain_text("Collapsible suggestion")
    expect(
        collapsed.get_by_test_id(f"suggestion-{suggestion.pk}-status")
    ).to_be_visible()
    expect(collapsed.get_by_role("link", name="Permalink")).to_be_visible()

    # The full card (with status actions, package section, etc.) is gone.
    expect(
        as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")
    ).to_have_count(0)
