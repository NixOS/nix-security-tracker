import pytest
from django.contrib.auth.models import User
from django.test import Client
from django.urls import reverse


@pytest.mark.django_db
def test_admin_login_redirects_anonymous_to_allauth() -> None:
    response = Client().get(reverse("admin:login"))
    assert response.status_code == 302
    assert response["Location"].startswith(reverse("account_login"))


@pytest.mark.django_db
def test_admin_login_rejects_password() -> None:
    User.objects.create_user(username="admin", password="hunter2", is_staff=True)
    client = Client()
    client.post(
        reverse("admin:login"),
        {"username": "admin", "password": "hunter2", "next": reverse("admin:index")},
    )
    assert "_auth_user_id" not in client.session


@pytest.mark.django_db
def test_admin_accessible_to_staff(user: User) -> None:
    user.is_staff = True
    user.save()
    client = Client()
    client.force_login(user)
    assert client.get(reverse("admin:index")).status_code == 200


@pytest.mark.django_db
@pytest.mark.parametrize(
    "fixture", ["user", "committer", "staff", "matching_training_user"]
)
def test_admin_denied_without_staff_flag(
    fixture: str, request: pytest.FixtureRequest
) -> None:
    client = Client()
    client.force_login(request.getfixturevalue(fixture))
    assert client.get(reverse("admin:index"), follow=True).status_code == 403
