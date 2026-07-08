from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


class CurrentUserSerializer(serializers.Serializer):
    username = serializers.CharField()
    avatar_url = serializers.URLField(allow_null=True)
    is_admin = serializers.BooleanField()
    is_committer = serializers.BooleanField()


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: CurrentUserSerializer},
        description="Returns the currently authenticated user's information.",
    )
    def get(self, request: Request) -> Response:
        from shared.auth import isadmin, iscommitter

        user = request.user

        # Get GitHub avatar URL from social account if available
        avatar_url = None
        social_account = user.socialaccount_set.filter(provider="github").first()
        if social_account:
            avatar_url = social_account.extra_data.get("avatar_url")

        data = {
            "username": user.username,
            "avatar_url": avatar_url,
            "is_admin": isadmin(user),
            "is_committer": iscommitter(user),
        }

        serializer = CurrentUserSerializer(data)
        return Response(serializer.data)
