import threading
import time
from collections.abc import Callable
from io import StringIO
from typing import Any
from unittest import mock

import pytest
from django.core.management import call_command
from django.db import close_old_connections

from shared.cache_suggestions import parse_drv_name
from shared.listeners.package_clustering import cluster_after_evaluation
from shared.models.nix_evaluation import (
    MAJOR_CHANNELS,
    NixChannel,
    NixDerivation,
    NixEvaluation,
)
from shared.models.package import Package, PackageAttrpath, PackageDerivation
from shared.package_clustering import cluster_packages, package_from_attrs


def test_attrpath_match(
    drv: NixDerivation,
    make_package: Callable[..., Package],
) -> None:
    """
    Test Known attrpath maps to existing package.
    No new package or attrpath is created.
    """
    pkg = make_package(drv)

    cluster_packages(NixDerivation.objects.filter(pk=drv.pk))

    assert PackageDerivation.objects.get(derivation=drv).package == pkg
    assert Package.objects.count() == 1
    assert PackageAttrpath.objects.count() == 1


def test_name_homepage_match(
    drv: NixDerivation,
    make_package: Callable[..., Package],
) -> None:
    """
    Test derivation with no registered attrpath but matching (pname, homepage) maps to existing package.
    Its attrpath is registered alongside the existing one.
    """

    assert drv.metadata
    pkg = make_package(drv, homepage=drv.metadata.homepage, attrpath="some-other-attr")

    cluster_packages(NixDerivation.objects.filter(pk=drv.pk))

    assert PackageDerivation.objects.get(derivation=drv).package == pkg
    assert Package.objects.count() == 1
    assert PackageAttrpath.objects.count() == 2
    assert PackageAttrpath.objects.filter(attrpath=drv.attribute).exists()


def test_new_package(
    drv: NixDerivation,
) -> None:
    """
    Test unmatched derivation creates a new `Package` and `PackageAttrpath`.
    `homepage` and `description` are seeded on the package and nulled on the derivation metadata.
    """
    assert drv.metadata
    original_homepage = drv.metadata.homepage
    original_description = drv.metadata.description

    cluster_packages(NixDerivation.objects.filter(pk=drv.pk))

    link = PackageDerivation.objects.get(derivation=drv)
    pname, _ = parse_drv_name(drv.name)
    assert link.package.name == pname
    assert link.package.homepage == original_homepage
    assert link.package.description == original_description
    assert Package.objects.count() == 1
    assert PackageAttrpath.objects.count() == 1
    assert PackageAttrpath.objects.filter(attrpath=drv.attribute).exists()

    drv.metadata.refresh_from_db()
    assert drv.metadata.homepage is None
    assert drv.metadata.description is None


def test_intra_batch_dedup(
    make_drv: Callable[..., NixDerivation],
) -> None:
    """
    Test two derivations with the same (pname, homepage) but distinct drv paths share a single Package.
    """
    drv1 = make_drv(attribute="foo", version="1.0")
    drv2 = make_drv(attribute="fooAlias", version="2.0")

    cluster_packages(NixDerivation.objects.filter(pk__in=[drv1.pk, drv2.pk]))

    pkg1 = PackageDerivation.objects.get(derivation=drv1).package
    pkg2 = PackageDerivation.objects.get(derivation=drv2).package
    assert pkg1 == pkg2
    assert Package.objects.count() == 1
    assert PackageAttrpath.objects.count() == 2


def test_drv_path_grouping(
    make_drv: Callable[..., NixDerivation],
) -> None:
    """
    Test derivations sharing a drv path are assigned to one package with all their attrpaths registered.
    """
    drv1 = make_drv(attribute="foo")
    drv2 = make_drv(attribute="fooAlias")
    assert drv1.derivation_path == drv2.derivation_path

    cluster_packages(NixDerivation.objects.filter(pk__in=[drv1.pk, drv2.pk]))

    pkg1 = PackageDerivation.objects.get(derivation=drv1).package
    pkg2 = PackageDerivation.objects.get(derivation=drv2).package
    assert pkg1 == pkg2
    assert Package.objects.count() == 1
    assert PackageAttrpath.objects.count() == 2


def test_already_matched_skipped(
    drv: NixDerivation,
) -> None:
    """
    Derivations that already have a PackageDerivation are not processed again.
    """
    cluster_packages(NixDerivation.objects.filter(pk=drv.pk))
    cluster_packages(NixDerivation.objects.filter(pk=drv.pk))

    assert PackageDerivation.objects.filter(derivation=drv).count() == 1
    assert Package.objects.count() == 1


