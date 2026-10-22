from typing import Any, cast

from django.template.defaultfilters import truncatewords
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework.utils.serializer_helpers import ReturnList

from api.suggestions.serializers import SuggestionSerializer
from shared.models import NixpkgsIssue
from shared.models.issue import EventType, GitHubItem


def state_names(item_type: EventType) -> list[str]:
    """
    Names of all flags occurring in valid event combinations for the given item type.
    """
    valid = [EventType(v) for v in range(1, 2 * max(EventType)) if EventType.valid(v)]
    return [
        cast(str, flag.name)
        for flag in EventType
        if flag != item_type and any(flag in v for v in valid if item_type in v)
    ]


GITHUB_ISSUE_STATES = state_names(EventType.ISSUE)
GITHUB_PULL_REQUEST_STATES = state_names(EventType.PULL_REQUEST)


class GitHubStateField(serializers.ListField):
    def __init__(self, choices: list[str], **kwargs: Any) -> None:
        super().__init__(
            child=serializers.ChoiceField(choices=choices),
            read_only=True,
            **kwargs,
        )

    def to_representation(self, data: EventType) -> list[str]:
        return [
            cast(str, flag.name) for flag in data if flag.name in self.child.choices
        ]


class GitHubPullRequestSerializer(serializers.ModelSerializer):
    """A GitHub pull request and its current state."""

    url = serializers.URLField(read_only=True)
    state = GitHubStateField(GITHUB_PULL_REQUEST_STATES)

    class Meta:
        model = GitHubItem
        fields = ["url", "number", "state"]


class GitHubIssueSerializer(serializers.ModelSerializer):
    """A GitHub issue, its current state, and the pull requests closing it."""

    url = serializers.URLField(read_only=True)
    state = GitHubStateField(GITHUB_ISSUE_STATES)
    closed_by = serializers.SerializerMethodField()

    class Meta:
        model = GitHubItem
        fields = ["url", "number", "state", "closed_by"]

    @extend_schema_field(GitHubPullRequestSerializer(many=True))
    def get_closed_by(self, obj: GitHubItem) -> ReturnList:
        pull_requests = sorted(
            (reference.pull_request for reference in obj.closed_by.all()),
            key=lambda pull_request: pull_request.number,
        )
        return cast(
            ReturnList,
            GitHubPullRequestSerializer(pull_requests, many=True).data,
        )


class IssueSerializer(serializers.ModelSerializer):
    """A Nixpkgs security issue (a group of published suggestions)."""

    title = serializers.SerializerMethodField()
    github_issue = GitHubIssueSerializer(read_only=True, allow_null=True)
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
            "github_issue",
            "suggestions",
        ]
        # `title`/`status` have model defaults, but always present on read.
        # Marking them required reflects it is OpenAPI spec, and thus for type generation in front.
        extra_kwargs = {
            "title": {"required": True},
            "status": {"required": True},
        }

    @extend_schema_field(serializers.CharField())
    def get_title(self, obj: NixpkgsIssue) -> str:
        if obj.title:
            return obj.title
        match list(obj.suggestions.all()):
            case [suggestion]:
                payload = suggestion.cached.payload
                return payload["title"] or truncatewords(payload["description"], 10)
            case _:
                return ""

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
