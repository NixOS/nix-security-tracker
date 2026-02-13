import json
import logging
import time
from collections.abc import Callable, Generator
from dataclasses import dataclass, field
from typing import Any, TypeVar

from dataclass_wizard import JSONWizard, LoadMixin
from django.db.models import Model

from shared.models.nix_evaluation import (
    MAJOR_CHANNELS,
    NixDerivation,
    NixDerivationMeta,
    NixEvaluation,
    NixLicense,
    NixMaintainer,
)

T = TypeVar("T", bound=Model)
DeferredThrough = Callable[[int], list[T]]
logger = logging.getLogger(__name__)


@dataclass
class MaintainerAttribute(JSONWizard):
    name: str
    github: str | None = None
    github_id: int | None = None
    email: str | None = None
    matrix: str | None = None


@dataclass
class LicenseAttribute(JSONWizard):
    full_name: str | None = None
    deprecated: bool = False
    free: bool = False
    redistributable: bool = False
    short_name: str | None = None
    spdx_id: str | None = None
    url: str | None = None


@dataclass
class MetadataAttribute(JSONWizard, LoadMixin):
    outputs_to_install: list[str] = field(default_factory=list)
    available: bool = True
    broken: bool = False
    unfree: bool = False
    unsupported: bool = False
    insecure: bool = False
    main_program: str | None = None
    position: str | None = None
    homepage: str | None = None
    description: str | None = None
    name: str | None = None
    maintainers: list[MaintainerAttribute] = field(default_factory=list)
    license: list[LicenseAttribute] = field(default_factory=list)
    platforms: list[str] = field(default_factory=list)
    known_vulnerabilities: list[str] = field(default_factory=list)


@dataclass
class EvaluatedAttribute(JSONWizard):
    """
    This is a totally evaluated attribute.
    """

    attr: str
    attr_path: list[str]
    name: str
    drv_path: str
    meta: MetadataAttribute | None
    outputs: dict[str, str]
    system: str

    def as_key(self) -> tuple[str, str, str, str | None]:
        """
        Unique dictionary key for a derivation

        These are the actual degrees of freedom for a derivation, judging from the data.
        """
        # FIXME(@fricklerhandwerk): We should only need the derivation path!
        # Extract the extra fields to save more space.
        # A `NixPackage` could indeed consist of just `pname` (parsed from `name`, validate against `attribute` and `drv_metadata.name`).
        # Then we'd describe all occurrences of a `NixPackage` with
        # - NixDerivation
        # - attribute_name
        # - metadata__name
        # - parent_evaluation (also extracted since derivation paths of close-to-root packages can be the same across evaluations)
        # - version (also parsed from `name`, for easier querying)
        return (
            self.drv_path,
            self.attr,
            self.name,
            self.meta.name or None if self.meta else None,
        )


@dataclass
class PartialEvaluatedAttribute:
    """
    This represents a potentially invalid partially
    evaluated attribute for some reasons.
    Open the `evaluation` for more or read the `error`.
    """

    attr: str
    attr_path: list[str]
    error: str | None = None
    evaluation: EvaluatedAttribute | None = None


def fixup_evaluated_attribute(raw: dict[str, Any]) -> EvaluatedAttribute:
    # Various fixups to deal with... things.
    # my lord...
    if raw.get("meta", {}) is None:
        logger.info(f"'{raw['attr']}' has no metadata")

    if (
        raw.get("meta", {}) is not None
        and "license" in raw.get("meta", {})
        and not isinstance(raw.get("meta", {})["license"], list)
    ):
        if raw["meta"]["license"] == "unknown":
            raw["meta"]["license"] = []
        elif isinstance(raw["meta"]["license"], str):
            raw["meta"]["license"] = [{"fullName": raw["meta"]["license"]}]
        else:
            raw["meta"]["license"] = [raw["meta"]["license"]]

    new_maintainers = []
    if (
        raw.get("meta", {}) is not None
        and "maintainers" in raw.get("meta", {})
        and isinstance(raw.get("meta", {})["maintainers"], list)
    ):
        for maintainer in raw.get("meta", {})["maintainers"]:
            if maintainer.get("shortName") is not None:
                # FIXME(@fricklerhandwerk): This should actually never happen, judging from recent data.
                logger.info("Maintainer '{maintainer['shortName']}' is actually a team")
                new_maintainers.extend(maintainer["members"])
            else:
                new_maintainers.append(maintainer)
        raw["meta"]["maintainers"] = new_maintainers

    return EvaluatedAttribute.from_dict(raw)


