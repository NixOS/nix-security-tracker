from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from shared.cvss import compute_cvss_fields
from shared.logs.batches import (
    FoldedCreationEvent,
    FoldedEventType,
    FoldedMaintainerEvent,
    FoldedPackageEvent,
    FoldedReferenceEvent,
    FoldedStatusEvent,
)
from shared.models.linkage import CVEDerivationClusterProposal


class SuggestionCommentSerializer(serializers.Serializer):
    """Serializer for reading or updating a suggestion comment."""

    comment = serializers.CharField(
        allow_null=True,
        allow_blank=True,
        required=True,
        max_length=1000,
        help_text="Free-text comment. Set to empty string to clear.",
    )


class MetricHumanReadableItemSerializer(serializers.Serializer):
    label = serializers.CharField()
    value = serializers.CharField()


class MetricSerializer(serializers.Serializer):
    format = serializers.CharField()
    vector_string = serializers.CharField()
    base_score = serializers.FloatField(allow_null=True)
    base_severity = serializers.CharField(allow_null=True)
    human_readable = MetricHumanReadableItemSerializer(many=True, allow_null=True)


class MaintainerSerializer(serializers.Serializer):
    name = serializers.CharField(allow_null=True)
    email = serializers.CharField(allow_null=True)
    github = serializers.CharField()
    matrix = serializers.CharField(allow_null=True)
    github_id = serializers.IntegerField()


class SuggestionPackageOnBranchSerializer(serializers.Serializer):
    version = serializers.CharField()
    status = serializers.CharField()
    src_position = serializers.CharField(allow_null=True)
    updated = serializers.DateTimeField()


class SuggestionPackageOnPrimaryChannelSerializer(serializers.Serializer):
    major_version = serializers.CharField(allow_null=True)
    status = serializers.CharField(allow_null=True)
    updated = serializers.DateTimeField(allow_null=True)
    uniform_versions = serializers.BooleanField(allow_null=True)
    src_position = serializers.CharField(allow_null=True)
    sub_branches = serializers.DictField(child=SuggestionPackageOnBranchSerializer())


class SuggestionPackageSerializer(serializers.Serializer):
    channels = serializers.DictField(
        child=SuggestionPackageOnPrimaryChannelSerializer()
    )
    derivation_ids = serializers.ListField(child=serializers.IntegerField())
    maintainers = MaintainerSerializer(many=True)
    description = serializers.CharField(allow_null=True)


class SuggestionAffectedProductSerializer(serializers.Serializer):
    name = serializers.CharField()
    version_constraints = serializers.ListField(
        child=serializers.ListField(child=serializers.CharField())
    )
    cpes = serializers.ListField(child=serializers.CharField())


class SuggestionUrlReferenceSerializer(serializers.Serializer):
    url = serializers.CharField()
    name = serializers.CharField()
    tags = serializers.ListField(child=serializers.CharField())


class SuggestionCategorizedUrlReferencesSerializer(serializers.Serializer):
    original = SuggestionUrlReferenceSerializer(many=True)
    active = SuggestionUrlReferenceSerializer(many=True)
    ignored = SuggestionUrlReferenceSerializer(many=True)


class SuggestionCategorizedMaintainersSerializer(serializers.Serializer):
    original = MaintainerSerializer(many=True)
    active = MaintainerSerializer(many=True)
    ignored = MaintainerSerializer(many=True)
    added = MaintainerSerializer(many=True)


