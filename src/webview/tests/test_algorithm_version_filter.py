from collections.abc import Callable

from django.urls import reverse
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.linkage import CVEDerivationClusterProposal
from shared.models.nix_evaluation import NixDerivation

_OUTDATED_VERSION: int = (
    CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION - 1  # type: ignore
)


def test_untriaged_list_shows_active_version_only(
    live_server: LiveServer,
    as_staff: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Only current-version proposals appear on the untriaged (pending) list."""

    current_proposal = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING,
    )

    outdated_proposal = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING,
        algorithm_version=_OUTDATED_VERSION,
    )

    as_staff.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))

    expect(as_staff.locator(f"#suggestion-{current_proposal.pk}")).to_be_visible()
    expect(as_staff.locator(f"#suggestion-{outdated_proposal.pk}")).not_to_be_visible()


def test_list_by_package_shows_target_propospals_only(
    live_server: LiveServer,
    as_staff: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    drv: NixDerivation,
) -> None:
    """Only current-version proposals appear on the untriaged (pending) list."""
    current_proposal = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING,
    )
    accepted_outdated = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        algorithm_version=_OUTDATED_VERSION,
    )

    outdated_proposal = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING,
        algorithm_version=_OUTDATED_VERSION,
    )

    as_staff.goto(
        live_server.url
        + reverse("webview:suggestion:suggestions_by_package", args=[drv.attribute])
    )

    expect(as_staff.locator(f"#suggestion-{current_proposal.pk}")).to_be_visible()
    expect(as_staff.locator(f"#suggestion-{accepted_outdated.pk}")).to_be_visible()
    expect(as_staff.locator(f"#suggestion-{outdated_proposal.pk}")).not_to_be_visible()


def test_accepted_and_dismissed_lists_show_all_versions(
    live_server: LiveServer,
    as_staff: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Accepted and dismissed lists show proposals from any algorithm version."""
    accepted_outdated = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        algorithm_version=_OUTDATED_VERSION,
    )

    dismissed_outdated = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.REJECTED,
        algorithm_version=_OUTDATED_VERSION,
    )

    as_staff.goto(live_server.url + reverse("webview:suggestion:accepted_suggestions"))
    expect(as_staff.locator(f"#suggestion-{accepted_outdated.pk}")).to_be_visible()

    as_staff.goto(live_server.url + reverse("webview:suggestion:dismissed_suggestions"))
    expect(as_staff.locator(f"#suggestion-{dismissed_outdated.pk}")).to_be_visible()
