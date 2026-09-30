from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from shared.models.nix_evaluation import NixDerivation


class PackageExistsSerializer(serializers.Serializer):
    exists = serializers.BooleanField(
        help_text="Whether a package with this attribute name currently exists in Nixpkgs."
    )


class PackageExistsView(APIView):
    """Public endpoint to check whether a package attribute name exists."""

    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="getPackageExists",
        description="Check whether a package with the given attribute name currently exists in Nixpkgs.",
        responses={200: PackageExistsSerializer},
    )
    def get(self, request: Request, package_name: str) -> Response:
        # FIXME(@florentc): For now the concept of package here still relies on attribute names.
        # This needs to be refactored to rely on the package data model when we wire it the the users globally.
        exists = NixDerivation.objects.filter(attribute=package_name).exists()
        serializer = PackageExistsSerializer({"exists": exists})
        return Response(serializer.data)
