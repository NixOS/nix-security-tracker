from collections.abc import Callable

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
