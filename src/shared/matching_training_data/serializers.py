"""DRF ModelSerializers for matching training-data roundtrip.

The exported derivation and CVE data is exactly what we assume is required for
matching them reproducibly.
Adapt that appropriately when the matching algorithm changes.

Serializers are named after the models they read/write. Export with
``CVEDerivationClusterProposal(instance).data``; import with
``CVEDerivationClusterProposal(data=...).is_valid(); .save()``.
"""

from __future__ import annotations

import uuid
from typing import Any, cast

from django.db import transaction
from rest_framework import serializers

from shared import models
from shared.evaluation import DerivationKey, derivation_as_key

SCHEMA_VERSION = 1

# Synthetic channel used when materializing a local benchmark corpus
BENCHMARK_CHANNEL_BRANCH = "benchmark"
BENCHMARK_RELEASE_BRANCH = "benchmark-master"

# Fixed dummy git SHA so get_or_create stays obviously idempotent.
_BENCHMARK_DUMMY_SHA1 = "0" * 40

# Stable org for imported training CVEs
_TRAINING_ORG_UUID = uuid.UUID("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")


def ensure_benchmark_evaluation() -> models.NixEvaluation:
    """Create or reuse the synthetic benchmark channel + completed evaluation."""
    release_branch, _ = models.NixpkgsBranch.objects.get_or_create(
        name=BENCHMARK_RELEASE_BRANCH,
        defaults={"head_sha1_commit": _BENCHMARK_DUMMY_SHA1},
    )
    channel, _ = models.NixChannel.objects.get_or_create(
        channel_branch=BENCHMARK_CHANNEL_BRANCH,
        defaults={
            "release_branch": release_branch,
            "state": models.NixChannel.ChannelState.UNSTABLE,
            "head_sha1_commit": _BENCHMARK_DUMMY_SHA1,
            "variant": None,
        },
    )
    evaluation = (
        models.NixEvaluation.objects.filter(
            channel=channel,
            state=models.NixEvaluation.EvaluationState.COMPLETED,
        )
        .order_by("-updated_at")
        .first()
    )
    if evaluation is None:
        evaluation = models.NixEvaluation.objects.create(
            channel=channel,
            commit_sha1=_BENCHMARK_DUMMY_SHA1,
            state=models.NixEvaluation.EvaluationState.COMPLETED,
        )
    return evaluation


def pick_first_container(
    proposal: models.CVEDerivationClusterProposal,
) -> models.Container | None:
    """Prefer a container with ``package_name`` (needed for matching); else any first container."""
    return (
        proposal.cve.container.filter(affected__package_name__isnull=False).first()
        or proposal.cve.container.first()
    )


def _training_drv_path(*, attribute: str, name: str, system: str) -> str:
    """Stable synthetic drv path so :func:`derivation_as_key` stays deterministic."""
    return f"/nix/store/training-{attribute}-{name}-{system}.drv"


class AffectedProduct(serializers.ModelSerializer):
    cpes = serializers.ListField(child=serializers.CharField(), required=False)

    class Meta:
        model = models.AffectedProduct
        fields = (
            "vendor",
            "product",
            "package_name",
            "cpes",
        )

    def to_representation(self, instance: models.AffectedProduct) -> dict[str, Any]:
        return {
            "vendor": instance.vendor,
            "product": instance.product,
            "package_name": instance.package_name,
            "cpes": sorted(cpe.name for cpe in instance.cpes.all()),
        }


class Container(serializers.Serializer):
    """
    Subset of Container fields relevant for training data
    """

    tags = serializers.ListField(child=serializers.CharField(), required=False)
    affected = AffectedProduct(many=True, required=False)

    def to_representation(self, instance: models.Container) -> dict[str, Any]:
        affected = [
            AffectedProduct().to_representation(product)
            for product in instance.affected.all()
        ]
        return {
            "tags": sorted(tag.value for tag in instance.tags.all()),
            "affected": sorted(
                affected,
                key=lambda a: (
                    a.get("package_name") or "",
                    a.get("product") or "",
                    a.get("vendor") or "",
                    tuple(a.get("cpes") or []),
                ),
            ),
        }


class NixDerivation(serializers.ModelSerializer):
    known_vulnerabilities = serializers.ListField(
        child=serializers.CharField(),
        required=False,
    )

    class Meta:
        model = models.NixDerivation
        fields = ("attribute", "name", "system", "known_vulnerabilities")

    def to_representation(self, instance: models.NixDerivation) -> dict[str, Any]:
        known: list[str] = []
        if instance.metadata_id is not None and instance.metadata is not None:
            known = list(instance.metadata.known_vulnerabilities or [])
        return {
            "attribute": instance.attribute,
            "name": instance.name,
            "system": instance.system,
            "known_vulnerabilities": known,
        }


