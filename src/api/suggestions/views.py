from typing import cast

from django.core.exceptions import ValidationError
from django.db.models.query import QuerySet
from django.template.defaultfilters import truncatewords
from django_filters import rest_framework as filters
from drf_spectacular.utils import (
    OpenApiParameter,
    extend_schema,
    extend_schema_serializer,
)
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from api.issues.serializers import IssueSerializer
from api.params import ACTIVITY_LOG_PARAMETER, activity_log_requested
from api.serializers import ErrorDetailSerializer
from api.suggestions.serializers import (
    ActivityLogEntrySerializer,
    IssueDraftPublishSerializer,
    MaintainerSerializer,
    SuggestionBundleSerializer,
    SuggestionCategorizedMaintainersSerializer,
    SuggestionCategorizedPackagesSerializer,
    SuggestionCategorizedUrlReferencesSerializer,
    SuggestionCommentSerializer,
    SuggestionMaintainerAddSerializer,
    SuggestionMaintainerDeleteSerializer,
    SuggestionMaintainerUpdateSerializer,
    SuggestionPackageUpdateSerializer,
    SuggestionReferenceUpdateSerializer,
    SuggestionSerializer,
    build_activity_log_map,
)
from shared.auth import user_can_edit_suggestion
from shared.models import CVEDerivationClusterProposal, NixpkgsIssue
from shared.models.cached import CachedSuggestions


class CanEditSuggestion(BasePermission):
    def has_permission(self, request: Request, view: APIView) -> bool:  # pyright: ignore[reportIncompatibleMethodOverride]
        return user_can_edit_suggestion(request.user)


@extend_schema_serializer(component_name="SuggestionStatus")
class SuggestionStatusSerializer(serializers.ModelSerializer):
    """Serializer for suggestion status changes (accept/reject/reset)."""

    rejection_reason = serializers.ChoiceField(
        choices=CVEDerivationClusterProposal.RejectionReason.choices,
        required=False,
        allow_null=True,
        allow_blank=False,
        help_text="Reason for rejection. Required when status is 'rejected' (unless comment is provided).",
    )

    class Meta:
        model = CVEDerivationClusterProposal
        extra_kwargs = {"status": {"required": True}}
        fields = ["status", "rejection_reason", "comment"]

    def to_representation(self, instance: CVEDerivationClusterProposal) -> dict:
        result = super().to_representation(instance)
        if instance.status != CVEDerivationClusterProposal.Status.REJECTED:
            result.pop("rejection_reason", None)
        if not instance.comment:
            result.pop("comment", None)
        return result


class SuggestionPagination(PageNumberPagination):
    page_size = 10  # TODO(@florentc): Allow the user to change it within limits


class SuggestionFilterSet(filters.FilterSet):
    """Filters for the suggestion list endpoint.

    `status` accepts repeated query params (e.g. `?status=pending&status=accepted`) and is combined with OR.
    Combines with other filters with AND.
    """

    status = filters.MultipleChoiceFilter(
        choices=CVEDerivationClusterProposal.Status.choices,
        label="Filter by status (repeatable, combined with OR)",
    )
    in_issue_draft = filters.BooleanFilter(
        label="Filter by whether the suggestion is in the issue draft",
    )
    package = filters.CharFilter(
        method="filter_package",
        label="Filter by an active package attribute name (exact match)",
    )

    class Meta:
        model = CVEDerivationClusterProposal
        fields = ["status", "in_issue_draft", "package"]

    def filter_package(self, queryset: QuerySet, name: str, value: str) -> QuerySet:
        return queryset.filter(cached__payload__packages__has_key=value)


