import re
from collections.abc import Callable
from contextlib import AbstractContextManager

from django.contrib.auth.models import User
from django.urls import reverse
from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from webview.models import Notification

from ..notifications.views import NotificationCenterView


def test_mark_notification_read_unread(
    live_server: LiveServer,
    staff: User,
    as_staff: Page,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    """
    Check that marking a notification read and unread has the desired effect
    """
    db_notification, *_ = make_maintainer_notification(staff)

    as_staff.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))
    badge = as_staff.locator("#notifications-badge")
    expect(badge).to_have_text("1")

    badge.click()

    notification = as_staff.locator(f"#notification-{db_notification.pk}")
    expect(notification).to_be_visible()

    suggestion_link = notification.get_by_role("link", name="View")
    assert db_notification.suggestion
    link = re.compile(
        reverse(
            "webview:suggestion:detail",
            kwargs={"suggestion_id": db_notification.suggestion.pk},
        )
    )
    expect(suggestion_link).to_have_attribute("href", link)

    mark_read = notification.get_by_role("button", name="Mark read")
    mark_read.click()
    expect(badge).to_have_text("0")
    notification = as_staff.locator(f"#notification-{db_notification.pk}")
    expect(notification).to_be_visible()
    mark_unread = notification.get_by_role("button", name="Mark unread")
    mark_unread.click()
    expect(badge).to_have_text("1")


def test_notifications_bulk_operations(
    live_server: LiveServer,
    staff: User,
    as_staff: Page,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    """
    Check that bulk operations on notifications work as expected
    """
    num_notifications = 3

    db_notifications = [
        make_maintainer_notification(staff)[0] for i in range(num_notifications)
    ]

    as_staff.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))
    badge = as_staff.locator("#notifications-badge")
    expect(badge).to_have_text(str(num_notifications))
    badge.click()

    for db_notification in db_notifications:
        notification = as_staff.locator(f"#notification-{db_notification.pk}")
        expect(notification).to_be_visible()
        mark_read = notification.get_by_role("button", name="Mark read")
        expect(mark_read).to_be_visible()

    all_read = as_staff.get_by_role("button", name="Mark all as read")
    all_read.click()

    expect(badge).to_have_text("0")

    for db_notification in db_notifications:
        notification = as_staff.locator(f"#notification-{db_notification.pk}")
        expect(notification).to_be_visible()
        mark_unread = notification.get_by_role("button", name="Mark unread")
        expect(mark_unread).to_be_visible()

    remove_read = as_staff.get_by_role("button", name="Remove read notification")
    remove_read.click()

    for db_notification in db_notifications:
        notification = as_staff.locator(f"#notification-{db_notification.pk}")
        expect(notification).to_have_count(0)

    assert Notification.objects.count() == 0


def test_paginated_notifications(
    live_server: LiveServer,
    staff: User,
    as_staff: Page,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    """
    Check that browsing multiple pages of notifications works as expected
    """
    page_size = NotificationCenterView.paginate_by
    num_notifications = page_size + 1

    db_notifications = [
        make_maintainer_notification(staff)[0] for i in range(num_notifications)
    ]

    as_staff.goto(live_server.url + reverse("webview:suggestion:untriaged_suggestions"))
    badge = as_staff.locator("#notifications-badge")
    expect(badge).to_have_text(str(num_notifications))
    badge.click()

    for i, db_notification in enumerate(reversed(db_notifications), start=1):
        notification = as_staff.locator(f"#notification-{db_notification.pk}")
        if i > page_size:
            expect(notification).to_have_count(0)
        else:
            expect(notification).to_be_visible()
            mark_read = notification.get_by_role("button", name="Mark read")
            expect(mark_read).to_be_visible()

    pagination = as_staff.locator("#pagination")
    page_2 = pagination.get_by_role("link", name="2")
    page_2.click()

    for i, db_notification in enumerate(reversed(db_notifications), start=1):
        notification = as_staff.locator(f"#notification-{db_notification.pk}")
        if i <= page_size:
            expect(notification).to_have_count(0)
        else:
            expect(notification).to_be_visible()
            mark_read = notification.get_by_role("button", name="Mark read")
            expect(mark_read).to_be_visible()

    mark_read = as_staff.get_by_text("Mark read")
    mark_read.click()

    page_1 = pagination.get_by_role("link", name="1")
    page_1.click()

    expect(mark_read).to_have_count(num_notifications - 1)
    expect(badge).to_have_text(str(num_notifications - 1))


def test_notifications_per_user(
    live_server: LiveServer,
    page: Page,
    logged_in_as: Callable[..., AbstractContextManager[Page]],
    staff: User,
    committer: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    """
    Check that users only get their own notifications
    """
    make_maintainer_notification(staff)

    # Anonymous users are redirected to login
    page.goto(live_server.url + reverse("webview:notifications:center"))
    expect(page).to_have_url(re.compile(re.escape(reverse("account_login"))))

    with logged_in_as(staff) as as_staff:
        as_staff.goto(live_server.url + reverse("webview:notifications:center"))
        badge = as_staff.locator("#notifications-badge")
        expect(badge).to_have_text("1")

    with logged_in_as(committer) as as_committer:
        as_committer.goto(live_server.url + reverse("webview:notifications:center"))
        badge = as_committer.locator("#notifications-badge")
        expect(badge).to_have_text("0")


def test_notifications_empty_state(
    live_server: LiveServer,
    staff: User,
    as_staff: Page,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    """
    Check that appropriate message is displayed for the empty state
    """
    as_staff.goto(live_server.url + reverse("webview:notifications:center"))
    empty_message = "You don't have any notifications yet."
    expect(as_staff.get_by_text(empty_message)).to_be_visible()

    badge = as_staff.locator("#notifications-badge")
    expect(badge).to_have_text("0")

    mark_all_read = as_staff.get_by_text("Mark all as read")
    expect(mark_all_read).to_have_count(0)
    remove_read = as_staff.get_by_text("Remove read notifications")
    expect(remove_read).to_have_count(0)

    make_maintainer_notification(staff)

    as_staff.goto(live_server.url + reverse("webview:notifications:center"))
    mark_all_read.click()
    remove_read.click()

    expect(mark_all_read).to_have_count(0)
    expect(remove_read).to_have_count(0)

    expect(as_staff.get_by_text(empty_message)).to_be_visible()

    badge = as_staff.locator("#notifications-badge")
    expect(badge).to_have_text("0")

    assert Notification.objects.count() == 0
