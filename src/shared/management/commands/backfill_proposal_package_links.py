from argparse import ArgumentParser
from typing import Any

from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Prefetch

from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
    PackageClusterProposalLink,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import NixDerivation
from shared.models.package import PackageDerivation
from shared.package_clustering import cluster_packages


class Command(BaseCommand):
    help = "Backfill PackageClusterProposalLink for existing proposals from their derivation links."

    def add_arguments(self, parser: ArgumentParser) -> None:
        parser.add_argument(
            "--batch-size",
            type=int,
            default=500,
            help="Number of proposals to process per batch.",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        batch_size: int = options["batch_size"]
        qs = (
            CVEDerivationClusterProposal.objects.filter(package_links__isnull=True)
            .distinct()
            .values_list("id", flat=True)
        )
        total = qs.count()
        self.stdout.write(f"Backfilling package links for {total} proposals...")

        # Establish package linkage for any derivation referenced by these
        # proposals that isn't clustered into a package yet.
        derivation_ids = (
            DerivationClusterProposalLink.objects.filter(
                proposal__package_links__isnull=True,
                derivation__package_link__isnull=True,
            )
            .values_list("derivation_id", flat=True)
            .distinct()
        )
        count = derivation_ids.count()
        self.stdout.write(
            f"Clustering {count} derivations into packages...",
        )
        cluster_result = cluster_packages(
            NixDerivation.objects.filter(pk__in=derivation_ids),
        )
        self.stdout.write(
            f"Clustered {cluster_result.packages_created} new packages "
            f"({cluster_result.attrpaths_created} attrpaths) for "
            f"{count} previously unlinked derivations."
        )

        created = 0
        for proposal_id in qs.iterator(chunk_size=batch_size):
            with transaction.atomic():
                proposal = (
                    CVEDerivationClusterProposal.objects.select_for_update()
                    .prefetch_related(
                        Prefetch(
                            "derivationclusterproposallink_set",
                            queryset=DerivationClusterProposalLink.objects.select_related(
                                "derivation__package_link"
                            ),
                        )
                    )
                    .get(pk=proposal_id)
                )

                package_flags: dict[int, int] = {}
                for link in proposal.derivationclusterproposallink_set.all():
                    try:
                        pkg_id = link.derivation.package_link.package_id
                    except PackageDerivation.DoesNotExist:
                        continue
                    package_flags[pkg_id] = (
                        package_flags.get(pkg_id, 0) | link.provenance_flags
                    )

                objs = [
                    PackageClusterProposalLink(
                        proposal=proposal,
                        package_id=pkg_id,
                        provenance_flags=ProvenanceFlags(flags),
                    )
                    for pkg_id, flags in package_flags.items()
                ]
                result = PackageClusterProposalLink.objects.bulk_create(
                    objs, ignore_conflicts=True
                )
                created += len(result)

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. {created} package links created across {total} proposals."
            )
        )
