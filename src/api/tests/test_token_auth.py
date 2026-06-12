from collections.abc import Callable
from datetime import timedelta

import pytest
from django.contrib.auth.models import User
from freezegun import freeze_time
from knox.models import AuthToken
from rest_framework.test import APIClient

from shared.models.linkage import CVEDerivationClusterProposal

# A public (AllowAny) endpoint that returns 404 for non-existent objects,
# used to probe authentication without needing real fixture data.
PROBE_URL = "/api/v1/suggestions/999999/status"


@pytest.mark.django_db
def test_bearer_auth_valid_token(
    user: User, make_token: Callable[..., tuple[AuthToken, str]]
) -> None:
    _, raw = make_token(user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {raw}")
    response = client.get(PROBE_URL)
    # 404 means the auth worked (no 401/403)
    assert response.status_code == 404


@pytest.mark.django_db
def test_bearer_auth_invalid_token() -> None:
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION="Bearer invalidtoken")
    response = client.get(PROBE_URL)
    assert response.status_code == 401


@pytest.mark.django_db
def test_bearer_auth_expired_token(
    user: User, make_token: Callable[..., tuple[AuthToken, str]]
) -> None:
    token_obj, raw = make_token(user)
    assert token_obj.expiry is not None
    with freeze_time(token_obj.expiry + timedelta(seconds=1)):
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {raw}")
        response = client.get(PROBE_URL)
    assert response.status_code == 401


@pytest.mark.django_db
def test_bearer_auth_revoked_token(
    user: User, make_token: Callable[..., tuple[AuthToken, str]]
) -> None:
    _, raw = make_token(user)
    AuthToken.objects.filter(user=user).delete()
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {raw}")
    response = client.get(PROBE_URL)
    assert response.status_code == 401


@pytest.mark.django_db
def test_bearer_auth_missing_header() -> None:
    """No Authorization header → anonymous; AllowAny endpoints still respond."""
    client = APIClient()
    response = client.get(PROBE_URL)
    assert response.status_code == 404


@pytest.mark.django_db
def test_bearer_auth_malformed_header() -> None:
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION="Token sometoken")
    response = client.get(PROBE_URL)
    # Not a Bearer header → treated as anonymous → AllowAny endpoint → 404
    assert response.status_code == 404


@pytest.mark.parametrize(
    ("actor_fixture", "expected_status"),
    [
        ("user", 403),
        ("staff", 200),
    ],
)
@pytest.mark.django_db
def test_bearer_auth_change_status_permissions(
    request: pytest.FixtureRequest,
    actor_fixture: str,
    expected_status: int,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_token: Callable[..., tuple[AuthToken, str]],
) -> None:
    """Bearer token: regular users get 403, staff can change status (200)."""
    actor: User = request.getfixturevalue(actor_fixture)
    suggestion = make_cached_suggestion()
    _, raw = make_token(actor)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {raw}")
    response = client.post(
        f"/api/v1/suggestions/{suggestion.pk}/change_status",
        {"status": CVEDerivationClusterProposal.Status.ACCEPTED},
        format="json",
    )
    assert response.status_code == expected_status
    if expected_status == 200:
        assert response.data["status"] == CVEDerivationClusterProposal.Status.ACCEPTED
