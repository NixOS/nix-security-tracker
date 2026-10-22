from collections.abc import Callable
from typing import cast

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models.query import QuerySet
from django.shortcuts import get_object_or_404
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
    BulkErrorSerializer,
    BulkResultSerializer,
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
from api.throttling import BulkRateThrottle
from shared.auth import user_can_edit_suggestion
from shared.models import CVEDerivationClusterProposal, NixpkgsIssue
from shared.models.cached import CachedSuggestions
from shared.models.linkage import BulkValidationError


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

    The creation date filters take whole days (`YYYY-MM-DD`) and both bounds are inclusive.
    Setting both bounds to the same day selects the suggestions created on that day.
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
    created_at_after = filters.DateFilter(
        field_name="created_at",
        lookup_expr="date__gte",
        label="Filter by creation on or after a day (YYYY-MM-DD)",
    )
    created_at_before = filters.DateFilter(
        field_name="created_at",
        lookup_expr="date__lte",
        label="Filter by creation on or before a day (YYYY-MM-DD)",
    )

    class Meta:
        model = CVEDerivationClusterProposal
        fields = [
            "status",
            "in_issue_draft",
            "package",
            "created_at_after",
            "created_at_before",
        ]

    def filter_package(self, queryset: QuerySet, name: str, value: str) -> QuerySet:
        return queryset.filter(cached__payload__packages__has_key=value)


# The list filters, as they appear on the bulk operations.
# drf-spectacular only documents filter backends on list endpoints, and bulk operations do not return a list, so they declare their selection parameters explicitly.
BULK_FILTER_PARAMETERS = [
    OpenApiParameter(
        name="status",
        type=str,
        many=True,
        enum=[value for value, _label in CVEDerivationClusterProposal.Status.choices],
        description="Select suggestions by status (repeatable, combined with OR).",
    ),
    OpenApiParameter(
        name="in_issue_draft",
        type=bool,
        description="Select suggestions by whether they are in the issue draft.",
    ),
    OpenApiParameter(
        name="package",
        type=str,
        description="Select suggestions holding this active package attribute name (exact match).",
    ),
]


