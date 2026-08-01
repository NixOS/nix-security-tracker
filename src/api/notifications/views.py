from enum import StrEnum
from typing import Any

from django.db.models import QuerySet
from drf_spectacular.utils import extend_schema, extend_schema_field
from rest_framework import serializers, viewsets
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from api.suggestions.serializers import SuggestionPackageSerializer
from shared.cache_suggestions import CachedSuggestion
from webview.models import Notification, SuggestionNotification, TextNotification


class NotificationType(StrEnum):
    TEXT = "text"
    SUGGESTION = "suggestion"


class NotificationSerializer(serializers.ModelSerializer):
    is_obsolete = serializers.SerializerMethodField()
    message = serializers.SerializerMethodField()
    matching_maintained_packages = serializers.SerializerMethodField()
    matching_subscribed_packages = serializers.SerializerMethodField()
    suggestion_id = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "created_at",
            "id",
            "is_obsolete",
            "is_read",
            "message",
            "matching_maintained_packages",
            "matching_subscribed_packages",
            "suggestion_id",
            "title",
            "type",
        ]

    def get_is_obsolete(self, notif: Notification) -> bool:
        if isinstance(notif, TextNotification):
            return False
        return not (
            self.get_matching_maintained_packages(notif)
            or self.get_matching_subscribed_packages(notif)
        )

    def get_message(self, notif: Notification) -> str | None:
        if isinstance(notif, TextNotification):
            return notif.message
        return None

    @extend_schema_field(serializers.DictField(child=SuggestionPackageSerializer()))
    def get_matching_maintained_packages(
        self, notif: Notification
    ) -> dict[str, Any] | None:
        username = self.context["request"].user.username
        if isinstance(notif, SuggestionNotification):
            cached = CachedSuggestion.model_validate(notif.suggestion.cached.payload)
            return {
                pname: SuggestionPackageSerializer(pkg).data
                for pname, pkg in cached.packages.items()
                if any(m.github == username for m in pkg.maintainers)
            }
        return None

    @extend_schema_field(serializers.DictField(child=SuggestionPackageSerializer()))
    def get_matching_subscribed_packages(
        self, notif: Notification
    ) -> dict[str, Any] | None:
        if isinstance(notif, SuggestionNotification):
            cached = CachedSuggestion.model_validate(notif.suggestion.cached.payload)
            subscribed_attrs = set(
                self.context["request"].user.profile.package_subscriptions
            )
            return {
                attr: SuggestionPackageSerializer(cached.packages[attr]).data
                for attr in cached.packages
                if attr in subscribed_attrs
            }
        return None

    def get_suggestion_id(self, notif: Notification) -> int | None:
        if isinstance(notif, SuggestionNotification):
            return notif.suggestion_id
        return None

    def get_title(self, notif: Notification) -> str:
        return notif.title

    def get_type(self, notif: Notification) -> NotificationType:
        if isinstance(notif, TextNotification):
            return NotificationType.TEXT
        return NotificationType.SUGGESTION


class NotificationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "per_page"
    max_page_size = 100


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    pagination_class = NotificationPagination

    @extend_schema(
        operation_id="listNotifications",
        description="List notifications for the authenticated user, ordered by most recent.",
        responses={200: NotificationSerializer},
    )
    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().list(request, *args, **kwargs)

    def get_queryset(  # pyright: ignore[reportIncompatibleMethodOverride]
        self,
    ) -> QuerySet[Notification]:
        return (
            Notification.objects.filter(user=self.request.user)
            .select_related(
                "suggestionnotification__suggestion__cve",
            )
            .select_subclasses()
            .order_by("-created_at")
        )
