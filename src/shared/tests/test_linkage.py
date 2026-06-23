from collections.abc import Callable
from datetime import timedelta

import pytest
from django.test import override_settings

from shared.cache_suggestions import cache_new_suggestions
from shared.listeners.automatic_linkage import build_new_links
from shared.models.cve import Container, Tag
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import (
    NixChannel,
    NixDerivation,
    NixEvaluation,
)


def test_link_only_latest_eval(
    make_container: Callable[..., Container],
    make_channel: Callable[..., NixChannel],
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
) -> None:
    """
    Check that only derivations from the latest complete evaluation of each channel are matched.
    """

    channels = [
        make_channel(
            channel_branch="nixos-26.05", state=NixChannel.ChannelState.STABLE
        ),
        make_channel(
            channel_branch="nixos-unstable", state=NixChannel.ChannelState.UNSTABLE
        ),
    ]

    evaluations = []
    # We don't really need to test for `WAITING` since we don't expect derivations to exist for such an evaluation that hasn't started yet.
    # But for simplicity we simply iterate over all states.
    for state in NixEvaluation.EvaluationState.values:
        for channel in channels:
            evaluations.extend(
                [
                    make_evaluation(
                        channel=channel, state=state, age=timedelta(days=0)
                    ),
                    make_evaluation(
                        channel=channel, state=state, age=timedelta(days=1)
                    ),
                ]
            )

    for i, ev in enumerate(evaluations):
        make_drv(evaluation=ev, pname="foobar", version=f"1.{i}")

    container = make_container(package_name="foo", affected_version="<3.2")
    assert build_new_links(container)
    suggestion = CVEDerivationClusterProposal.objects.first()
    assert suggestion
    states = suggestion.derivations.values_list("parent_evaluation__state", flat=True)
    assert set(states) == {NixEvaluation.EvaluationState.COMPLETED}
    assert suggestion.derivations.count() == len(channels)
    assert suggestion.derivations.count() < len(evaluations)

    # Check the whole data pipeline by also caching the suggestion
    cache_new_suggestions(suggestion)


def test_eol_channel_produces_no_matches(
    make_container: Callable[..., Container],
    make_channel: Callable[..., NixChannel],
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
) -> None:
    """
    Derivations on unmaintained channels must not produce matches.
    """
    assert NixChannel.ChannelState.END_OF_LIFE not in NixChannel.TRACKED_STATES
    eol_channel = make_channel(
        channel_branch="nixos-24.05",
        state=NixChannel.ChannelState.END_OF_LIFE,
    )
    eol_eval = make_evaluation(channel=eol_channel)
    make_drv(pname="foo", evaluation=eol_eval)

    container = make_container(package_name="foo")
    assert not build_new_links(container)


@pytest.mark.parametrize(
    "package_name,product,drv_pname,expected_flags",
    [
        ("foo", None, "foo", ProvenanceFlags.PACKAGE_NAME_MATCH),
        ("foo", None, "bar", None),
        (None, "bar", "bar", ProvenanceFlags.PRODUCT_MATCH),
        (None, "bar", "foo", None),
        ("foo", "bar", "foo", ProvenanceFlags.PACKAGE_NAME_MATCH),
        ("foo", "bar", "bar", ProvenanceFlags.PRODUCT_MATCH),
        ("foo", "bar", "baz", None),
        (
            "foo",
            "foo",
            "foo",
            ProvenanceFlags.PACKAGE_NAME_MATCH | ProvenanceFlags.PRODUCT_MATCH,
        ),
        # This does not seem happen in practice though
        (None, None, "foo", None),
    ],
)
def test_link_product_or_package_name(
    make_container: Callable[..., Container],
    make_channel: Callable[..., NixChannel],
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    package_name: str | None,
    product: str | None,
    drv_pname: str,
    expected_flags: ProvenanceFlags,
) -> None:
    container = make_container(package_name=package_name, product=product)
    drv = make_drv(pname=drv_pname)

    match = build_new_links(container)

    if expected_flags:
        assert match
        link = DerivationClusterProposalLink.objects.get(derivation=drv)
        assert link.provenance_flags == expected_flags
        # Check the whole data pipeline by also caching the suggestion
        cache_new_suggestions(link.proposal)
    else:
        assert not match


