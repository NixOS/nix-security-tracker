from django_filters import rest_framework as filters
from rest_framework import serializers, viewsets
from rest_framework.permissions import AllowAny

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
