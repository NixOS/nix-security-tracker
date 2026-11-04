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

SHARED_STATE_PARAMETER = OpenApiParameter(
    name="shared_state",
    type=bool,
    location=OpenApiParameter.QUERY,
    required=False,
    description=(
        "When true, report in the `shared` field what the whole filtered selection has in common, so a client can tell which bulk operations it may offer. "
        "Null when not requested or no bulk operation would accept the selection. "
        "A bulk operation remains free to refuse what is reported."
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


def _flag_requested(request: Request, name: str) -> bool:
    return request.query_params.get(name, "").lower() in ("true", "1", "yes")


def activity_log_requested(request: Request) -> bool:
    """Whether the `activity_log` query param is truthy on this request."""
    return _flag_requested(request, "activity_log")


def shared_state_requested(request: Request) -> bool:
    """Whether the `shared_state` query param is truthy on this request."""
    return _flag_requested(request, "shared_state")


def parse_expand_fields(request: Request) -> set[str]:
    """Parse the comma-separated `expand` query param into a set of field names."""
    expand = request.query_params.get("expand", "")
    return {field.strip() for field in expand.split(",") if field.strip()}
