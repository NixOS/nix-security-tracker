import json
from dataclasses import dataclass, field
from datetime import UTC, datetime
from importlib.resources import files
from typing import Any, Literal

from graphql import GraphQLError, GraphQLResolveInfo, build_schema, graphql_sync
from graphql.pyutils import camel_to_snake
from requests import PreparedRequest

GITHUB_SCHEMA = build_schema(
    files("github_graphql").joinpath("schema.graphql").read_text()
)

# PyGithub's connection fills in the default port, so requests carry it explicitly.
GRAPHQL_URL = "https://api.github.com:443/graphql"


def page(
    nodes: list[Any],
    first: int | None = None,
    after: str | None = None,
    **_: Any,
) -> dict[str, Any]:
    start = int(after) if after else 0
    end = start + first if first is not None else len(nodes)
    return {
        "totalCount": len(nodes),
        "nodes": nodes[start:end],
        "pageInfo": {
            "hasNextPage": end < len(nodes),
            "hasPreviousPage": start > 0,
            "startCursor": str(start),
            "endCursor": str(min(end, len(nodes))),
        },
    }


@dataclass
class ClosedEvent:
    created_at: datetime
    state_reason: Literal["COMPLETED", "DUPLICATE", "NOT_PLANNED"]


@dataclass
class ReopenedEvent:
    created_at: datetime


@dataclass
class Issue:
    repository: str
    number: int
    created_at: datetime
    timeline: list[ClosedEvent | ReopenedEvent] = field(default_factory=list)

    def timeline_items(
        self,
        _info: GraphQLResolveInfo,
        item_types: list[str] | None = None,
        **args: Any,
    ) -> dict[str, Any]:
        # GitHub names the filter value for each item type by converting the type name, e.g. `CLOSED_EVENT` for `ClosedEvent`.
        nodes = [
            node
            for node in self.timeline
            if item_types is None
            or camel_to_snake(type(node).__name__).upper() in item_types
        ]
        return page(nodes, **args)


class NotFoundError(GraphQLError):
    def __init__(self, message: str) -> None:
        super().__init__(message, extensions={"type": "NOT_FOUND"})


@dataclass
class Repository:
    items: dict[int, Issue]

    def issue(self, _info: GraphQLResolveInfo, number: int) -> Issue:
        if number not in self.items:
            raise NotFoundError(
                f"Could not resolve to an Issue with the number of {number}."
            )
        return self.items[number]


def resolve_field(source: Any, info: GraphQLResolveInfo, **args: Any) -> Any:
    if isinstance(source, dict):
        value = source.get(info.field_name)
    else:
        value = getattr(source, camel_to_snake(info.field_name), None)
    if callable(value):
        value = value(info, **{camel_to_snake(k): v for k, v in args.items()})
    if isinstance(value, datetime):
        return value.replace(tzinfo=value.tzinfo or UTC).isoformat()
    return value


class FakeGitHub:
    def __init__(self) -> None:
        self.items: list[Issue] = []

    def repository(
        self, _info: GraphQLResolveInfo, owner: str, name: str, **_: Any
    ) -> Repository:
        return Repository(
            {
                item.number: item
                for item in self.items
                if item.repository == f"{owner}/{name}"
            }
        )

    def rate_limit(self, _info: GraphQLResolveInfo, **_: Any) -> dict[str, Any]:
        return {
            "cost": 1,
            "limit": 5000,
            "nodeCount": 0,
            "remaining": 5000,
            "resetAt": "2026-01-01T00:00:00Z",
            "used": 0,
        }

    def handle(self, request: PreparedRequest) -> tuple[int, dict[str, str], str]:
        assert isinstance(request.body, str | bytes)
        body = json.loads(request.body)
        result = graphql_sync(
            GITHUB_SCHEMA,
            body["query"],
            root_value=self,
            variable_values=body.get("variables"),
            field_resolver=resolve_field,
            type_resolver=lambda value, _info, _type: type(value).__name__,
        )
        response: dict[str, Any] = {"data": result.data}
        if result.errors:
            # GitHub puts the error type next to the message instead of in the spec's slot for extra error details, and doesn't send that slot at all.
            # Matching this exactly keeps code that reads the wrong place from passing tests.
            response["errors"] = [
                {
                    **{k: v for k, v in error.formatted.items() if k != "extensions"},
                    **(error.extensions or {}),
                }
                for error in result.errors
            ]
        return 200, {"Content-Type": "application/json"}, json.dumps(response)
