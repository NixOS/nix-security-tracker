from django.db.models import Prefetch, QuerySet
from drf_spectacular.utils import extend_schema
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from api.serializers import ErrorDetailSerializer
from shared.auth import can_access_matching_training_data
from shared.matching_training_data import serializers
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
)


class CanAccessMatchingTrainingData(BasePermission):
    def has_permission(self, request: Request, view: APIView) -> bool:  # pyright: ignore[reportIncompatibleMethodOverride]
        return bool(request.user and can_access_matching_training_data(request.user))


class MatchingTrainingDataPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 100


class MatchingTrainingDataView(ListAPIView):
    """Read-only export of user-curated matching proposals for offline training."""

    permission_classes = [IsAuthenticated, CanAccessMatchingTrainingData]
    pagination_class = MatchingTrainingDataPagination
    serializer_class = serializers.CVEDerivationClusterProposal

    def get_queryset(self) -> QuerySet[CVEDerivationClusterProposal]:  # pyright: ignore[reportIncompatibleMethodOverride]
        return (
            CVEDerivationClusterProposal.objects.user_curated()
            .select_related("cve")
            .prefetch_related(
                "cve__container__tags",
                "cve__container__affected__cpes",
                Prefetch(
                    "derivationclusterproposallink_set",
                    queryset=DerivationClusterProposalLink.objects.select_related(
                        "derivation__metadata"
                    ),
                ),
                "package_overlays",
            )
            .order_by("pk")
        )

    @extend_schema(
        operation_id="listMatchingTrainingData",
        description=(
            "Export user-curated CVE-derivation proposals "
            "(status != pending, including auto-rejects) as versioned training-data "
            "records. Restricted to the matching_training_data group (manually "
            "assigned) as a stopgap for server load until rate limiting exists."
        ),
        responses={
            200: serializers.CVEDerivationClusterProposal(many=True),
            401: ErrorDetailSerializer,
            403: ErrorDetailSerializer,
        },
    )
    def get(self, request: Request, *args: object, **kwargs: object) -> Response:
        return super().get(request, *args, **kwargs)
