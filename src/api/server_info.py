from django.conf import settings
from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


class ServerInfoSerializer(serializers.Serializer):
    debug = serializers.BooleanField(
        help_text="Whether Django DEBUG mode is active (indicates a testing environment)"
    )
    production = serializers.BooleanField(
        help_text="Whether this is a production deployment"
    )
    revision = serializers.CharField(
        help_text="Git revision (commit SHA) of the running server"
    )
    show_demo_disclaimer = serializers.BooleanField(
        help_text="Whether to show the demo disclaimer (production deployment not yet stable)"
    )


class ServerInfoView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        responses={200: ServerInfoSerializer},
        description="Returns public server information: deployment mode, git revision, and disclaimer flags.",
    )
    def get(self, request: Request) -> Response:
        data = {
            "debug": settings.DEBUG,
            "production": settings.PRODUCTION,
            "revision": settings.REVISION,
            "show_demo_disclaimer": settings.SHOW_DEMO_DISCLAIMER,
        }
        serializer = ServerInfoSerializer(data)
        return Response(serializer.data)
