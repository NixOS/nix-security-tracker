from collections.abc import Callable

import pytest
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.cve import Container
from shared.models.linkage import CVEDerivationClusterProposal

from .routes import SUGGESTION_DETAIL

REFERENCE_URL = "https://example.com/advisory"
REFERENCE_NAME = "Advisory"


@pytest.fixture
def suggestion_with_reference(
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> Callable[..., CVEDerivationClusterProposal]:
    def wrapped(**kwargs: object) -> CVEDerivationClusterProposal:
        container = make_container(references=[(REFERENCE_NAME, REFERENCE_URL, [])])
        return make_cached_suggestion(container=container, **kwargs)

    return wrapped


@pytest.mark.django_db
def test_reference_no_ignore_button_for_anonymous(
    live_server: LiveServer,
    page: Page,
    suggestion_with_reference: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Anonymous users can see references but not the Ignore action."""
    suggestion = suggestion_with_reference()
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    references = page.get_by_test_id(f"suggestion-{suggestion.pk}-references")
    expect(references.get_by_role("link", name=REFERENCE_NAME)).to_be_visible()
    expect(references.get_by_role("button", name="Ignore")).to_be_hidden()


@pytest.mark.django_db
def test_reference_ignore_button_visible_for_committer(
    live_server: LiveServer,
    as_committer: Page,
    suggestion_with_reference: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Committers see the Ignore action for an active reference on an editable suggestion."""
    suggestion = suggestion_with_reference(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    references = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-references")
    expect(references.get_by_role("button", name="Ignore")).to_be_visible()


@pytest.mark.django_db
def test_reference_ignore_button_hidden_when_suggestion_rejected(
    live_server: LiveServer,
    as_committer: Page,
    suggestion_with_reference: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Once a suggestion is rejected (frozen), references can no longer be edited."""
    suggestion = suggestion_with_reference(
        status=CVEDerivationClusterProposal.Status.REJECTED
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    references = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-references")
    expect(references.get_by_role("link", name=REFERENCE_NAME)).to_be_visible()
    expect(references.get_by_role("button", name="Ignore")).to_be_hidden()


@pytest.mark.django_db
def test_reference_ignore_moves_to_ignored_section_and_logs_activity(
    live_server: LiveServer,
    as_committer: Page,
    suggestion_with_reference: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Clicking Ignore moves the reference into the Ignored references section
    and records an activity log entry."""
    suggestion = suggestion_with_reference(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    references = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-references")

    references.get_by_role("button", name="Ignore").click()

    expect(references.get_by_text("Ignored references", exact=False)).to_be_visible()
    references.get_by_text("Ignored references", exact=False).click()
    expect(references.get_by_role("button", name="Restore")).to_be_visible()

    activity_log = as_committer.get_by_test_id(
        f"suggestion-{suggestion.pk}-activity-log"
    )
    activity_log.locator("summary").click()
    expect(activity_log.get_by_text("ignored reference", exact=False)).to_be_visible()


@pytest.mark.django_db
def test_reference_restore_moves_back_to_active_section(
    live_server: LiveServer,
    as_committer: Page,
    suggestion_with_reference: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Clicking Restore on an ignored reference moves it back to the active list."""
    suggestion = suggestion_with_reference(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    references = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-references")

    references.get_by_role("button", name="Ignore").click()
    references.get_by_text("Ignored references", exact=False).click()
    expect(references.get_by_role("button", name="Restore")).to_be_visible()

    references.get_by_role("button", name="Restore").click()

    expect(references.get_by_role("button", name="Ignore")).to_be_visible()
    expect(references.get_by_text("Ignored references", exact=False)).to_be_hidden()


@pytest.mark.django_db
def test_reference_ignore_shows_error_toast_on_backend_mismatch(
    live_server: LiveServer,
    as_committer: Page,
    suggestion_with_reference: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """If the reference was already ignored server-side (e.g. by another
    committer, or a stale tab) by the time the user clicks Ignore, the
    optimistic update is rolled back and an error message is shown."""
    suggestion = suggestion_with_reference(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    references = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-references")
    expect(references.get_by_role("button", name="Ignore")).to_be_visible()

    # Simulate a UI/backend mismatch
    suggestion.ignore_reference(REFERENCE_URL)

    references.get_by_role("button", name="Ignore").click()

    expect(as_committer.get_by_text("Reference already ignored")).to_be_visible()
    expect(
        as_committer.get_by_text("The suggestion might have been stale.", exact=False)
    ).to_be_visible()

    # The suggestion is supposed to have been refreshed so the reference should be ignored now
    expect(references.get_by_text("Ignored references", exact=False)).to_be_visible()
