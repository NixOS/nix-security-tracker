from collections import defaultdict

from cpe import CPE
from django.db.models import Q
from pydantic import BaseModel

from shared.cache_suggestions import src_position_url
from shared.models.linkage import CVEDerivationClusterProposal, PackageOverlay
from shared.models.nix_evaluation import NixDerivation, NixEvaluation
from shared.models.package import PackageAttrpath


class MissingCPEs(BaseModel):
    class CPE(BaseModel, frozen=True):
        vendor: str
        product: str

    package: str
    attributes: list[str]
    positions: list[str]
    cpes: list["MissingCPEs.CPE"]


def missing_cpes() -> list[MissingCPEs]:
    """
    List CPEs that validated suggestions tie to packages, but aren't declared on those packages in the latest evaluation of any current branch.
    """

    # Get all curated matches
    curated = CVEDerivationClusterProposal.objects.filter(
        Q(status=CVEDerivationClusterProposal.Status.PUBLISHED)
        | Q(
            # A known vulnerability in derivation metadata means a confirmed match.
            status=CVEDerivationClusterProposal.Status.REJECTED,
            rejection_reason=CVEDerivationClusterProposal.RejectionReason.KNOWN_VULNERABILITY,
        )
    )

    # Filter for non-ignored packages
    ignored = set(
        PackageOverlay.objects.filter(
            suggestion__in=curated, type=PackageOverlay.Type.IGNORED
        ).values_list("suggestion_id", "package_attribute")
    )
    attributes: dict[int, set[str]] = defaultdict(set)
    for proposal, attribute in (
        curated.filter(derivationclusterproposallink__isnull=False)
        .values_list("pk", "derivationclusterproposallink__derivation__attribute")
        .distinct()
    ):
        if (proposal, attribute) not in ignored:
            attributes[proposal].add(attribute)

    # Take CPE information from each curated CVE
    cpes = (
        curated.filter(cve__container__affected__cpes__isnull=False)
        .values_list("pk", "cve__container__affected__cpes__name")
        .distinct()
    )
    parsed = {cpe: CPE(cpe) for cpe in {cpe for _, cpe in cpes}}
    cpe_info: dict[int, set[MissingCPEs.CPE]] = defaultdict(set)
    for proposal, cpe in cpes:
        for vendor, product in zip(
            parsed[cpe].get_vendor(), parsed[cpe].get_product(), strict=False
        ):
            if vendor and product and vendor != "*" and product != "*":
                cpe_info[proposal].add(MissingCPEs.CPE(vendor=vendor, product=product))

    # Map CPE information to curated package matches
    candidates: dict[str, set[MissingCPEs.CPE]] = defaultdict(set)
    for proposal, attrs in attributes.items():
        for attribute in attrs:
            candidates[attribute] |= cpe_info[proposal]

    # Collect CPE information from latest known derivations
    declared: dict[str, set[MissingCPEs.CPE]] = {}
    positions: dict[str, set[str]] = defaultdict(set)
    for (
        attribute,
        commit_sha1,
        position,
        vendor,
        product,
    ) in NixDerivation.objects.filter(
        attribute__in=candidates,
        parent_evaluation__in=NixEvaluation.objects.latest_completed_per_branch(),
    ).values_list(
        "attribute",
        "parent_evaluation__commit_sha1",
        "metadata__position",
        "metadata__cpe_vendor",
        "metadata__cpe_product",
    ):
        cpes = declared.setdefault(attribute, set())
        if vendor and product:
            cpes.add(MissingCPEs.CPE(vendor=vendor, product=product))
        if url := src_position_url(commit_sha1, position):
            positions[attribute].add(url)

    # Compute what's missing from derivations with respect to curated matches
    missing = {
        attribute: candidates[attribute] - cpes for attribute, cpes in declared.items()
    }

    # Group by package and attribute path
    grouped: dict[tuple[str, int], set[str]] = defaultdict(set)
    for attrpath, package, name in PackageAttrpath.objects.filter(
        attrpath__in=[attribute for attribute, cpes in missing.items() if cpes]
    ).values_list("attrpath", "package_id", "package__name"):
        grouped[(name, package)].add(attrpath)

    # Package it into the return type
    return [
        MissingCPEs(
            package=name,
            attributes=sorted(attributes),
            positions=sorted(
                set[str]().union(*(positions[attribute] for attribute in attributes))
            ),
            cpes=sorted(
                set[MissingCPEs.CPE]().union(
                    *(missing[attribute] for attribute in attributes)
                ),
                key=lambda cpe: (cpe.vendor, cpe.product),
            ),
        )
        for (name, _), attributes in sorted(grouped.items())
    ]
