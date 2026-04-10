import itertools
import logging
import re
import urllib.parse
from datetime import datetime
from itertools import chain
from typing import Any, overload

import pgpubsub
from django.db.models import Prefetch, Q
from pydantic import BaseModel, field_serializer

from shared.channels import CVEDerivationClusterProposalCacheChannel
from shared.models import NixDerivation, NixMaintainer
from shared.models.cached import CachedSuggestions
from shared.models.cve import AffectedProduct, Metric, Reference, Version
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    MaintainerOverlay,
    PackageOverlay,
    ReferenceOverlay,
)
from shared.models.nix_evaluation import get_major_channel

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
        version: str
        status: Version.Status
        src_position: str | None
        # Evaluation timestamps
        updated: datetime

    # FIXME(@fricklerhandwerk): This currently subsumes PackageOnBranch, duplicates its structure, and conflates two unrelated concerns.
    # We may instead want to collect all branches that have the same *status* (i.e. rolling, stable, deprecated) and display them as a group.
    # Then we could collapse the group if all channels have the same version, and display that version in the summary.
    class PackageOnPrimaryChannel(BaseModel):
        # Package version on the primary ("major") channel
        major_version: str | None
        status: Version.Status | None
        # Evaluation timestamps
        updated: datetime | None
        # Whether package version is the same for all branches where the package appears
        uniform_versions: bool | None
        src_position: str | None
        sub_branches: dict[str, "CachedSuggestion.PackageOnBranch"]

    class Maintainer(BaseModel):
        name: str | None = None
        email: str | None = None
        github: str
        matrix: str | None = None
        github_id: int

    class Package(BaseModel):
        channels: dict[str, "CachedSuggestion.PackageOnPrimaryChannel"] = {}
        derivation_ids: list[int] = []
        maintainers: list["CachedSuggestion.Maintainer"] = []
        description: str | None = None

    pk: int
    cve_id: str
    title: str
    description: str | None
    affected_products: dict[str, AffectedProduct]
    original_packages: dict[str, Package]
    packages: dict[str, Package]
    # XXX(@fricklerhandwerk): These are converted with `to_dict()` naively, we're not doing anything interesting to them here.
    metrics: list[dict]

    class CategorizedMaintainers(BaseModel):
        original: list[
            "CachedSuggestion.Maintainer"
        ]  # Maintainers of original packages
        active: list["CachedSuggestion.Maintainer"]  # Non ignored original maintainers
        ignored: list["CachedSuggestion.Maintainer"]  # Ignored original maintainers
        added: list[
            "CachedSuggestion.Maintainer"
        ]  # Additional maintainers (not part of original maintainers)

    class CategorizedReferences(BaseModel):
        # FIXME(@florentc): Having to redefine a pydantic model instead of
        # using the Django model is annoying. We should find a better solution
        # for this and the rest in CachedSuggestion (e.g. packages, maintainers).
        class Reference(BaseModel):
            id: int
            url: str
            name: str
            tags: list[str]

        original: list[Reference]  # References initially present at suggestion creation
        active: list[Reference]  # Non ignored references
        ignored: list[Reference]  # Ignored references

    categorized_maintainers: CategorizedMaintainers
    categorized_references: CategorizedReferences