def parse_evaluation_result(line: str) -> PartialEvaluatedAttribute:
    raw = json.loads(line)
    return PartialEvaluatedAttribute(
        attr=raw.get("attr"),
        attr_path=raw.get("attr_path"),
        error=None,
        evaluation=fixup_evaluated_attribute(raw) if raw.get("error") is None else None,
    )


def by_drv_key[T](
    gen: Generator[tuple[EvaluatedAttribute, list[T]]],
) -> dict[tuple[str, str, str, str | None], list[T]]:
    return dict((origin.as_key(), elements) for origin, elements in gen)


class SyncBatchAttributeIngester:
    """
    This is a class to perform ingestion
    of a bunch of **evaluated** attribute synchronously.
    """

    def __init__(
        self, evaluations: list[EvaluatedAttribute], parent_evaluation: NixEvaluation
    ) -> None:
        self.evaluations = evaluations
        self.parent_evaluation = parent_evaluation
        # FIXME(@fricklerhandwerk): This will fall apart when we obtain the channel structure dynamically [ref:channel-structure]
        self.rolling_release = (
            MAJOR_CHANNELS[0] in self.parent_evaluation.channel.channel_branch
        )

    def initialize(self) -> None:
        self.maintainers = list(NixMaintainer.objects.all())
        self.licenses = list(NixLicense.objects.all())

    def parse_maintainers(
        self, maintainers: list[MaintainerAttribute]
    ) -> list[NixMaintainer]:
        bulk = []
        seen = set()

        for m in maintainers:
            # Maintainers without a GitHub ID cannot be reconciled.
            # This unfortunately creates a partial view of all maintainers of a
            # given package. If you want to fix this, you can start from
            # looking around https://github.com/NixOS/nixpkgs/pull/273220.
            missing = []
            if m.github is None:
                missing.append("GitHub handle")
                # FIXME(@fricklerhandwerk): We could try to recover the maintainer based on the handle alone.
            if m.github_id is None:
                missing.append("GitHub ID")
                logger.info(
                    f"Skipping maintainer '{m.name}': no {' and no '.join(missing)}"
                )
                continue

            if m.github_id in seen:
                continue

            bulk.append(
                NixMaintainer(
                    github_id=m.github_id,
                    github=m.github,
                    email=m.email,
                    matrix=m.matrix,
                    name=m.name,
                )
            )

            seen.add(m.github_id)

        return bulk

    def parse_licenses(self, licenses: list[LicenseAttribute]) -> list[NixLicense]:
        bulk = []
        seen = set()

        for lic in licenses:
            if lic.spdx_id is None:
                logger.debug(f"Skipping license without SPDX-ID: {lic}")
                continue

            if lic.spdx_id in seen:
                continue

            bulk.append(
                NixLicense(
                    spdx_id=lic.spdx_id,
                    deprecated=lic.deprecated,
                    free=lic.free,
                    redistributable=lic.redistributable,
                    full_name=lic.full_name,
                    short_name=lic.short_name,
                    url=lic.url,
                )
            )
            seen.add(lic.spdx_id)

        return bulk

    def parse_meta(
        self, metadata: MetadataAttribute
    ) -> tuple[
        NixDerivationMeta,
        list[NixMaintainer],
        list[NixLicense],
    ]:
        maintainers = self.parse_maintainers(metadata.maintainers)
        licenses = self.parse_licenses(metadata.license)

        meta = NixDerivationMeta(
            name=metadata.name,
            insecure=metadata.insecure,
            available=metadata.available,
            broken=metadata.broken,
            unfree=metadata.unfree,
            unsupported=metadata.unsupported,
            homepage=metadata.homepage,
            description=metadata.description,
            main_program=metadata.main_program,
            position=metadata.position,
            known_vulnerabilities=metadata.known_vulnerabilities,
        )

        return meta, maintainers, licenses

    def make_derivation_shell(
        self,
        attribute: EvaluatedAttribute,
        metadata: NixDerivationMeta | None = None,
    ) -> NixDerivation:
        return NixDerivation(
            attribute=attribute.attr.removesuffix(f".{attribute.system}"),
            derivation_path=attribute.drv_path,
            name=attribute.name,
            metadata=metadata,
            system=attribute.system,
            parent_evaluation=self.parent_evaluation,
        )

    def ingest(self) -> list[NixDerivation]:
        start = time.time()
        bulk_derivations: dict[tuple[str, str, str, str | None], NixDerivation] = {}
        bulk_maintainers: dict[int, NixMaintainer] = {}
        bulk_licenses: dict[str, NixLicense] = {}
        metadata = []
        meta_maintainers = []
        meta_licenses = []
        for index, attribute in enumerate(self.evaluations):
            drv_metadata = None
            if attribute.meta is not None:
                (
                    drv_metadata,
                    drv_maintainers,
                    drv_licenses,
                ) = self.parse_meta(attribute.meta)

                metadata.append(drv_metadata)
                meta_maintainers.append(drv_maintainers)
                meta_licenses.append(drv_licenses)
                for maintainer in drv_maintainers:
                    bulk_maintainers[maintainer.github_id] = maintainer
                for license in drv_licenses:
                    bulk_licenses[license.spdx_id] = license

            bulk_derivations[attribute.as_key()] = self.make_derivation_shell(
                attribute, drv_metadata
            )

        logger.debug(
            "Parsed %d maintainers and %d licences for %d derivations in %f s",
            len(bulk_maintainers),
            len(bulk_licenses),
            len(bulk_derivations),
            time.time() - start,
        )

        # Anything but the rolling release must be considered stale.
        # Therefore we only add new rows if this is not a rolling release.
        start = time.time()
        NixMaintainer.objects.bulk_create(
            bulk_maintainers.values(),
            # This will ignore existing rows and won't return primary keys when `True`.
            # That's okay because we'll fetch the relevant objects aftwards unconditionally.
            ignore_conflicts=not self.rolling_release,
            update_conflicts=self.rolling_release,
            unique_fields=["github_id"],
            update_fields=["github", "email", "matrix", "name"],
        )
        db_maintainers = NixMaintainer.objects.in_bulk(
            bulk_maintainers.keys(),
            field_name="github_id",
        )
        logger.debug(
            "Ingested %d maintainers for %d derivations in %f s",
            len(bulk_maintainers),
            len(bulk_derivations),
            time.time() - start,
        )
        start = time.time()
        NixLicense.objects.bulk_create(
            bulk_licenses.values(),
            ignore_conflicts=not self.rolling_release,
            update_conflicts=self.rolling_release,
            unique_fields=["spdx_id"],
            update_fields=[
                "deprecated",
                "free",
                "redistributable",
                "full_name",
                "short_name",
                "url",
            ],
        )
        # FIXME(@fricklerhandwerk): This duplicates metadata entries at least by the number of systems we evaluate.
        # [ref:deduplicate-metadata]
        db_licenses = NixLicense.objects.in_bulk(
            bulk_licenses.keys(),
            field_name="spdx_id",
        )
        logger.debug(
            "Ingested %d licenses for %d derivations in %f s",
            len(bulk_licenses),
            len(bulk_derivations),
            time.time() - start,
        )

        start = time.time()
        db_metadata = NixDerivationMeta.objects.bulk_create(metadata)
        logger.debug(
            "Ingested %d metadata entries for %d derivations in %f s",
            len(metadata),
            len(bulk_derivations),
            time.time() - start,
        )

        start = time.time()
        maintainers_throughs = []
        licenses_throughs = []
        for db_meta, maintainers, licenses in zip(
            db_metadata, meta_maintainers, meta_licenses
        ):
            maintainers_throughs.extend(
                [
                    NixDerivationMeta.maintainers.through(
                        nixderivationmeta_id=db_meta.pk,
                        nixmaintainer_id=db_maintainers[maintainer.github_id].pk,
                    )
                    for maintainer in maintainers
                ]
            )
            licenses_throughs.extend(
                [
                    NixDerivationMeta.licenses.through(
                        nixderivationmeta_id=db_meta.pk,
                        nixlicense_id=db_licenses[license.spdx_id].pk,
                    )
                    for license in licenses
                ]
            )

        NixDerivationMeta.maintainers.through.objects.bulk_create(maintainers_throughs)
        logger.debug(
            "Ingested %d maintainers M2Ms for %d derivations in %f s",
            len(maintainers_throughs),
            len(bulk_derivations),
            time.time() - start,
        )

        start = time.time()
        NixDerivationMeta.licenses.through.objects.bulk_create(licenses_throughs)
        logger.debug(
            "Ingested %d licenses M2Ms for %d derivations in %f s",
            len(licenses_throughs),
            len(bulk_derivations),
            time.time() - start,
        )

        start = time.time()
        db_derivations_list = NixDerivation.objects.bulk_create(
            bulk_derivations.values()
        )
        db_derivations = dict(zip(bulk_derivations.keys(), db_derivations_list))
        logger.debug(
            "Ingested %d derivation shells in %f s",
            len(bulk_derivations),
            time.time() - start,
        )

        return list(db_derivations.values())
