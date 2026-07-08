from rest_framework import serializers


class ErrorDetailSerializer(serializers.Serializer):
    """
    Standard error response body used across all API endpoints.
    Use this with @extend_schema responses to avoid 'No response body' in the generated schema.
    """

    detail = serializers.CharField()