def apply_package_overlays(
    packages: dict, edits: list[PackageOverlay]
) -> dict[str, CachedSuggestion.Package]:
    """
    Returns the packages dict with user-supplied package edits applied.
    Packages marked for removal are filtered out.
    """
    to_skip = {
        edit.package_attribute
        for edit in edits
        if edit.edit_type == PackageOverlay.Type.REMOVE
    }

    return {attr: data for attr, data in packages.items() if attr not in to_skip}


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
    relevant_piece = (
        suggestion.cve.container.values(
            "title",
            "descriptions__value",
        )
        .filter(
            Q(affected__package_name__isnull=False)
            | Q(affected__product__isnull=False),
        )
        .first()
    )

    # XXX(@fricklerhandwerk): Satisfy static typecheck. This must hold due to how we construct matches.
    assert relevant_piece is not None

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
        # XXX(@fricklerhandwerk): Satisfy the static typecheck that doesn't know we already filtered those out...
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

    derivations = list(
        suggestion.derivations.select_related("metadata", "parent_evaluation")
        .prefetch_related(
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

    prefetched_metrics = Metric.objects.filter(container__cve=suggestion.cve)
    original_packages = channel_structure(all_versions, derivations)
    maintainer_overlays = list(
        suggestion.maintainer_overlays.select_related("maintainer").all()
    )
    package_overlays = list(suggestion.package_overlays.all())
    packages = apply_package_overlays(original_packages, package_overlays)

    only_relevant_data = CachedSuggestion(
        pk=suggestion.pk,
        cve_id=suggestion.cve.cve_id,
        title=relevant_piece["title"],
        description=relevant_piece["descriptions__value"],
        affected_products=affected_products,
        original_packages=original_packages,
        packages=packages,
        metrics=[to_dict(m) for m in prefetched_metrics],
        categorized_maintainers=categorize_maintainers(packages, maintainer_overlays),
        categorized_references=categorize_references(
            suggestion.references, list(suggestion.reference_overlays.all())
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


# FIXME: this breaks the insert listener, let's report it upstream.
# @pgpubsub.post_update_listener(CVEDerivationClusterProposalChannel)
# def expire_cached_suggestions(old: CVEDerivationClusterProposal, new: CVEDerivationClusterProposal) -> None:
#     if new.status != CVEDerivationClusterProposal.Status.PENDING:
#         CachedSuggestions.objects.filter(pk=new.pk).delete()


@pgpubsub.post_insert_listener(CVEDerivationClusterProposalCacheChannel)
def cache_new_suggestions_following_new_container(
    old: CVEDerivationClusterProposal, new: CVEDerivationClusterProposal
) -> None:
    cache_new_suggestions(new)


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
    if derivation.metadata and derivation.metadata.position:
        rev = urllib.parse.quote(derivation.parent_evaluation.commit_sha1)
        # position is something like `/tmp/tmpfh7ff2xs/pkgs/development/python-modules/qemu/default.nix:67`
        position_match = re.match(
            # FIXME the location of the eval store is going to be configurable in the future.
            # https://github.com/Nix-Security-WG/nix-security-tracker/pull/451
            # Ideally the position field is already relative to the location.
            r"/tmp/[^/]+/(.+):(\d+)",
            derivation.metadata.position,
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
            if derivation.metadata:
                if derivation.metadata.description:
                    packages[
                        attribute_path
                    ].description = derivation.metadata.description
                packages[attribute_path].maintainers = [
                    CachedSuggestion.Maintainer.model_validate(to_dict(m))
                    for m in derivation.metadata.prefetched_maintainers
                ]
        packages[attribute_path].derivation_ids.append(derivation.pk)
        # Get the branch from which that derivation originates
        branch_name = derivation.parent_evaluation.channel.channel_branch
        # Get primary ("major") channel to which that branch belongs
        major_channel = get_major_channel(branch_name)
        # FIXME This quietly drops unfamiliar branch names
        if major_channel:
            # XXX(@fricklerhandwerk): Here we assign package information to channel names in iteration order, which in the query we have established to be oldest-first by evaluation time.
            channels = packages[attribute_path].channels
            if major_channel not in channels:
                channels[major_channel] = CachedSuggestion.PackageOnPrimaryChannel(
                    major_version=None,
                    status=None,
                    src_position=None,
                    # XXX(@fricklerhandwerk): If this is not replaced in subsequent processing, it will display "-"
                    uniform_versions=None,
                    sub_branches=dict(),
                    updated=None,
                )
            if branch_name == major_channel:
                channels[major_channel] = CachedSuggestion.PackageOnPrimaryChannel(
                    major_version=package_version,
                    status=is_version_affected(
                        [c.affects(package_version) for c in version_constraints]
                    ),
                    src_position=get_src_position(derivation),
                    uniform_versions=channels[major_channel].uniform_versions,
                    sub_branches=channels[major_channel].sub_branches,
                    updated=derivation.parent_evaluation.updated_at,
                )
            else:
                channels[major_channel].sub_branches[branch_name] = (
                    CachedSuggestion.PackageOnBranch(
                        version=package_version,
                        status=is_version_affected(
                            [c.affects(package_version) for c in version_constraints]
                        ),
                        src_position=get_src_position(derivation),
                        updated=derivation.parent_evaluation.updated_at,
                    )
                )

    for package_name in packages:
        channels = packages[package_name].channels
        for mc in channels.keys():
            uniform_versions = True
            major_version = channels[mc].major_version
            for _, branch in channels[mc].sub_branches.items():
                uniform_versions = (
                    uniform_versions and str(major_version) == branch.version
                )
            channels[mc].uniform_versions = uniform_versions
            # We just sort branch names by length to get a good-enough order
            channels[mc].sub_branches = dict(
                sorted(
                    channels[mc].sub_branches.items(),
                    reverse=True,
                )
            )
    return packages


def parse_drv_name(name: str) -> tuple[str, str]:
    """
    Splits the input string `name` into a package name and version.

    https://nix.dev/manual/nix/latest/language/builtins.html#builtins-parseDrvName

    The package name is everything up to but not including the first dash
    not followed by a letter, and the version is everything after that dash.
    """
    match = re.match(r"^(.+?)-([^-]*\d.*)$", name)
    if match:
        return match.group(1), match.group(2)
    else:
        return name, ""


def maintainers_list(
    packages: dict, edits: list[MaintainerOverlay]
) -> list[CachedSuggestion.Maintainer]:
    """
    Returns a deduplicated list (by GitHub ID) of all the maintainers, as dicts,
    of all the affected packages linked to this suggestion, modified by
    potential user-supplied edits.
    """

    # Set of maintainers manually removed by the user. We use it to store
    # maintainers that have already been added as well, for deduplication. If a
    # maintainer's id is in this set at some point, it'll be ignored from there.
    to_skip_or_seen: set[int] = {
        m.maintainer.github_id
        for m in edits
        if m.edit_type == MaintainerOverlay.Type.REMOVE
    }
    to_add: list[CachedSuggestion.Maintainer] = [
        CachedSuggestion.Maintainer.model_validate(to_dict(m.maintainer))
        for m in edits
        if m.edit_type == MaintainerOverlay.Type.ADD
    ]

    maintainers: list[CachedSuggestion.Maintainer] = list()
    all_maintainers = [m for pkg in packages.values() for m in pkg["maintainers"]]

    for m in itertools.chain(all_maintainers, to_add):
        if m.github_id not in to_skip_or_seen:
            to_skip_or_seen.add(m.github_id)
            maintainers.append(m)

    return maintainers


def categorize_references(
    references: list[Reference],
    reference_overlay: list[ReferenceOverlay],
) -> CachedSuggestion.CategorizedReferences:
    """
    Categorize references associated to a suggestion.
    Assumes the references list has no duplicates.
    """

    original_references = [
        CachedSuggestion.CategorizedReferences.Reference(
            id=ref.id,
            url=ref.url,
            name=ref.name,
            tags=[
                tag.value for tag in ref.tags.all()
            ],  # Assuming tags is a many-to-many field
        )
        for ref in references
    ]

    ignored_reference_ids = {
        edit.reference.id
        for edit in reference_overlay
        if edit.type == ReferenceOverlay.Type.IGNORED
    }

    active_references = [
        ref for ref in original_references if ref.id not in ignored_reference_ids
    ]
    ignored_references = [
        ref for ref in original_references if ref.id in ignored_reference_ids
    ]

    return CachedSuggestion.CategorizedReferences(
        original=original_references,
        active=active_references,
        ignored=ignored_references,
    )


def categorize_maintainers(
    packages: dict[str, CachedSuggestion.Package],
    maintainer_overlays: list[MaintainerOverlay],
) -> CachedSuggestion.CategorizedMaintainers:
    """
    Categorize maintainers associated to the packages of a suggestion.
    """
    # Collect all original maintainers from packages (deduplicated by github_id)
    original_maintainers_dict: dict[int, CachedSuggestion.Maintainer] = {}
    for package in packages.values():
        for maintainer in package.maintainers:
            original_maintainers_dict[maintainer.github_id] = maintainer

    original_maintainers = list(original_maintainers_dict.values())

    # Process edits to categorize maintainers
    removed_github_ids = set()
    added_maintainers = []

    for edit in maintainer_overlays:
        if edit.edit_type == MaintainerOverlay.Type.REMOVE:
            removed_github_ids.add(edit.maintainer.github_id)
        elif edit.edit_type == MaintainerOverlay.Type.ADD:
            added_maintainers.append(
                CachedSuggestion.Maintainer.model_validate(to_dict(edit.maintainer))
            )

    # Categorize original maintainers into active and ignored
    active_maintainers = []
    ignored_maintainers = []

    for maintainer in original_maintainers:
        if maintainer.github_id in removed_github_ids:
            ignored_maintainers.append(maintainer)
        else:
            active_maintainers.append(maintainer)

    return CachedSuggestion.CategorizedMaintainers(
        original=original_maintainers,
        active=active_maintainers,
        ignored=ignored_maintainers,
        added=added_maintainers,
    )
