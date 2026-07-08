from django.contrib.auth.models import User
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from .routes import USER_SETTINGS_SUBSCRIPTIONS

EMAIL_NOTIFICATIONS_LABEL = "Email notifications"


def test_email_notifications_toggle_persists(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
) -> None:
    """Toggling email notifications in the new UI persists across reloads."""
    as_staff.goto(live_server.url + USER_SETTINGS_SUBSCRIPTIONS)

    toggle = as_staff.get_by_text(EMAIL_NOTIFICATIONS_LABEL)
    state = as_staff.get_by_label(EMAIL_NOTIFICATIONS_LABEL)

    expect(state).not_to_be_checked()

    toggle.click()
    expect(state).to_be_checked()

    # Reload to prove the new state was persisted server-side (refetched from the API).
    as_staff.reload()
    toggle = as_staff.get_by_text(EMAIL_NOTIFICATIONS_LABEL)
    state = as_staff.get_by_label(EMAIL_NOTIFICATIONS_LABEL)
    expect(state).to_be_checked()

    # Re-disable and confirm that persists too.
    toggle.click()
    expect(state).not_to_be_checked()
    as_staff.reload()
    state = as_staff.get_by_label(EMAIL_NOTIFICATIONS_LABEL)
    expect(state).not_to_be_checked()