def test_exclusively_hosted_service_creates_rejected_proposal(
    make_container: Callable[..., Container],
) -> None:
    """Containers tagged exclusively-hosted-service must be stored but immediately rejected."""
    container = make_container()
    tag, _ = Tag.objects.get_or_create(value="exclusively-hosted-service")
    container.tags.add(tag)

    result = build_new_links(container)

    assert result is True
    proposal = CVEDerivationClusterProposal.objects.get(cve=container.cve)
    assert proposal.status == CVEDerivationClusterProposal.Status.REJECTED
    assert (
        proposal.rejection_reason
        == CVEDerivationClusterProposal.RejectionReason.EXCLUSIVELY_HOSTED_SERVICE
    )
    assert proposal.derivations.count() == 0


@override_settings(MAX_MATCHES=1)
def test_max_matches_exceeded_creates_rejected_proposal(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
) -> None:
    container = make_container(package_name="foo", product="foo")
    make_drv(pname="foo", attribute="foo1")
    make_drv(pname="foo", attribute="foo2")

    assert build_new_links(container) is True
    proposal = CVEDerivationClusterProposal.objects.get(cve=container.cve)
    assert proposal.status == CVEDerivationClusterProposal.Status.REJECTED
    assert (
        proposal.rejection_reason
        == CVEDerivationClusterProposal.RejectionReason.MAX_MATCHES_EXCEEDED
    )
    assert proposal.derivations.count() == 0
    assert proposal.rejection_match_count == 2
    assert proposal.rejection_max_matches_limit == 1


def test_hardware_cpe_produces_no_match(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
) -> None:
    container = make_container(
        package_name="some_router",
        product="some_router",
        cpes=["cpe:2.3:h:cisco:some_router:1.0:*:*:*:*:*:*:*"],
    )
    make_drv(pname="some_router")

    assert build_new_links(container) is True
    proposal = CVEDerivationClusterProposal.objects.get(cve=container.cve)
    assert proposal.status == CVEDerivationClusterProposal.Status.REJECTED
    assert (
        proposal.rejection_reason
        == CVEDerivationClusterProposal.RejectionReason.HARDWARE_ONLY_CPE
    )
    assert proposal.derivations.count() == 0


def test_application_cpe_produces_match(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
) -> None:
    container = make_container(
        package_name="myapp",
        product="myapp",
        cpes=["cpe:2.3:a:vendor:myapp:1.0:*:*:*:*:*:*:*"],
    )
    make_drv(pname="myapp")

    assert build_new_links(container)


def test_mixed_cpe_parts_skips_hardware_only_affected_products(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
) -> None:
    # hardware-only affected product — should be skipped
    hw_container = make_container(
        cve_id="CVE-2025-0002",
        package_name="some_router",
        product="some_router",
        cpes=["cpe:2.3:h:cisco:some_router:1.0:*:*:*:*:*:*:*"],
    )
    # application affected product on a separate CVE — should match
    app_container = make_container(
        cve_id="CVE-2025-0003",
        package_name="myapp",
        product="myapp",
        cpes=["cpe:2.3:a:vendor:myapp:1.0:*:*:*:*:*:*:*"],
    )
    make_drv(pname="some_router", version="1.0")
    make_drv(pname="myapp", version="1.0", attribute="myapp")

    build_new_links(hw_container)
    assert not CVEDerivationClusterProposal.objects.get(
        cve=hw_container.cve
    ).derivations.exists()
    assert build_new_links(app_container)
    suggestion = CVEDerivationClusterProposal.objects.get(cve=app_container.cve)
    assert suggestion.derivations.filter(name__startswith="myapp").exists()
    assert not suggestion.derivations.filter(name__startswith="some_router").exists()


def test_ignore_tests(
    cve: Container,
    make_drv: Callable[..., NixDerivation],
) -> None:
    drv1 = make_drv(attribute="foo")
    drv2 = make_drv(attribute="tests.foo")

    assert build_new_links(cve)

    suggestion = CVEDerivationClusterProposal.objects.get(cve=cve.cve)
    assert suggestion.derivations.filter(attribute=drv1.attribute).exists()
    assert not suggestion.derivations.filter(attribute=drv2.attribute).exists()


def test_skip_known_vulnerability(
    cve: Container, make_drv: Callable[..., NixDerivation]
) -> None:
    drv1 = make_drv(pname="foo")
    drv2 = make_drv(pname="bar", known_vulnerabilities=[cve.cve.cve_id])

    assert build_new_links(cve)

    proposal = CVEDerivationClusterProposal.objects.get(cve=cve.cve)

    assert proposal.status == CVEDerivationClusterProposal.Status.REJECTED
    assert (
        proposal.rejection_reason
        == CVEDerivationClusterProposal.RejectionReason.KNOWN_VULNERABILITY
    )
    assert not proposal.derivations.filter(attribute=drv1.attribute).exists()
    assert proposal.derivations.filter(attribute=drv2.attribute).exists()