class SuggestionViewSet(ListModelMixin, RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = CVEDerivationClusterProposal.objects.all()
    serializer_class = SuggestionSerializer
    pagination_class = SuggestionPagination
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = SuggestionFilterSet

    # Actions that operate on a whole filtered selection rather than on a single suggestion.
    BULK_ACTIONS = frozenset(
        {
            "bulk_status",
            "bulk_bundle",
            "bulk_comment",
            "bulk_packages",
            "bulk_maintainers",
            "bulk_references",
        }
    )

    # Applied on top of the usual rate limit, for bulk operations only.
    bulk_throttle_classes = [BulkRateThrottle]

    def get_throttles(self) -> list:
        throttles = super().get_throttles()
        if self.action in self.BULK_ACTIONS:
            throttles += [throttle() for throttle in self.bulk_throttle_classes]
        return throttles

    def get_permissions(self) -> list:
        if getattr(self.request, "method", None) != "GET":
            return [IsAuthenticated(), CanEditSuggestion()]
        else:
            return []

    def filter_queryset(self, queryset: QuerySet) -> QuerySet:  # pyright: ignore[reportIncompatibleMethodOverride]
        # Filters (status/in_issue_draft/package) apply to the list action and to the bulk actions, which select what they modify the same way the list selects what it displays.
        # Other actions (retrieve, status, comment, ...) fetch a single suggestion by pk via get_object() and must not be affected by those filters.
        if self.action != "list" and self.action not in self.BULK_ACTIONS:
            return queryset
        return super().filter_queryset(queryset)

    def get_queryset(self) -> QuerySet[CVEDerivationClusterProposal]:  # pyright: ignore[reportIncompatibleMethodOverride]
        if self.action != "list" and self.action not in self.BULK_ACTIONS:
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

    def get_bulk_queryset(self) -> QuerySet[CVEDerivationClusterProposal]:
        """
        The selection a bulk operation applies to, or an error explaining why there is none.

        Refuses an unfiltered selection, so that a forgotten filter cannot silently
        reach every suggestion, and a selection too large to be modified in a single
        transaction.
        """
        request = cast(Request, self.request)
        if not set(self.filterset_class.base_filters) & set(request.query_params):
            raise DRFValidationError(
                {
                    "detail": "A bulk operation requires at least one filter: "
                    + ", ".join(sorted(self.filterset_class.base_filters))
                }
            )
        queryset = self.filter_queryset(self.get_queryset())
        count = queryset.count()
        if count > settings.API_BULK_MAX_AFFECTED:
            raise DRFValidationError(
                {
                    "detail": f"This selection holds {count} suggestions, more than the {settings.API_BULK_MAX_AFFECTED} a single bulk operation is allowed to affect. Narrow it down with more filters."
                }
            )
        return queryset

    def bulk_response(
        self, operation: Callable[[QuerySet[CVEDerivationClusterProposal]], int]
    ) -> Response:
        """
        Apply a bulk operation to the current selection and report what happened.
        """
        queryset = self.get_bulk_queryset()
        try:
            affected = operation(queryset)
        except BulkValidationError as error:
            return Response(
                BulkErrorSerializer(
                    {
                        "detail": error.detail
                        or "Some of the selected suggestions do not accept this operation, so none was modified.",
                        "reasons": error.errors,
                    }
                ).data,
                status=400,
            )
        except ValidationError as error:
            # NOTE(@florentc): A check that only fires while applying the operation
            # (the database-level status transition guard, for instance) raises without
            # telling which suggestion refused. It is still a validation failure, so it
            # is reported as one rather than as a server error.
            return Response(
                BulkErrorSerializer(
                    {
                        "detail": " ".join(error.messages),
                        "reasons": {},
                    }
                ).data,
                status=400,
            )
        return Response(BulkResultSerializer({"affected": affected}).data)

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
        operation_id="getSuggestionByCve",
        description="Get full details of a suggestion (proposal linking CVEs to derivations) by its CVE ID.",
        parameters=[ACTIVITY_LOG_PARAMETER],
        responses={200: SuggestionSerializer, 404: ErrorDetailSerializer},
    )
    @action(detail=False, methods=["get"], url_path="by-cve/(?P<cve_id>[^/]+)")
    def by_cve(self, request: Request, cve_id: str) -> Response:
        instance = get_object_or_404(CVEDerivationClusterProposal, cve__cve_id=cve_id)
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

    # Bulk operations.
    # They mirror the single-suggestion actions above, but apply to every suggestion matching the filters of the list endpoint.
    # They are all-or-nothing: if a single selected suggestion refuses the operation, nothing is modified and the response says which ones refused and why.

    @extend_schema(
        operation_id="bulkChangeSuggestionStatus",
        description=(
            "Change the status of every suggestion matching the filters. "
            "Fails without modifying anything if any of them is already in the "
            "target status or cannot reach it."
        ),
        parameters=BULK_FILTER_PARAMETERS,
        request=SuggestionStatusSerializer,
        responses={
            200: BulkResultSerializer,
            400: BulkErrorSerializer,
            403: ErrorDetailSerializer,
        },
    )
    @action(
        detail=False,
        methods=["post"],
        url_path="status",
        url_name="bulk-status",
        serializer_class=SuggestionStatusSerializer,
    )
    def bulk_status(self, request: Request) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        return self.bulk_response(lambda queryset: queryset.change_status(**validated))

    @extend_schema(
        operation_id="bulkBundleSuggestions",
        description=(
            "Add every suggestion matching the filters to the issue draft, or remove "
            "them all from it. Fails without modifying anything if any of them is not "
            "accepted."
        ),
        parameters=BULK_FILTER_PARAMETERS,
        request=SuggestionBundleSerializer,
        responses={
            200: BulkResultSerializer,
            400: BulkErrorSerializer,
            403: ErrorDetailSerializer,
        },
    )
    @action(
        detail=False,
        methods=["patch"],
        url_path="bundle",
        url_name="bulk-bundle",
        serializer_class=SuggestionBundleSerializer,
    )
    def bulk_bundle(self, request: Request) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        in_issue_draft = serializer.validated_data["in_issue_draft"]
        return self.bulk_response(
            lambda queryset: queryset.set_in_issue_draft(in_issue_draft)
        )

    @extend_schema(
        operation_id="bulkUpdateSuggestionComment",
        description=(
            "Replace the comment of every suggestion matching the filters. Send an "
            "empty string to clear it. Fails without modifying anything if the selected "
            "suggestions do not all hold the same comment to begin with."
        ),
        parameters=BULK_FILTER_PARAMETERS,
        request=SuggestionCommentSerializer,
        responses={
            200: BulkResultSerializer,
            400: BulkErrorSerializer,
            403: ErrorDetailSerializer,
        },
    )
    @action(
        detail=False,
        methods=["patch"],
        url_path="comment",
        url_name="bulk-comment",
        serializer_class=SuggestionCommentSerializer,
    )
    def bulk_comment(self, request: Request) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.validated_data["comment"]
        return self.bulk_response(lambda queryset: queryset.set_comment(comment))

    @extend_schema(
        operation_id="bulkUpdateSuggestionPackage",
        description=(
            "Ignore or restore a package on every suggestion matching the filters. "
            "Fails without modifying anything if any of them does not hold that "
            "package, or already has it in the requested state."
        ),
        parameters=BULK_FILTER_PARAMETERS,
        request=SuggestionPackageUpdateSerializer,
        responses={
            200: BulkResultSerializer,
            400: BulkErrorSerializer,
            403: ErrorDetailSerializer,
        },
    )
    @action(
        detail=False,
        methods=["patch"],
        url_path="packages",
        url_name="bulk-packages",
        serializer_class=SuggestionPackageUpdateSerializer,
    )
    def bulk_packages(self, request: Request) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        package_attribute = serializer.validated_data["package_attribute"]
        if serializer.validated_data["ignored"]:
            return self.bulk_response(
                lambda queryset: queryset.ignore_package(package_attribute)
            )
        return self.bulk_response(
            lambda queryset: queryset.restore_package(package_attribute)
        )

    @extend_schema(
        operation_id="bulkUpdateSuggestionMaintainer",
        description=(
            "Ignore or restore a maintainer on every suggestion matching the filters. "
            "Fails without modifying anything if any of them does not hold that "
            "maintainer, or already has them in the requested state."
        ),
        parameters=BULK_FILTER_PARAMETERS,
        request=SuggestionMaintainerUpdateSerializer,
        responses={
            200: BulkResultSerializer,
            400: BulkErrorSerializer,
            403: ErrorDetailSerializer,
        },
    )
    @action(
        detail=False,
        methods=["patch"],
        url_path="maintainers",
        url_name="bulk-maintainers",
        serializer_class=SuggestionMaintainerUpdateSerializer,
    )
    def bulk_maintainers(self, request: Request) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        github_id = serializer.validated_data["github_id"]
        if serializer.validated_data["ignored"]:
            return self.bulk_response(
                lambda queryset: queryset.ignore_maintainer(github_id)
            )
        return self.bulk_response(
            lambda queryset: queryset.restore_maintainer(github_id)
        )

    @extend_schema(
        operation_id="bulkUpdateSuggestionReference",
        description=(
            "Ignore or restore a URL reference on every suggestion matching the "
            "filters. Fails without modifying anything if any of them does not hold "
            "that reference, or already has it in the requested state."
        ),
        parameters=BULK_FILTER_PARAMETERS,
        request=SuggestionReferenceUpdateSerializer,
        responses={
            200: BulkResultSerializer,
            400: BulkErrorSerializer,
            403: ErrorDetailSerializer,
        },
    )
    @action(
        detail=False,
        methods=["patch"],
        url_path="references",
        url_name="bulk-references",
        serializer_class=SuggestionReferenceUpdateSerializer,
    )
    def bulk_references(self, request: Request) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reference_url = serializer.validated_data["reference_url"]
        if serializer.validated_data["ignored"]:
            return self.bulk_response(
                lambda queryset: queryset.ignore_reference(reference_url)
            )
        return self.bulk_response(
            lambda queryset: queryset.restore_reference(reference_url)
        )
