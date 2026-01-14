import secrets
from collections.abc import Callable

import pytest
from allauth.socialaccount.models import SocialAccount
from django.contrib.auth.models import AbstractBaseUser
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
def make_channel(db: None) -> Callable[[str, NixChannel.ChannelState], NixChannel]:
    def wrapped(release: str, state: NixChannel.ChannelState) -> NixChannel:
        return NixChannel.objects.create(
            staging_branch=f"nixos-{release}",
            channel_branch=f"nixos-{release}",
            head_sha1_commit=secrets.token_hex(16),
            state=state,
            release_version=release,
            repository="https://github.com/NixOS/nixpkgs",
        )

    return wrapped


@pytest.fixture
def channel(
    make_channel: Callable[[str, NixChannel.ChannelState], NixChannel],
) -> NixChannel:
    # FIXME(@fricklerhandwerk): This will fall apart when we obtain the channel structure dynamically [ref:channel-structure]
    return make_channel(MAJOR_CHANNELS[1], NixChannel.ChannelState.STABLE)


@pytest.fixture
def make_evaluation() -> Callable[[NixChannel], NixEvaluation]:
    def wrapped(channel: NixChannel) -> NixEvaluation:
        return NixEvaluation.objects.create(
            channel=channel,
            commit_sha1=secrets.token_hex(16),
            state="completed",
        )

    return wrapped


@pytest.fixture
def evaluation(
    channel: NixChannel, make_evaluation: Callable[[NixChannel], NixEvaluation]
) -> NixEvaluation:
    return make_evaluation(channel)


@pytest.fixture
def maintainer(db: None) -> NixMaintainer:
    return NixMaintainer.objects.create(
        github_id=123, github="testuser", name="Test User", email="test@example.com"
    )


@pytest.fixture
def make_drv(maintainer: NixMaintainer) -> Callable[[NixEvaluation], NixDerivation]:
    def wrapped(evaluation: NixEvaluation) -> NixDerivation:
        meta = NixDerivationMeta.objects.create(
            description="Dummy derivation",
            insecure=False,
            available=True,
            broken=False,
            unfree=False,
            unsupported=False,
        )
        meta.maintainers.add(maintainer)

        return NixDerivation.objects.create(
            attribute="foo",
            derivation_path="/nix/store/<hash>-foo.drv",
            name="foo-1.0",
            metadata=meta,
            system="x86_64-linux",
            parent_evaluation=evaluation,
        )

    return wrapped


@pytest.fixture
def drv(
    db: None,
    make_drv: Callable[[NixEvaluation], NixDerivation],
    evaluation: NixEvaluation,
) -> NixDerivation:
    return make_drv(evaluation)


@pytest.fixture
def suggestion(cve: Container, drv: NixDerivation) -> CVEDerivationClusterProposal:
    suggestion = CVEDerivationClusterProposal.objects.create(
        status="pending",
        cve=cve.cve,
    )

    DerivationClusterProposalLink.objects.create(
        proposal=suggestion,
        derivation=drv,
        provenance_flags=ProvenanceFlags.PACKAGE_NAME_MATCH,
    )

    return suggestion


@pytest.fixture
def cached_suggestion(
    suggestion: CVEDerivationClusterProposal,
) -> CVEDerivationClusterProposal:
    cache_new_suggestions(suggestion)

    return suggestion


@pytest.fixture
def authenticated_client(
    client: Client, django_user_model: type[AbstractBaseUser]
) -> Client:
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
    # https://docs.djangoproject.com/en/6.0/topics/testing/tools/#django.test.Client.force_login
    client.force_login(
        user,
        backend="allauth.account.auth_backends.AuthenticationBackend",
    )
    return client
