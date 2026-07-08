import pytest
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APIClient


@pytest.fixture
def url() -> str:
    return reverse("server-info")


@pytest.mark.django_db
def test_server_info_accessible_without_auth(url: str) -> None:
    anon = APIClient()
    response = anon.get(url)
    assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_server_info_values_match_settings(url: str) -> None:
    from django.conf import settings

    anon = APIClient()
    response = anon.get(url)
    data = response.data
    assert data["debug"] == settings.DEBUG
    assert data["production"] == settings.PRODUCTION
    assert data["revision"] == settings.REVISION
    assert data["show_demo_disclaimer"] == settings.SHOW_DEMO_DISCLAIMER
