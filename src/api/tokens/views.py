from django.conf import settings
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from knox.models import AuthToken
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from api.serializers import ErrorDetailSerializer


class TokenInfoSerializer(serializers.Serializer):
    created = serializers.DateTimeField()
    expiry = serializers.DateTimeField()
    ttl_days = serializers.IntegerField(
        help_text="Number of days the token lifetime is extended by when using the extend endpoint."
    )


class NewTokenSerializer(serializers.Serializer):
    created = serializers.DateTimeField()
    expiry = serializers.DateTimeField()
    token = serializers.CharField(
        help_text="Raw token value. Shown once — store it immediately."
    )
    ttl_days = serializers.IntegerField(
        help_text="Number of days the token lifetime is extended by when using the extend endpoint."
    )


class TokenManagementView(APIView):
    permission_classes = [IsAuthenticated]
    # Used by drf-spectacular for class-level introspection; individual methods
    # override this via @extend_schema.
    serializer_class = TokenInfoSerializer

    @extend_schema(
        operation_id="getToken",
        description=(
            "Return the authenticated user's active API token metadata. "
            "Returns 204 with no body when no token exists yet."
        ),
        responses={
            200: TokenInfoSerializer,
            204: None,
        },
    )
    def get(self, request: Request) -> Response:
        ttl = settings.REST_KNOX["TOKEN_TTL"]
        token = AuthToken.objects.filter(user=request.user).first()
        if token is None:
            return Response(status=status.HTTP_204_NO_CONTENT)
        serializer = TokenInfoSerializer(
            {"created": token.created, "expiry": token.expiry, "ttl_days": ttl.days}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        operation_id="generateToken",
        description=(
            "Generate a new API token for the authenticated user, replacing any existing one. "
            "The raw token value is returned once and will not be retrievable again."
        ),
        request=None,
        responses={201: NewTokenSerializer},
    )
    def post(self, request: Request) -> Response:
        ttl = settings.REST_KNOX["TOKEN_TTL"]
        AuthToken.objects.filter(user=request.user).delete()
        token_obj, raw = AuthToken.objects.create(  # type: ignore[misc]
            user=request.user, expiry=ttl
        )
        serializer = NewTokenSerializer(
            {
                "created": token_obj.created,
                "expiry": token_obj.expiry,
                "token": raw,
                "ttl_days": ttl.days,
            }
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        operation_id="revokeToken",
        description=(
            "Revoke the authenticated user's API token. "
            "Idempotent — returns 204 even if no token existed."
        ),
        responses={204: None},
    )
    def delete(self, request: Request) -> Response:
        AuthToken.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        operation_id="extendToken",
        description=(
            "Extend the expiry of the authenticated user's active API token by the configured TTL."
        ),
        request=None,
        responses={
            200: TokenInfoSerializer,
            404: ErrorDetailSerializer,
        },
    )
    def patch(self, request: Request) -> Response:
        ttl = settings.REST_KNOX["TOKEN_TTL"]
        token = AuthToken.objects.filter(user=request.user).first()
        if token is None:
            return Response(
                {"detail": "No active token to extend."},
                status=status.HTTP_404_NOT_FOUND,
            )
        token.expiry = timezone.now() + ttl
        token.save(update_fields=["expiry"])
        serializer = TokenInfoSerializer(
            {"created": token.created, "expiry": token.expiry, "ttl_days": ttl.days}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
