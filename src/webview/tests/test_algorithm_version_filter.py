from collections.abc import Callable

import pytest
from django.urls import reverse
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.cve import Container
from shared.models.linkage import CVEDerivationClusterProposal, ProvenanceFlags
from shared.models.nix_evaluation import NixDerivation


@pytest.mark.parametrize(
    "url_path, status",
    [
        (
            reverse("webview:suggestion:untriaged_suggestions"),
            CVEDerivationClusterProposal.Status.PENDING,
        ),
        (
            reverse("webview:suggestion:accepted_suggestions"),
            CVEDerivationClusterProposal.Status.ACCEPTED,
        ),
        (
            reverse("webview:suggestion:dismissed_suggestions"),
            CVEDerivationClusterProposal.Status.REJECTED,
        ),
    ],
)
def test_list_view_shows_active_version_only(
    live_server: LiveServer,
    as_staff: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    make_container: Callable[..., Container],
    url_path: str,
    status: CVEDerivationClusterProposal.Status,
) -> None:
    """Current-version proposal is visible, outdated-version proposal is not."""
    drv = make_drv()

    current_container = make_container(cve_id="CVE-2025-1001")
    current_proposal = make_cached_suggestion(
        container=current_container,
        drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH},
        status=status,
    )

    outdated_container = make_container(cve_id="CVE-2025-1002")
    outdated_drv = make_drv(pname="outdated-pkg", attribute="outdated-pkg")
    outdated_proposal = make_cached_suggestion(
        container=outdated_container,
        drvs={outdated_drv: ProvenanceFlags.PACKAGE_NAME_MATCH},
        status=status,
        algorithm_version=CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION - 1,  # type: ignore
    )

    as_staff.goto(live_server.url + url_path)

    expect(as_staff.locator(f"#suggestion-{current_proposal.pk}")).to_be_visible()
    expect(as_staff.locator(f"#suggestion-{outdated_proposal.pk}")).not_to_be_visible()


def test_by_package_view_shows_active_version_only(
    live_server: LiveServer,
    as_staff: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    make_container: Callable[..., Container],
) -> None:
    """The by-package view also filters by active algorithm version."""
    shared_drv = make_drv(pname="shared-pkg", attribute="shared-pkg")

    current_container = make_container(cve_id="CVE-2025-2001")
    current_proposal = make_cached_suggestion(
        container=current_container,
        drvs={shared_drv: ProvenanceFlags.PACKAGE_NAME_MATCH},
    )

    outdated_container = make_container(cve_id="CVE-2025-2002")
    outdated_proposal = make_cached_suggestion(
        container=outdated_container,
        drvs={shared_drv: ProvenanceFlags.PACKAGE_NAME_MATCH},
        algorithm_version=CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION - 1,  # type: ignore
    )

    url = reverse(
        "webview:suggestion:suggestions_by_package",
        kwargs={"package_name": shared_drv.attribute},
    )
    as_staff.goto(live_server.url + url)

    expect(as_staff.locator(f"#suggestion-{current_proposal.pk}")).to_be_visible()
    expect(as_staff.locator(f"#suggestion-{outdated_proposal.pk}")).not_to_be_visible()
