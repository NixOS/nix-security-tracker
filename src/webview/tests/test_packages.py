from collections.abc import Callable

import pytest
from django.contrib.auth.models import User
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
        (CVEDerivationClusterProposal.Status.PENDING, True, "suggestions"),
        (CVEDerivationClusterProposal.Status.REJECTED, False, "dismissed"),
        (CVEDerivationClusterProposal.Status.ACCEPTED, True, "drafts"),
    ],
)
def test_package_removal(
    live_server: LiveServer,
    staff: User,
    as_staff: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    editable: bool,
    status: CVEDerivationClusterProposal.Status,
    endpoint: str,
    no_js: bool,
) -> None:
    """Test removing a package permanently"""
    drv1 = make_drv(pname="package1")
    drv2 = make_drv(pname="package2")
    suggestion = make_cached_suggestion(
        status=status,
        drvs={
            drv1: ProvenanceFlags.PACKAGE_NAME_MATCH,
            drv2: ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
    )

    as_staff.goto(live_server.url + reverse(f"webview:{endpoint}_view"))
    matches = as_staff.locator(f"#nixpkgs-matches-{suggestion.pk}")
    expect(matches.get_by_text("package1")).to_be_visible()
    expect(matches.get_by_text("package2")).to_be_visible()

    checkbox = as_staff.locator('input[value="package1"]')

    if not editable:
        expect(checkbox).not_to_be_visible()
        return
    else:
        if no_js:
            checkbox.uncheck()
            purge = as_staff.get_by_role("button", name="Purge deleted packages")
            purge.click()
        else:
            # FIXME(@fricklerhandwerk): There's currently no visible indication whether the action is done.
            with as_staff.expect_response(
                live_server.url + reverse(f"webview:{endpoint}_view")
            ):
                checkbox.uncheck()
            as_staff.reload()

    expect(matches.get_by_text("package1")).not_to_be_visible()
    expect(matches.get_by_text("package2")).to_be_visible()


@pytest.mark.parametrize(
    "status, editable, endpoint",
    [
        (CVEDerivationClusterProposal.Status.PENDING, True, "suggestions"),
        (CVEDerivationClusterProposal.Status.REJECTED, False, "dismissed"),
        (CVEDerivationClusterProposal.Status.ACCEPTED, True, "drafts"),
    ],
)
def test_restore_package(
    live_server: LiveServer,
    staff: User,
    as_staff: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    editable: bool,
    status: CVEDerivationClusterProposal.Status,
    endpoint: str,
    no_js: bool,
) -> None:
    """Test removing a package from a suggestion in pending status (editable)"""
    drv1 = make_drv(pname="package1")
    drv2 = make_drv(pname="package2")
    suggestion = make_cached_suggestion(
        status=status,
        drvs={
            drv1: ProvenanceFlags.PACKAGE_NAME_MATCH,
            drv2: ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
    )

    as_staff.goto(live_server.url + reverse(f"webview:{endpoint}_view"))
    matches = as_staff.locator(f"#nixpkgs-matches-{suggestion.pk}")
    expect(matches.get_by_text("package1")).to_be_visible()
    expect(matches.get_by_text("package2")).to_be_visible()

    checkbox = as_staff.locator('input[value="package1"]')

    if not editable:
        expect(checkbox).not_to_be_visible()
        return
    else:
        if no_js:
            checkbox.uncheck()
            checkbox.check()
            purge = as_staff.get_by_role("button", name="Purge deleted packages")
            purge.click()
        else:
            # FIXME(@fricklerhandwerk): There's currently no visible indication whether the action is done.
            with as_staff.expect_response(
                live_server.url + reverse(f"webview:{endpoint}_view")
            ):
                checkbox.uncheck()
            with as_staff.expect_response(
                live_server.url + reverse(f"webview:{endpoint}_view")
            ):
                checkbox.check()
            as_staff.reload()

    expect(matches.get_by_text("package1")).to_be_visible()
    expect(matches.get_by_text("package2")).to_be_visible()
