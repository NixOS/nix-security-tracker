from collections.abc import Callable

import pytest
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from api.notifications.views import NotificationType
from webview.models import Notification


def test_list_notifications_authenticated(
    client: APIClient,
    user: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    db_notifications = make_maintainer_notification(user)

    url = reverse("notifications-list")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] == 1

    results = response.data["results"]
    assert results[0]["title"] == (
        "CVE-2025-0001 was automatically matched to packages you subscribed to"
    )
    assert results[0]["is_read"] is False
    assert "id" in results[0]
    assert "created_at" in results[0]
    assert results[0]["type"] == NotificationType.SUGGESTION
    assert results[0]["message"] is None
    assert results[0]["suggestion_id"] == db_notifications[0].suggestion_id

    maintained = results[0]["matching_maintained_packages"]
    assert isinstance(maintained, dict)
    assert len(maintained) == 1
    pkg_data = next(iter(maintained.values()))
    assert "channels" in pkg_data
    assert "description" in pkg_data
    assert "maintainers" in pkg_data

    subscribed = results[0]["matching_subscribed_packages"]
    assert isinstance(subscribed, dict)
    assert len(subscribed) == 0

    assert results[0]["is_obsolete"] is False


def test_list_notifications_are_paginated(
    user: User,
    client: APIClient,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    make_maintainer_notification(user)
    url = reverse("notifications-list")

    response = client.get(url)
    assert "previous" in response.data
    assert "next" in response.data
    assert "count" in response.data


def test_list_notifications_excludes_other_users_notifications(
    client: APIClient,
    staff: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    make_maintainer_notification(staff)

    url = reverse("notifications-list")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] == 0


def test_list_notifications_unauthenticated(
    user: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    make_maintainer_notification(user)

    client = APIClient()
    url = reverse("notifications-list")
    response = client.get(url)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_list_notifications_empty(
    client: APIClient,
) -> None:
    url = reverse("notifications-list")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] == 0


def test_list_notifications_includes_text_notifications(
    client: APIClient,
    user: User,
) -> None:
    user.profile.create_text_notification("Hello", "World")

    url = reverse("notifications-list")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] == 1

    api_data = response.data["results"]
    assert api_data[0]["type"] == NotificationType.TEXT
    assert api_data[0]["title"] == "Hello"
    assert api_data[0]["is_read"] is False
    assert api_data[0]["message"] == "World"
    assert api_data[0]["suggestion_id"] is None
    assert api_data[0]["matching_maintained_packages"] is None
    assert api_data[0]["matching_subscribed_packages"] is None
    assert api_data[0]["is_obsolete"] is False


