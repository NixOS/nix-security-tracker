from collections.abc import Callable

import pytest
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.cve import Container
from shared.models.linkage import CVEDerivationClusterProposal

from .routes import SUGGESTION_DETAIL, SUGGESTION_LIST

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
    expect(references.get_by_role("button", name="Ignore", exact=True)).to_be_hidden()


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
    expect(references.get_by_role("button", name="Ignore", exact=True)).to_be_visible()


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
    expect(references.get_by_role("button", name="Ignore", exact=True)).to_be_hidden()


@pytest.mark.django_db
def test_reference_ignore_moves_to_ignored_section_and_logs_activity(
    live_server: LiveServer,
    as_committer: Page,
    suggestion_with_reference: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Clicking Ignore hides the reference among ignored ones
    and records an activity log entry."""
    suggestion = suggestion_with_reference(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    references = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-references")

    references.get_by_role("button", name="Ignore", exact=True).click()

    expect(
        references.get_by_role("button", name="Ignored (1)", exact=True)
    ).to_be_visible()
    references.get_by_role("button", name="Ignored (").click()
    expect(references.get_by_role("button", name="Restore")).to_be_visible()

    activity_log_toggle = as_committer.get_by_test_id(
        f"suggestion-{suggestion.pk}-activity-log-toggle"
    )
    activity_log_toggle.click()
    activity_log = as_committer.get_by_test_id(
        f"suggestion-{suggestion.pk}-activity-log"
    )
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

    references.get_by_role("button", name="Ignore", exact=True).click()
    references.get_by_role("button", name="Ignored (").click()
    expect(references.get_by_role("button", name="Restore")).to_be_visible()

    references.get_by_role("button", name="Restore").click()

    expect(references.get_by_role("button", name="Ignore", exact=True)).to_be_visible()
    expect(
        references.get_by_role("button", name="Ignored (0)", exact=True)
    ).to_be_visible()


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
    expect(references.get_by_role("button", name="Ignore", exact=True)).to_be_visible()

    # Simulate a UI/backend mismatch
    suggestion.ignore_reference(REFERENCE_URL)

    references.get_by_role("button", name="Ignore", exact=True).click()

    expect(as_committer.get_by_text("Reference already ignored")).to_be_visible()
    expect(
        as_committer.get_by_text("The suggestion might have been stale.", exact=False)
    ).to_be_visible()

    # The suggestion is supposed to have been refreshed so the reference should be ignored now
    expect(
        references.get_by_role("button", name="Ignored (1)", exact=True)
    ).to_be_visible()


@pytest.mark.django_db
def test_reference_ignore_from_list_updates_the_list_card(
    live_server: LiveServer,
    as_committer: Page,
    suggestion_with_reference: Callable[..., CVEDerivationClusterProposal],
) -> None:
    suggestion = suggestion_with_reference(
        status=CVEDerivationClusterProposal.Status.PENDING
    )
    as_committer.goto(live_server.url + SUGGESTION_LIST)
    card = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}")
    references = card.get_by_test_id(f"suggestion-{suggestion.pk}-references")

    references.get_by_role("button", name="Ignore", exact=True).click()

    expect(
        references.get_by_role("button", name="Ignored (1)", exact=True)
    ).to_be_visible()
    references.get_by_role("button", name="Ignored (").click()
    expect(references.get_by_role("button", name="Restore")).to_be_visible()


@pytest.mark.django_db
def test_ignored_references_are_hidden_until_shown(
    live_server: LiveServer,
    page: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Ignored references are hidden by default, and shown on demand."""
    container = make_container(
        references=[
            ("Active", "https://example.com/active", []),
            ("Ignored", "https://example.com/ignored", []),
        ]
    )
    suggestion = make_cached_suggestion(container=container)
    suggestion.ignore_reference("https://example.com/ignored")
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    references = page.get_by_test_id(f"suggestion-{suggestion.pk}-references")

    expect(references.get_by_role("link")).to_have_count(1)
    expect(references.get_by_role("link", name="Active")).to_be_visible()
    expect(references.get_by_role("link", name="Ignored")).to_have_count(0)

    references.get_by_role("button", name="Ignored (1)", exact=True).click()

    expect(references.get_by_role("link")).to_have_count(2)
    expect(references.get_by_role("link", name="Ignored")).to_be_visible()


@pytest.mark.django_db
def test_ignored_reference_keeps_its_position_when_shown(
    live_server: LiveServer,
    page: Page,
    make_container: Callable[..., Container],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """An ignored reference is shown where it was, not moved after the active ones."""
    container = make_container(
        references=[
            ("First", "https://example.com/first", []),
            ("Second", "https://example.com/second", []),
            ("Third", "https://example.com/third", []),
        ]
    )
    suggestion = make_cached_suggestion(container=container)
    suggestion.ignore_reference("https://example.com/second")
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    references = page.get_by_test_id(f"suggestion-{suggestion.pk}-references")

    references.get_by_role("button", name="Ignored (").click()

    expect(references.get_by_role("link")).to_have_text(["First", "Second", "Third"])
