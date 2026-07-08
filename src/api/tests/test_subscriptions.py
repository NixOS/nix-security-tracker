from collections.abc import Callable

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient

from shared.models.nix_evaluation import NixDerivation
from shared.models.package import Package

AUTO_SUBSCRIBE_URL = "/api/v1/subscriptions/auto-subscribe-to-maintained-packages"
EMAIL_NOTIFICATIONS_URL = "/api/v1/subscriptions/email-notifications"
PACKAGES_URL = "/api/v1/subscriptions/packages"

# --- Auto subscribe ---


def test_get_enabled(client: APIClient, user: User) -> None:
    user.profile.auto_subscribe_to_maintained_packages = True
    user.profile.save()
    response = client.get(AUTO_SUBSCRIBE_URL)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["enabled"] is True


def test_get_disabled(client: APIClient, user: User) -> None:
    user.profile.auto_subscribe_to_maintained_packages = False
    user.profile.save()
    response = client.get(AUTO_SUBSCRIBE_URL)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["enabled"] is False


def test_put_enable(client: APIClient, user: User) -> None:
    user.profile.auto_subscribe_to_maintained_packages = False
    user.profile.save()
    response = client.put(AUTO_SUBSCRIBE_URL, {"enabled": True}, format="json")
    assert response.status_code == status.HTTP_200_OK
    user.profile.refresh_from_db()
    assert user.profile.auto_subscribe_to_maintained_packages is True
    # idempotency
    response = client.put(AUTO_SUBSCRIBE_URL, {"enabled": True}, format="json")
    assert response.status_code == status.HTTP_200_OK
    user.profile.refresh_from_db()
    assert user.profile.auto_subscribe_to_maintained_packages is True


def test_put_disable(client: APIClient, user: User) -> None:
    user.profile.auto_subscribe_to_maintained_packages = True
    user.profile.save()
    response = client.put(AUTO_SUBSCRIBE_URL, {"enabled": False}, format="json")
    assert response.status_code == status.HTTP_200_OK
    user.profile.refresh_from_db()
    assert user.profile.auto_subscribe_to_maintained_packages is False
    # idempotency
    response = client.put(AUTO_SUBSCRIBE_URL, {"enabled": False}, format="json")
    assert response.status_code == status.HTTP_200_OK
    user.profile.refresh_from_db()
    assert user.profile.auto_subscribe_to_maintained_packages is False


