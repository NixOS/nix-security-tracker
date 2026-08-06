from collections.abc import Callable

import pytest
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.linkage import CVEDerivationClusterProposal
from shared.models.nix_evaluation import NixMaintainer

from .routes import SUGGESTION_DETAIL, SUGGESTION_LIST


@pytest.mark.django_db
def test_maintainer_no_ignore_button_for_anonymous(
    live_server: LiveServer,
    page: Page,
    cached_suggestion: CVEDerivationClusterProposal,
    maintainer: NixMaintainer,
) -> None:
    """Anonymous users can see maintainers but not the Ignore action."""
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{cached_suggestion.pk}")
    maintainers = page.get_by_test_id(f"suggestion-{cached_suggestion.pk}-maintainers")
    expect(maintainers.get_by_text(f"@{maintainer.github}")).to_be_visible()
    expect(maintainers.get_by_role("button", name="Ignore")).to_be_hidden()


@pytest.mark.django_db
def test_maintainer_ignore_button_visible_for_committer(
    live_server: LiveServer,
    as_committer: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """Committers see the Ignore action for an active maintainer on an editable suggestion."""
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{cached_suggestion.pk}")
    maintainers = as_committer.get_by_test_id(
        f"suggestion-{cached_suggestion.pk}-maintainers"
    )
    expect(maintainers.get_by_role("button", name="Ignore")).to_be_visible()


@pytest.mark.django_db
def test_maintainer_ignore_button_hidden_when_suggestion_rejected(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    maintainer: NixMaintainer,
) -> None:
    """Once a suggestion is rejected (frozen), maintainers can no longer be edited."""
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.REJECTED
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    maintainers = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-maintainers")
    expect(maintainers.get_by_text(f"@{maintainer.github}")).to_be_visible()
    expect(maintainers.get_by_role("button", name="Ignore")).to_be_hidden()


@pytest.mark.django_db
def test_maintainer_ignore_moves_to_ignored_section_and_logs_activity(
    live_server: LiveServer,
    as_committer: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """Clicking Ignore moves the maintainer into the Ignored maintainers section
    and records an activity log entry."""
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{cached_suggestion.pk}")
    maintainers = as_committer.get_by_test_id(
        f"suggestion-{cached_suggestion.pk}-maintainers"
    )

    maintainers.get_by_role("button", name="Ignore").click()

    expect(maintainers.get_by_text("Ignored maintainers", exact=False)).to_be_visible()
    maintainers.get_by_text("Ignored maintainers", exact=False).click()
    expect(maintainers.get_by_role("button", name="Restore")).to_be_visible()

    activity_log = as_committer.get_by_test_id(
        f"suggestion-{cached_suggestion.pk}-activity-log"
    )
    activity_log.locator("summary").click()
    expect(activity_log.get_by_text("ignored maintainer", exact=False)).to_be_visible()


@pytest.mark.django_db
def test_maintainer_restore_moves_back_to_active_section(
    live_server: LiveServer,
    as_committer: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    """Clicking Restore on an ignored maintainer moves it back to the active list."""
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{cached_suggestion.pk}")
    maintainers = as_committer.get_by_test_id(
        f"suggestion-{cached_suggestion.pk}-maintainers"
    )

    maintainers.get_by_role("button", name="Ignore").click()
    maintainers.get_by_text("Ignored maintainers", exact=False).click()
    expect(maintainers.get_by_role("button", name="Restore")).to_be_visible()

    maintainers.get_by_role("button", name="Restore").click()

    expect(maintainers.get_by_role("button", name="Ignore")).to_be_visible()
    expect(maintainers.get_by_text("Ignored maintainers", exact=False)).to_be_hidden()


@pytest.mark.django_db
def test_maintainer_ignore_shows_error_toast_on_backend_mismatch(
    live_server: LiveServer,
    as_committer: Page,
    cached_suggestion: CVEDerivationClusterProposal,
    maintainer: NixMaintainer,
) -> None:
    """If the maintainer was already ignored server-side (e.g. by another
    committer, or a stale tab) by the time the user clicks Ignore, the
    optimistic update is rolled back and an error message is shown."""
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{cached_suggestion.pk}")
    maintainers = as_committer.get_by_test_id(
        f"suggestion-{cached_suggestion.pk}-maintainers"
    )
    expect(maintainers.get_by_role("button", name="Ignore")).to_be_visible()

    # Simulate a UI/backend mismatch
    cached_suggestion.ignore_maintainer(maintainer.github_id)

    maintainers.get_by_role("button", name="Ignore").click()

    expect(as_committer.get_by_text("Maintainer already ignored")).to_be_visible()
    expect(
        as_committer.get_by_text("The suggestion might have been stale.", exact=False)
    ).to_be_visible()

    # The suggestion is supposed to have been refreshed so the maintainer should be ignored now
    expect(maintainers.get_by_text("Ignored maintainers", exact=False)).to_be_visible()


@pytest.mark.django_db
def test_maintainer_ignore_from_list_updates_the_list_card(
    live_server: LiveServer,
    as_committer: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    as_committer.goto(live_server.url + SUGGESTION_LIST)
    card = as_committer.get_by_test_id(f"suggestion-{cached_suggestion.pk}")
    maintainers = card.get_by_test_id(f"suggestion-{cached_suggestion.pk}-maintainers")

    maintainers.get_by_role("button", name="Ignore").click()

    expect(maintainers.get_by_text("Ignored maintainers", exact=False)).to_be_visible()
    maintainers.get_by_text("Ignored maintainers", exact=False).click()
    expect(maintainers.get_by_role("button", name="Restore")).to_be_visible()
