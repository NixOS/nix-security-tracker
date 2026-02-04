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
