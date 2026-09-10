from collections.abc import Callable

import pytest
from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import override_settings
from knox.models import AuthToken
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework.views import APIView

from api.throttling import APIRateThrottle

PROBE_URL = "/api/v1/server-info"


@pytest.fixture(autouse=True)
def enable_api_throttling(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        APIView,
        "throttle_classes",
        [APIRateThrottle],
    )


@pytest.fixture(autouse=True)
def clear_throttle_cache() -> None:
    cache.clear()


@pytest.mark.django_db
@override_settings(API_THROTTLE_ANONYMOUS="1/min")
def test_anonymous_requests_are_throttled() -> None:
    client = APIClient()
    assert client.get(PROBE_URL).status_code == status.HTTP_200_OK
    assert client.get(PROBE_URL).status_code == status.HTTP_429_TOO_MANY_REQUESTS


@pytest.mark.django_db
@override_settings(API_THROTTLE_AUTHENTICATED="1/min")
def test_authenticated_session_requests_are_throttled(user: User) -> None:
    client = APIClient()
    client.force_login(user)
    assert client.get(PROBE_URL).status_code == status.HTTP_200_OK
    assert client.get(PROBE_URL).status_code == status.HTTP_429_TOO_MANY_REQUESTS


@pytest.mark.django_db
@override_settings(
    API_THROTTLE_AUTHENTICATED="1/min",
    API_THROTTLE_SECURITY_TEAM="2/min",
)
def test_security_team_has_its_own_rate(staff: User) -> None:
    client = APIClient()
    client.force_login(staff)
    assert client.get(PROBE_URL).status_code == status.HTTP_200_OK
    assert client.get(PROBE_URL).status_code == status.HTTP_200_OK
    assert client.get(PROBE_URL).status_code == status.HTTP_429_TOO_MANY_REQUESTS


@pytest.mark.django_db
@override_settings(API_THROTTLE_AUTHENTICATED="1/min")
def test_token_and_session_requests_use_independent_buckets(
    user: User,
    make_token: Callable[..., tuple[AuthToken, str]],
) -> None:
    _, raw_token = make_token(user)

    session_client = APIClient()
    session_client.force_login(user)
    token_client = APIClient()
    token_client.credentials(HTTP_AUTHORIZATION=f"Bearer {raw_token}")

    assert session_client.get(PROBE_URL).status_code == status.HTTP_200_OK
    assert token_client.get(PROBE_URL).status_code == status.HTTP_200_OK
    assert (
        session_client.get(PROBE_URL).status_code == status.HTTP_429_TOO_MANY_REQUESTS
    )
    assert token_client.get(PROBE_URL).status_code == status.HTTP_429_TOO_MANY_REQUESTS
