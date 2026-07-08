from typing import Any

from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from api.serializers import ErrorDetailSerializer
from shared.models import PackageAttrpath
from webview.models import Profile


class SubscriptionsViewSet(viewsets.GenericViewSet):
    queryset = Profile.objects.none()  # Add collection resource here later
    permission_classes = [IsAuthenticated]

    class AutoSubscribeSerializer(serializers.Serializer):
        enabled = serializers.BooleanField()

    class EmailNotificationsSerializer(serializers.Serializer):
        enabled = serializers.BooleanField()

    class PackageSubscriptionsSerializer(serializers.Serializer):
        packages = serializers.ListField(
            child=serializers.CharField(),
            help_text="Package attribute names the user has manually subscribed to",
        )

    class PackageSubscriptionStatusSerializer(serializers.Serializer):
        subscribed = serializers.BooleanField(
            help_text="Whether the authenticated user is subscribed to this package",
        )

    class AddPackageSubscriptionSerializer(serializers.Serializer):
        package_name = serializers.CharField(
            help_text="Nixpkgs attribute name of the package to subscribe to (e.g. 'firefox', 'python311Packages.requests')",
        )

    @extend_schema(
        methods=["GET"],
        operation_id="getAutoSubscribe",
        description="Get the current auto-subscribe preference for maintained packages",
    )
    @extend_schema(
        methods=["PUT"],
        operation_id="setAutoSubscribe",
        description="Update the auto-subscribe preference for maintained packages",
    )
    @action(
        detail=False,
        methods=["GET", "PUT"],
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
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        else:
            raise AssertionError(
                f"unexpected method (this should never happen): {request.method}"
            )

    @extend_schema(
        methods=["GET"],
        operation_id="getEmailNotifications",
        description="Get the current email notifications preference",
    )
    @extend_schema(
        methods=["PUT"],
        operation_id="setEmailNotifications",
        description="Update the email notifications preference",
    )
    @action(
        detail=False,
        methods=["GET", "PUT"],
        url_path="email-notifications",
        serializer_class=EmailNotificationsSerializer,
    )
    def email_notifications(self, request: Request) -> Response:
        profile = request.user.profile
        if request.method == "GET":
            serializer = self.get_serializer(
                {"enabled": profile.receive_email_notifications}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif request.method == "PUT":
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            profile.receive_email_notifications = serializer.validated_data["enabled"]
            profile.save()
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        else:
            raise AssertionError(
                f"unexpected method (this should never happen): {request.method}"
            )

    @extend_schema(
        methods=["GET"],
        operation_id="listPackageSubscriptions",
        description="List the package attribute names the authenticated user has manually subscribed to",
        responses=PackageSubscriptionsSerializer,
    )
    @extend_schema(
        methods=["POST"],
        operation_id="addPackageSubscription",
        description="Subscribe to a package by Nix attribute name. Returns 400 if the package does not exist, 409 if already subscribed",
        request=AddPackageSubscriptionSerializer,
        responses=PackageSubscriptionsSerializer,
    )
    @action(
        detail=False,
        methods=["GET", "POST"],
        url_path="packages",
        serializer_class=PackageSubscriptionsSerializer,
    )
    def packages(self, request: Request) -> Response:
        profile = request.user.profile
        if request.method == "GET":
            serializer = self.get_serializer(
                {"packages": profile.package_subscriptions}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif request.method == "POST":
            input_serializer = self.AddPackageSubscriptionSerializer(data=request.data)
            input_serializer.is_valid(raise_exception=True)
            validated: dict[str, Any] = input_serializer.validated_data  # type: ignore[assignment]
            package_name = str(validated["package_name"]).strip()

            if not PackageAttrpath.objects.filter(attrpath=package_name).exists():
                return Response(
                    {"detail": f"Package '{package_name}' does not exist."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if package_name in profile.package_subscriptions:
                return Response(
                    {"detail": f"You are already subscribed to '{package_name}'."},
                    status=status.HTTP_409_CONFLICT,
                )

            profile.subscribe_to_package(package_name)
            serializer = self.get_serializer(
                {"packages": profile.package_subscriptions}
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            raise AssertionError(
                f"unexpected method (this should never happen): {request.method}"
            )

    @extend_schema(
        methods=["GET"],
        operation_id="getPackageSubscription",
        description="Get the subscription status of the authenticated user for a specific package. Returns 404 if the package does not exist in nixpkgs.",
        responses={
            200: PackageSubscriptionStatusSerializer,
            404: ErrorDetailSerializer,
        },
    )
    @extend_schema(
        methods=["DELETE"],
        operation_id="removePackageSubscription",
        description="Unsubscribe from a package by Nix attribute name. Returns 404 if not currently subscribed.",
        responses={200: PackageSubscriptionsSerializer, 404: ErrorDetailSerializer},
    )
    @action(
        detail=False,
        methods=["GET", "DELETE"],
        url_path=r"packages/(?P<package_name>[^/]+)",
        serializer_class=PackageSubscriptionsSerializer,
    )
    def package(self, request: Request, package_name: str) -> Response:
        profile = request.user.profile
        if request.method == "GET":
            if not PackageAttrpath.objects.filter(attrpath=package_name).exists():
                return Response(
                    {"detail": f"Package '{package_name}' does not exist."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            serializer = self.PackageSubscriptionStatusSerializer(
                {"subscribed": package_name in profile.package_subscriptions}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        elif request.method == "DELETE":
            if package_name not in profile.package_subscriptions:
                return Response(
                    {"detail": f"You are not subscribed to '{package_name}'."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            profile.unsubscribe_from_package(package_name)
            serializer = self.get_serializer(
                {"packages": profile.package_subscriptions}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            raise AssertionError(
                f"unexpected method (this should never happen): {request.method}"
            )
