from collections.abc import Callable

import pytest
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.linkage import CVEDerivationClusterProposal, ProvenanceFlags
from shared.models.nix_evaluation import NixDerivation, NixMaintainer

from .routes import SUGGESTION_DETAIL, SUGGESTION_LIST

PACKAGE_ATTRIBUTE = "package1"


@pytest.fixture
def suggestion_with_package(
    make_drv: Callable[..., NixDerivation],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> Callable[..., CVEDerivationClusterProposal]:
    def wrapped(**kwargs: object) -> CVEDerivationClusterProposal:
        drv = make_drv(pname=PACKAGE_ATTRIBUTE)
        return make_cached_suggestion(
            drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH}, **kwargs
        )

    return wrapped


@pytest.mark.django_db
def test_package_no_ignore_button_for_anonymous(
    live_server: LiveServer,
    page: Page,
    suggestion_with_package: Callable[..., CVEDerivationClusterProposal],
) -> None:
    suggestion = suggestion_with_package()
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    packages = page.get_by_test_id(f"suggestion-{suggestion.pk}-packages")
    expect(packages.get_by_text(PACKAGE_ATTRIBUTE)).to_be_visible()
    expect(packages.get_by_role("button", name="Ignore")).to_be_hidden()


@pytest.mark.django_db
def test_package_ignore_button_visible_for_committer(
    live_server: LiveServer,
    as_committer: Page,
    suggestion_with_package: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Committers see the Ignore action for an active package on an editable suggestion."""
    suggestion = suggestion_with_package(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    packages = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-packages")
    expect(packages.get_by_role("button", name="Ignore")).to_be_visible()


@pytest.mark.django_db
def test_package_ignore_button_hidden_when_suggestion_rejected(
    live_server: LiveServer,
    as_committer: Page,
    suggestion_with_package: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Once a suggestion is rejected (frozen), packages can no longer be edited."""
    suggestion = suggestion_with_package(
        status=CVEDerivationClusterProposal.Status.REJECTED
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    packages = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-packages")
    expect(packages.get_by_text(PACKAGE_ATTRIBUTE)).to_be_visible()
    expect(packages.get_by_role("button", name="Ignore")).to_be_hidden()


@pytest.mark.django_db
def test_package_ignore_moves_to_ignored_section_and_logs_activity(
    live_server: LiveServer,
    as_committer: Page,
    suggestion_with_package: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Clicking Ignore moves the package into the Ignored packages section
    and records an activity log entry."""
    suggestion = suggestion_with_package(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    packages = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-packages")

    packages.get_by_role("button", name="Ignore").click()

    expect(packages.get_by_text("Ignored packages", exact=False)).to_be_visible()
    packages.get_by_text("Ignored packages", exact=False).click()
    expect(packages.get_by_role("button", name="Restore")).to_be_visible()

    activity_log = as_committer.get_by_test_id(
        f"suggestion-{suggestion.pk}-activity-log"
    )
    activity_log.locator("summary").click()
    expect(activity_log.get_by_text("ignored package", exact=False)).to_be_visible()


@pytest.mark.django_db
def test_package_restore_moves_back_to_active_section(
    live_server: LiveServer,
    as_committer: Page,
    suggestion_with_package: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Clicking Restore on an ignored package moves it back to the active list."""
    suggestion = suggestion_with_package(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    packages = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-packages")

    packages.get_by_role("button", name="Ignore").click()
    packages.get_by_text("Ignored packages", exact=False).click()
    expect(packages.get_by_role("button", name="Restore")).to_be_visible()

    packages.get_by_role("button", name="Restore").click()

    expect(packages.get_by_role("button", name="Ignore")).to_be_visible()
    expect(packages.get_by_text("Ignored packages", exact=False)).to_be_hidden()


@pytest.mark.django_db
def test_package_ignore_shows_error_toast_on_backend_mismatch(
    live_server: LiveServer,
    as_committer: Page,
    suggestion_with_package: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """If the package was already ignored server-side (e.g. by another
    committer, or a stale tab) by the time the user clicks Ignore, the
    optimistic update is rolled back and an error message is shown."""
    suggestion = suggestion_with_package(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    packages = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-packages")
    expect(packages.get_by_role("button", name="Ignore")).to_be_visible()

    # Simulate a UI/backend mismatch
    suggestion.ignore_package(PACKAGE_ATTRIBUTE)

    packages.get_by_role("button", name="Ignore").click()

    expect(as_committer.get_by_text("Package already ignored")).to_be_visible()
    expect(
        as_committer.get_by_text("The suggestion might have been stale.", exact=False)
    ).to_be_visible()

    # The suggestion is supposed to have been refreshed so the package should be ignored now
    expect(packages.get_by_text("Ignored packages", exact=False)).to_be_visible()


@pytest.mark.django_db
def test_package_ignore_removes_solo_maintainer_from_active_list(
    live_server: LiveServer,
    as_committer: Page,
    make_drv: Callable[..., NixDerivation],
    make_maintainer: Callable[..., NixMaintainer],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Ignoring the only package a maintainer is associated with drops it from the active maintainers.
    Restoring the package brings it back."""
    solo_maintainer = make_maintainer(github_id=999, github="solo")
    other_maintainer = make_maintainer(github_id=998, github="other")
    drv1 = make_drv(pname=PACKAGE_ATTRIBUTE, maintainer=solo_maintainer)
    drv2 = make_drv(pname="package2", maintainer=other_maintainer)
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING,
        drvs={
            drv1: ProvenanceFlags.PACKAGE_NAME_MATCH,
            drv2: ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    maintainers = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-maintainers")
    packages = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-packages")

    expect(maintainers.get_by_text(f"@{solo_maintainer.github}")).to_be_visible()
    expect(maintainers.get_by_text(f"@{other_maintainer.github}")).to_be_visible()

    package1_item = packages.get_by_role("listitem").filter(has_text=PACKAGE_ATTRIBUTE)
    package1_item.get_by_role("button", name="Ignore").click()

    expect(maintainers.get_by_text(f"@{solo_maintainer.github}")).to_be_hidden()
    expect(maintainers.get_by_text(f"@{other_maintainer.github}")).to_be_visible()

    packages.get_by_text("Ignored packages", exact=False).click()
    package1_item = packages.get_by_role("listitem").filter(has_text=PACKAGE_ATTRIBUTE)
    package1_item.get_by_role("button", name="Restore").click()

    expect(maintainers.get_by_text(f"@{solo_maintainer.github}")).to_be_visible()
    expect(maintainers.get_by_text(f"@{other_maintainer.github}")).to_be_visible()


@pytest.mark.django_db
def test_package_restore_brings_back_maintainer_in_ignored_section_if_it_was_ignored(
    live_server: LiveServer,
    as_committer: Page,
    make_drv: Callable[..., NixDerivation],
    make_maintainer: Callable[..., NixMaintainer],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Regression test: a maintainer that was ignored, and later becomes an
    orphan (all its packages get ignored), must reappear under "Ignored
    maintainers" — not "active" — once one of its packages is restored."""
    maintainer = make_maintainer(github_id=999, github="solo")
    drv1 = make_drv(pname=PACKAGE_ATTRIBUTE, maintainer=maintainer)
    drv2 = make_drv(pname="package2", maintainer=maintainer)
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PENDING,
        drvs={
            drv1: ProvenanceFlags.PACKAGE_NAME_MATCH,
            drv2: ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    maintainers = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-maintainers")
    packages = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-packages")

    # Ignore the maintainer while it still has active packages.
    maintainers.get_by_role("button", name="Ignore").click()
    expect(maintainers.get_by_text("Ignored maintainers", exact=False)).to_be_visible()

    # Ignore both of its packages, making it an orphan: it disappears entirely.
    package1_item = packages.get_by_role("listitem").filter(has_text=PACKAGE_ATTRIBUTE)
    package1_item.get_by_role("button", name="Ignore").click()
    expect(packages.get_by_text("Ignored packages", exact=False)).to_be_visible()
    packages.get_by_text("Ignored packages", exact=False).click()
    expect(
        packages.get_by_role("listitem")
        .filter(has_text=PACKAGE_ATTRIBUTE)
        .get_by_role("button", name="Restore")
    ).to_be_visible()

    package2_item = packages.get_by_role("listitem").filter(has_text="package2")
    package2_item.get_by_role("button", name="Ignore").click()
    expect(
        packages.get_by_role("listitem")
        .filter(has_text="package2")
        .get_by_role("button", name="Restore")
    ).to_be_visible()

    # Both packages ignored: the maintainer is orphan, hidden from both the
    # active and ignored sections (the "Ignored maintainers" accordion itself
    # disappears, since it has no visible entries left).
    expect(maintainers.get_by_text(f"@{maintainer.github}")).to_be_hidden()
    expect(maintainers.get_by_text("Ignored maintainers", exact=False)).to_be_hidden()

    # Restore one of the packages: the maintainer must reappear as ignored.
    ignored_package1_item = packages.get_by_role("listitem").filter(
        has_text=PACKAGE_ATTRIBUTE
    )
    ignored_package1_item.get_by_role("button", name="Restore").click()

    expect(maintainers.get_by_text("Ignored maintainers", exact=False)).to_be_visible()
    maintainers.get_by_text("Ignored maintainers", exact=False).click()
    ignored_maintainer_item = maintainers.get_by_role("listitem").filter(
        has_text=f"@{maintainer.github}"
    )
    expect(ignored_maintainer_item).to_be_visible()
    expect(
        ignored_maintainer_item.get_by_role("button", name="Restore")
    ).to_be_visible()


@pytest.mark.django_db
def test_package_ignore_from_list_updates_the_list_card(
    live_server: LiveServer,
    as_committer: Page,
    suggestion_with_package: Callable[..., CVEDerivationClusterProposal],
) -> None:
    suggestion = suggestion_with_package(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_LIST)
    card = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}")
    packages = card.get_by_test_id(f"suggestion-{suggestion.pk}-packages")

    packages.get_by_role("button", name="Ignore").click()

    expect(packages.get_by_text("Ignored packages", exact=False)).to_be_visible()
    packages.get_by_text("Ignored packages", exact=False).click()
    expect(packages.get_by_role("button", name="Restore")).to_be_visible()
