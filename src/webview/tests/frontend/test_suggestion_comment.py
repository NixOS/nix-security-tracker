from collections.abc import Callable

import pytest
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.linkage import CVEDerivationClusterProposal

from .routes import SUGGESTION_DETAIL


@pytest.mark.django_db
def test_comment_absent_for_anonymous_when_empty(
    live_server: LiveServer,
    page: Page,
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{cached_suggestion.pk}")
    expect(page.locator("textarea")).to_have_count(0)


@pytest.mark.django_db
def test_comment_shown_readonly_for_anonymous(
    live_server: LiveServer,
    page: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    suggestion = make_cached_suggestion(comment="note")
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    textarea = page.locator("textarea")
    expect(textarea).to_be_visible()
    expect(textarea).to_have_value("note")
    expect(textarea).to_be_disabled()


@pytest.mark.django_db
def test_comment_section_shown_for_committer_when_empty(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    suggestion = make_cached_suggestion()
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    textarea = as_committer.locator("textarea")
    expect(textarea).to_be_visible()
    expect(textarea).to_be_enabled()


@pytest.mark.django_db
def test_comment_autosave_persists_after_reload(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    suggestion = make_cached_suggestion()
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")

    textarea = as_committer.locator("textarea")
    expect(textarea).to_be_visible()
    textarea.fill("foo")

    # Wait for the comment to be saved
    expect(textarea).to_have_attribute("data-save-state", "saved")

    as_committer.reload()

    expect(as_committer.locator("textarea")).to_have_value("foo")


# Debounce before an autosave request is fired, in the Comment component.
AUTOSAVE_DEBOUNCE_MS = 500

# How long the response to the first autosave is held back in the browser.
# Must be comfortably longer than the debounce so that a second autosave is
# already in flight by the time it lands.
FIRST_SAVE_RESPONSE_DELAY_MS = 2000

# Responses to the subsequent autosaves are held back for the whole test, so
# that the edits stay unsaved from the point of view of the comment box.
NEXT_SAVE_RESPONSE_DELAY_MS = 60000

# Delays the responses to the comment autosave requests, so that the response to
# an outdated one lands while more recent edits are still unsaved. The API
# client uses `fetch`, and the delay is applied in the browser only: the server
# still receives and processes the requests in order.
DELAY_COMMENT_SAVE_RESPONSES = """
{
  const originalFetch = window.fetch;
  let saves = 0;
  window.fetch = async (input, init) => {
    // `apiFetch` passes a `URL` object rather than a string.
    const url = String(input instanceof Request ? input.url : input);
    const method = (init?.method ?? "GET").toUpperCase();
    const isCommentSave = method === "PATCH" && url.includes("/comment");
    const delay = isCommentSave ? (saves++ === 0 ? FIRST_DELAY_MS : NEXT_DELAY_MS) : 0;
    const response = await originalFetch(input, init);
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    return response;
  };
}
"""
DELAY_COMMENT_SAVE_RESPONSES = DELAY_COMMENT_SAVE_RESPONSES.replace(
    "FIRST_DELAY_MS", str(FIRST_SAVE_RESPONSE_DELAY_MS)
).replace("NEXT_DELAY_MS", str(NEXT_SAVE_RESPONSE_DELAY_MS))


@pytest.mark.django_db
def test_comment_not_rolled_back_by_late_save_response(
    live_server: LiveServer,
    as_committer: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """
    Regression test: the response to an outdated autosave must not overwrite what the user typed since.
    """
    suggestion = make_cached_suggestion()
    as_committer.add_init_script(DELAY_COMMENT_SAVE_RESPONSES)
    as_committer.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")

    textarea = as_committer.locator("textarea")
    expect(textarea).to_be_visible()

    # First autosave: the response to it is held back for a while.
    textarea.fill("foo")
    as_committer.wait_for_timeout(2 * AUTOSAVE_DEBOUNCE_MS)

    # More typing: the corresponding autosave stays in flight, so these edits
    # are still unsaved when the response to the first one finally lands.
    textarea.fill("foobar")
    as_committer.wait_for_timeout(FIRST_SAVE_RESPONSE_DELAY_MS + AUTOSAVE_DEBOUNCE_MS)

    expect(textarea).to_have_value("foobar")