def test_update_packages_overwrites_existing(
    drv: NixDerivation,
    make_package: Callable[..., Package],
) -> None:
    """
    Test with `update_packages=True`, an existing matched package has its `homepage` and `description` overwritten from the derivation's metadata.
    """
    assert drv.metadata
    pkg = make_package(drv, homepage="https://old.example.com", description="stale")

    new_homepage = drv.metadata.homepage
    new_description = drv.metadata.description

    cluster_packages(NixDerivation.objects.filter(pk=drv.pk), update_packages=True)

    pkg.refresh_from_db()
    assert pkg.homepage == new_homepage
    assert pkg.description == new_description


def test_update_packages_false_preserves_existing(
    drv: NixDerivation,
    make_package: Callable[..., Package],
) -> None:
    """
    By default, an existing matched package retains its original `homepage` and `description`.
    """
    pkg = make_package(drv, homepage="https://old.example.com", description="stale")

    cluster_packages(NixDerivation.objects.filter(pk=drv.pk))

    pkg.refresh_from_db()
    assert pkg.homepage == "https://old.example.com"
    assert pkg.description == "stale"


def test_leading_no_metadata_does_not_stall_batch(
    evaluation: NixEvaluation,
    make_drv: Callable[..., NixDerivation],
) -> None:
    """
    A leading run of metadata-less derivations must not stall the outer loop.
    """
    no_meta = [
        NixDerivation.objects.create(
            name=f"no-meta-{i}",
            metadata=None,
            parent_evaluation=evaluation,
        )
        for i in range(3)
    ]
    with_meta = make_drv(pname="real", attribute="real")

    cluster_packages(
        NixDerivation.objects.filter(
            pk__in=[*(d.pk for d in no_meta), with_meta.pk],
        ),
        batch_size=2,
    )

    assert PackageDerivation.objects.filter(derivation=with_meta).exists()


def test_no_metadata_skipped(evaluation: NixEvaluation) -> None:
    """
    Test derivations without metadata are excluded from clustering, a package
    without any metadata is not useful.
    """
    drv = NixDerivation.objects.create(
        attribute="no-meta",
        derivation_path="/nix/store/zzz-no-meta-1.0.drv",
        name="no-meta-1.0",
        metadata=None,
        system="x86_64-linux",
        parent_evaluation=evaluation,
    )

    cluster_packages(NixDerivation.objects.filter(pk=drv.pk))

    assert not PackageDerivation.objects.filter(derivation=drv).exists()
    assert Package.objects.count() == 0


@pytest.mark.parametrize(
    "old_status, new_status, package_count",
    [
        (
            NixEvaluation.EvaluationState.COMPLETED,
            NixEvaluation.EvaluationState.COMPLETED,
            0,
        ),
        (
            NixEvaluation.EvaluationState.WAITING,
            NixEvaluation.EvaluationState.IN_PROGRESS,
            0,
        ),
    ],
)
def test_listener_no_processing_state(
    db: None, old_status: str, new_status: str, package_count: int
) -> None:
    """
    Test listener exits immediately when new evaluation state is not completed.
    """
    cluster_after_evaluation(
        old=NixEvaluation(state=old_status),
        new=NixEvaluation(state=new_status),
    )
    assert Package.objects.count() == package_count


def test_listener_clusters_on_completed(
    make_channel: Callable[..., NixChannel],
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
) -> None:
    """
    Test when an evaluation transitions to COMPLETED, the listener clusters all
    its derivations. Rolling channel pass update_packages=True.
    """
    channel = make_channel(release=MAJOR_CHANNELS[0])  # rolling (unstable)
    evaluation = make_evaluation(channel=channel)
    drv = make_drv(evaluation=evaluation)

    cluster_after_evaluation(
        old=NixEvaluation(state=NixEvaluation.EvaluationState.IN_PROGRESS),
        new=evaluation,
    )

    assert PackageDerivation.objects.filter(derivation=drv).exists()


def test_backfill_no_evaluations(db: None) -> None:
    """
    Test when there is no evaluation to process.
    """
    out = StringIO()
    call_command("backfill_package_clustering", stdout=out)
    assert "no completed evaluations; nothing to do.\n" == out.getvalue().lower()


