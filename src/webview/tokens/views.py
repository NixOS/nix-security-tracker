from datetime import timedelta
from typing import Any

from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.models import User
from django.http import HttpRequest, HttpResponse
from django.shortcuts import redirect
from django.urls import reverse
from django.utils import timezone
from django.views.generic import TemplateView
from knox.models import AuthToken

expiry: timedelta = settings.REST_KNOX["TOKEN_TTL"]


class TokenManagementView(LoginRequiredMixin, TemplateView):
    template_name = "tokens/token_management.html"

    def get_context_data(self, **kwargs: Any) -> dict[str, Any]:
        context = super().get_context_data(**kwargs)
        context["token"] = AuthToken.objects.filter(user=self.request.user).first()
        context["TOKEN_LIFETIME_DAYS"] = expiry.days
        return context

    def post(self, request: HttpRequest) -> HttpResponse:
        assert isinstance(request.user, User)
        action = request.POST.get("action", "")

        if action == "generate":
            AuthToken.objects.filter(user=request.user).delete()
            token_obj, raw = AuthToken.objects.create(  # type: ignore[misc]
                user=request.user, expiry=expiry
            )
            return self.render_to_response(
                self.get_context_data(
                    token=token_obj,
                    new_token_value=raw,
                )
            )

        if action == "revoke":
            AuthToken.objects.filter(user=request.user).delete()
            return redirect(reverse("webview:tokens:manage"))

        if action == "extend":
            token_obj = AuthToken.objects.filter(user=request.user).first()
            if token_obj is not None:
                token_obj.expiry = timezone.now() + expiry
                token_obj.save(update_fields=["expiry"])
            return redirect(reverse("webview:tokens:manage"))

        return redirect(reverse("webview:tokens:manage"))
