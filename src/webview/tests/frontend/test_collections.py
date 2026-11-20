from collections.abc import Callable

import pytest
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.cve import Container
from shared.models.linkage import CVEDerivationClusterProposal

from .routes import SUGGESTION_DETAIL

# NOTE(@florentc): Keep in sync with the defaults in `frontend/src/components/ui/CollectionCard.tsx`.
SHOWN_ITEMS = 10
MAX_TRUNCATED_ITEMS = 30


def make_references(count: int) -> list[tuple[str, str, list[str]]]:
    return [
        (f"Reference {index}", f"https://example.com/{index}", [])
        for index in range(count)
    ]


@pytest.mark.django_db
def test_collection_truncates_until_shown_more(
    live_server: LiveServer,
    page: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Only the first references show, until "Show more", and "Show less" goes back."""
    hidden = 2
    suggestion = make_cached_suggestion(
        container=make_container(references=make_references(SHOWN_ITEMS + hidden))
    )
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    references = page.get_by_test_id(f"suggestion-{suggestion.pk}-references")

    expect(references.get_by_role("link")).to_have_count(SHOWN_ITEMS)
    show_more = references.get_by_role(
        "button", name=f"Show more ({hidden})", exact=True
    )
    expect(show_more).to_have_attribute("aria-expanded", "false")

    show_more.click()
    expect(references.get_by_role("link")).to_have_count(SHOWN_ITEMS + hidden)
    show_less = references.get_by_role("button", name="Show less")
    expect(show_less).to_have_attribute("aria-expanded", "true")

    show_less.click()
    expect(references.get_by_role("link")).to_have_count(SHOWN_ITEMS)


@pytest.mark.django_db
def test_collection_at_truncation_threshold_has_no_show_more_nor_pagination(
    live_server: LiveServer,
    page: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    suggestion = make_cached_suggestion(
        container=make_container(references=make_references(SHOWN_ITEMS))
    )
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    references = page.get_by_test_id(f"suggestion-{suggestion.pk}-references")

    expect(references.get_by_role("link")).to_have_count(SHOWN_ITEMS)
    expect(references.get_by_role("button", name="Show more")).to_have_count(0)
    expect(references.get_by_role("button", name="Next page")).to_have_count(0)


@pytest.mark.django_db
def test_collection_beyond_truncation_limit_is_paginated(
    live_server: LiveServer,
    page: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Beyond the truncation limit, pages replace "Show more"."""
    suggestion = make_cached_suggestion(
        container=make_container(references=make_references(MAX_TRUNCATED_ITEMS + 1))
    )
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    references = page.get_by_test_id(f"suggestion-{suggestion.pk}-references")

    expect(references.get_by_role("link")).to_have_count(SHOWN_ITEMS)
    expect(references.get_by_role("navigation", name="References")).to_be_visible()
    expect(references.get_by_role("button", name="Next page")).to_be_visible()
    expect(references.get_by_role("button", name="Show more")).to_have_count(0)


@pytest.mark.django_db
def test_removing_only_item_of_last_page_goes_back_a_page(
    live_server: LiveServer,
    as_committer: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Ignoring the only reference of the last page shows the previous, full page."""
    full_pages = MAX_TRUNCATED_ITEMS // SHOWN_ITEMS + 1
    suggestion = make_cached_suggestion(
        container=make_container(
            references=make_references(full_pages * SHOWN_ITEMS + 1)
        ),
        status=CVEDerivationClusterProposal.Status.PENDING,
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    references = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-references")

    for _ in range(full_pages):
        references.get_by_role("button", name="Next page").click()
    expect(references.get_by_role("button", name="Ignore", exact=True)).to_have_count(1)

    references.get_by_role("button", name="Ignore", exact=True).click()

    expect(references.get_by_role("button", name="Ignore", exact=True)).to_have_count(
        SHOWN_ITEMS
    )


@pytest.mark.django_db
def test_ignore_and_restore_buttons_have_the_same_width(
    live_server: LiveServer,
    as_committer: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Ignore and Restore buttons are as wide, so that the items they act on stay aligned."""
    container = make_container(
        references=[
            ("Active", "https://example.com/active", []),
            ("Ignored", "https://example.com/ignored", []),
        ]
    )
    suggestion = make_cached_suggestion(
        container=container, status=CVEDerivationClusterProposal.Status.PENDING
    )
    suggestion.ignore_reference("https://example.com/ignored")
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    references = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-references")
    references.get_by_role("button", name="Ignored (").click()

    ignore = references.get_by_role("button", name="Ignore", exact=True).bounding_box()
    restore = references.get_by_role(
        "button", name="Restore", exact=True
    ).bounding_box()
    active = references.get_by_role("link", name="Active").bounding_box()
    ignored = references.get_by_role("link", name="Ignored").bounding_box()
    assert ignore and restore and active and ignored
    assert ignore["width"] == restore["width"]
    assert active["x"] == ignored["x"]
