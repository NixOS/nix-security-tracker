import secrets
from collections.abc import Callable
from typing import ParamSpec

import pytest
from allauth.socialaccount.models import SocialAccount
from allauth.socialaccount.providers.github.provider import GitHubProvider
from django.conf import settings
from django.contrib.auth.models import Group, User

from shared.listeners.cache_suggestions import cache_new_suggestions
from shared.listeners.notify_users import create_package_subscription_notifications
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
from webview.models import SuggestionNotification as Notification


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
def make_maintainer(db: None) -> Callable[..., NixMaintainer]:
    def wrapped(
        github_id: int = 321,
        github: str = "maintainer",
        name: str = "Test User",
        email: str = "test@example.com",
    ) -> NixMaintainer:
        maintainer, _ = NixMaintainer.objects.get_or_create(
            github_id=github_id,
            github=github,
            name=name,
            email=name,
        )
        return maintainer

    return wrapped


@pytest.fixture
def make_maintainer_from_user(
    make_maintainer: Callable[..., NixMaintainer],
    user: User,
) -> Callable[..., NixMaintainer]:
    def wrapped(user: User = user) -> NixMaintainer:
        social, _ = SocialAccount.objects.get_or_create(user=user)
        return make_maintainer(github_id=int(social.uid), github=user.username)

    return wrapped


@pytest.fixture
def maintainer(make_maintainer: Callable[..., NixMaintainer]) -> NixMaintainer:
    return make_maintainer()


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


P = ParamSpec("P")


@pytest.fixture
def make_cached_suggestion(  # noqa: UP047
    make_suggestion: Callable[P, CVEDerivationClusterProposal],
) -> Callable[P, CVEDerivationClusterProposal]:
    def wrapped(*args: P.args, **kwargs: P.kwargs) -> CVEDerivationClusterProposal:
        suggestion = make_suggestion(*args, **kwargs)
        cache_new_suggestions(suggestion)
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
def make_user(
    django_user_model: type[User],
) -> Callable[..., User]:
    def wrapped(
        is_staff: bool = True,
        is_committer: bool = True,
        username: str = "testuser",
        provider: str = GitHubProvider.id,
        uid: str = "123",
    ) -> User:
        user = django_user_model.objects.create_user(
            username=username,
        )
        if is_staff:
            group, _ = Group.objects.get_or_create(name=settings.DB_SECURITY_TEAM)
            user.groups.add(group)
        if is_committer:
            group, _ = Group.objects.get_or_create(name=settings.DB_COMMITTERS_TEAM)
            user.groups.add(group)

        SocialAccount.objects.get_or_create(
            user=user,
            provider=provider,
            uid=uid,
            extra_data={"login": user.username},
        )
        return user

    return wrapped


@pytest.fixture
def user(make_user: Callable[..., User]) -> User:
    # FIXME(@fricklerhandwerk): Currently tests assume users to be staff.
    # For less confusing naming, rework the tests to be specific about privileges, let `user` here have none.
    return make_user()


@pytest.fixture
def committer(make_user: Callable[..., User]) -> User:
    return make_user(username="committer", is_committer=True, uid="456")


@pytest.fixture
def staff(make_user: Callable[..., User]) -> User:
    return make_user(username="staff", is_staff=True, uid="789")


@pytest.fixture
def make_maintainer_notification(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_maintainer_from_user: Callable[..., NixMaintainer],
    make_drv: Callable[..., NixDerivation],
) -> Callable[..., list[Notification]]:
    def wrapped(
        user: User,
    ) -> list[Notification]:
        maintainer = make_maintainer_from_user(user)
        drv = make_drv(maintainer=maintainer)
        suggestion = make_cached_suggestion(
            drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH}
        )
        return create_package_subscription_notifications(suggestion)

    return wrapped


@pytest.fixture
def make_package_notification(
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_maintainer_from_user: Callable[..., NixMaintainer],
    make_drv: Callable[..., NixDerivation],
) -> Callable[..., list[Notification]]:
    def wrapped(
        drv: NixDerivation,
    ) -> list[Notification]:
        suggestion = make_suggestion(drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH})
        return create_package_subscription_notifications(suggestion)

    return wrapped
