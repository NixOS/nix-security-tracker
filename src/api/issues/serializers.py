from typing import cast

from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework.utils.serializer_helpers import ReturnList

from api.suggestions.serializers import SuggestionSerializer
from shared.models import NixpkgsIssue
from shared.models.issue import EventType, GitHubItem


class GitHubPullRequestSerializer(serializers.ModelSerializer):
    """A GitHub pull request and its current state."""

    url = serializers.URLField(read_only=True)
    state = serializers.SerializerMethodField()

    class Meta:
        model = GitHubItem
        fields = ["url", "state"]

    @extend_schema_field(
        serializers.ListField(
            child=serializers.ChoiceField(choices=[flag.name for flag in EventType])
        )
    )
    def get_state(self, obj: GitHubItem) -> list[str]:
        return [cast(str, flag.name) for flag in obj.state]


class IssueSerializer(serializers.ModelSerializer):
    """A Nixpkgs security issue (a group of published suggestions)."""

    github_issue_url = serializers.SerializerMethodField()
    github_issue_state = serializers.SerializerMethodField()
    github_closing_pull_requests = serializers.SerializerMethodField()
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
            "github_issue_state",
            "github_closing_pull_requests",
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
        serializers.ListField(
            child=serializers.ChoiceField(choices=[flag.name for flag in EventType]),
            allow_null=True,
        )
    )
    def get_github_issue_state(self, obj: NixpkgsIssue) -> list[str] | None:
        item = obj.github_issue
        return [cast(str, flag.name) for flag in item.state] if item else None

    @extend_schema_field(GitHubPullRequestSerializer(many=True))
    def get_github_closing_pull_requests(self, obj: NixpkgsIssue) -> ReturnList:
        item = obj.github_issue
        pull_requests = (
            sorted(
                (reference.pull_request for reference in item.closed_by.all()),
                key=lambda pull_request: pull_request.number,
            )
            if item
            else []
        )
        return cast(
            ReturnList,
            GitHubPullRequestSerializer(pull_requests, many=True).data,
        )

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
