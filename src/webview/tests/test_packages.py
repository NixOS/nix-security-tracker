import re
from collections.abc import Callable

import pytest
from django.urls import reverse
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.linkage import (
    CVEDerivationClusterProposal,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import (
    NixDerivation,
)


@pytest.mark.parametrize(
    "status, editable, endpoint",
    [
        (CVEDerivationClusterProposal.Status.PENDING, True, "untriaged_suggestions"),
        (CVEDerivationClusterProposal.Status.REJECTED, False, "dismissed_suggestions"),
        (CVEDerivationClusterProposal.Status.ACCEPTED, True, "accepted_suggestions"),
        (CVEDerivationClusterProposal.Status.PENDING, True, "detail"),
        (CVEDerivationClusterProposal.Status.REJECTED, False, "detail"),
        (CVEDerivationClusterProposal.Status.ACCEPTED, True, "detail"),
    ],
)
def test_ignore_restore_package(
    live_server: LiveServer,
    as_staff: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    editable: bool,
    status: CVEDerivationClusterProposal.Status,
    endpoint: str,
) -> None:
    """Test ignoring and restoring a package"""
    drv1 = make_drv(pname="package1")
    drv2 = make_drv(pname="package2")
    suggestion = make_cached_suggestion(
        status=status,
        drvs={
            drv1: ProvenanceFlags.PACKAGE_NAME_MATCH,
            drv2: ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
    )

    if endpoint == "detail":
        as_staff.goto(
            live_server.url
            + reverse(
                "webview:suggestion:detail", kwargs={"suggestion_id": suggestion.pk}
            )
        )
    else:
        as_staff.goto(live_server.url + reverse(f"webview:suggestion:{endpoint}"))

    # Check both packages are initially visible under active packages
    active_packages = as_staff.locator(f"#suggestion-{suggestion.pk}-active-packages")
    ignored_packages = as_staff.locator(f"#suggestion-{suggestion.pk}-ignored-packages")
    expect(active_packages.get_by_text("package1")).to_be_visible()
    expect(active_packages.get_by_text("package2")).to_be_visible()
    expect(ignored_packages).not_to_be_visible()

    ignore_package1_button = active_packages.locator(".package-package1").get_by_role(
        "button", name="Ignore"
    )

    if not editable:
        # Expect no ignore button to be visible if edition is disallowed
        expect(ignore_package1_button).not_to_be_visible()
        return
    else:
        # Click ignore and open the list of ignored packages
        ignore_package1_button.click()
        as_staff.locator(f"#suggestion-{suggestion.pk}").get_by_text(
            re.compile("Ignored packages"),
        ).click()

    # Check package 1 now appears under the ignored packages
    expect(active_packages.get_by_text("package1")).not_to_be_visible()
    expect(active_packages.get_by_text("package2")).to_be_visible()
    expect(ignored_packages.get_by_text("package1")).to_be_visible()

    # Click restore on package 1
    restore_package1_button = ignored_packages.locator(".package-package1").get_by_role(
        "button", name="Restore"
    )
    restore_package1_button.click()

    # Expect to be back in initial state
    expect(active_packages.get_by_text("package1")).to_be_visible()
    expect(active_packages.get_by_text("package2")).to_be_visible()
    expect(ignored_packages).not_to_be_visible()


def test_ignore_multiple_packages(
    live_server: LiveServer,
    as_staff: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
) -> None:
    """Ignoring packages one by one keeps all of them in the ignored section."""
    drv1 = make_drv(pname="alpha")
    drv2 = make_drv(pname="bravo")
    drv3 = make_drv(pname="charlie")
    suggestion = make_cached_suggestion(
        drvs={
            drv1: ProvenanceFlags.PACKAGE_NAME_MATCH,
            drv2: ProvenanceFlags.PACKAGE_NAME_MATCH,
            drv3: ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
    )

    as_staff.goto(
        live_server.url
        + reverse("webview:suggestion:detail", kwargs={"suggestion_id": suggestion.pk})
    )

    active = as_staff.locator(f"#suggestion-{suggestion.pk}-active-packages")
    ignored = as_staff.locator(f"#suggestion-{suggestion.pk}-ignored-packages")
    container = as_staff.locator(f"#suggestion-{suggestion.pk}")

    # Ignore alpha
    active.locator(".package-alpha").get_by_role("button", name="Ignore").click()
    container.get_by_text(re.compile("Ignored packages")).click()
    expect(ignored.get_by_text("alpha")).to_be_visible()
    expect(active.get_by_text("bravo")).to_be_visible()
    expect(active.get_by_text("charlie")).to_be_visible()

    # Ignore bravo
    active.locator(".package-bravo").get_by_role("button", name="Ignore").click()
    expect(active.get_by_text("bravo")).not_to_be_visible()
    container.get_by_text("Ignored packages").click()
    expect(ignored.get_by_text("alpha")).to_be_visible()
    expect(ignored.get_by_text("bravo")).to_be_visible()
    expect(active.get_by_text("charlie")).to_be_visible()

    # Only charlie remains active
    expect(active.get_by_text("alpha")).not_to_be_visible()
    expect(active.get_by_text("bravo")).not_to_be_visible()


def test_restore_one_of_multiple_ignored_packages(
    live_server: LiveServer,
    as_staff: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
) -> None:
    """Restoring one ignored package does not affect other ignored packages."""
    drv1 = make_drv(pname="alpha")
    drv2 = make_drv(pname="bravo")
    drv3 = make_drv(pname="charlie")
    suggestion = make_cached_suggestion(
        drvs={
            drv1: ProvenanceFlags.PACKAGE_NAME_MATCH,
            drv2: ProvenanceFlags.PACKAGE_NAME_MATCH,
            drv3: ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
    )

    as_staff.goto(
        live_server.url
        + reverse("webview:suggestion:detail", kwargs={"suggestion_id": suggestion.pk})
    )

    active = as_staff.locator(f"#suggestion-{suggestion.pk}-active-packages")
    ignored = as_staff.locator(f"#suggestion-{suggestion.pk}-ignored-packages")
    container = as_staff.locator(f"#suggestion-{suggestion.pk}")

    # Ignore both alpha and bravo
    active.locator(".package-alpha").get_by_role("button", name="Ignore").click()
    container.get_by_text(re.compile("Ignored packages")).click()
    active.locator(".package-bravo").get_by_role("button", name="Ignore").click()
    expect(active.get_by_text("bravo")).not_to_be_visible()

    # Restore only alpha
    ignored.click()
    ignored.locator(".package-alpha").get_by_role("button", name="Restore").click()
    expect(ignored.get_by_text("alpha")).not_to_be_visible()

    expect(active.get_by_text("alpha")).to_be_visible()
    expect(active.get_by_text("charlie")).to_be_visible()
    # Expand the ignored packages section before asserting since it will close due to re-render
    container.get_by_text("Ignored packages").click()
    expect(ignored.get_by_text("bravo")).to_be_visible()
    expect(active.get_by_text("bravo")).not_to_be_visible()


def test_ignored_packages_persist_across_page_load(
    live_server: LiveServer,
    as_staff: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
) -> None:
    """Ignored packages remain ignored after navigating away and back."""
    drv1 = make_drv(pname="alpha")
    drv2 = make_drv(pname="bravo")
    suggestion = make_cached_suggestion(
        drvs={
            drv1: ProvenanceFlags.PACKAGE_NAME_MATCH,
            drv2: ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
    )

    detail_url = live_server.url + reverse(
        "webview:suggestion:detail", kwargs={"suggestion_id": suggestion.pk}
    )
    as_staff.goto(detail_url)

    active = as_staff.locator(f"#suggestion-{suggestion.pk}-active-packages")

    # Ignore bravo
    active.locator(".package-bravo").get_by_role("button", name="Ignore").click()
    expect(active.get_by_text("bravo")).not_to_be_visible()

    # Navigate away and back
    as_staff.goto(detail_url)

    active = as_staff.locator(f"#suggestion-{suggestion.pk}-active-packages")
    ignored = as_staff.locator(f"#suggestion-{suggestion.pk}-ignored-packages")

    expect(active.get_by_text("alpha")).to_be_visible()
    expect(active.get_by_text("bravo")).not_to_be_visible()

    # Open ignored section and verify bravo is there
    as_staff.locator(f"#suggestion-{suggestion.pk}").get_by_text(
        re.compile("Ignored packages")
    ).click()
    expect(ignored.get_by_text("bravo")).to_be_visible()
