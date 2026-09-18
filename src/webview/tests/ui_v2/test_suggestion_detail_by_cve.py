from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.linkage import CVEDerivationClusterProposal

from .routes import SUGGESTION_DETAIL_BY_CVE


def test_suggestion_detail_by_cve_redirects_to_canonical_url(
    live_server: LiveServer,
    page: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    page.goto(
        live_server.url + SUGGESTION_DETAIL_BY_CVE + f"/{cached_suggestion.cve.cve_id}"
    )
    expect(page).to_have_url(
        live_server.url + f"/ui-v2/suggestions/by-id/{cached_suggestion.pk}"
    )
    expect(page.get_by_text(cached_suggestion.cve.cve_id, exact=False)).to_be_visible()


def test_suggestion_detail_by_cve_not_found(
    live_server: LiveServer,
    page: Page,
) -> None:
    page.goto(live_server.url + SUGGESTION_DETAIL_BY_CVE + "/CVE-2099-9999")
    expect(page.get_by_text("Suggestion not found.")).to_be_visible()
