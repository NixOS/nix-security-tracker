import logging
import re
import urllib.parse
from collections import defaultdict
from collections.abc import Collection, Iterable, Mapping
from datetime import datetime
from enum import StrEnum
from itertools import chain
from typing import Any, overload

from django.db.models import Case, IntegerField, Prefetch, Q, When
from pydantic import BaseModel, field_serializer

from shared.models import NixDerivation, NixMaintainer
from shared.models.cached import CachedSuggestions
from shared.models.cve import AffectedProduct, Metric, Reference, Version
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    MaintainerOverlay,
    PackageOverlay,
    ReferenceUrlOverlay,
)
from shared.models.package import Package as PackageModel

logger = logging.getLogger(__name__)


# ============================================================================
# ⚠️ IMPORTANT: CACHE SCHEMA VERSIONING
#
# When modifying this schema, you MUST bump
# CachedSuggestions.CURRENT_SCHEMA_VERSION.
#
# Otherwise cached data may become inconsistent.
# ============================================================================
class CachedSuggestion(BaseModel):
    class AffectedProduct(BaseModel):
        version_constraints: set[tuple[str, str]] = set()
        cpes: set[str] = set()

        @overload
        def from_set(self, value: set[str]) -> list[str]: ...

        @overload
        def from_set(self, value: set[tuple[str, str]]) -> list[tuple[str, str]]: ...

        @field_serializer("version_constraints", "cpes", when_used="json")
        def from_set(self, value):
            return list(value)

    class PackageOnBranch(BaseModel):
        version: str | None
        status: Version.Status | None
        updated: datetime | None
        src_position: str | None

    class Maintainer(BaseModel):
        name: str | None = None
        email: str | None = None
        github: str
        matrix: str | None = None
        github_id: int

    class Package(BaseModel):
        branches: dict[str, "CachedSuggestion.PackageOnBranch"] = {}
        derivation_ids: list[int] = []
        maintainer_ids: list[int] = []
        description: str | None = None

    class AttributePackageGroup(BaseModel):
        """
        Attributes that belong to the same package.
        """

        package_id: int
        name: str
        homepage: str | None
        description: str | None
        attributes: list[str]

    class MaintainerStatus(StrEnum):
        ACTIVE = "active"
        IGNORED = "ignored"
        ADDED = "added"

    class PackageStatus(StrEnum):
        ACTIVE = "active"
        IGNORED = "ignored"

    class UrlReferenceStatus(StrEnum):
        ACTIVE = "active"
        IGNORED = "ignored"

    class StatusPackage(BaseModel):
        package: "CachedSuggestion.Package"
        status: "CachedSuggestion.PackageStatus"

    class StatusMaintainer(BaseModel):
        maintainer: "CachedSuggestion.Maintainer"
        status: "CachedSuggestion.MaintainerStatus"
        # Original maintainers who no longer have any active package.
        # Always false for added maintainers.
        orphan: bool = False

    class UrlReference(BaseModel):
        """
        These references are in practice the equivalence classes for references wich share the same URL.
        One object of this model may represent several references which share one URL, and whose tags are combined.
        """

        url: str
        name: str
        tags: set[str]

    class StatusUrlReference(BaseModel):
        reference: "CachedSuggestion.UrlReference"
        status: "CachedSuggestion.UrlReferenceStatus"

    pk: int
    cve_id: str
    title: str | None
    description: str | None
    affected_products: dict[str, "CachedSuggestion.AffectedProduct"]
    # Keyed by attribute.
    packages: dict[str, StatusPackage]
    attribute_package_groups: list[AttributePackageGroup]
    # NOTE(@fricklerhandwerk): These are converted with `to_dict()` naively, we're not doing anything interesting to them here.
    metrics: list[dict]
    # Keyed by GitHub ID.
    maintainers: dict[int, StatusMaintainer]
    # Keyed by URL.
    url_references: dict[str, StatusUrlReference]


def categorize_packages(
    packages: dict[str, CachedSuggestion.Package], edits: Iterable[PackageOverlay]
) -> dict[str, CachedSuggestion.StatusPackage]:
    """
    Attach to each package its status according to user-supplied package edits.
    """
    ignored = {
        edit.package_attribute
        for edit in edits
        if edit.type == PackageOverlay.Type.IGNORED
    }
    return {
        attribute: CachedSuggestion.StatusPackage(
            package=package,
            status=CachedSuggestion.PackageStatus.IGNORED
            if attribute in ignored
            else CachedSuggestion.PackageStatus.ACTIVE,
        )
        for attribute, package in packages.items()
    }


