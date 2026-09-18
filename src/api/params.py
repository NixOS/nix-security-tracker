from drf_spectacular.utils import OpenApiParameter
from rest_framework.request import Request

ACTIVITY_LOG_PARAMETER = OpenApiParameter(
    name="activity_log",
    type=bool,
    location=OpenApiParameter.QUERY,
    required=False,
    description=(
        "When true, inline each suggestion's activity log in its `activity_log` field instead of requiring a separate request to the activity_log endpoint."
    ),
)

EXPAND_PARAMETER = OpenApiParameter(
    name="expand",
    type=str,
    location=OpenApiParameter.QUERY,
    required=False,
    description=(
        "Comma-separated list of fields to inline instead of returning ids. "
        "Which field names are supported depends on the endpoint (see its description)."
    ),
)


def activity_log_requested(request: Request) -> bool:
    """Whether the `activity_log` query param is truthy on this request."""
    return request.query_params.get("activity_log", "").lower() in ("true", "1", "yes")


def parse_expand_fields(request: Request) -> set[str]:
    """Parse the comma-separated `expand` query param into a set of field names."""
    expand = request.query_params.get("expand", "")
    return {field.strip() for field in expand.split(",") if field.strip()}