class SuggestionViewSet(ListModelMixin, RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = CVEDerivationClusterProposal.objects.all()
    serializer_class = SuggestionSerializer
    pagination_class = SuggestionPagination
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = SuggestionFilterSet

    def get_permissions(self) -> list:
        if getattr(self.request, "method", None) != "GET":
            return [IsAuthenticated(), CanEditSuggestion()]
        else:
            return []

    def filter_queryset(self, queryset: QuerySet) -> QuerySet:  # pyright: ignore[reportIncompatibleMethodOverride]
        # Filters (status/in_issue_draft/package) only apply to the list action.
        # Other actions (retrieve, status, comment, ...) fetch a single suggestion by pk via get_object() and must not be affected by list-only filters.
        if self.action != "list":
            return queryset
        return super().filter_queryset(queryset)

    def get_queryset(self) -> QuerySet[CVEDerivationClusterProposal]:  # pyright: ignore[reportIncompatibleMethodOverride]
        if self.action != "list":
            return super().get_queryset()

        # Only suggestions with fresh cache
        return (
            CVEDerivationClusterProposal.objects.filter(
                cached__isnull=False,
                cached__schema_version=CachedSuggestions.CURRENT_SCHEMA_VERSION,
            )
            .select_related("cached")
            .prefetch_related("cve__container__references__tags")
            .order_by("-updated_at", "-created_at")
        )

    def get_serializer_context(self) -> dict:
        context = super().get_serializer_context()
        context["include_activity_log"] = activity_log_requested(
            cast(Request, self.request)
        )
        return context

    @extend_schema(
        operation_id="listSuggestions",
        description="List all suggestions (proposals linking CVEs to derivations), paginated and sorted by most recently modified or created first.",
        parameters=[ACTIVITY_LOG_PARAMETER],
        responses={200: SuggestionSerializer(many=True)},
    )
    def list(self, request: Request) -> Response:
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        objects = page if page is not None else list(queryset)

        context = self.get_serializer_context()
        if context.get("include_activity_log"):
            # Batch the activity log for the whole page in a fixed number of queries.
            context["activity_logs"] = build_activity_log_map(
                [obj.pk for obj in objects]
            )

        serializer = self.get_serializer_class()(objects, many=True, context=context)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @extend_schema(
        operation_id="getSuggestion",
        description="Get full details of a suggestion (proposal linking CVEs to derivations).",
        parameters=[ACTIVITY_LOG_PARAMETER],
        responses={200: SuggestionSerializer, 404: ErrorDetailSerializer},
    )
    def retrieve(self, request: Request, pk: int) -> Response:
        instance = self.get_object()
        instance.ensure_fresh_cache()
        context = self.get_serializer_context()
        if context.get("include_activity_log"):
            context["activity_logs"] = build_activity_log_map([instance.pk])
        serializer = self.get_serializer_class()(instance, context=context)
        return Response(serializer.data)

    @extend_schema(
        methods=["get"],
        operation_id="getSuggestionStatus",
        description="Get the current status of a suggestion (proposal linking CVEs to derivations).",
        responses={200: SuggestionStatusSerializer, 404: ErrorDetailSerializer},
    )
    @extend_schema(
        methods=["post"],
        operation_id="changeSuggestionStatus",
        description="Change the status of a suggestion (accept, reject, or reset to pending).",
        request=SuggestionStatusSerializer,
        responses={
            200: SuggestionStatusSerializer,
            400: ErrorDetailSerializer,
            404: ErrorDetailSerializer,
        },
    )
    @action(
        detail=True,
        methods=["get", "post"],
        url_path="status",
        serializer_class=SuggestionStatusSerializer,
    )
    def status(self, request: Request, pk: int) -> Response:
        if request.method == "GET":
            instance = self.get_object()
            return Response(self.get_serializer(instance).data)
        elif request.method == "POST":
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            instance = self.get_object()
            instance.change_status(**serializer.validated_data)
            return Response(self.get_serializer(instance).data)
        else:
            raise MethodNotAllowed(request.method)

    @extend_schema(
        operation_id="bundleSuggestion",
        description=("Add or remove an accepted suggestion from the issue draft."),
        request=SuggestionBundleSerializer,
        responses={
            200: SuggestionBundleSerializer,
            400: ErrorDetailSerializer,
            403: ErrorDetailSerializer,
            404: ErrorDetailSerializer,
        },
    )
    @action(
        detail=True,
        methods=["patch"],
        url_path="bundle",
        serializer_class=SuggestionBundleSerializer,
    )
    def bundle(self, request: Request, pk: int) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = self.get_object()
        try:
            instance.set_in_issue_draft(serializer.validated_data["in_issue_draft"])
        except ValidationError as e:
            raise DRFValidationError(e.message_dict)
        return Response(self.get_serializer(instance).data)

    @extend_schema(
        operation_id="publishSuggestion",
        description=(
            "Publish an accepted suggestion in a standalone GitHub issue. "
            "The issue title is derived automatically from the suggestion."
        ),
        request=None,
        responses={
            201: IssueSerializer,
            400: ErrorDetailSerializer,
            403: ErrorDetailSerializer,
            404: ErrorDetailSerializer,
        },
    )
    @action(
        detail=True,
        methods=["post"],
        url_path="publish",
        serializer_class=IssueSerializer,
    )
    def publish(self, request: Request, pk: int) -> Response:
        instance = self.get_object()
        if instance.status != CVEDerivationClusterProposal.Status.ACCEPTED:
            raise DRFValidationError(
                {"status": "Only accepted suggestions can be published"}
            )
        instance.ensure_fresh_cache()
        payload = instance.cached.payload
        title = (
            payload.get("title")
            or truncatewords(payload.get("description") or "", 10)
            or "Security issue"
        )
        issue = NixpkgsIssue.publish_suggestions([instance], title)
        return Response(IssueSerializer(issue).data, status=201)

    @extend_schema(
        operation_id="publishIssueDraft",
        description="Publish all suggestions currently in the issue draft as a single GitHub issue.",
        request=IssueDraftPublishSerializer,
        responses={
            201: IssueSerializer,
            400: ErrorDetailSerializer,
            403: ErrorDetailSerializer,
        },
    )
    @action(
        detail=False,
        methods=["post"],
        url_path="issue_draft/publish",
        serializer_class=IssueDraftPublishSerializer,
    )
    def publish_issue_draft(self, request: Request) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        suggestions = list(
            CVEDerivationClusterProposal.objects.filter(
                in_issue_draft=True
            ).select_related("cached")
        )
        if not suggestions:
            raise DRFValidationError(
                {"non_field_errors": ["Cannot publish an empty issue"]}
            )
        issue = NixpkgsIssue.publish_suggestions(
            suggestions, serializer.validated_data["title"]
        )
        return Response(IssueSerializer(issue).data, status=201)

    @extend_schema(
        operation_id="resetIssueDraft",
        description="Remove all suggestions from the issue draft.",
        request=None,
        responses={204: None, 403: ErrorDetailSerializer},
    )
    @action(detail=False, methods=["post"], url_path="issue_draft/reset")
    def reset_issue_draft(self, request: Request) -> Response:
        CVEDerivationClusterProposal.objects.filter(in_issue_draft=True).update(
            in_issue_draft=False
        )
        return Response(status=204)

    @extend_schema(
        operation_id="getSuggestionActivityLog",
        description="Get the activity log for a suggestion (creation, status changes, package/maintainer/reference edits).",
        responses={
            200: ActivityLogEntrySerializer(many=True),
            404: ErrorDetailSerializer,
        },
    )
    @action(
        detail=True,
        methods=["get"],
        url_path="activity_log",
        serializer_class=ActivityLogEntrySerializer,
        permission_classes=[AllowAny],
        pagination_class=None,
    )
    def activity_log(self, request: Request, pk: int) -> Response:
        instance = self.get_object()
        data = build_activity_log_map([instance.pk]).get(instance.pk, [])
        serializer = ActivityLogEntrySerializer(data, many=True)
        return Response(serializer.data)

    @extend_schema(
        methods=["get"],
        operation_id="getSuggestionComment",
        description="Get the current comment for a suggestion.",
        responses={200: SuggestionCommentSerializer, 404: ErrorDetailSerializer},
    )
    @extend_schema(
        methods=["patch"],
        operation_id="updateSuggestionComment",
        description="Update the comment for a suggestion. Send an empty string to clear it.",
        request=SuggestionCommentSerializer,
        responses={
            200: SuggestionCommentSerializer,
            400: ErrorDetailSerializer,
            403: ErrorDetailSerializer,
            404: ErrorDetailSerializer,
        },
    )
    @action(
        detail=True,
        methods=["get", "patch"],
        url_path="comment",
        serializer_class=SuggestionCommentSerializer,
    )
    def comment(self, request: Request, pk: int) -> Response:
        if request.method == "GET":
            instance = self.get_object()
            return Response(self.get_serializer(instance).data)
        elif request.method == "PATCH":
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            instance = self.get_object()
            instance.set_comment(serializer.validated_data["comment"])
            return Response(self.get_serializer(instance).data)
        else:
            raise MethodNotAllowed(request.method)

    @extend_schema(
        methods=["get"],
        operation_id="getSuggestionReferences",
        description="Get the categorized URL references of a suggestion (original, active, ignored).",
        responses={
            200: SuggestionCategorizedUrlReferencesSerializer,
            404: ErrorDetailSerializer,
        },
    )
    @extend_schema(
        methods=["patch"],
        operation_id="updateSuggestionReference",
        description="Ignore or restore a URL reference. Send `ignored: true` to ignore, `ignored: false` to restore.",
        request=SuggestionReferenceUpdateSerializer,
        responses={
            204: None,
            400: ErrorDetailSerializer,
            403: ErrorDetailSerializer,
            404: ErrorDetailSerializer,
        },
    )
    @action(
        detail=True,
        methods=["get", "patch"],
        url_path="references",
        serializer_class=SuggestionReferenceUpdateSerializer,
    )
    def references(self, request: Request, pk: int) -> Response:
        if request.method == "GET":
            instance = self.get_object()
            instance.ensure_fresh_cache()
            data = instance.cached.payload["categorized_url_references"]
            return Response(SuggestionCategorizedUrlReferencesSerializer(data).data)
        elif request.method == "PATCH":
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            instance = self.get_object()
            instance.ensure_fresh_cache()
            try:
                if serializer.validated_data["ignored"]:
                    instance.ignore_reference(
                        serializer.validated_data["reference_url"]
                    )
                else:
                    instance.restore_reference(
                        serializer.validated_data["reference_url"]
                    )
            except ValidationError as e:
                raise DRFValidationError(e.message_dict)
            return Response(status=204)
        else:
            raise MethodNotAllowed(request.method)

    @extend_schema(
        methods=["get"],
        operation_id="getSuggestionMaintainers",
        description="Get the categorized maintainers of a suggestion (original, active, ignored, added).",
        responses={
            200: SuggestionCategorizedMaintainersSerializer,
            404: ErrorDetailSerializer,
        },
    )
    @extend_schema(
        methods=["patch"],
        operation_id="updateSuggestionMaintainer",
        description="Ignore or restore a maintainer. Send `ignored: true` to ignore, `ignored: false` to restore.",
        request=SuggestionMaintainerUpdateSerializer,
        responses={
            204: None,
            400: ErrorDetailSerializer,
            403: ErrorDetailSerializer,
            404: ErrorDetailSerializer,
        },
    )
    @extend_schema(
        methods=["post"],
        operation_id="addSuggestionMaintainer",
        description="Manually add a maintainer that is not part of the original maintainers.",
        request=SuggestionMaintainerAddSerializer,
        responses={
            201: MaintainerSerializer,
            400: ErrorDetailSerializer,
            403: ErrorDetailSerializer,
            404: ErrorDetailSerializer,
        },
    )
    @extend_schema(
        methods=["delete"],
        operation_id="deleteSuggestionMaintainer",
        description="Delete a manually added maintainer.",
        # FIXME(@florentc): drf-spectacular doesn't document request body for DELETE
        # We can't have the info in OpenAPI schema and then generated field in frontend.
        # The github_id is passed as query param instead for the time being.
        # In the future, we could consider the following structure:
        # PATCH suggestions/{id}/maintainers/{github_id} to ignore/restore
        # POST suggestions/{id}/extra_maintainers/ with github_id in request body to add extra maintainer
        # DELETE suggestions/{id}/extra_maintainers/{github_id} to remove extra maintainer
        # We should stay consistent with package & reference ignore/restore if we change ignore/restore
        parameters=[
            OpenApiParameter(
                name="github_id",
                type=int,
                location=OpenApiParameter.QUERY,
                required=True,
                description="GitHub ID of the manually added maintainer to delete.",
            ),
        ],
        responses={
            204: None,
            400: ErrorDetailSerializer,
            403: ErrorDetailSerializer,
            404: ErrorDetailSerializer,
        },
    )
    @action(
        detail=True,
        methods=["get", "patch", "post", "delete"],
        url_path="maintainers",
        serializer_class=SuggestionMaintainerUpdateSerializer,
    )
    def maintainers(self, request: Request, pk: int) -> Response:
        if request.method == "GET":
            instance = self.get_object()
            instance.ensure_fresh_cache()
            data = instance.cached.payload["categorized_maintainers"]
            return Response(SuggestionCategorizedMaintainersSerializer(data).data)
        elif request.method == "PATCH":
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            instance = self.get_object()
            instance.ensure_fresh_cache()
            try:
                if serializer.validated_data["ignored"]:
                    instance.ignore_maintainer(serializer.validated_data["github_id"])
                else:
                    instance.restore_maintainer(serializer.validated_data["github_id"])
            except ValidationError as e:
                raise DRFValidationError(e.message_dict)
            return Response(status=204)
        elif request.method == "POST":
            serializer = SuggestionMaintainerAddSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            instance = self.get_object()
            instance.ensure_fresh_cache()
            try:
                maintainer = instance.add_maintainer(
                    serializer.validated_data["github_handle"]
                )
            except ValidationError as e:
                raise DRFValidationError(e.message_dict)
            return Response(MaintainerSerializer(maintainer).data, status=201)
        elif request.method == "DELETE":
            serializer = SuggestionMaintainerDeleteSerializer(data=request.query_params)
            serializer.is_valid(raise_exception=True)
            instance = self.get_object()
            instance.ensure_fresh_cache()
            try:
                instance.delete_maintainer(serializer.validated_data["github_id"])
            except ValidationError as e:
                raise DRFValidationError(e.message_dict)
            return Response(status=204)
        else:
            raise MethodNotAllowed(request.method)

    @extend_schema(
        methods=["get"],
        operation_id="getSuggestionPackages",
        description="Get the categorized packages of a suggestion (original, active, ignored).",
        responses={
            200: SuggestionCategorizedPackagesSerializer,
            404: ErrorDetailSerializer,
        },
    )
    @extend_schema(
        methods=["patch"],
        operation_id="updateSuggestionPackage",
        description="Ignore or restore a package. Send `ignored: true` to ignore, `ignored: false` to restore.",
        request=SuggestionPackageUpdateSerializer,
        responses={
            204: None,
            400: ErrorDetailSerializer,
            403: ErrorDetailSerializer,
            404: ErrorDetailSerializer,
        },
    )
    @action(
        detail=True,
        methods=["get", "patch"],
        url_path="packages",
        serializer_class=SuggestionPackageUpdateSerializer,
    )
    def packages(self, request: Request, pk: int) -> Response:
        if request.method == "GET":
            # FIXME(@florentc): On the model side, packages don't follow the "categorized" convention of maintainers and references.
            # This converts to the convention to present a unified interface to API users.
            # Eventually, this should be at the model level.
            instance = self.get_object()
            instance.ensure_fresh_cache()
            payload = instance.cached.payload
            active = payload["packages"]
            data = {
                "original": payload["original_packages"],
                "active": active,
                "ignored": {
                    k: v
                    for k, v in payload["original_packages"].items()
                    if k not in active
                },
            }
            return Response(SuggestionCategorizedPackagesSerializer(data).data)
        elif request.method == "PATCH":
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            instance = self.get_object()
            instance.ensure_fresh_cache()
            try:
                if serializer.validated_data["ignored"]:
                    instance.ignore_package(
                        serializer.validated_data["package_attribute"]
                    )
                else:
                    instance.restore_package(
                        serializer.validated_data["package_attribute"]
                    )
            except ValidationError as e:
                raise DRFValidationError(e.message_dict)
            return Response(status=204)
        else:
            raise MethodNotAllowed(request.method)
