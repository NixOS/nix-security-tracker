from collections.abc import Callable

import pytest
from django.contrib.auth.models import User
from knox.models import AuthToken
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APIClient


@pytest.fixture
def url() -> str:
    return reverse("token-management")


@pytest.mark.django_db
def test_get_no_token(client: APIClient, url: str) -> None:
    response = client.get(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.django_db
def test_get_with_token(
    client: APIClient,
    user: User,
    make_token: Callable[..., tuple[AuthToken, str]],
    url: str,
) -> None:
    make_token(user)
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert "created" in response.data
    assert "expiry" in response.data
    assert "ttl_days" in response.data
    assert "token" not in response.data


@pytest.mark.django_db
def test_get_unauthenticated(url: str) -> None:
    anon = APIClient()
    response = anon.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_post_generates_token(client: APIClient, user: User, url: str) -> None:
    response = client.post(url)
    assert response.status_code == status.HTTP_201_CREATED
    assert "token" in response.data
    assert "created" in response.data
    assert "expiry" in response.data
    assert AuthToken.objects.filter(user=user).exists()


@pytest.mark.django_db
def test_post_replaces_existing_token(
    client: APIClient,
    user: User,
    make_token: Callable[..., tuple[AuthToken, str]],
    url: str,
) -> None:
    old_obj, _ = make_token(user)
    response = client.post(url)
    assert response.status_code == status.HTTP_201_CREATED
    assert AuthToken.objects.filter(user=user).count() == 1
    new_obj = AuthToken.objects.get(user=user)
    assert new_obj.pk != old_obj.pk


@pytest.mark.django_db
def test_post_raw_token_not_in_subsequent_get(client: APIClient, url: str) -> None:
    client.post(url)
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert "token" not in response.data


@pytest.mark.django_db
def test_delete_revokes_token(
    client: APIClient,
    user: User,
    make_token: Callable[..., tuple[AuthToken, str]],
    url: str,
) -> None:
    make_token(user)
    response = client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert not AuthToken.objects.filter(user=user).exists()


@pytest.mark.django_db
def test_delete_idempotent_no_token(client: APIClient, url: str) -> None:
    response = client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.django_db
def test_patch_extends_expiry(
    client: APIClient,
    user: User,
    make_token: Callable[..., tuple[AuthToken, str]],
    url: str,
) -> None:
    token_obj, _ = make_token(user)
    old_expiry = token_obj.expiry
    response = client.patch(url)
    assert response.status_code == status.HTTP_200_OK
    token_obj.refresh_from_db()
    assert old_expiry is not None
    assert token_obj.expiry is not None
    assert token_obj.expiry > old_expiry


@pytest.mark.django_db
def test_patch_no_token_returns_404(client: APIClient, url: str) -> None:
    response = client.patch(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "detail" in response.data
