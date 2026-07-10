from collections.abc import Callable
from io import StringIO

from django.core.management import call_command

from shared.models.linkage import (
    CVEDerivationClusterProposal,
    PackageClusterProposalLink,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import NixDerivation
from shared.models.package import Package, PackageDerivation


def test_backfill_creates_package_link_for_clustered_drv(
    drv: NixDerivation,
    make_package: Callable[..., Package],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """A proposal whose derivation is clustered gets one package link after backfill."""
    pkg = make_package(drv)
    PackageDerivation.objects.create(derivation=drv, package=pkg)
    suggestion = make_suggestion()

    assert not PackageClusterProposalLink.objects.filter(proposal=suggestion).exists()

    call_command("backfill_proposal_package_links", stdout=StringIO())

    link = PackageClusterProposalLink.objects.get(proposal=suggestion)
    assert link.package == pkg
    assert link.provenance_flags == ProvenanceFlags.PACKAGE_NAME_MATCH


def test_backfill_clusters_drv_with_no_package_link(
    drv: NixDerivation,
    suggestion: CVEDerivationClusterProposal,
) -> None:
    """A proposal's derivation that has no PackageDerivation yet is clustered
    into a package (instead of being skipped), then linked."""
    assert not PackageDerivation.objects.filter(derivation=drv).exists()

    call_command("backfill_proposal_package_links", stdout=StringIO())

    pkg_link = PackageDerivation.objects.get(derivation=drv)
    link = PackageClusterProposalLink.objects.get(proposal=suggestion)
    assert link.package == pkg_link.package
    assert link.provenance_flags == ProvenanceFlags.PACKAGE_NAME_MATCH


def test_backfill_aggregates_flags_for_drvs_sharing_a_package(
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Provenance flags from multiple derivations of the same package are OR-ed into one link."""
    drv1 = make_drv(pname="foo", attribute="foo")
    drv2 = make_drv(pname="foo-cli", attribute="foo-cli")
    pkg = Package.objects.create(name="foo", homepage="https://example.com/foo")
    PackageDerivation.objects.create(derivation=drv1, package=pkg)
    PackageDerivation.objects.create(derivation=drv2, package=pkg)

    suggestion = make_suggestion(
        drvs={
            drv1: ProvenanceFlags.PACKAGE_NAME_MATCH,
            drv2: ProvenanceFlags.PRODUCT_MATCH,
        }
    )

    call_command("backfill_proposal_package_links", stdout=StringIO())

    link = PackageClusterProposalLink.objects.get(proposal=suggestion)
    assert link.package == pkg
    assert (
        link.provenance_flags
        == ProvenanceFlags.PACKAGE_NAME_MATCH | ProvenanceFlags.PRODUCT_MATCH
    )


def test_backfill_creates_separate_link_per_package(
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Derivations belonging to different packages each produce their own package link."""
    drv1 = make_drv(pname="foo", attribute="foo")
    drv2 = make_drv(pname="bar", attribute="bar")
    pkg1 = Package.objects.create(name="foo", homepage="https://example.com/foo")
    pkg2 = Package.objects.create(name="bar", homepage="https://example.com/bar")
    PackageDerivation.objects.create(derivation=drv1, package=pkg1)
    PackageDerivation.objects.create(derivation=drv2, package=pkg2)

    suggestion = make_suggestion(
        drvs={
            drv1: ProvenanceFlags.PACKAGE_NAME_MATCH,
            drv2: ProvenanceFlags.PRODUCT_MATCH,
        }
    )

    call_command("backfill_proposal_package_links", stdout=StringIO())

    assert PackageClusterProposalLink.objects.filter(proposal=suggestion).count() == 2
    assert (
        PackageClusterProposalLink.objects.get(
            proposal=suggestion, package=pkg1
        ).provenance_flags
        == ProvenanceFlags.PACKAGE_NAME_MATCH
    )
    assert (
        PackageClusterProposalLink.objects.get(
            proposal=suggestion, package=pkg2
        ).provenance_flags
        == ProvenanceFlags.PRODUCT_MATCH
    )


def test_backfill_is_idempotent(
    drv: NixDerivation,
    make_package: Callable[..., Package],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Running the backfill multiple times does not create duplicate package links."""
    pkg = make_package(drv)
    PackageDerivation.objects.create(derivation=drv, package=pkg)
    make_suggestion()

    call_command("backfill_proposal_package_links", stdout=StringIO())
    call_command("backfill_proposal_package_links", stdout=StringIO())

    assert PackageClusterProposalLink.objects.count() == 1
