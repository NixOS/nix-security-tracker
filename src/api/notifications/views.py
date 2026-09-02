from enum import StrEnum
from typing import Any, cast

from django.db.models import QuerySet
from drf_spectacular.utils import extend_schema, extend_schema_field
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.mixins import DestroyModelMixin, ListModelMixin, RetrieveModelMixin
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from api.params import (
    ACTIVITY_LOG_PARAMETER,
    EXPAND_PARAMETER,
    activity_log_requested,
    parse_expand_fields,
)
from api.serializers import ErrorDetailSerializer
from api.suggestions.serializers import (
    SuggestionPackageSerializer,
    SuggestionSerializer,
    build_activity_log_map,
)
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
    suggestion = serializers.SerializerMethodField()
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
            "suggestion",
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

    @extend_schema_field(
        {
            "nullable": True,
            "allOf": [{"$ref": "#/components/schemas/Suggestion"}],
        }
    )
    def get_suggestion(self, notif: Notification) -> dict[str, Any] | None:
        """Embedded suggestions when notification is about a suggestion and `expand=suggestion` is passed"""
        if not self.context.get("expand_suggestion"):
            return None
        if isinstance(notif, SuggestionNotification):
            notif.suggestion.ensure_fresh_cache()
            return cast(
                dict[str, Any],
                SuggestionSerializer(notif.suggestion, context=self.context).data,
            )
        return None

    def get_title(self, notif: Notification) -> str:
        return notif.title

    def get_type(self, notif: Notification) -> NotificationType:
        if isinstance(notif, TextNotification):
            return NotificationType.TEXT
        return NotificationType.SUGGESTION


class NotificationUpdateSerializer(serializers.Serializer):
    """Request body for marking a notification read/unread."""

    is_read = serializers.BooleanField(
        help_text="New read status for the notification.",
    )


class NotificationUnreadCountSerializer(serializers.Serializer):
    """Response body carrying the authenticated user's unread notification count."""

    unread_count = serializers.IntegerField(
        help_text="Number of unread notifications for the authenticated user.",
    )


class NotificationDeletedCountSerializer(serializers.Serializer):
    """Response body carrying the number of notifications deleted by a bulk action."""

    deleted_count = serializers.IntegerField(
        help_text="Number of read notifications that were deleted.",
    )


class NotificationPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "per_page"
    max_page_size = 100

    def get_paginated_response(self, data: list) -> Response:
        response = super().get_paginated_response(data)
        request = cast(Request, self.request)
        response_data = cast(dict, response.data)
        response_data["unread_count"] = request.user.profile.unread_notifications_count
        return response

    def get_paginated_response_schema(self, schema: dict) -> dict:
        response_schema = cast(dict, super().get_paginated_response_schema(schema))
        response_schema["properties"]["unread_count"] = {
            "type": "integer",
            "example": 3,
        }
        response_schema["required"].append("unread_count")
        return response_schema


