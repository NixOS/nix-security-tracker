from django.urls import reverse
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.cache_suggestions import cache_new_suggestions
from shared.models.linkage import (
    CVEDerivationClusterProposal,
)


def test_uncached_suggestion_not_visible(
    live_server: LiveServer,
    as_staff: Page,
    suggestion: CVEDerivationClusterProposal,
) -> None:
    response = as_staff.goto(
        live_server.url + reverse("webview:suggestion:untriaged_suggestions")
    )

    # 500 will also not have the element visible
    assert response
    assert response.status == 200
    expect(as_staff.locator(f"#suggestion-{suggestion.pk}")).not_to_be_visible()

    cache_new_suggestions(suggestion)

    as_staff.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))
    expect(as_staff.locator(f"#suggestion-{suggestion.pk}")).to_be_visible()


def test_uncached_suggestion_detail_cached_on_demand(
    live_server: LiveServer,
    as_staff: Page,
    suggestion: CVEDerivationClusterProposal,
) -> None:
    as_staff.goto(
        live_server.url
        + reverse(
            "webview:suggestion:detail",
            kwargs={"suggestion_id": suggestion.pk},
        )
    )
