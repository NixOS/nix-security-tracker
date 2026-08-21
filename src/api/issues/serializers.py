from typing import cast

from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework.utils.serializer_helpers import ReturnList

from api.suggestions.serializers import SuggestionSerializer
from shared.models import NixpkgsIssue


class IssueSerializer(serializers.ModelSerializer):
    """A Nixpkgs security issue (a group of published suggestions)."""

    github_issue_url = serializers.SerializerMethodField()
    suggestions = serializers.SerializerMethodField()

    class Meta:
        model = NixpkgsIssue
        fields = [
            "id",
            "code",
            "title",
            "status",
            "created_at",
            "updated_at",
            "github_issue_url",
            "suggestions",
        ]
        # `title`/`status` have model defaults, but always present on read.
        # Marking them required reflects it is OpenAPI spec, and thus for type generation in front.
        extra_kwargs = {
            "title": {"required": True},
            "status": {"required": True},
        }

    @extend_schema_field(serializers.URLField(allow_null=True))
    def get_github_issue_url(self, obj: NixpkgsIssue) -> str | None:
        return obj.github_issue_url

    @extend_schema_field(
        {
            "type": "array",
            "items": {
                "oneOf": [
                    {"type": "integer"},
                    {"$ref": "#/components/schemas/Suggestion"},
                ]
            },
        }
    )
    def get_suggestions(self, obj: NixpkgsIssue) -> list[int] | ReturnList:
        suggestions = obj.suggestions.all()
        if self.context.get("expand_suggestions"):
            return cast(
                ReturnList,
                SuggestionSerializer(suggestions, many=True, context=self.context).data,
            )
        return [s.pk for s in suggestions]