class NotificationViewSet(
    ListModelMixin,
    RetrieveModelMixin,
    DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    pagination_class = NotificationPagination

    def get_queryset(  # pyright: ignore[reportIncompatibleMethodOverride]
        self,
    ) -> QuerySet[Notification]:
        return (
            Notification.objects.filter(user=self.request.user)
            .select_related(
                "suggestionnotification__suggestion__cve",
                "suggestionnotification__suggestion__cached",
            )
            .prefetch_related(
                "suggestionnotification__suggestion__cve__container__references__tags",
            )
            .select_subclasses()
            .order_by("-created_at")
        )

    def get_serializer_context(self) -> dict:
        context = super().get_serializer_context()
        request = cast(Request, self.request)
        expand_suggestion = "suggestion" in parse_expand_fields(request)
        context["expand_suggestion"] = expand_suggestion
        # Only meaningful when the suggestion is inlined; otherwise there is
        # nothing to attach the activity log to.
        context["include_activity_log"] = expand_suggestion and activity_log_requested(
            request
        )
        return context

    def _add_activity_log_context(
        self, notifications: list[Notification], context: dict
    ) -> dict:
        """Batch the activity log for all suggestions embedded in the given notifications."""
        if context.get("include_activity_log"):
            suggestion_ids = [
                notif.suggestion_id
                for notif in notifications
                if isinstance(notif, SuggestionNotification)
            ]
            context["activity_logs"] = build_activity_log_map(suggestion_ids)
        return context

    @extend_schema(
        operation_id="listNotifications",
        description=(
            "List notifications for the authenticated user, ordered by most recent. "
            "Supports `expand=suggestion` to inline the full suggestion object on suggestion "
            "notifications instead of just its id."
        ),
        parameters=[EXPAND_PARAMETER, ACTIVITY_LOG_PARAMETER],
        responses={200: NotificationSerializer},
    )
    def list(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        notifications = page if page is not None else list(queryset)
        context = self._add_activity_log_context(
            notifications, self.get_serializer_context()
        )
        serializer = self.get_serializer_class()(
            notifications, many=True, context=context
        )
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @extend_schema(
        operation_id="getNotification",
        description=(
            "Get full details of a single notification. "
            "Supports `expand=suggestion` to inline the full suggestion object on suggestion "
            "notifications instead of just its id."
        ),
        parameters=[EXPAND_PARAMETER, ACTIVITY_LOG_PARAMETER],
        responses={200: NotificationSerializer, 404: ErrorDetailSerializer},
    )
    def retrieve(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        instance = self.get_object()
        context = self._add_activity_log_context(
            [instance], self.get_serializer_context()
        )
        serializer = self.get_serializer_class()(instance, context=context)
        return Response(serializer.data)

    @extend_schema(
        operation_id="updateNotification",
        description="Mark a single notification as read or unread.",
        request=NotificationUpdateSerializer,
        responses={
            200: NotificationSerializer,
            400: ErrorDetailSerializer,
            404: ErrorDetailSerializer,
        },
    )
    def partial_update(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        instance = self.get_object()
        update_serializer = NotificationUpdateSerializer(data=request.data)
        update_serializer.is_valid(raise_exception=True)
        instance.mark_read(update_serializer.validated_data["is_read"])
        context = self.get_serializer_context()
        return Response(NotificationSerializer(instance, context=context).data)

    @extend_schema(
        operation_id="deleteNotification",
        description="Delete a single notification.",
        responses={204: None, 404: ErrorDetailSerializer},
    )
    def destroy(self, request: Request, *args: Any, **kwargs: Any) -> Response:
        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        operation_id="markAllNotificationsRead",
        description="Mark all of the authenticated user's notifications as read.",
        request=None,
        responses={200: NotificationUnreadCountSerializer},
    )
    @action(
        detail=False,
        methods=["post"],
        url_path="mark-all-read",
        serializer_class=NotificationUnreadCountSerializer,
    )
    def mark_all_read(self, request: Request) -> Response:
        request.user.profile.mark_all_read_for_user()
        return Response({"unread_count": 0})

    @extend_schema(
        operation_id="clearReadNotifications",
        description="Delete all of the authenticated user's read notifications.",
        responses={200: NotificationDeletedCountSerializer},
    )
    @action(
        detail=False,
        methods=["delete"],
        url_path="clear-read",
        serializer_class=NotificationDeletedCountSerializer,
    )
    def clear_read(self, request: Request) -> Response:
        deleted_count = request.user.profile.clear_read_for_user()
        return Response({"deleted_count": deleted_count})

    @extend_schema(
        operation_id="getNotificationsUnreadCount",
        description=(
            "Get the authenticated user's unread notification count. "
            "Lightweight endpoint intended for badges/indicators shown outside the "
            "notification center itself (e.g. a header bell), so it doesn't require "
            "fetching a full notification page."
        ),
        responses={200: NotificationUnreadCountSerializer},
    )
    @action(
        detail=False,
        methods=["get"],
        url_path="unread-count",
        serializer_class=NotificationUnreadCountSerializer,
    )
    def unread_count(self, request: Request) -> Response:
        return Response(
            {"unread_count": request.user.profile.unread_notifications_count}
        )
