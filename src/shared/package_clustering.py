import logging
from dataclasses import dataclass
from itertools import groupby

import pglock
from django.db import transaction
from django.db.models import QuerySet

from shared.cache_suggestions import parse_drv_name
from shared.models.nix_evaluation import NixDerivation, NixDerivationMeta
from shared.models.package import Package, PackageAttrpath, PackageDerivation

logger = logging.getLogger(__name__)


@dataclass
class ClusterResult:
    derivations_processed: int = 0
    packages_updated: int = 0
    packages_created: int = 0
    attrpaths_updated: int = 0
    attrpaths_created: int = 0

    def __iadd__(self, other: "ClusterResult") -> "ClusterResult":
        self.derivations_processed += other.derivations_processed
        self.packages_updated += other.packages_updated
        self.packages_created += other.packages_created
        self.attrpaths_updated += other.attrpaths_updated
        self.attrpaths_created += other.attrpaths_created
        return self


def cluster_packages(
    derivations: QuerySet[NixDerivation],
    update_packages: bool = False,
    batch_size: int = 10_000,
) -> ClusterResult:
    """
    Assign derivations to packages, in batches.
    Stops when a batch produces no progress — all remaining rows are either
    already linked or held by a concurrent process.
    """
    result = ClusterResult()
    while True:
        batch = _cluster_batch(
            derivations,
            update_packages=update_packages,
            batch_size=batch_size,
        )
        if not batch.packages_updated and not batch.packages_created:
            break
        logger.debug(
            f"updated {batch.packages_updated}, created {batch.packages_created} packages, "
            f"updated {batch.attrpaths_updated}, created {batch.attrpaths_created} attrpaths "
            f"from {batch.derivations_processed} derivations",
        )
        result += batch

    return result


def _cluster_batch(
    derivations: QuerySet[NixDerivation],
    batch_size: int,
    update_packages: bool,
) -> ClusterResult:
    """
    For each derivation-path group:
    1. If any attrpath in the group is already registered, use the associated package.
    2. Otherwise find or create a package by `(pname, homepage)`, with intra-batch deduplication so two derivations with the same key share one package.
    3. Register any new attrpaths for the resolved package.

    Newly created packages inherit `homepage` and `description` from the derivation that brought them in.
    For existing packages, `homepage` and `description` are overwritten only when `update_packages`.
    After assignment, `homepage` and `description` are nulled on the clustered derivations since the deduplicated values now live on the package.
    """
    with transaction.atomic():
        batch_pks = list(
            derivations.filter(
                package_link__isnull=True,
                # Filtered here, not after the slice, so a leading run of ineligible rows cannot stall the outer loop.
                metadata__isnull=False,
            ).values_list("pk", flat=True)[:batch_size]
        )
        if not batch_pks:
            return ClusterResult()

        # Fetch only the columns we actually need; avoids hydrating full ORM objects
        # for every NixDerivation and NixDerivationMeta row in the batch.
        # `of=("self",)` restricts the FOR UPDATE lock to the NixDerivation table only.
        # Without it, the LEFT OUTER JOIN onto NixDerivationMeta (from the .values() span)
        # would trigger "FOR UPDATE cannot be applied to the nullable side of an outer join".
        drvs: list[dict] = list(
            NixDerivation.objects.filter(pk__in=batch_pks, package_link__isnull=True)
            .select_for_update(skip_locked=True, of=("self",))
            .values_list(
                "pk",
                "attribute",
                "derivation_path",
                "name",
                "metadata_id",
                "metadata__homepage",
                "metadata__description",
                named=True,
            )
            .order_by("derivation_path")
        )

        # Serialize clustering on attrpath.
        # Row locking only protects the selected derivations, not the links to new attrpaths.
        # Without this advisory lock, concurrent workers can race on the same attrpath and assign derivations to inconsistent packages.
        # Sorted so overlapping lock sequences cannot run in opposite orders and deadlock.
        for attribute in sorted({drv.attribute for drv in drvs}):
            # `xact=True` releases the lock when the surrounding transaction ends.
            pglock.advisory(attribute, xact=True).acquire()

        # XXX(@fricklerhandwerk): Extracted query into procedure to instrument testing against race conditions.
        attrpath_to_pkg = package_from_attrs(drvs)

        new_links: list[PackageDerivation] = []
        new_attrpaths: list[PackageAttrpath] = []
        # Deduplicates across groups that share the same `(pname, homepage)` but have different derivation paths.
        seen: dict[tuple[str, str | None], Package] = {}
        updated: set[int] = set()
        created: set[int] = set()
        # Packages whose `homepage`/`description` should be updated; stores the values directly
        # rather than holding a reference to the full derivation row.
        to_update: dict[int, tuple[str | None, str | None]] = {}
        done: list[int] = []

        for _, group_iter in groupby(drvs, key=lambda drv: drv.derivation_path):
            group = list(group_iter)
            # Any drv in the group is representative for name/homepage/description
            # since all drvs in a group share the same derivation_path.
            first = group[0]

            pkg = next(
                (
                    attrpath_to_pkg[drv.attribute]
                    for drv in group
                    if drv.attribute in attrpath_to_pkg
                ),
                None,
            )

            if pkg is None:
                pname, _ = parse_drv_name(first.name)
                homepage: str | None = first.metadata__homepage
                description: str | None = first.metadata__description
                key = (pname, homepage)
                if key not in seen:
                    pkg, was_created = Package.objects.get_or_create(
                        name=pname,
                        homepage=homepage,
                        defaults={"description": description},
                    )
                    seen[key] = pkg
                    if was_created:
                        created.add(pkg.pk)
                    elif update_packages:
                        to_update[pkg.pk] = (homepage, description)
                pkg = seen[key]
            elif update_packages:
                to_update[pkg.pk] = (
                    first.metadata__homepage,
                    first.metadata__description,
                )

            updated.add(pkg.pk)
            for drv in group:
                if drv.attribute not in attrpath_to_pkg:
                    new_attrpaths.append(
                        PackageAttrpath(attrpath=drv.attribute, package=pkg)
                    )
                new_links.append(PackageDerivation(derivation_id=drv.pk, package=pkg))
                done.append(drv.metadata_id)

        PackageAttrpath.objects.bulk_create(new_attrpaths, ignore_conflicts=True)
        PackageDerivation.objects.bulk_create(new_links, ignore_conflicts=True)

        if to_update:
            packages = list(Package.objects.filter(pk__in=to_update).only("pk"))
            for pkg in packages:
                homepage, description = to_update[pkg.pk]
                pkg.homepage = homepage
                pkg.description = description
            Package.objects.bulk_update(packages, ["homepage", "description"])

        # The values now live on the package; clear the per-derivation copies to reclaim space.
        NixDerivationMeta.objects.filter(pk__in=done).update(
            homepage=None, description=None
        )

    return ClusterResult(
        derivations_processed=len(drvs),
        packages_updated=len(updated - created),
        packages_created=len(created),
        attrpaths_updated=len(attrpath_to_pkg),
        attrpaths_created=len(new_attrpaths),
    )


def package_from_attrs(drvs: list[dict]) -> dict[str, Package]:
    return {
        pa.attrpath: pa.package
        for pa in PackageAttrpath.objects.filter(
            attrpath__in=[drv.attribute for drv in drvs]
        ).select_related("package")
    }
