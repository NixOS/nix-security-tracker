from collections.abc import Callable
from datetime import timedelta

import pytest

from shared.listeners.automatic_linkage import build_new_links
from shared.listeners.cache_suggestions import cache_new_suggestions
from shared.models.cve import Container, Tag
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import (
    MAJOR_CHANNELS,
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

    # FIXME(@fricklerhandwerk): This will fall apart when we obtain the channel structure dynamically [ref:channel-structure]
    release = MAJOR_CHANNELS[1]
    channels = [
        make_channel(
            release=release,
            branch=branch,
            state=NixChannel.ChannelState.UNSTABLE,
        )
        for branch in [
            f"nixos-${release}",
            f"nixos-${release}-small",
            f"nixpkgs-${release}-darwin",
        ]
    ]

    evaluations = []
    # We don't really need to test for `WAITING` since we don't expect derivations to exist for such an evaluation that hasn't started yet.
    # But for simplicity we simply iterate over all states.
    for state in NixEvaluation.EvaluationState.values:
        for channel in channels:
            for day in range(3):
                ev = make_evaluation(channel=channel, state=state)
                target_time = ev.created_at - timedelta(days=day)
                # Overwrite the timestamp without triggering the `save()` hook that would write the current time again
                NixEvaluation.objects.filter(pk=ev.pk).update(
                    created_at=target_time,
                    updated_at=target_time,
                )
                evaluations.append(ev)

    for i, ev in enumerate(evaluations):
        make_drv(
            evaluation=ev,
            pname="foobar",
            version=f"1.{i}",
        )

    container = make_container(package_name="foo", affected_version="<3.2")
    match = build_new_links(container)
    assert match
    suggestion = CVEDerivationClusterProposal.objects.first()
    assert suggestion
    states = suggestion.derivations.values_list("parent_evaluation__state", flat=True)
    assert set(states) == {NixEvaluation.EvaluationState.COMPLETED}
    assert suggestion.derivations.count() == len(channels)
    assert suggestion.derivations.count() < len(evaluations)

    # Check the whole data pipeline by also caching the suggestion
    cache_new_suggestions(suggestion)


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


@pytest.mark.xfail(reason="Not implemented")
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

    assert not build_new_links(container)


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


@pytest.mark.xfail(reason="Not implemented")
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

    assert not build_new_links(hw_container)
    assert build_new_links(app_container)
    suggestion = CVEDerivationClusterProposal.objects.get(cve=app_container.cve)
    assert suggestion.derivations.filter(name__startswith="myapp").exists()
    assert not suggestion.derivations.filter(name__startswith="some_router").exists()
