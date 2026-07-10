from collections.abc import Callable

from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.cve import Container
from shared.models.linkage import CVEDerivationClusterProposal

from .routes import SUGGESTION_DETAIL


def test_suggestion_detail_loads(
    live_server: LiveServer,
    page: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """The suggestion detail page loads and shows the CVE ID."""
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{cached_suggestion.pk}")
    expect(page.get_by_text(cached_suggestion.cve.cve_id, exact=False)).to_be_visible()


def test_suggestion_detail_shows_status(
    live_server: LiveServer,
    page: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """The suggestion detail page shows the status label for a pending suggestion."""
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{cached_suggestion.pk}")
    expect(page.get_by_text("Untriaged")).to_be_visible()


def test_suggestion_detail_shows_references(
    live_server: LiveServer,
    page: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_container: Callable[..., Container],
) -> None:
    """The suggestion detail page shows references when the CVE has references."""
    container = make_container(references=[("Ref text", "https://example.com/ref", [])])
    suggestion = make_cached_suggestion(container=container)
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    expect(page.get_by_role("heading", name="References")).to_be_visible()
    expect(page.get_by_role("link", name="Ref text")).to_be_visible()


def test_suggestion_detail_shows_affected_products(
    live_server: LiveServer,
    page: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """The suggestion detail page shows the affected products section with product data.

    The default CVE fixture creates an AffectedProduct with package_name="foo".
    """
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{cached_suggestion.pk}")
    expect(page.get_by_role("heading", name="Affected products")).to_be_visible()
    package_name = next(iter(cached_suggestion.cached.payload["affected_products"]))
    expect(page.get_by_text(package_name, exact=True).first).to_be_visible()


def test_suggestion_detail_shows_packages(
    live_server: LiveServer,
    page: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """The suggestion detail page shows the packages section with the derivation attribute.

    The default drv fixture creates a NixDerivation with attribute="foo".
    """
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{cached_suggestion.pk}")
    expect(page.get_by_role("heading", name="Matching in nixpkgs")).to_be_visible()
    attribute = next(iter(cached_suggestion.cached.payload["packages"]))
    expect(page.get_by_role("heading", name=attribute, level=3)).to_be_visible()


def test_suggestion_detail_shows_maintainers(
    live_server: LiveServer,
    page: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """The suggestion detail page shows the maintainers section with maintainer data.

    The default drv fixture creates a NixDerivation with a maintainer with github="maintainer".
    """
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{cached_suggestion.pk}")
    expect(page.get_by_role("heading", name="Maintainers")).to_be_visible()
    github_handle = cached_suggestion.cached.payload["categorized_maintainers"][
        "active"
    ][0]["github"]
    expect(page.get_by_role("link", name=f"@{github_handle}")).to_be_visible()


def test_suggestion_detail_not_found(
    live_server: LiveServer,
    page: Page,
) -> None:
    """Browsing to a non-existent suggestion ID shows a not-found error."""
    page.goto(live_server.url + SUGGESTION_DETAIL + "/999999999")
    expect(page.get_by_text("Suggestion not found.")).to_be_visible()


def test_suggestion_detail_invalid_id(
    live_server: LiveServer,
    page: Page,
) -> None:
    """Browsing to a non-numeric suggestion ID shows an invalid ID error."""
    page.goto(live_server.url + SUGGESTION_DETAIL + "/not-a-number")
    expect(page.get_by_text("Invalid suggestion ID.")).to_be_visible()