def test_put_invalid_body(client: APIClient, user: User) -> None:
    response = client.put(AUTO_SUBSCRIBE_URL, {"enabled": "not-a-bool"}, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_unauthenticated() -> None:
    anon = APIClient()
    assert anon.get(AUTO_SUBSCRIBE_URL).status_code == status.HTTP_401_UNAUTHORIZED
    assert anon.put(AUTO_SUBSCRIBE_URL).status_code == status.HTTP_401_UNAUTHORIZED


# --- Email notifications ---


def test_email_notifications_get_enabled(client: APIClient, user: User) -> None:
    user.profile.receive_email_notifications = True
    user.profile.save()
    response = client.get(EMAIL_NOTIFICATIONS_URL)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["enabled"] is True


def test_email_notifications_get_disabled(client: APIClient, user: User) -> None:
    user.profile.receive_email_notifications = False
    user.profile.save()
    response = client.get(EMAIL_NOTIFICATIONS_URL)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["enabled"] is False


def test_email_notifications_put_enable(client: APIClient, user: User) -> None:
    user.profile.receive_email_notifications = False
    user.profile.save()
    response = client.put(EMAIL_NOTIFICATIONS_URL, {"enabled": True}, format="json")
    assert response.status_code == status.HTTP_200_OK
    user.profile.refresh_from_db()
    assert user.profile.receive_email_notifications is True
    # idempotency
    response = client.put(EMAIL_NOTIFICATIONS_URL, {"enabled": True}, format="json")
    assert response.status_code == status.HTTP_200_OK
    user.profile.refresh_from_db()
    assert user.profile.receive_email_notifications is True


def test_email_notifications_put_disable(client: APIClient, user: User) -> None:
    user.profile.receive_email_notifications = True
    user.profile.save()
    response = client.put(EMAIL_NOTIFICATIONS_URL, {"enabled": False}, format="json")
    assert response.status_code == status.HTTP_200_OK
    user.profile.refresh_from_db()
    assert user.profile.receive_email_notifications is False
    # idempotency
    response = client.put(EMAIL_NOTIFICATIONS_URL, {"enabled": False}, format="json")
    assert response.status_code == status.HTTP_200_OK
    user.profile.refresh_from_db()
    assert user.profile.receive_email_notifications is False


def test_email_notifications_put_invalid_body(client: APIClient, user: User) -> None:
    response = client.put(
        EMAIL_NOTIFICATIONS_URL, {"enabled": "not-a-bool"}, format="json"
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_email_notifications_unauthenticated() -> None:
    anon = APIClient()
    assert anon.get(EMAIL_NOTIFICATIONS_URL).status_code == status.HTTP_401_UNAUTHORIZED
    assert anon.put(EMAIL_NOTIFICATIONS_URL).status_code == status.HTTP_401_UNAUTHORIZED


# --- Package subscriptions ---


def test_packages_list_empty(client: APIClient, user: User) -> None:
    response = client.get(PACKAGES_URL)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["packages"] == []


def test_packages_list_with_subscriptions(
    client: APIClient, user: User, make_drv: Callable[..., NixDerivation]
) -> None:
    drv = make_drv(attribute="firefox")
    user.profile.subscribe_to_package(drv.attribute)
    response = client.get(PACKAGES_URL)
    assert response.status_code == status.HTTP_200_OK
    assert "firefox" in response.data["packages"]


def test_packages_add_success(
    client: APIClient,
    user: User,
    make_drv: Callable[..., NixDerivation],
    make_package: Callable[..., Package],
) -> None:
    drv = make_drv(attribute="firefox")
    make_package(drv)
    response = client.post(PACKAGES_URL, {"package_name": drv.attribute}, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    assert drv.attribute in response.data["packages"]
    user.profile.refresh_from_db()
    assert drv.attribute in user.profile.package_subscriptions


def test_packages_add_duplicate(
    client: APIClient,
    user: User,
    make_drv: Callable[..., NixDerivation],
    make_package: Callable[..., Package],
) -> None:
    drv = make_drv(attribute="firefox")
    make_package(drv)
    user.profile.subscribe_to_package(drv.attribute)
    response = client.post(PACKAGES_URL, {"package_name": drv.attribute}, format="json")
    assert response.status_code == status.HTTP_409_CONFLICT


def test_packages_add_nonexistent_package(client: APIClient, user: User) -> None:
    response = client.post(
        PACKAGES_URL, {"package_name": "nonexistent-package"}, format="json"
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_packages_add_empty_package_name(client: APIClient, user: User) -> None:
    response = client.post(PACKAGES_URL, {"package_name": ""}, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_packages_remove_success(
    client: APIClient, user: User, make_drv: Callable[..., NixDerivation]
) -> None:
    drv = make_drv(attribute="firefox")
    user.profile.subscribe_to_package(drv.attribute)
    response = client.delete(f"{PACKAGES_URL}/{drv.attribute}")
    assert response.status_code == status.HTTP_200_OK
    assert drv.attribute not in response.data["packages"]
    user.profile.refresh_from_db()
    assert drv.attribute not in user.profile.package_subscriptions


def test_packages_remove_not_subscribed(
    client: APIClient, user: User, make_drv: Callable[..., NixDerivation]
) -> None:
    drv = make_drv(attribute="firefox")
    response = client.delete(f"{PACKAGES_URL}/{drv.attribute}")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_packages_unauthenticated() -> None:
    anon = APIClient()
    response = anon.get(PACKAGES_URL)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = anon.post(PACKAGES_URL, {"package_name": "firefox"}, format="json")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    response = anon.delete(f"{PACKAGES_URL}/firefox")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


# --- Individual package subscription status ---


def test_get_package_subscription_subscribed(
    client: APIClient,
    user: User,
    make_drv: Callable[..., NixDerivation],
    make_package: Callable[..., Package],
) -> None:
    drv = make_drv(attribute="firefox")
    make_package(drv)
    user.profile.subscribe_to_package(drv.attribute)
    response = client.get(f"{PACKAGES_URL}/{drv.attribute}")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["subscribed"] is True


def test_get_package_subscription_not_subscribed(
    client: APIClient,
    user: User,
    make_drv: Callable[..., NixDerivation],
    make_package: Callable[..., Package],
) -> None:
    drv = make_drv(attribute="firefox")
    make_package(drv)
    response = client.get(f"{PACKAGES_URL}/{drv.attribute}")
    assert response.status_code == status.HTTP_200_OK
    assert response.data["subscribed"] is False


def test_get_package_subscription_nonexistent(client: APIClient, user: User) -> None:
    response = client.get(f"{PACKAGES_URL}/nonexistent-package")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_get_package_subscription_unauthenticated() -> None:
    anon = APIClient()
    assert (
        anon.get(f"{PACKAGES_URL}/firefox").status_code == status.HTTP_401_UNAUTHORIZED
    )
