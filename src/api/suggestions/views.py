from django.core.exceptions import ValidationError
from drf_spectacular.utils import extend_schema, extend_schema_serializer
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.mixins import RetrieveModelMixin
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from api.serializers import ErrorDetailSerializer
from api.suggestions.serializers import (
    ActivityLogEntrySerializer,
    SuggestionCategorizedUrlReferencesSerializer,
    SuggestionCommentSerializer,
    SuggestionReferenceUpdateSerializer,
    SuggestionSerializer,
    folded_event_to_dict,
)
from shared.auth import user_can_edit_suggestion
from shared.logs.batches import batch_events
from shared.logs.events import remove_canceling_events
from shared.logs.fetchers import fetch_suggestion_events
from shared.models import CVEDerivationClusterProposal


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


class SuggestionViewSet(RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = CVEDerivationClusterProposal.objects.all()
    serializer_class = SuggestionSerializer

    def get_permissions(self) -> list:
        if getattr(self.request, "method", None) != "GET":
            return [IsAuthenticated(), CanEditSuggestion()]
        else:
            return []

    @extend_schema(
        operation_id="getSuggestion",
        description="Get full details of a suggestion (proposal linking CVEs to derivations).",
        responses={200: SuggestionSerializer, 404: ErrorDetailSerializer},
    )
    def retrieve(self, request: Request, pk: int) -> Response:
        instance = self.get_object()
        instance.ensure_fresh_cache()
        return Response(self.get_serializer(instance).data)

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
    )
    def activity_log(self, request: Request, pk: int) -> Response:
        instance = self.get_object()
        # FIXME(@florentc): Eventually we'll want to:
        # - remove cancelling events: at the model level through a proper debouncing implementation
        # - batch events: at the frontend level as it's presentation-related
        raw_events = fetch_suggestion_events([instance.pk]).get(instance.pk, [])
        deduplicated = remove_canceling_events(raw_events, sort=True)
        folded = batch_events(deduplicated)
        data = [folded_event_to_dict(e) for e in folded]
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
