from typing import Any
from unittest.mock import patch

from allauth.account.utils import get_login_redirect_url
from allauth.socialaccount.providers.oauth2.views import OAuth2LoginView
from allauth.socialaccount.templatetags.socialaccount import provider_login_url
from django.contrib.auth import get_user_model, login
from django.http import HttpRequest, HttpResponse
from django.shortcuts import redirect
from django.test import Client
from django.urls import reverse


def test_redirect_after_login(db: None, client: Client) -> None:
    # location to start navigation
    entry_point = reverse("webview:suggestions_view")
    response = client.get(entry_point)
    # expect the correct login URL in the response,
    # which will redirect back to the same page on success
    context = response.context[0]
    login_url = provider_login_url(
        context,
        provider="github",
        next=context.request.get_full_path(),
    )
    assert login_url in response.content.decode("utf-8")
    # follow the login workflow as displayed
    response = client.get(login_url)
    # expect confirmation to log in and a CSRF barrier via POST request
    assert "form" in response.content.decode("utf-8")

    def mock_login(
        self: OAuth2LoginView, request: HttpRequest, *args: Any, **kwargs: Any
    ) -> HttpResponse:
        user, _ = get_user_model().objects.get_or_create(username="testuser")
        login(
            request,
            user,
            backend="allauth.account.auth_backends.AuthenticationBackend",
        )
        return redirect(get_login_redirect_url(request))

    with patch.object(OAuth2LoginView, "dispatch", mock_login):
        # log in and follow redirect
        response = client.post(login_url, {}, follow=True)

    assert response.status_code == 200
    assert response.context["user"].is_authenticated
    location, status = response.redirect_chain[-1]
    assert location == entry_point
