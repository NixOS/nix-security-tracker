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