def test_list_notifications_shows_both_types(
    client: APIClient,
    user: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    user.profile.create_text_notification("Hello", "World")
    db_suggestion_notifications = make_maintainer_notification(user)

    url = reverse("notifications-list")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["count"] == 2

    results = response.data["results"]
    text_result = next(r for r in results if r["type"] == NotificationType.TEXT)
    suggestion_result = next(
        r for r in results if r["type"] == NotificationType.SUGGESTION
    )

    assert text_result["type"] == NotificationType.TEXT
    assert text_result["title"] == "Hello"
    assert text_result["message"] == "World"
    assert text_result["suggestion_id"] is None

    assert suggestion_result["type"] == NotificationType.SUGGESTION
    assert (
        suggestion_result["suggestion_id"]
        == db_suggestion_notifications[0].suggestion_id
    )
    assert suggestion_result["message"] is None

    assert isinstance(suggestion_result["matching_maintained_packages"], dict)
    assert len(suggestion_result["matching_maintained_packages"]) == 1
    assert isinstance(suggestion_result["matching_subscribed_packages"], dict)
    assert len(suggestion_result["matching_subscribed_packages"]) == 0


def test_list_notifications_suggestion_null_by_default(
    client: APIClient,
    user: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    make_maintainer_notification(user)

    url = reverse("notifications-list")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["results"][0]["suggestion"] is None


def test_list_notifications_expand_suggestion_inlines_suggestion(
    client: APIClient,
    user: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    db_notifications = make_maintainer_notification(user)

    url = reverse("notifications-list")
    response = client.get(url, {"expand": "suggestion"})

    assert response.status_code == status.HTTP_200_OK
    suggestion = response.data["results"][0]["suggestion"]
    assert suggestion is not None
    assert suggestion["id"] == db_notifications[0].suggestion_id


def test_list_notifications_expand_suggestion_null_for_text_notifications(
    client: APIClient,
    user: User,
) -> None:
    user.profile.create_text_notification("Hello", "World")

    url = reverse("notifications-list")
    response = client.get(url, {"expand": "suggestion"})

    assert response.status_code == status.HTTP_200_OK
    assert response.data["results"][0]["suggestion"] is None


@pytest.mark.parametrize("include_activity_log", [False, True])
def test_list_notifications_expand_suggestion_with_activity_log(
    include_activity_log: bool,
    client: APIClient,
    user: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    make_maintainer_notification(user)

    url = reverse("notifications-list")
    params = {"expand": "suggestion"}
    if include_activity_log:
        params["activity_log"] = "true"
    response = client.get(url, params)

    assert response.status_code == status.HTTP_200_OK
    activity_log = response.data["results"][0]["suggestion"]["activity_log"]
    if include_activity_log:
        assert isinstance(activity_log, list)
        assert len(activity_log) >= 1
        assert any(e["action"] == "create" for e in activity_log)
    else:
        assert activity_log is None


def test_list_notifications_activity_log_ignored_without_expand_suggestion(
    client: APIClient,
    user: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    """`activity_log=true` has no effect unless `expand=suggestion` is also requested."""
    make_maintainer_notification(user)

    url = reverse("notifications-list")
    response = client.get(url, {"activity_log": "true"})

    assert response.status_code == status.HTTP_200_OK
    assert response.data["results"][0]["suggestion"] is None


def test_list_notifications_includes_unread_count(
    client: APIClient,
    user: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    make_maintainer_notification(user)
    # The maintainer notification is created via a separate `Profile` instance
    # internally, so the cached `user.profile` needs refreshing before reusing it.
    user.profile.refresh_from_db()
    user.profile.create_text_notification("Hello", "World")

    url = reverse("notifications-list")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["unread_count"] == 2


def test_patch_notification_marks_read(
    client: APIClient,
    user: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    db_notifications = make_maintainer_notification(user)
    notification = db_notifications[0]
    assert notification.is_read is False

    url = reverse("notifications-detail", kwargs={"pk": notification.pk})
    response = client.patch(url, {"is_read": True}, format="json")

    assert response.status_code == status.HTTP_200_OK
    assert response.data["is_read"] is True
    notification.refresh_from_db()
    assert notification.is_read is True
    user.profile.refresh_from_db()
    assert user.profile.unread_notifications_count == 0

    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["is_read"] is True


def test_patch_notification_marks_unread(
    client: APIClient,
    user: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    """
    Check that marking already read notifications back as unread increases the counter and resets the is-read flag.
    """
    db_notifications = make_maintainer_notification(user)
    notification = db_notifications[0]
    notification.mark_read(True)
    user.profile.refresh_from_db()
    assert user.profile.unread_notifications_count == 0

    url = reverse("notifications-detail", kwargs={"pk": notification.pk})
    response = client.patch(url, {"is_read": False}, format="json")

    assert response.status_code == status.HTTP_200_OK
    assert response.data["is_read"] is False
    user.profile.refresh_from_db()
    assert user.profile.unread_notifications_count == 1


def test_patch_notification_is_idempotent(
    client: APIClient,
    user: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    db_notifications = make_maintainer_notification(user)
    notification = db_notifications[0]

    url = reverse("notifications-detail", kwargs={"pk": notification.pk})
    client.patch(url, {"is_read": True}, format="json")
    response = client.patch(url, {"is_read": True}, format="json")

    assert response.status_code == status.HTTP_200_OK
    user.profile.refresh_from_db()
    assert user.profile.unread_notifications_count == 0


def test_patch_notification_missing_is_read_returns_400(
    client: APIClient,
    user: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    db_notifications = make_maintainer_notification(user)

    url = reverse("notifications-detail", kwargs={"pk": db_notifications[0].pk})
    response = client.patch(url, {}, format="json")

    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_patch_notification_wrong_user_returns_404(
    client: APIClient,
    staff: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    db_notifications = make_maintainer_notification(staff)

    url = reverse("notifications-detail", kwargs={"pk": db_notifications[0].pk})
    response = client.patch(url, {"is_read": True}, format="json")

    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_patch_notification_unauthenticated_returns_401(
    user: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    db_notifications = make_maintainer_notification(user)

    client = APIClient()
    url = reverse("notifications-detail", kwargs={"pk": db_notifications[0].pk})
    response = client.patch(url, {"is_read": True}, format="json")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_delete_notification_removes_it(
    client: APIClient,
    user: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    db_notifications = make_maintainer_notification(user)
    notification_id = db_notifications[0].pk

    url = reverse("notifications-detail", kwargs={"pk": notification_id})
    response = client.delete(url)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not Notification.objects.filter(pk=notification_id).exists()


def test_delete_unread_notification_decrements_unread_count(
    client: APIClient,
    user: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    db_notifications = make_maintainer_notification(user)
    user.profile.refresh_from_db()
    assert user.profile.unread_notifications_count == 1

    url = reverse("notifications-detail", kwargs={"pk": db_notifications[0].pk})
    response = client.delete(url)

    assert response.status_code == status.HTTP_204_NO_CONTENT
    user.profile.refresh_from_db()
    assert user.profile.unread_notifications_count == 0


def test_delete_notification_wrong_user_returns_404(
    client: APIClient,
    staff: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    db_notifications = make_maintainer_notification(staff)

    url = reverse("notifications-detail", kwargs={"pk": db_notifications[0].pk})
    response = client.delete(url)

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert Notification.objects.filter(pk=db_notifications[0].pk).exists()


def test_delete_notification_unauthenticated_returns_401(
    user: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    db_notifications = make_maintainer_notification(user)

    client = APIClient()
    url = reverse("notifications-detail", kwargs={"pk": db_notifications[0].pk})
    response = client.delete(url)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_mark_all_read_marks_all_notifications_read(
    client: APIClient,
    user: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    make_maintainer_notification(user)
    user.profile.refresh_from_db()
    user.profile.create_text_notification("Hello", "World")
    assert user.profile.unread_notifications_count == 2

    url = reverse("notifications-mark-all-read")
    response = client.post(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["unread_count"] == 0
    assert Notification.objects.filter(user=user, is_read=False).count() == 0
    user.profile.refresh_from_db()
    assert user.profile.unread_notifications_count == 0


def test_mark_all_read_unauthenticated_returns_401() -> None:
    client = APIClient()
    url = reverse("notifications-mark-all-read")
    response = client.post(url)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_clear_read_deletes_only_read_notifications(
    client: APIClient,
    user: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    db_notifications = make_maintainer_notification(user)
    read_notification = db_notifications[0]
    read_notification.mark_read(True)
    unread_notification = user.profile.create_text_notification("Hello", "World")

    url = reverse("notifications-clear-read")
    response = client.delete(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["deleted_count"] == 1
    assert not Notification.objects.filter(pk=read_notification.pk).exists()
    assert Notification.objects.filter(pk=unread_notification.pk).exists()


def test_clear_read_unauthenticated_returns_401() -> None:
    client = APIClient()
    url = reverse("notifications-clear-read")
    response = client.delete(url)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_unread_count_returns_profile_counter(
    client: APIClient,
    user: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    make_maintainer_notification(user)
    user.profile.refresh_from_db()
    user.profile.create_text_notification("Hello", "World")

    url = reverse("notifications-unread-count")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["unread_count"] == 2


def test_unread_count_excludes_other_users(
    client: APIClient,
    staff: User,
    make_maintainer_notification: Callable[..., list[Notification]],
) -> None:
    make_maintainer_notification(staff)

    url = reverse("notifications-unread-count")
    response = client.get(url)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["unread_count"] == 0


def test_unread_count_unauthenticated_returns_401() -> None:
    client = APIClient()
    url = reverse("notifications-unread-count")
    response = client.get(url)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
