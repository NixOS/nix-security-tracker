import re
from collections.abc import Callable

import pytest
from django.contrib.auth.models import User
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.linkage import CVEDerivationClusterProposal, ProvenanceFlags
from shared.models.nix_evaluation import NixDerivation
from shared.notify_users import create_package_subscription_notifications
from webview.models import Notification

from .routes import NOTIFICATIONS


def test_notification_center_shows_notification(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    notifications = make_maintainer_notification(staff)
    notification = notifications[0]

    as_staff.goto(live_server.url + NOTIFICATIONS)
    item = as_staff.get_by_test_id(f"notification-{notification.id}")
    expect(item).to_be_visible()
    # Suggestion is always inlined (`expand=suggestion&activity_log=true`).
    expect(
        item.get_by_test_id(f"notification-{notification.id}-suggestion")
    ).to_be_visible()


def test_notification_center_empty_state(
    live_server: LiveServer,
    as_staff: Page,
) -> None:
    as_staff.goto(live_server.url + NOTIFICATIONS)
    expect(
        as_staff.get_by_text("You don't have any notifications yet.")
    ).to_be_visible()


def test_unauthenticated_shows_error(
    live_server: LiveServer,
    page: Page,
) -> None:
    page.goto(live_server.url + NOTIFICATIONS)
    expect(page.get_by_text("not authenticated", exact=False)).to_be_visible()


def test_header_bell_shows_unread_count(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    make_maintainer_notification(staff)

    as_staff.goto(live_server.url + NOTIFICATIONS)
    expect(as_staff.get_by_test_id("notification-bell-count")).to_have_text("1")


def test_header_bell_hidden_when_no_unread_notifications(
    live_server: LiveServer,
    as_staff: Page,
) -> None:
    as_staff.goto(live_server.url + NOTIFICATIONS)
    expect(as_staff.get_by_test_id("notification-bell-count")).to_have_count(0)


def test_toggle_notification_read_updates_badge(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    notifications = make_maintainer_notification(staff)
    notification = notifications[0]

    as_staff.goto(live_server.url + NOTIFICATIONS)
    expect(as_staff.get_by_test_id("notification-bell-count")).to_have_text("1")

    toggle = as_staff.get_by_test_id(f"notification-{notification.id}-toggle-read")
    toggle.click()
    expect(as_staff.get_by_test_id("notification-bell-count")).to_have_count(0)
    expect(toggle).to_have_text("Mark unread")

    # Toggling again marks it unread, restoring the badge.
    toggle.click()
    expect(as_staff.get_by_test_id("notification-bell-count")).to_have_text("1")
    expect(toggle).to_have_text("Mark read")

    # Persisted server-side.
    as_staff.reload()
    expect(as_staff.get_by_test_id("notification-bell-count")).to_have_text("1")


def test_mark_all_read(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    make_maintainer_notification(staff)
    make_maintainer_notification(staff)

    as_staff.goto(live_server.url + NOTIFICATIONS)
    expect(as_staff.get_by_test_id("notification-bell-count")).to_have_text("2")

    as_staff.get_by_test_id("notifications-mark-all-read").click()
    expect(as_staff.get_by_test_id("notification-bell-count")).to_have_count(0)
    expect(as_staff.get_by_role("button", name="Mark unread")).to_have_count(2)


def test_clear_read_removes_read_notifications(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    notifications = make_maintainer_notification(staff)
    notification = notifications[0]

    as_staff.goto(live_server.url + NOTIFICATIONS)
    as_staff.get_by_test_id(f"notification-{notification.id}-toggle-read").click()
    expect(
        as_staff.get_by_test_id(f"notification-{notification.id}-toggle-read")
    ).to_have_text("Mark unread")

    as_staff.once("dialog", lambda dialog: dialog.accept())
    as_staff.get_by_test_id("notifications-clear-read").click()

    expect(as_staff.get_by_test_id(f"notification-{notification.id}")).to_have_count(0)
    expect(
        as_staff.get_by_text("You don't have any notifications yet.")
    ).to_be_visible()


def test_clear_read_dismissed_keeps_notifications(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    """Dismissing the confirmation dialog leaves read notifications untouched."""
    notifications = make_maintainer_notification(staff)
    notification = notifications[0]

    as_staff.goto(live_server.url + NOTIFICATIONS)
    as_staff.get_by_test_id(f"notification-{notification.id}-toggle-read").click()

    as_staff.once("dialog", lambda dialog: dialog.dismiss())
    as_staff.get_by_test_id("notifications-clear-read").click()

    expect(as_staff.get_by_test_id(f"notification-{notification.id}")).to_be_visible()


def test_clear_read_resets_to_page_one(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    """
    Clearing read notifications always navigates back to page 1.
    This is important for when the list shrinks and the curent page would no longer exist.
    """
    # Page size is 10 (see PAGE_SIZE in NotificationCenter.tsx);
    # 11 notifications span exactly 2 pages, with a single notification on page 2.
    for _ in range(11):
        make_maintainer_notification(staff)

    as_staff.goto(live_server.url + NOTIFICATIONS)
    as_staff.get_by_test_id("notifications-mark-all-read").click()
    expect(as_staff.get_by_role("button", name="Mark unread")).to_have_count(10)

    as_staff.goto(live_server.url + NOTIFICATIONS + "?page=2")
    expect(as_staff.get_by_role("button", name="Mark unread")).to_have_count(1)

    as_staff.once("dialog", lambda dialog: dialog.accept())
    as_staff.get_by_test_id("notifications-clear-read").click()

    expect(
        as_staff.get_by_text("You don't have any notifications yet.")
    ).to_be_visible()
    expect(as_staff).to_have_url(re.compile(r"^(?!.*[?&]page=2).*$"))
    expect(
        as_staff.get_by_text("Failed to load notifications", exact=False)
    ).to_have_count(0)


def test_notifications_default_to_collapsed_suggestion_view(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    notifications = make_maintainer_notification(staff)
    notification = notifications[0]
    suggestion = notification.suggestion

    as_staff.goto(live_server.url + NOTIFICATIONS)
    # The collapsed view has its own data-testid; the unfolded card is not rendered.
    expect(
        as_staff.get_by_test_id(f"suggestion-{suggestion.pk}-collapsed")
    ).to_be_visible()
    expect(as_staff.get_by_test_id(f"suggestion-{suggestion.pk}")).to_have_count(0)


def test_notifications_list_wide_toggle_switches_to_detailed(
    live_server: LiveServer,
    as_staff: Page,
    staff: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    """Picking "Detailed" in the list-wide toggle expands every embedded suggestion."""
    notifications = make_maintainer_notification(staff)
    notification = notifications[0]
    suggestion = notification.suggestion

    as_staff.goto(live_server.url + NOTIFICATIONS)
    as_staff.get_by_test_id("suggestion-view-toggle").get_by_role(
        "button", name="Detailed"
    ).click()

    card = as_staff.get_by_test_id(f"suggestion-{suggestion.pk}")
    expect(card.get_by_role("heading", name="Matching in nixpkgs")).to_be_visible()
    expect(card.get_by_role("heading", name="Maintainers")).to_be_visible()
    expect(as_staff).to_have_url(re.compile(r"[?&]suggestionView=detailed"))


@pytest.mark.django_db
def test_accept_from_notifications_updates_the_whole_card(
    live_server: LiveServer,
    as_committer: Page,
    committer: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    """Regression test: Changing a suggestion's status from the notifications page updates the whole card in place (not just the activity log)."""
    notifications = make_maintainer_notification(committer)
    notification = notifications[0]
    suggestion = notification.suggestion

    as_committer.goto(live_server.url + NOTIFICATIONS)
    # Status actions only exist in the unfolded views, and notifications default to collapsed.
    as_committer.get_by_test_id("suggestion-view-toggle").get_by_role(
        "button", name="Detailed"
    ).click()
    card = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}")
    actions = card.get_by_test_id(f"suggestion-{suggestion.pk}-status-actions")

    actions.get_by_role("button", name="Accept").click()

    expect(card.get_by_text("Accepted")).to_be_visible()
    expect(actions.get_by_role("button", name="Accept")).to_be_hidden()
    expect(actions.get_by_role("button", name="Dismiss")).to_be_visible()


@pytest.mark.django_db
def test_obsolete_suggestion_is_dimmed_in_notifications(
    live_server: LiveServer,
    as_committer: Page,
    committer: User,
    make_drv: Callable[..., NixDerivation],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    drv = make_drv(pname="foo")
    committer.profile.subscribe_to_package("foo")
    suggestion = make_cached_suggestion(drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH})
    create_package_subscription_notifications(suggestion)

    as_committer.goto(live_server.url + NOTIFICATIONS)
    # Notifications default to the collapsed suggestion view, which has its own test id.
    card = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-collapsed")
    expect(card).to_be_visible()
    expect(card).not_to_have_class(re.compile(r"\bborder-dashed\b"))

    committer.profile.unsubscribe_from_package("foo")

    as_committer.reload()
    expect(
        as_committer.get_by_test_id(f"suggestion-{suggestion.pk}-collapsed")
    ).to_have_class(re.compile(r"\bborder-dashed\b"))


@pytest.mark.django_db
def test_ignoring_last_matching_package_dims_notification_live(
    live_server: LiveServer,
    as_committer: Page,
    committer: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    notifications = make_maintainer_notification(committer)
    notification = notifications[0]
    suggestion = notification.suggestion

    as_committer.goto(live_server.url + NOTIFICATIONS)
    # Notifications default to the collapsed suggestion view, which has its own test id.
    collapsed_card = as_committer.get_by_test_id(
        f"suggestion-{suggestion.pk}-collapsed"
    )
    notif_item = as_committer.get_by_test_id(f"notification-{notification.id}")
    maintained_section = notif_item.get_by_test_id(
        f"notification-{notification.id}-matching-maintained-packages"
    )
    obsolete_banner = notif_item.get_by_test_id(
        f"notification-{notification.id}-obsolete"
    )

    expect(collapsed_card).not_to_have_class(re.compile(r"\bborder-dashed\b"))
    expect(maintained_section).to_be_visible()
    expect(obsolete_banner).to_have_count(0)

    # Packages are hidden by default in collapsed view; switch to detailed to reveal them.
    as_committer.get_by_test_id("suggestion-view-toggle").get_by_role(
        "button", name="Detailed"
    ).click()
    card = as_committer.get_by_test_id(f"suggestion-{suggestion.pk}")
    card.get_by_test_id(f"suggestion-{suggestion.pk}-packages").get_by_role(
        "button", name="Ignore"
    ).click()

    expect(card).to_have_class(re.compile(r"\bborder-dashed\b"))
    expect(obsolete_banner).to_be_visible()
    expect(maintained_section).to_have_count(0)