class SuggestionSerializer(serializers.Serializer):
    """Suggestion (proposal linking a CVE to derivations)."""

    id = serializers.IntegerField(source="pk")
    status = serializers.ChoiceField(
        choices=CVEDerivationClusterProposal.Status.choices
    )
    rejection_reason = serializers.ChoiceField(
        choices=CVEDerivationClusterProposal.RejectionReason.choices,
        allow_null=True,
        required=False,
    )
    comment = serializers.CharField(allow_null=True, required=False)
    in_issue_draft = serializers.BooleanField()

    # Fields from the cached payload
    cve_id = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    affected_products = serializers.SerializerMethodField()
    packages = serializers.SerializerMethodField()
    original_packages = serializers.SerializerMethodField()
    ignored_packages = serializers.SerializerMethodField()
    metrics = serializers.SerializerMethodField()
    categorized_maintainers = serializers.SerializerMethodField()
    categorized_url_references = serializers.SerializerMethodField()

    def _payload(self, obj: CVEDerivationClusterProposal) -> dict:
        return obj.cached.payload

    @extend_schema_field(serializers.CharField())
    def get_cve_id(self, obj: CVEDerivationClusterProposal) -> str:
        return self._payload(obj)["cve_id"]

    @extend_schema_field(serializers.CharField())
    def get_title(self, obj: CVEDerivationClusterProposal) -> str:
        return self._payload(obj)["title"]

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_description(self, obj: CVEDerivationClusterProposal) -> str | None:
        return self._payload(obj)["description"]

    @extend_schema_field(
        serializers.DictField(child=SuggestionAffectedProductSerializer())
    )
    def get_affected_products(self, obj: CVEDerivationClusterProposal) -> list:
        data = self._payload(obj)["affected_products"]
        return [
            SuggestionAffectedProductSerializer(v | {"name": k}).data
            for k, v in data.items()
        ]

    @extend_schema_field(serializers.DictField(child=SuggestionPackageSerializer()))
    def get_packages(self, obj: CVEDerivationClusterProposal) -> dict:
        data = self._payload(obj)["packages"]
        return {k: SuggestionPackageSerializer(v).data for k, v in data.items()}

    @extend_schema_field(serializers.DictField(child=SuggestionPackageSerializer()))
    def get_original_packages(self, obj: CVEDerivationClusterProposal) -> dict:
        data = self._payload(obj)["original_packages"]
        return {k: SuggestionPackageSerializer(v).data for k, v in data.items()}

    @extend_schema_field(serializers.DictField(child=SuggestionPackageSerializer()))
    def get_ignored_packages(self, obj: CVEDerivationClusterProposal) -> dict:
        original_packages = self._payload(obj)["original_packages"]
        packages = self._payload(obj)["packages"]
        return {
            k: SuggestionPackageSerializer(v).data
            for k, v in original_packages.items()
            if k not in packages
        }

    @extend_schema_field(MetricSerializer(many=True))
    def get_metrics(self, obj: CVEDerivationClusterProposal) -> list:
        metrics = self._payload(obj)["metrics"]
        result = []
        for m in metrics:
            fields = compute_cvss_fields(m)
            result.append(
                MetricSerializer(
                    {
                        "format": m.get("format"),
                        "vector_string": m.get("vector_string"),
                        "base_score": fields.base_score,
                        "base_severity": fields.base_severity,
                        "human_readable": fields.human_readable,
                    }
                ).data
            )
        return result

    @extend_schema_field(SuggestionCategorizedMaintainersSerializer())
    def get_categorized_maintainers(self, obj: CVEDerivationClusterProposal) -> dict:
        data = self._payload(obj)["categorized_maintainers"]
        return dict(SuggestionCategorizedMaintainersSerializer(data).data)

    @extend_schema_field(SuggestionCategorizedUrlReferencesSerializer())
    def get_categorized_url_references(self, obj: CVEDerivationClusterProposal) -> dict:
        data = self._payload(obj)["categorized_url_references"]
        return dict(SuggestionCategorizedUrlReferencesSerializer(data).data)

    def to_representation(self, instance: CVEDerivationClusterProposal) -> dict:
        result = super().to_representation(instance)
        if instance.status != CVEDerivationClusterProposal.Status.REJECTED:
            result.pop("rejection_reason", None)
        if not instance.comment:
            result.pop("comment", None)
        return result


# Activity log serializers


class ActivityLogReferenceSerializer(serializers.Serializer):
    url = serializers.CharField()
    name = serializers.CharField(allow_null=True)


class ActivityLogEntrySerializer(serializers.Serializer):
    action = serializers.CharField()
    timestamp = serializers.DateTimeField()
    username = serializers.CharField(allow_null=True)
    status_value = serializers.CharField(allow_null=True, default=None)
    rejection_reason = serializers.CharField(allow_null=True, default=None)
    package_names = serializers.ListField(child=serializers.CharField(), default=list)
    maintainers = MaintainerSerializer(many=True, default=list)
    references = ActivityLogReferenceSerializer(many=True, default=list)


# FIXME(@florentc): Eventually we'll want to:
# - remove cancelling events: at the model level through a proper debouncing implementation
# - batch events: at the frontend level as it's presentation-related
def folded_event_to_dict(event: FoldedEventType) -> dict:
    """Convert a FoldedEventType Pydantic model to a plain dict for serialization."""
    base: dict = {
        "action": event.action,
        "timestamp": event.timestamp,
        "username": event.username,
        "status_value": None,
        "rejection_reason": None,
        "package_names": [],
        "maintainers": [],
        "references": [],
    }
    if isinstance(event, FoldedCreationEvent):
        base["rejection_reason"] = event.rejection_reason
    elif isinstance(event, FoldedStatusEvent):
        base["status_value"] = event.status_value
        base["rejection_reason"] = event.rejection_reason
    elif isinstance(event, FoldedPackageEvent):
        base["package_names"] = event.package_names
    elif isinstance(event, FoldedMaintainerEvent):
        base["maintainers"] = [dict(m) for m in event.maintainers]
    elif isinstance(event, FoldedReferenceEvent):
        base["references"] = [dict(r) for r in event.references]
    return base
