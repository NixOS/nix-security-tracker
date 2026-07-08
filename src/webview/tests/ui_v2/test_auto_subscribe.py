from django.contrib.auth.models import User
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from .routes import USER_SETTINGS_SUBSCRIPTIONS

AUTO_SUBSCRIBE_LABEL = "Auto-subscribe to maintained packages"


def test_auto_subscribe_toggle_persists(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
) -> None:
    """Toggling auto-subscribe in the new UI persists across reloads."""
    as_staff.goto(live_server.url + USER_SETTINGS_SUBSCRIPTIONS)

    toggle = as_staff.get_by_text(AUTO_SUBSCRIBE_LABEL)
    state = as_staff.get_by_label(AUTO_SUBSCRIBE_LABEL)
    expect(state).to_be_checked()

    toggle.click()
    expect(state).not_to_be_checked()

    # Reload to prove the new state was persisted server-side (refetched from the API).
    as_staff.reload()
    toggle = as_staff.get_by_text(AUTO_SUBSCRIBE_LABEL)
    state = as_staff.get_by_label(AUTO_SUBSCRIBE_LABEL)
    expect(state).not_to_be_checked()

    # Re-enable and confirm that persists too.
    toggle.click()
    expect(state).to_be_checked()
    as_staff.reload()
    state = as_staff.get_by_label(AUTO_SUBSCRIBE_LABEL)
    expect(state).to_be_checked()
