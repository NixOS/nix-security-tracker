import pytest

from shared.models.cve import (
    AffectedProduct,
    Container,
    CveRecord,
    Description,
    Metric,
    Organization,
    Version,
)
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import (
    NixChannel,
    NixDerivation,
    NixDerivationMeta,
    NixEvaluation,
    NixMaintainer,
)


@pytest.fixture
def cve(db: None) -> Container:
    org = Organization.objects.create(uuid=1, short_name="test-org")
    cve = CveRecord.objects.create(
        cve_id="CVE-2025-0001",
        assigner=org,
    )
    desc = Description.objects.create(value="Test description")
    metric = Metric.objects.create(format="cvssV3_1", raw_cvss_json={})
    version = Version.objects.create(status=Version.Status.AFFECTED, version="1.0")
    affected = AffectedProduct.objects.create(package_name="dummy-package")
    affected.versions.add(version)

    container = cve.container.create(provider=org, title="Dummy Title")
    container.affected.add(affected)
    container.descriptions.add(desc)
    container.metrics.add(metric)

    return container


@pytest.fixture
def evaluation(db: None) -> NixEvaluation:
    channel = NixChannel.objects.create(
        staging_branch="release-24.05",
        channel_branch="release-24.05",
        head_sha1_commit="deadbeef",
        state=NixChannel.ChannelState.STABLE,
        release_version="24.05",
        repository="https://github.com/NixOS/nixpkgs",
    )

    evaluation = NixEvaluation.objects.create(
        channel=channel,
        commit_sha1="deadbeef",
        state="completed",
    )
    return evaluation


@pytest.fixture
def drv(db: None, evaluation: NixEvaluation) -> NixDerivation:
    maintainer = NixMaintainer.objects.create(
        github_id=123, github="testuser", name="Test User", email="test@example.com"
    )

    meta = NixDerivationMeta.objects.create(
        description="First dummy derivation",
        insecure=False,
        available=True,
        broken=False,
        unfree=False,
        unsupported=False,
    )

    meta.maintainers.add(maintainer)

    drv = NixDerivation.objects.create(
        attribute="foo",
        derivation_path="/nix/store/<hash>-foo.drv",
        name="foo-1.0",
        metadata=meta,
        system="x86_64-linux",
        parent_evaluation=evaluation,
    )

    return drv


@pytest.fixture
def suggestion(cve: Container, drv: NixDerivation) -> CVEDerivationClusterProposal:
    suggestion = CVEDerivationClusterProposal.objects.create(
        status="pending",
        cve_id=cve.pk,
    )

    DerivationClusterProposalLink.objects.create(
        proposal=suggestion,
        derivation=drv,
        provenance_flags=ProvenanceFlags.PACKAGE_NAME_MATCH,
    )

    return suggestion
