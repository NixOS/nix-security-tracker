from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APIClient

URL = "/api/v1/subscriptions/auto-subscribe-to-maintained-packages"


def test_get_enabled(client: APIClient, user: User) -> None:
    user.profile.auto_subscribe_to_maintained_packages = True
    user.profile.save()
    response = client.get(URL)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["enabled"] is True


def test_get_disabled(client: APIClient, user: User) -> None:
    user.profile.auto_subscribe_to_maintained_packages = False
    user.profile.save()
    response = client.get(URL)
    assert response.status_code == status.HTTP_200_OK
    assert response.data["enabled"] is False


def test_put_enable(client: APIClient, user: User) -> None:
    user.profile.auto_subscribe_to_maintained_packages = False
    user.profile.save()
    response = client.put(URL, {"enabled": True}, format="json")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    user.profile.refresh_from_db()
    assert user.profile.auto_subscribe_to_maintained_packages is True
    # idempotency
    response = client.put(URL, {"enabled": True}, format="json")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    user.profile.refresh_from_db()
    assert user.profile.auto_subscribe_to_maintained_packages is True


def test_put_disable(client: APIClient, user: User) -> None:
    user.profile.auto_subscribe_to_maintained_packages = True
    user.profile.save()
    response = client.put(URL, {"enabled": False}, format="json")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    user.profile.refresh_from_db()
    assert user.profile.auto_subscribe_to_maintained_packages is False
    # idempotency
    response = client.put(URL, {"enabled": False}, format="json")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    user.profile.refresh_from_db()
    assert user.profile.auto_subscribe_to_maintained_packages is False


def test_put_invalid_body(client: APIClient, user: User) -> None:
    response = client.put(URL, {"enabled": "not-a-bool"}, format="json")
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_unauthenticated() -> None:
    anon = APIClient()
    assert anon.get(URL).status_code == status.HTTP_403_FORBIDDEN
    assert anon.put(URL).status_code == status.HTTP_403_FORBIDDEN
