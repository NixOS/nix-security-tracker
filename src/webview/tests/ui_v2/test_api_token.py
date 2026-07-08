from collections.abc import Callable

import pytest
from django.contrib.auth.models import User
from freezegun import freeze_time
from knox.models import AuthToken
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from webview.tests.ui_v2.routes import USER_SETTINGS_TOKENS

GENERATE_BUTTON = "Generate API token"
COPY_WARNING = "Copy this value now"
ACTIVE_TOKEN_HEADING = "Active token"
REVOKE_BUTTON = "Revoke"


def test_token_page_anonymous(
    live_server: LiveServer,
    page: Page,
) -> None:
    """Unauthenticated users see the 'not authenticated' error instead of the form."""
    page.goto(live_server.url + USER_SETTINGS_TOKENS)
    expect(page.get_by_text("not authenticated", exact=False)).to_be_visible()
    expect(page.get_by_role("button", name=GENERATE_BUTTON)).to_have_count(0)


@pytest.mark.django_db
def test_token_page_no_token(
    live_server: LiveServer,
    as_staff: Page,
) -> None:
    """Authenticated user with no token sees the 'Generate API token' button."""
    as_staff.goto(live_server.url + USER_SETTINGS_TOKENS)
    expect(as_staff.get_by_role("button", name=GENERATE_BUTTON)).to_be_visible()


@pytest.mark.django_db
def test_generate_shows_token_value_once(
    live_server: LiveServer,
    as_staff: Page,
) -> None:
    """Clicking 'Generate' shows the raw token with the 'Copy this value now' warning."""
    as_staff.goto(live_server.url + USER_SETTINGS_TOKENS)
    as_staff.get_by_role("button", name=GENERATE_BUTTON).click()
    expect(as_staff.get_by_text(COPY_WARNING)).to_be_visible()
    # The raw token value is displayed in a <pre> element.
    expect(as_staff.locator("pre")).to_be_visible()
    expect(as_staff.locator("pre")).not_to_be_empty()


@pytest.mark.django_db
def test_second_get_hides_token_value(
    live_server: LiveServer,
    as_staff: Page,
) -> None:
    """After generating, reloading the page shows 'Active token' state without the raw value."""
    as_staff.goto(live_server.url + USER_SETTINGS_TOKENS)
    as_staff.get_by_role("button", name=GENERATE_BUTTON).click()
    expect(as_staff.get_by_text(COPY_WARNING)).to_be_visible()

    as_staff.reload()
    expect(as_staff.get_by_text(ACTIVE_TOKEN_HEADING)).to_be_visible()
    expect(as_staff.get_by_text(COPY_WARNING)).to_have_count(0)
    expect(as_staff.locator("pre")).to_have_count(0)


@pytest.mark.django_db
def test_revoke_deletes_token(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    make_token: Callable[..., tuple[AuthToken, str]],
) -> None:
    """Revoking removes the token and returns to the 'Generate API token' state."""
    make_token(staff)
    as_staff.goto(live_server.url + USER_SETTINGS_TOKENS)
    expect(as_staff.get_by_text(ACTIVE_TOKEN_HEADING)).to_be_visible()

    as_staff.get_by_role("button", name=REVOKE_BUTTON).click()

    expect(as_staff.get_by_role("button", name=GENERATE_BUTTON)).to_be_visible()
    # exact=True: "Active token" must not partially match "No active token"
    expect(as_staff.get_by_text(ACTIVE_TOKEN_HEADING, exact=True)).to_have_count(0)


@pytest.mark.django_db
def test_extend_pushes_expiry(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    make_token: Callable[..., tuple[AuthToken, str]],
) -> None:
    """Extending the token updates the displayed expiry date."""
    with freeze_time("2025-06-01") as frozen:
        make_token(staff)
        as_staff.goto(live_server.url + USER_SETTINGS_TOKENS)
        expect(as_staff.get_by_text(ACTIVE_TOKEN_HEADING)).to_be_visible()

        expiry_locator = as_staff.locator("p", has_text="Expires:")
        expiry_text_before = expiry_locator.inner_text()

        frozen.move_to("2025-06-16")
        as_staff.get_by_role("button", name="Extend", exact=False).click()

        expect(expiry_locator).not_to_have_text(expiry_text_before)
        expect(as_staff.get_by_text(ACTIVE_TOKEN_HEADING)).to_be_visible()


@pytest.mark.django_db
def test_generate_replaces_existing_token(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    make_token: Callable[..., tuple[AuthToken, str]],
) -> None:
    """Starting from an existing token, revoking then generating yields a new token display."""
    make_token(staff)
    as_staff.goto(live_server.url + USER_SETTINGS_TOKENS)
    expect(as_staff.get_by_text(ACTIVE_TOKEN_HEADING)).to_be_visible()

    as_staff.get_by_role("button", name=REVOKE_BUTTON).click()
    expect(as_staff.get_by_role("button", name=GENERATE_BUTTON)).to_be_visible()

    as_staff.get_by_role("button", name=GENERATE_BUTTON).click()
    expect(as_staff.get_by_text(COPY_WARNING)).to_be_visible()
    expect(as_staff.locator("pre")).to_be_visible()
