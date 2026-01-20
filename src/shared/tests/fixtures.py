import secrets
from collections.abc import Callable

import pytest
from allauth.socialaccount.models import SocialAccount
from django.contrib.auth.models import User
from django.test import Client

from shared.listeners.cache_suggestions import cache_new_suggestions
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
    MAJOR_CHANNELS,
    NixChannel,
    NixDerivation,
    NixDerivationMeta,
    NixEvaluation,
    NixMaintainer,
)


@pytest.fixture
def make_container(db: None) -> Callable[..., Container]:
    def wrapped(
        cve_id: str = "CVE-2025-0001",
        title: str = "Dummy Title",
        description: str | None = "Test description",
        affected_version: str = "1.0",
        package_name: str | None = "foo",
        product: str | None = "bar",
    ) -> Container:
        org, _created = Organization.objects.get_or_create(
            uuid=1, short_name="test-org"
        )
        cve = CveRecord.objects.create(
            cve_id=cve_id,
            assigner=org,
        )
        metric = Metric.objects.create(format="cvssV3_1", raw_cvss_json={})
        version = Version.objects.create(
            status=Version.Status.AFFECTED, version=affected_version
        )
        affected = AffectedProduct.objects.create(
            package_name=package_name,
            product=product,
        )
        affected.versions.add(version)

        container = cve.container.create(provider=org, title=title)
        container.affected.add(affected)
        if description is not None:
            desc = Description.objects.create(value=description)
            container.descriptions.add(desc)
        container.metrics.add(metric)

        return container

    return wrapped


@pytest.fixture
def cve(make_container: Callable[..., Container]) -> Container:
    return make_container()


@pytest.fixture
def make_channel(db: None) -> Callable[..., NixChannel]:
    # FIXME(@fricklerhandwerk): This will fall apart when we obtain the channel structure dynamically [ref:channel-structure]
    def wrapped(
        release: str = MAJOR_CHANNELS[1],
        state: NixChannel.ChannelState = NixChannel.ChannelState.STABLE,
        branch: str | None = None,
    ) -> NixChannel:
        if branch is None:
            branch = f"nixos-{release}"

        return NixChannel.objects.create(
            staging_branch=branch,
            channel_branch=branch,
            head_sha1_commit=secrets.token_hex(16),
            state=state,
            release_version=release,
            repository="https://github.com/NixOS/nixpkgs",
        )

    return wrapped


@pytest.fixture
def channel(
    make_channel: Callable[..., NixChannel],
) -> NixChannel:
    return make_channel()


@pytest.fixture
def make_evaluation(
    channel: NixChannel,
) -> Callable[..., NixEvaluation]:
    def wrapped(
        channel: NixChannel = channel,
        state: NixEvaluation.EvaluationState = NixEvaluation.EvaluationState.COMPLETED,
    ) -> NixEvaluation:
        return NixEvaluation.objects.create(
            channel=channel,
            commit_sha1=secrets.token_hex(16),
            state=state,
        )

    return wrapped


@pytest.fixture
def evaluation(make_evaluation: Callable[..., NixEvaluation]) -> NixEvaluation:
    return make_evaluation()


@pytest.fixture
def maintainer(db: None) -> NixMaintainer:
    return NixMaintainer.objects.create(
        github_id=123, github="testuser", name="Test User", email="test@example.com"
    )


@pytest.fixture
def make_drv(
    maintainer: NixMaintainer,
    evaluation: NixEvaluation,
) -> Callable[..., NixDerivation]:
    def wrapped(
        # Like `pname` in `mkDerivation`
        pname: str = "foo",
        version: str = "1.0",
        system: str = "x86_64-linux",
        attribute: str | None = None,
        evaluation: NixEvaluation = evaluation,
        maintainer: NixMaintainer = maintainer,
    ) -> NixDerivation:
        meta = NixDerivationMeta.objects.create(
            description="Dummy derivation",
            insecure=False,
            available=True,
            broken=False,
            unfree=False,
            unsupported=False,
        )
        meta.maintainers.add(maintainer)

        if attribute is None:
            attribute = pname

        return NixDerivation.objects.create(
            attribute=attribute,
            derivation_path=f"/nix/store/<hash>-{pname}-{version}.drv",
            name=f"{pname}-{version}",
            metadata=meta,
            system=system,
            parent_evaluation=evaluation,
        )

    return wrapped


@pytest.fixture
def drv(
    make_drv: Callable[..., NixDerivation],
) -> NixDerivation:
    return make_drv()


@pytest.fixture
def make_suggestion(
    cve: Container, drv: NixDerivation
) -> Callable[..., CVEDerivationClusterProposal]:
    def wrapped(
        # FIXME(@fricklerhandwerk): This should be a whole CVE
        container: Container = cve,
        drvs: dict[NixDerivation, ProvenanceFlags] = {
            drv: ProvenanceFlags.PACKAGE_NAME_MATCH
        },
        status: CVEDerivationClusterProposal.Status = CVEDerivationClusterProposal.Status.PENDING,
    ) -> CVEDerivationClusterProposal:
        suggestion = CVEDerivationClusterProposal.objects.create(
            status=status,
            cve=container.cve,
        )

        for drv, provenance in drvs.items():
            DerivationClusterProposalLink.objects.create(
                proposal=suggestion,
                derivation=drv,
                provenance_flags=provenance,
            )

        return suggestion

    return wrapped


@pytest.fixture
def suggestion(
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> CVEDerivationClusterProposal:
    return make_suggestion()


@pytest.fixture
def cached_suggestion(
    suggestion: CVEDerivationClusterProposal,
) -> CVEDerivationClusterProposal:
    cache_new_suggestions(suggestion)

    return suggestion


@pytest.fixture
def user(django_user_model: type[User]) -> User:
    user = django_user_model.objects.create_user(
        username="testuser",
        is_staff=True,
    )
    SocialAccount.objects.get_or_create(
        user=user,
        provider="github",
        uid="123456",
        extra_data={"login": user.username},
    )
    return user


@pytest.fixture
def authenticated_client(
    client: Client,
    user: User,
) -> Client:
    # https://docs.djangoproject.com/en/6.0/topics/testing/tools/#django.test.Client.force_login
    client.force_login(
        user,
        backend="allauth.account.auth_backends.AuthenticationBackend",
    )
    return client
