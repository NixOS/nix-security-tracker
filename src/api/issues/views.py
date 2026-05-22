from django.shortcuts import get_object_or_404
from django_filters import rest_framework as filters
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from shared.models import NixpkgsIssue


class StringInFilter(filters.BaseInFilter, filters.CharFilter):
    pass


class NixpkgsIssueViewSet(viewsets.ReadOnlyModelViewSet):
    class Filter(filters.FilterSet):
        cve = StringInFilter(
            label="Filter by CVEs referenced",
            field_name="suggestion__cve__cve_id",
            lookup_expr="in",
        )

        class Meta:
            model = NixpkgsIssue
            fields = ["cve"]

    class Serializer(serializers.ModelSerializer):
        status = serializers.CharField(source="get_status_display")
        cve = serializers.SerializerMethodField()

        def get_cve(self, obj: NixpkgsIssue) -> str:
            return obj.suggestion.cve.cve_id

        class Meta:
            model = NixpkgsIssue
            fields = ["code", "cve", "status"]

    filterset_class = Filter

    permission_classes = [AllowAny]
    queryset = NixpkgsIssue.objects.select_related(
        "suggestion__cve",
    ).all()
    serializer_class = Serializer

    @action(
        detail=False,
        methods=["get"],
        url_path=r"by-code/(?P<code>NIXPKGS-[0-9]{4}-[0-9]{4,19})",
    )
    def by_code(self, request: Request, code: str) -> Response:
        issue = get_object_or_404(self.get_queryset(), code=code)
        return Response(self.get_serializer(issue).data)
