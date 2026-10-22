from drf_spectacular.utils import extend_schema
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from shared.missing_cpes import MissingCPEs, missing_cpes


class MissingCPEsPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 100


class MissingCPEsView(ListAPIView):
    permission_classes = [AllowAny]
    pagination_class = MissingCPEsPagination

    @extend_schema(
        operation_id="listMissingCPEs",
        description=(
            "List CPE vendor/product pairs that validated suggestions tie to a package attribute, but that the attribute does not declare in the latest evaluation of any current branch."
        ),
        responses={200: MissingCPEs},
    )
    def get(self, request: Request) -> Response:
        page = self.paginate_queryset(missing_cpes())
        return self.get_paginated_response(
            [missing.model_dump() for missing in page or []]
        )
