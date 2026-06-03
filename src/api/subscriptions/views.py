from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from webview.models import Profile


class SubscriptionsViewSet(viewsets.GenericViewSet):
    queryset = Profile.objects.none()  # Add collection resource here later
    permission_classes = [IsAuthenticated]

    class AutoSubscribeSerializer(serializers.Serializer):
        enabled = serializers.BooleanField()

    @action(
        detail=False,
        methods=["get", "put"],
        url_path="auto-subscribe-to-maintained-packages",
        serializer_class=AutoSubscribeSerializer,
    )
    def auto_subscribe_to_maintained_packages(self, request: Request) -> Response:
        profile = request.user.profile
        if request.method == "GET":
            serializer = self.get_serializer(
                {"enabled": profile.auto_subscribe_to_maintained_packages}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif request.method == "PUT":
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            profile.auto_subscribe_to_maintained_packages = serializer.validated_data[
                "enabled"
            ]
            profile.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            raise AssertionError(
                f"unexpected method (this should never happen): {request.method}"
            )
