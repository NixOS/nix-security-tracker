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


class SuggestionViewSet(viewsets.GenericViewSet):
    class StatusSerializer(serializers.ModelSerializer):
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

    queryset = CVEDerivationClusterProposal.objects.all()
    permission_classes = [IsAuthenticated, CanEditSuggestion]

    @action(
        detail=True,
        methods=["get"],
        url_path="status",
        serializer_class=StatusSerializer,
        permission_classes=[AllowAny],
    )
    def status(self, request: Request, pk: int) -> Response:
        instance = self.get_object()
        return Response(self.get_serializer(instance).data)

    @action(detail=True, methods=["post"], serializer_class=StatusSerializer)
    def change_status(self, request: Request, pk: int) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = self.get_object()

        instance.change_status(**serializer.validated_data)

        return Response(self.get_serializer(instance).data)