def test_backfill_clusters_derivations(
    drv: NixDerivation,
) -> None:
    """
    Test command links all unmatched derivations from completed evaluations to packages.
    """
    call_command("backfill_package_clustering", stdout=StringIO())

    assert PackageDerivation.objects.filter(derivation=drv).exists()


def test_backfill_preserves_package_metadata(
    drv: NixDerivation,
    make_package: Callable[..., Package],
) -> None:
    """
    The backfill never updates existing package metadata regardless of channel type —
    that is the listener's responsibility. update_packages=False is always used.
    """
    pkg = make_package(
        drv, homepage="https://keep.example.com", description="keep this"
    )

    call_command("backfill_package_clustering", stdout=StringIO())

    pkg.refresh_from_db()
    assert pkg.homepage == "https://keep.example.com"
    assert pkg.description == "keep this"


@pytest.mark.django_db(transaction=True)
def test_concurrent_clustering_is_safe(
    evaluation: NixEvaluation,
    make_drv: Callable[..., NixDerivation],
) -> None:
    """
    The backfill command and the listener can fire concurrently over the same
    derivations without errors and without any derivation being linked twice.

    `transaction=True` is required so both threads commit real transactions
    that are visible to each other, the default test transaction wrapper
    would prevent that.
    """
    drvs = [make_drv(pname=f"pkg{i}", attribute=f"pkg{i}") for i in range(10)]
    pks = [d.pk for d in drvs]

    barrier = threading.Barrier(2)
    errors: list[Exception] = []

    def run() -> None:
        try:
            barrier.wait()  # both threads start at the same instant
            cluster_packages(
                NixDerivation.objects.filter(pk__in=pks),
                batch_size=3,
            )
        except Exception as exc:
            errors.append(exc)
        finally:
            close_old_connections()

    t1 = threading.Thread(target=run)
    t2 = threading.Thread(target=run)
    t1.start()
    t2.start()
    t1.join()
    t2.join()

    assert not errors, f"concurrent clustering raised: {errors}"
    # Every derivation linked to exactly one package, no duplicates, no gaps.
    assert PackageDerivation.objects.count() == len(drvs)
    for drv in drvs:
        assert PackageDerivation.objects.filter(derivation=drv).count() == 1


@pytest.mark.django_db(transaction=True)
def test_concurrent_attrpath_consistency(
    evaluation: NixEvaluation,
    make_drv: Callable[..., NixDerivation],
) -> None:
    """
    Two threads clustering different derivations that share an attrpath but resolve to different packages must end up with the attrpath registration and the derivation link pointing at the same package.
    """
    # Same attribute, different pname so the threads target different `(pname, homepage)` and would create distinct packages if not serialized.
    # If pname matched, `get_or_create` on the unique constraint would collapse them and the invariant would hold trivially.
    drv_a = make_drv(pname="alpha", attribute="shared")
    drv_b = make_drv(pname="beta", attribute="shared")

    at_barrier = threading.Barrier(2)
    errors: list[Exception] = []

    original = package_from_attrs

    def with_sleep(*args: Any, **kwargs: Any) -> Any:
        # For a test that fails before the fix and passes after, we don't have anything specific to block on:
        # - If we block on anything inside the critical section, a concurrent thread locking before it will deadlock.
        # - Before implementing the locking point, there's nothing to block on.
        # Assume that the machine executing the test is fast enough for this to be a reasonable duration!
        time.sleep(0.2)
        return original(*args, **kwargs)

    def run(pk: int, wait_in_critical_section: bool = False) -> None:
        try:
            at_barrier.wait()
            with mock.patch(
                "shared.package_clustering.package_from_attrs",
                new=with_sleep if wait_in_critical_section else original,
            ):
                cluster_packages(NixDerivation.objects.filter(pk=pk))
        except Exception as exc:
            errors.append(exc)
        finally:
            close_old_connections()

    t1 = threading.Thread(target=run, args=(drv_a.pk,))
    t2 = threading.Thread(target=run, args=(drv_b.pk,))
    t1.start()
    t2.start()
    t1.join()
    t2.join()

    assert not errors, f"concurrent clustering raised: {errors}"

    # Whichever thread won, the attrpath and both derivation links must point at the same package.
    pkg = PackageAttrpath.objects.get(attrpath="shared").package
    assert PackageDerivation.objects.get(derivation=drv_a).package == pkg
    assert PackageDerivation.objects.get(derivation=drv_b).package == pkg