def to_dict(instance: Any) -> dict[str, Any]:
    opts = instance._meta
    data = {}
    for f in chain(opts.concrete_fields, opts.private_fields):
        if getattr(f, "foreign_related_fields", None) is not None:
            raw_value = getattr(instance, f.name)
            if raw_value is not None:
                data[f.name] = to_dict(raw_value)
            else:
                data[f.name] = None
        else:
            data[f.name] = f.value_from_object(instance)
    for f in opts.many_to_many:
        data[f.name] = [to_dict(i) for i in f.value_from_object(instance)]
    return data


def cache_new_suggestions(suggestion: CVEDerivationClusterProposal) -> None:
    # FIXME(@fricklerhandwerk): Here we're blindly picking a title and description, which can be arbitrarily bad.
    # For instance, at the time of writing, most titles in containers are one of
    # - "CVE Program Container" (>600k)
    # - "CISA ADP VUlnrichment" (>270k)
    has_package_data = Q(affected__package_name__isnull=False) | Q(
        affected__product__isnull=False
    )

    def nonempty(field: str) -> str | None:
        """
        Take the first nonempty of the given field, prioritising one that has package data.
        """
        return (
            suggestion.cve.container.annotate(
                priority=Case(
                    When(has_package_data, then=0),
                    default=1,
                    output_field=IntegerField(),
                )
            )
            .exclude(**{f"{field}__isnull": True})
            .order_by("priority")
            .values_list(field, flat=True)
            .first()
        )

    title = nonempty("title")
    description = nonempty("descriptions__value")

    if title is None and description is None:
        # FIXME(@fricklerhandwerk): Currently there are some entries that hit this case, despite them violating the spec. [tag:invalid-cves]
        # Example:
        # - https://nvd.nist.gov/vuln/detail/CVE-2026-11950
        # - https://nvd.nist.gov/vuln/detail/CVE-2026-47105
        # Make that impossible:
        # - Filter them out at ingestion
        # - Clean up the database in a migration
        # - Narrow down all types in the pipeline
        return

    affected_products: dict[str, CachedSuggestion.AffectedProduct] = {}
    all_versions = list()

    prefetched_affected_products = (
        AffectedProduct.objects.filter(
            container__cve=suggestion.cve,
        )
        .filter(
            Q(package_name__isnull=False) | Q(product__isnull=False),
        )
        .prefetch_related("versions", "cpes")
    )

    for affected_product in prefetched_affected_products:
        # FIXME(@fricklerhandwerk): We should have a more sophisticated data structure that allows displaying what exactly we're matching.
        package_name = affected_product.package_name or affected_product.product
        # NOTE(@fricklerhandwerk): Satisfy the static typecheck that doesn't know we already filtered those out...
        assert package_name is not None
        versions = list(affected_product.versions.all())
        all_versions.extend(versions)

        if package_name not in affected_products:
            affected_products[package_name] = CachedSuggestion.AffectedProduct()

        affected_products[package_name].version_constraints.update(
            (vc.status, vc.version_constraint_str()) for vc in versions
        )
        affected_products[package_name].cpes.update(
            cpe.name for cpe in affected_product.cpes.all()
        )

    from shared.package_clustering import cluster_packages

    # Cluster derivations not yet linked to a package, so their attributes can be grouped by package.
    # Most of the time this is a cheap noop, since clustering happens on evaluation and on linkage.
    cluster_packages(suggestion.derivations.filter(package_link__isnull=True))

    derivations = list(
        suggestion.derivations.select_related(
            "metadata",
            "package_link__package",
            "parent_evaluation",
        )
        .prefetch_related(
            "parent_evaluation__on_branches",
            Prefetch(
                "metadata__maintainers",
                queryset=NixMaintainer.objects.distinct(),
                to_attr="prefetched_maintainers",
            ),
        )
        # Oldest first, primary key is tie breaker.
        # That way the most recent information will end up being displayed.
        # Sorting in the database is surely faster than conditional update in Python, since there's a low limit of `settings.MAX_MATCHES`
        .order_by("parent_evaluation__updated_at", "pk")
        .all()
    )

    prefetched_metrics = Metric.objects.filter(container__cve=suggestion.cve).order_by(
        "-format"
    )
    packages = categorize_packages(
        channel_structure(all_versions, derivations),
        suggestion.package_overlays.all(),
    )
    maintainer_overlays = list(
        suggestion.maintainer_overlays.select_related("maintainer").all()
    )
    maintainer_details = {
        m.github_id: CachedSuggestion.Maintainer.model_validate(to_dict(m))
        for derivation in derivations
        if derivation.metadata
        for m in derivation.metadata.prefetched_maintainers
    }

    only_relevant_data = CachedSuggestion(
        pk=suggestion.pk,
        cve_id=suggestion.cve.cve_id,
        title=title,
        description=description,
        affected_products=affected_products,
        packages=packages,
        attribute_package_groups=group_attributes_by_package(derivations),
        metrics=[to_dict(m) for m in prefetched_metrics],
        maintainers=categorize_maintainers(
            packages, maintainer_overlays, maintainer_details
        ),
        url_references=categorize_url_references(
            suggestion.references, list(suggestion.reference_url_overlays.all())
        ),
    )

    _, created = CachedSuggestions.objects.update_or_create(
        proposal_id=suggestion.pk,
        defaults={
            "payload": only_relevant_data.model_dump(mode="json"),
            "schema_version": CachedSuggestions.CURRENT_SCHEMA_VERSION,
        },
    )

    if created:
        logger.info(
            "CVE '%s' suggestion cached for the first time", suggestion.cve.cve_id
        )
    else:
        logger.info("CVE '%s' suggestion cache updated", suggestion.cve.cve_id)


