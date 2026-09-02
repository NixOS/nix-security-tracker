from typing import cast

from django.db.models import Prefetch
from django.db.models.query import QuerySet
from drf_spectacular.utils import extend_schema
from rest_framework import viewsets
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from api.issues.serializers import IssueSerializer
from api.params import (
    ACTIVITY_LOG_PARAMETER,
    EXPAND_PARAMETER,
    activity_log_requested,
    parse_expand_fields,
)
from api.serializers import ErrorDetailSerializer
from api.suggestions.serializers import build_activity_log_map
from shared.models import (
    NIXPKGS_ISSUE_CODE_REGEX,
    EventType,
    NixpkgsEvent,
    NixpkgsIssue,
)


class IssuePagination(PageNumberPagination):
    page_size = 10  # TODO(@florentc): Allow the user to change it within limits


class IssueViewSet(ListModelMixin, RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = NixpkgsIssue.objects.all()
    serializer_class = IssueSerializer
    pagination_class = IssuePagination
    permission_classes = [AllowAny]
    lookup_field = "code"
    lookup_value_regex = NIXPKGS_ISSUE_CODE_REGEX

    def get_queryset(self) -> QuerySet[NixpkgsIssue]:  # pyright: ignore[reportIncompatibleMethodOverride]
        return (
            NixpkgsIssue.objects.prefetch_related(
                "suggestions__cached",
                "suggestions__cve__container__references__tags",
                Prefetch(
                    "events",
                    queryset=NixpkgsEvent.objects.filter(
                        event_type=EventType.ISSUE | EventType.OPENED,
                    ),
                ),
            )
            .order_by("-created_at")
            .distinct()
        )

    def get_serializer_context(self) -> dict:
        context = super().get_serializer_context()
        request = cast(Request, self.request)
        expand_suggestions = "suggestions" in parse_expand_fields(request)
        context["expand_suggestions"] = expand_suggestions
        # Only meaningful when suggestions are inlined; otherwise there is nothing
        # to attach the activity log to.
        context["include_activity_log"] = expand_suggestions and activity_log_requested(
            request
        )
        return context

    def _add_activity_log_context(
        self, issues: list[NixpkgsIssue], context: dict
    ) -> dict:
        """Batch the activity log for all suggestions embedded in the given issues."""
        if context.get("include_activity_log"):
            suggestion_ids = [
                suggestion.pk
                for issue in issues
                for suggestion in issue.suggestions.all()
            ]
            context["activity_logs"] = build_activity_log_map(suggestion_ids)
        return context

    @extend_schema(
        operation_id="listIssues",
        description=(
            "List all Nixpkgs security issues, sorted by most recently created first. "
        ),
        parameters=[EXPAND_PARAMETER, ACTIVITY_LOG_PARAMETER],
        responses={200: IssueSerializer(many=True)},
    )
    def list(self, request: Request) -> Response:
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        issues = page if page is not None else list(queryset)
        context = self._add_activity_log_context(issues, self.get_serializer_context())
        serializer = self.get_serializer_class()(issues, many=True, context=context)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @extend_schema(
        operation_id="getIssue",
        description=("Get full details of a Nixpkgs security issue. "),
        parameters=[EXPAND_PARAMETER, ACTIVITY_LOG_PARAMETER],
        responses={200: IssueSerializer, 404: ErrorDetailSerializer},
    )
    def retrieve(self, request: Request, code: str) -> Response:
        instance = self.get_object()
        context = self.get_serializer_context()
        if context["expand_suggestions"]:
            for suggestion in instance.suggestions.all():
                suggestion.ensure_fresh_cache()
        context = self._add_activity_log_context([instance], context)
        serializer = self.get_serializer_class()(instance, many=False, context=context)
        return Response(serializer.data)
