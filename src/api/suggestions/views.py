from drf_spectacular.utils import extend_schema, extend_schema_serializer
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from shared.auth import user_can_edit_suggestion
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


class SuggestionViewSet(viewsets.GenericViewSet):
    queryset = CVEDerivationClusterProposal.objects.all()
    permission_classes = [IsAuthenticated, CanEditSuggestion]

    @extend_schema(
        operation_id="getSuggestionStatus",
        description="Get the current status of a suggestion (proposal linking CVEs to derivations).",
    )
    @action(
        detail=True,
        methods=["get"],
        url_path="status",
        serializer_class=SuggestionStatusSerializer,
        permission_classes=[AllowAny],
    )
    def status(self, request: Request, pk: int) -> Response:
        instance = self.get_object()
        return Response(self.get_serializer(instance).data)

    @extend_schema(
        operation_id="changeSuggestionStatus",
        description="Change the status of a suggestion (accept, reject, or reset to pending).",
    )
    @action(detail=True, methods=["post"], serializer_class=SuggestionStatusSerializer)
    def change_status(self, request: Request, pk: int) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = self.get_object()

        instance.change_status(**serializer.validated_data)

        return Response(self.get_serializer(instance).data)
