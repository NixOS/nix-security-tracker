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
            field_name="suggestions__cve__cve_id",
            lookup_expr="in",
        )

        class Meta:
            model = NixpkgsIssue
            fields = ["cve"]

    class Serializer(serializers.ModelSerializer):
        status = serializers.CharField(source="get_status_display")
        cve = serializers.SerializerMethodField()

        # FIXME(@florentc): Issues may now have several suggestions, hence several cves.
        # This should be turned into a cves (plural) field
        def get_cve(self, obj: NixpkgsIssue) -> str | None:
            first = obj.suggestions.select_related("cve").first()
            return first.cve.cve_id if first else None

        class Meta:
            model = NixpkgsIssue
            fields = ["code", "cve", "status"]

    filterset_class = Filter

    permission_classes = [AllowAny]
    queryset = NixpkgsIssue.objects.prefetch_related(
        "suggestions__cve",
    ).distinct()
    serializer_class = Serializer

    @action(
        detail=False,
        methods=["get"],
        url_path=r"by-code/(?P<code>NIXPKGS-[0-9]{4}-[0-9]{4,19})",
    )
    def by_code(self, request: Request, code: str) -> Response:
        issue = get_object_or_404(self.get_queryset(), code=code)
        return Response(self.get_serializer(issue).data)
