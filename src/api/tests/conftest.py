import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

pytest_plugins = ["shared.tests.conftest"]


@pytest.fixture
def client(user: User) -> APIClient:
    c = APIClient()
    c.force_login(user)
    return c