def is_version_affected(version_statuses: list[str]) -> Version.Status:
    """
    Returns the highest priority status from the list of version constraints.
    Priority: Affected > Unknown > Unaffected.
    """
    return max(
        (Version.Status(status) for status in version_statuses),
        default=Version.Status.UNKNOWN,
    )


def get_src_position(derivation: NixDerivation) -> str | None:
    """
    Get the GitHub URL pointing to the exact source file used for the evaluation of this derivation.
    E.g. https://github.com/NixOS/nixpkgs/blob/0e8be3827d0298743ba71b91eea652d43d7dc03d/pkgs/by-name/he/hello/package.nix#L47
    """
    if derivation.metadata:
        return src_position_url(
            derivation.parent_evaluation.commit_sha1, derivation.metadata.position
        )
    return None


def src_position_url(commit_sha1: str, position: str | None) -> str | None:
    """
    Get the GitHub URL pointing to the source file at `position` in the Nixpkgs commit `commit_sha1`.
    """
    if position:
        rev = urllib.parse.quote(commit_sha1)
        # position is something like `/tmp/tmpfh7ff2xs/pkgs/development/python-modules/qemu/default.nix:67`
        position_match = re.match(
            # FIXME the location of the eval store is going to be configurable in the future.
            # https://github.com/Nix-Security-WG/nix-security-tracker/pull/451
            # Ideally the position field is already relative to the location.
            r"/tmp/[^/]+/(.+):(\d+)",
            position,
        )
        if position_match:
            path = urllib.parse.quote(position_match.group(1))
            linenumber = urllib.parse.quote(position_match.group(2))
            return f"https://github.com/NixOS/nixpkgs/blob/{rev}/{path}#L{linenumber}"
    return None


def channel_structure(
    version_constraints: list[Version], derivations: list[NixDerivation]
) -> dict[str, CachedSuggestion.Package]:
    """
    For a list of derivations and a list of version constraints that all belong to the same package, massage the data so that it can be rendered easily in the suggestions view
    """
    packages = dict()
    for derivation in derivations:
        attribute_path = derivation.attribute
        _, package_version = parse_drv_name(derivation.name)
        if attribute_path not in packages:
            packages[attribute_path] = CachedSuggestion.Package()
        packages[attribute_path].derivation_ids.append(derivation.pk)
        is_tracking = derivation.parent_evaluation.is_on_tracking_branch
        if derivation.metadata and is_tracking:
            packages[attribute_path].description = derivation.metadata.get_description()
            packages[attribute_path].maintainer_ids = [
                m.github_id for m in derivation.metadata.prefetched_maintainers
            ]
        status = is_version_affected(
            [c.affects(package_version) for c in version_constraints]
        )
        src_position = get_src_position(derivation)
        updated = derivation.parent_evaluation.updated_at
        for branch in derivation.parent_evaluation.on_branches.all():
            packages[attribute_path].branches[branch.name] = (
                CachedSuggestion.PackageOnBranch(
                    version=package_version,
                    status=status,
                    src_position=src_position,
                    updated=updated,
                )
            )
    return packages


