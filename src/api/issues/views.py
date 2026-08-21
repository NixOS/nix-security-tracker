from django.db.models import Prefetch
from django.db.models.query import QuerySet
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import viewsets
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from api.issues.serializers import IssueSerializer
from api.serializers import ErrorDetailSerializer
from shared.models import (
    NIXPKGS_ISSUE_CODE_REGEX,
    EventType,
    NixpkgsEvent,
    NixpkgsIssue,
)

EXPAND_PARAMETER = OpenApiParameter(
    name="expand",
    type=str,
    location=OpenApiParameter.QUERY,
    required=False,
    description=(
        "Comma-separated list of fields to inline instead of returning ids. "
        "Currently only `suggestions` is supported: when included, the "
        "`suggestions` field contains full suggestion objects instead of ids."
    ),
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
        expand = self.request.query_params.get("expand", "")
        expand_fields = {field.strip() for field in expand.split(",") if field.strip()}
        context["expand_suggestions"] = "suggestions" in expand_fields
        return context

    @extend_schema(
        operation_id="listIssues",
        description="List all Nixpkgs security issues, sorted by most recently created first.",
        parameters=[EXPAND_PARAMETER],
        responses={200: IssueSerializer(many=True)},
    )
    def list(self, request: Request) -> Response:
        return super().list(request)

    @extend_schema(
        operation_id="getIssue",
        description="Get full details of a Nixpkgs security issue.",
        parameters=[EXPAND_PARAMETER],
        responses={200: IssueSerializer, 404: ErrorDetailSerializer},
    )
    def retrieve(self, request: Request, code: str) -> Response:
        instance = self.get_object()
        if self.get_serializer_context()["expand_suggestions"]:
            for suggestion in instance.suggestions.all():
                suggestion.ensure_fresh_cache()
        return Response(self.get_serializer(instance).data)
