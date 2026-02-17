from collections.abc import Callable
from urllib.parse import quote, urlencode

from django.urls import reverse
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.cve import Container
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import (
    NixDerivation,
)


def test_package_search_shows_matching_suggestions(
    live_server: LiveServer,
    as_staff: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    make_container: Callable[..., Container],
) -> None:
    """Test package search pages show only and all suggestions that have this package as non-ignored"""
    container1 = make_container(cve_id="CVE-2026-0001")
    container2 = make_container(cve_id="CVE-2026-0002")
    container3 = make_container(cve_id="CVE-2026-0003")
    package1 = make_drv(pname="foo")
    package2 = make_drv(pname="bar")
    suggestion1 = make_cached_suggestion(
        container=container1, drvs={package1: ProvenanceFlags.PACKAGE_NAME_MATCH}
    )
    suggestion2 = make_cached_suggestion(
        container=container2, drvs={package2: ProvenanceFlags.PACKAGE_NAME_MATCH}
    )
    suggestion3 = make_cached_suggestion(
        container=container3, drvs={package1: ProvenanceFlags.PACKAGE_NAME_MATCH}
    )

    # FIXME(@florentc): We ignore package1 from suggestion3 by hand through the
    # UI as a set up to this test. We'd like to use a method from the model
    # itself instead.
    as_staff.goto(
        live_server.url
        + reverse("webview:suggestion:detail", kwargs={"suggestion_id": suggestion3.pk})
    )
    suggestion3_active_packages = as_staff.locator(
        f"#suggestion-{suggestion3.pk}-active-packages"
    )
    ignore_package1_button = suggestion3_active_packages.locator(
        f".package-{package1.attribute}"
    ).get_by_role("button", name="Ignore")
    ignore_package1_button.click()
    expect(ignore_package1_button).not_to_be_visible()

    as_staff.goto(
        live_server.url
        + reverse(
            "webview:suggestion:suggestions_by_package",
            kwargs={"package_name": package1.attribute},
        )
    )

    # Active package in the suggestion
    expect(as_staff.locator(f"#suggestion-{suggestion1.pk}")).to_be_visible()
    # Not a package in the suggestion
    expect(as_staff.locator(f"#suggestion-{suggestion2.pk}")).not_to_be_visible()
    # Ignored package in the suggestion
    expect(as_staff.locator(f"#suggestion-{suggestion3.pk}")).not_to_be_visible()


def test_package_links_send_to_associated_package_search(
    live_server: LiveServer,
    as_staff: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """Test package links are present on suggestions and send to the associated package search page"""

    as_staff.goto(
        live_server.url
        + reverse(
            "webview:suggestion:detail", kwargs={"suggestion_id": cached_suggestion.pk}
        )
    )
    drv = cached_suggestion.derivations.first()
    assert drv

    as_staff.get_by_role("link", name=drv.attribute).click()

    # Check the search panel is present, mentioning the target package name
    expect(as_staff.locator("#search-panel")).to_be_visible()
    expect(
        as_staff.locator("#search-panel").get_by_text(drv.attribute, exact=True)
    ).to_be_visible()


def test_status_filters(
    live_server: LiveServer,
    as_staff: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    make_container: Callable[..., Container],
) -> None:
    """Test only the suggestions of the targeted status are shown on by-status pages"""

    # Such package names exist, and we quote them the same way when linking in the templates.
    drv = make_drv(pname=quote("nodePackages.@something/foo", safe=""))
    # Create suggestions, one in each status, all with the same package
    status_suggestion_map = {}
    for i, status in enumerate(CVEDerivationClusterProposal.Status, 1):
        container = make_container(cve_id=f"CVE-2026-000{i}")
        suggestion = make_cached_suggestion(
            container=container,
            drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH},
            status=status,
        )
        status_suggestion_map[status] = suggestion

    # Test each status filter for the by-package search
    for status in CVEDerivationClusterProposal.Status:
        # Go to the filtered-by-status page
        as_staff.goto(
            live_server.url
            + reverse(
                "webview:suggestion:suggestions_by_package",
                kwargs={
                    "package_name": drv.attribute,
                },
            )
            + "?"
            + urlencode({"status": status})
        )

        # Check only the suggestion with that status appears
        for target_status, suggestion in status_suggestion_map.items():
            locator = as_staff.locator(f"#suggestion-{suggestion.pk}")
            if status == target_status:
                expect(locator).to_be_visible()
            else:
                expect(locator).not_to_be_visible()


def test_no_matching_suggestion_returns_message(
    live_server: LiveServer,
    as_staff: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """Test that a message is shown when no suggestion matches a search"""

    drv = cached_suggestion.derivations.first()
    assert drv

    as_staff.goto(
        live_server.url
        + reverse(
            "webview:suggestion:suggestions_by_package",
            kwargs={"package_name": f"{drv.attribute}-nonexistent"},
        )
    )

    # Check the search panel is present, mentioning no search result
    expect(as_staff.locator("#search-panel")).to_be_visible()
    expect(
        as_staff.locator("#search-panel").get_by_text("No matching suggestions found")
    ).to_be_visible()
