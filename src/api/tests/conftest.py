from collections.abc import Callable

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

pytest_plugins = ["shared.tests.conftest"]


@pytest.fixture
def client(user: User, make_client: Callable[..., APIClient]) -> APIClient:
    return make_client(user)


@pytest.fixture
def make_client() -> Callable[..., APIClient]:
    def wrapped(user: User, authenticated: bool = True) -> APIClient:
        c = APIClient()
        if authenticated:
            c.force_login(user)
        return c

    return wrapped