class DerivationClusterProposalLink(serializers.ModelSerializer):
    derivation = NixDerivation()

    class Meta:
        model = models.DerivationClusterProposalLink
        fields = ("derivation", "provenance_flags")

    def to_representation(
        self, instance: models.DerivationClusterProposalLink
    ) -> dict[str, Any]:
        return cast(dict[str, Any], super().to_representation(instance))


class PackageOverlay(serializers.ModelSerializer):
    type = serializers.ChoiceField(choices=models.PackageOverlay.Type.choices)

    class Meta:
        model = models.PackageOverlay
        fields = ("package_attribute", "type")

    def to_representation(self, instance: models.PackageOverlay) -> dict[str, Any]:
        return cast(dict[str, Any], super().to_representation(instance))


class CVEDerivationClusterProposal(serializers.ModelSerializer):
    """Versioned matching training-data record (export/import wire format)."""

    # Not model fields, must be declared (wire-only version gate + cve.cve_id).
    schema_version = serializers.IntegerField()
    cve_id = serializers.CharField()
    container = Container()
    derivationclusterproposallink_set = DerivationClusterProposalLink(
        many=True,
        required=False,
    )
    package_overlays = PackageOverlay(many=True, required=False)
    kept_derivations = serializers.SerializerMethodField()
    ignored_packages = serializers.SerializerMethodField()
    comment = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    # CharField (not ChoiceField): a nullable ChoiceField makes spectacular emit
    # oneOf[Enum, NullEnum], and orval names both the enum and the allOf wrapper
    # ``MatchingTrainingRecordRejectionReason``.
    rejection_reason = serializers.CharField(
        allow_null=True, allow_blank=True, required=False
    )

    class Meta:
        model = models.CVEDerivationClusterProposal
        ref_name = "MatchingTrainingRecord"
        fields = (
            "schema_version",
            "cve_id",
            "container",
            "status",
            "rejection_reason",
            "comment",
            "rejection_match_count",
            "rejection_max_matches_limit",
            "algorithm_version",
            "derivationclusterproposallink_set",
            "package_overlays",
            "kept_derivations",
            "ignored_packages",
        )
        read_only_fields = ("kept_derivations", "ignored_packages")

    def validate_schema_version(self, value: int) -> int:
        if value != SCHEMA_VERSION:
            raise serializers.ValidationError(
                f"Unsupported matching training-data schema_version={value}; "
                f"expected {SCHEMA_VERSION}"
            )
        return value

    def validate_rejection_reason(self, value: str | None) -> str | None:
        if value in (None, ""):
            return None
        valid = set(models.CVEDerivationClusterProposal.RejectionReason.values)
        if value not in valid:
            raise serializers.ValidationError(
                f"Invalid rejection_reason={value!r}; expected one of {sorted(valid)}"
            )
        return value

    def get_ignored_packages(
        self, obj: models.CVEDerivationClusterProposal
    ) -> list[str]:
        return sorted(
            overlay.package_attribute
            for overlay in obj.package_overlays.all()
            if overlay.type == models.PackageOverlay.Type.IGNORED
        )

    def get_kept_derivations(
        self, obj: models.CVEDerivationClusterProposal
    ) -> list[dict[str, str]]:
        if obj.status == models.CVEDerivationClusterProposal.Status.REJECTED:
            return []
        ignored = set(self.get_ignored_packages(obj))
        kept = [
            {
                "attribute": link.derivation.attribute,
                "name": link.derivation.name,
                "system": link.derivation.system,
            }
            for link in obj.derivationclusterproposallink_set.all()
            if link.derivation.attribute not in ignored
        ]
        return sorted(kept, key=lambda d: (d["attribute"], d["name"], d["system"]))

    def to_representation(
        self, instance: models.CVEDerivationClusterProposal
    ) -> dict[str, Any]:
        container = pick_first_container(instance)
        if container is None:
            raise ValueError(
                f"Proposal {instance.pk} for {instance.cve.cve_id} has no CVE container"
            )

        links = [
            DerivationClusterProposalLink().to_representation(link)
            for link in instance.derivationclusterproposallink_set.select_related(
                "derivation__metadata"
            ).order_by(
                "derivation__attribute",
                "derivation__name",
                "derivation__system",
            )
        ]
        overlays = [
            PackageOverlay().to_representation(overlay)
            for overlay in instance.package_overlays.order_by(
                "package_attribute",
                "type",
            )
        ]

        return {
            "schema_version": SCHEMA_VERSION,
            "cve_id": instance.cve.cve_id,
            "container": Container().to_representation(container),
            "status": instance.status,
            "rejection_reason": instance.rejection_reason,
            "comment": instance.comment,
            "rejection_match_count": instance.rejection_match_count,
            "rejection_max_matches_limit": instance.rejection_max_matches_limit,
            "algorithm_version": instance.algorithm_version,
            "derivationclusterproposallink_set": links,
            "package_overlays": overlays,
            "kept_derivations": self.get_kept_derivations(instance),
            "ignored_packages": self.get_ignored_packages(instance),
        }

    @transaction.atomic
    def create(
        self, validated_data: dict[str, Any]
    ) -> models.CVEDerivationClusterProposal:
        """
        Materialize a training record on the synthetic benchmark channel.

        Idempotent per ``cve_id``: any existing CVE with that id is replaced.
        """
        evaluation = ensure_benchmark_evaluation()
        validated_data.pop("schema_version")
        cve_id = validated_data.pop("cve_id")
        container_data = validated_data.pop("container")
        links_data = validated_data.pop("derivationclusterproposallink_set", [])
        overlays_data = validated_data.pop("package_overlays", [])

        models.CveRecord.objects.filter(cve_id=cve_id).delete()
        org, _ = models.Organization.objects.get_or_create(
            uuid=_TRAINING_ORG_UUID,
            defaults={"short_name": "training-data"},
        )

        cve = models.CveRecord.objects.create(cve_id=cve_id, assigner=org)
        container = models.Container.objects.create(
            cve=cve,
            provider=org,
            title=f"Training data for {cve_id}",
        )

        tag_objs = []
        for value in container_data.get("tags") or []:
            tag, _ = models.Tag.objects.get_or_create(value=value)
            tag_objs.append(tag)
        if tag_objs:
            container.tags.set(tag_objs)

        for affected_data in container_data.get("affected") or []:
            affected = models.AffectedProduct.objects.create(
                vendor=affected_data.get("vendor"),
                product=affected_data.get("product"),
                package_name=affected_data.get("package_name"),
            )
            for cpe_name in affected_data.get("cpes") or []:
                cpe, _ = models.Cpe.objects.get_or_create(name=cpe_name)
                affected.cpes.add(cpe)
            container.affected.add(affected)

        by_fingerprint: dict[DerivationKey, models.NixDerivation] = {}
        for link_data in links_data:
            drv_data = link_data["derivation"]
            attribute = drv_data["attribute"]
            name = drv_data["name"]
            system = drv_data["system"]
            drv_path = _training_drv_path(attribute=attribute, name=name, system=system)
            # Same uniqueness degrees of freedom as evaluation ingestion
            # (shared.evaluation.derivation_as_key). Training JSON has no real
            # drv_path, so we use a deterministic synthetic path that embeds
            # attribute/name/system.
            key = derivation_as_key(
                drv_path=drv_path,
                attr=attribute,
                name=name,
                meta_name=name,
            )
            if key not in by_fingerprint:
                meta = models.NixDerivationMeta.objects.create(
                    description="Imported training derivation",
                    homepage=None,
                    insecure=False,
                    available=True,
                    broken=False,
                    unfree=False,
                    unsupported=False,
                    known_vulnerabilities=list(
                        drv_data.get("known_vulnerabilities") or []
                    ),
                )
                by_fingerprint[key] = models.NixDerivation.objects.create(
                    attribute=attribute,
                    derivation_path=drv_path,
                    name=name,
                    metadata=meta,
                    system=system,
                    parent_evaluation=evaluation,
                )

        proposal = models.CVEDerivationClusterProposal.objects.create(
            cve=cve,
            status=validated_data["status"],
            rejection_reason=validated_data.get("rejection_reason"),
            comment=validated_data.get("comment"),
            rejection_match_count=validated_data.get("rejection_match_count"),
            rejection_max_matches_limit=validated_data.get(
                "rejection_max_matches_limit"
            ),
            algorithm_version=validated_data["algorithm_version"],
        )

        link_objs = []
        for link_data in links_data:
            drv_data = link_data["derivation"]
            attribute = drv_data["attribute"]
            name = drv_data["name"]
            system = drv_data["system"]
            key = derivation_as_key(
                drv_path=_training_drv_path(
                    attribute=attribute, name=name, system=system
                ),
                attr=attribute,
                name=name,
                meta_name=name,
            )
            link_objs.append(
                models.DerivationClusterProposalLink(
                    proposal=proposal,
                    derivation=by_fingerprint[key],
                    provenance_flags=link_data["provenance_flags"],
                )
            )
        if link_objs:
            models.DerivationClusterProposalLink.objects.bulk_create(link_objs)

        for overlay in overlays_data:
            models.PackageOverlay.objects.create(
                suggestion=proposal,
                package_attribute=overlay["package_attribute"],
                type=overlay["type"],
            )

        return proposal
