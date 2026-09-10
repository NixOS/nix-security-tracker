from django.conf import settings
from rest_framework.request import Request
from rest_framework.throttling import SimpleRateThrottle

from shared.auth import isadmin


class APIRateThrottle(SimpleRateThrottle):
    scope = "api"

    def allow_request(self, request: Request, view: object) -> bool:
        self.rate = self.get_rate(request)
        self.num_requests, self.duration = self.parse_rate(self.rate)
        return super().allow_request(request, view)

    def get_rate(self, request: Request | None = None) -> str:
        if request is None:
            return settings.API_THROTTLE_AUTHENTICATED
        if not request.user.is_authenticated:
            return settings.API_THROTTLE_ANONYMOUS
        if isadmin(request.user):
            return settings.API_THROTTLE_SECURITY_TEAM
        return settings.API_THROTTLE_AUTHENTICATED

    def get_cache_key(self, request: Request, view: object) -> str:
        if request.user.is_authenticated:
            auth_method = "token" if request.auth is not None else "session"
            ident = f"{request.user.pk}:{auth_method}"
        else:
            ident = self.get_ident(request)
        return self.cache_format % {"scope": self.scope, "ident": ident}
