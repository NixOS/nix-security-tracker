from collections.abc import Callable

import pytest
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.models.nix_evaluation import NixDerivation


def url(package_name: str) -> str:
    return reverse("package-exists", kwargs={"package_name": package_name})


@pytest.mark.django_db
def test_package_exists_true_for_existing_package(
    make_drv: Callable[..., NixDerivation],
) -> None:
    drv = make_drv(pname="foo")
    anon = APIClient()
    response = anon.get(url(drv.attribute))
    assert response.status_code == status.HTTP_200_OK
    assert response.data["exists"] is True


@pytest.mark.django_db
def test_package_exists_false_for_nonexistent_package() -> None:
    anon = APIClient()
    response = anon.get(url("nonexistent-package"))
    assert response.status_code == status.HTTP_200_OK
    assert response.data["exists"] is False