def group_attributes_by_package(
    derivations: list[NixDerivation],
) -> list[CachedSuggestion.AttributePackageGroup]:
    """
    Partition the attributes of the given derivations by the package they belong to.
    """
    # Oldest first, so the most recent package of an attribute wins.
    oldest_first = sorted(
        derivations, key=lambda d: (d.parent_evaluation.updated_at, d.pk)
    )
    # Every derivation has a package: matching only picks derivations with metadata, and caching clusters them.
    package_of: dict[str, PackageModel] = {
        derivation.attribute: derivation.package_link.package
        for derivation in oldest_first
    }

    groups: dict[int, CachedSuggestion.AttributePackageGroup] = {}
    for attribute, package in sorted(package_of.items()):
        if package.pk not in groups:
            groups[package.pk] = CachedSuggestion.AttributePackageGroup(
                package_id=package.pk,
                name=package.name,
                homepage=package.homepage,
                description=package.description,
                attributes=[],
            )
        groups[package.pk].attributes.append(attribute)

    return sorted(groups.values(), key=lambda g: (g.name, g.package_id))


def parse_drv_name(name: str) -> tuple[str, str]:
    """
    Splits the input string `name` into a package name and version.

    https://nix.dev/manual/nix/latest/language/builtins.html#builtins-parseDrvName

    The package name is everything up to but not including the first dash
    not followed by a letter, and the version is everything after that dash.
    """
    match = re.match(r"^(.+?)-([^a-zA-Z].*)$", name)
    if match:
        return match.group(1), match.group(2)
    else:
        return name, ""


def merge_url_references(
    url: str, entries: Iterable[tuple[str, Iterable[str]]]
) -> CachedSuggestion.UrlReference:
    """
    Merge several `(name, tags)` descriptions of one URL into a single reference.

    The name is the one they all share (ignoring empty names), or empty in case of
    mismatch. Tags are merged.
    """
    entries = list(entries)
    names = {name for name, _ in entries if name}
    return CachedSuggestion.UrlReference(
        url=url,
        name=next(iter(names)) if len(names) == 1 else "",
        tags={tag for _, tags in entries for tag in tags},
    )


def categorize_url_references(
    references: Iterable[Reference],
    reference_url_overlays: Iterable[ReferenceUrlOverlay],
) -> dict[str, CachedSuggestion.StatusUrlReference]:
    """
    Categorize references associated to a suggestion, keyed by URL.
    References sharing a URL are merged and their tags combined.
    """
    by_url: dict[str, list[tuple[str, Iterable[str]]]] = defaultdict(list)
    for ref in references:
        by_url[ref.url].append((ref.name, [tag.value for tag in ref.tags.all()]))

    ignored_urls = {
        o.reference_url
        for o in reference_url_overlays
        if o.type == ReferenceUrlOverlay.Type.IGNORED
    }

    return {
        url: CachedSuggestion.StatusUrlReference(
            reference=merge_url_references(url, entries),
            status=CachedSuggestion.UrlReferenceStatus.IGNORED
            if url in ignored_urls
            else CachedSuggestion.UrlReferenceStatus.ACTIVE,
        )
        for url, entries in by_url.items()
    }


def categorize_maintainers(
    packages: dict[str, CachedSuggestion.StatusPackage],
    maintainer_overlays: Collection[MaintainerOverlay],
    maintainer_details: Mapping[int, CachedSuggestion.Maintainer],
) -> dict[int, CachedSuggestion.StatusMaintainer]:
    """
    Categorize maintainers associated to the packages of a suggestion, keyed by GitHub ID.
    Packages only hold GitHub IDs, `maintainer_details` must hold the details for each of them.
    They are orphans if they no longer have any active package (but they keep their active/ignored status in case they cease to be orphans).
    """
    original = {
        github_id: maintainer_details[github_id]
        for entry in packages.values()
        for github_id in entry.package.maintainer_ids
    }
    active_package_maintainer_ids = {
        github_id
        for entry in packages.values()
        if entry.status == CachedSuggestion.PackageStatus.ACTIVE
        for github_id in entry.package.maintainer_ids
    }
    ignored_ids = {
        o.maintainer.github_id
        for o in maintainer_overlays
        if o.type == MaintainerOverlay.Type.IGNORED
    }

    result = {
        github_id: CachedSuggestion.StatusMaintainer(
            maintainer=maintainer,
            status=CachedSuggestion.MaintainerStatus.IGNORED
            if github_id in ignored_ids
            else CachedSuggestion.MaintainerStatus.ACTIVE,
            orphan=github_id not in active_package_maintainer_ids,
        )
        for github_id, maintainer in original.items()
    }
    # An original maintainer takes precedence over an overlay adding them by hand.
    result |= {
        o.maintainer.github_id: CachedSuggestion.StatusMaintainer(
            maintainer=CachedSuggestion.Maintainer.model_validate(
                to_dict(o.maintainer)
            ),
            status=CachedSuggestion.MaintainerStatus.ADDED,
        )
        for o in maintainer_overlays
        if o.type == MaintainerOverlay.Type.ADDITIONAL
        and o.maintainer.github_id not in original
    }
    return result
