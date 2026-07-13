from collections.abc import Callable
from datetime import timedelta
from unittest import mock

import pytest
from django.test import override_settings

from shared.cache_suggestions import cache_new_suggestions
from shared.listeners.automatic_linkage import (
    build_new_links,
    refresh_suggestion_derivation_links,
)
from shared.models.cve import Container, Tag
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
    PackageClusterProposalLink,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import (
    NixChannel,
    NixDerivation,
    NixEvaluation,
)
from shared.models.package import Package, PackageDerivation


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
    assert build_new_links(container) is True
    proposal = CVEDerivationClusterProposal.objects.get(cve=container.cve)
    assert proposal.status == CVEDerivationClusterProposal.Status.REJECTED
    assert (
        proposal.rejection_reason
        == CVEDerivationClusterProposal.RejectionReason.NO_MATCHES
    )
    assert proposal.derivations.count() == 0


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
    make_drv: Callable[..., NixDerivation],
    package_name: str | None,
    product: str | None,
    drv_pname: str,
    expected_flags: ProvenanceFlags,
) -> None:
    container = make_container(package_name=package_name, product=product)
    drv = make_drv(pname=drv_pname)

    match = build_new_links(container)
    assert match
    if expected_flags:
        link = DerivationClusterProposalLink.objects.get(derivation=drv)
        assert link.provenance_flags == expected_flags
        assert link.proposal.status == CVEDerivationClusterProposal.Status.PENDING
        # Check the whole data pipeline by also caching the suggestion
        cache_new_suggestions(link.proposal)
    else:
        proposal = CVEDerivationClusterProposal.objects.get(cve=container.cve)
        assert proposal.status == CVEDerivationClusterProposal.Status.REJECTED
        assert (
            proposal.rejection_reason
            == CVEDerivationClusterProposal.RejectionReason.NO_MATCHES
        )


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


def test_refresh_links_replaced_with_latest_evaluation(
    cve: Container,
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """
    Links are replaced with derivations from the latest evaluation,
    using the same name-based matching as the initial linkage algorithm.
    """
    old_eval = make_evaluation()
    new_eval = make_evaluation()

    old_drv = make_drv(pname="foo", evaluation=old_eval)
    new_drv = make_drv(pname="foo", evaluation=new_eval, attribute=old_drv.attribute)

    suggestion = make_suggestion(
        container=cve, drvs={old_drv: ProvenanceFlags.PACKAGE_NAME_MATCH}
    )

    refresh_suggestion_derivation_links(suggestion)

    suggestion.refresh_from_db()
    assert (
        suggestion.algorithm_version
        == CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION
    )
    links = DerivationClusterProposalLink.objects.filter(proposal=suggestion)
    assert links.count() == 1
    link = links.get()
    assert link.derivation == new_drv
    assert link.provenance_flags == ProvenanceFlags.PACKAGE_NAME_MATCH


def test_refresh_suggestion_rejected_when_package_gone(
    cve: Container,
    make_evaluation: Callable[..., NixEvaluation],
    drv: NixDerivation,
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """
    When a package no longer appears in the latest evaluation the suggestion is
    rejected with NO_MATCHES and its links are cleared.
    """
    suggestion = make_suggestion(
        container=cve, drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH}
    )

    make_evaluation()

    refresh_suggestion_derivation_links(suggestion)

    suggestion.refresh_from_db()
    assert suggestion.status == CVEDerivationClusterProposal.Status.REJECTED
    assert (
        suggestion.rejection_reason
        == CVEDerivationClusterProposal.RejectionReason.NO_MATCHES
    )
    assert not DerivationClusterProposalLink.objects.filter(
        proposal=suggestion
    ).exists()


@override_settings(MAX_MATCHES=1)
def test_refresh_suggestion_rejected_when_too_many_matches(
    cve: Container,
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """When matches exceed MAX_MATCHES the suggestion is rejected with MAX_MATCHES_EXCEEDED."""
    old_eval = make_evaluation()
    new_eval = make_evaluation()

    old_drv = make_drv(pname="foo", evaluation=old_eval)
    make_drv(pname="foo", evaluation=new_eval)
    make_drv(pname="foo", evaluation=new_eval)

    suggestion = make_suggestion(
        container=cve, drvs={old_drv: ProvenanceFlags.PACKAGE_NAME_MATCH}
    )

    refresh_suggestion_derivation_links(suggestion)

    suggestion.refresh_from_db()
    assert suggestion.status == CVEDerivationClusterProposal.Status.REJECTED
    assert (
        suggestion.rejection_reason
        == CVEDerivationClusterProposal.RejectionReason.MAX_MATCHES_EXCEEDED
    )


def test_refresh_suggestion_rejected_when_derivation_has_known_vulnerability(
    cve: Container,
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Suggestion is rejected when the latest matching derivation lists the CVE as a known vulnerability."""
    old_eval = make_evaluation()
    new_eval = make_evaluation()

    old_drv = make_drv(pname="foo", evaluation=old_eval)
    make_drv(
        pname="foo",
        evaluation=new_eval,
        attribute=old_drv.attribute,
        known_vulnerabilities=[cve.cve.cve_id],
    )

    suggestion = make_suggestion(
        container=cve, drvs={old_drv: ProvenanceFlags.PACKAGE_NAME_MATCH}
    )
    assert suggestion.status == CVEDerivationClusterProposal.Status.PENDING

    refresh_suggestion_derivation_links(suggestion)

    suggestion.refresh_from_db()
    assert suggestion.status == CVEDerivationClusterProposal.Status.REJECTED
    assert (
        suggestion.rejection_reason
        == CVEDerivationClusterProposal.RejectionReason.KNOWN_VULNERABILITY
    )
    assert DerivationClusterProposalLink.objects.filter(proposal=suggestion).exists()


def test_refresh_skips_published_suggestion_on_rejection(
    make_evaluation: Callable[..., NixEvaluation],
    drv: NixDerivation,
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """
    When a suggestion is published while refresh is running, the status must not
    be overwritten to REJECTED and its links must not be deleted.
    """
    suggestion = make_suggestion(
        drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH},
        status=CVEDerivationClusterProposal.Status.PUBLISHED,
    )
    # Simulate the stale in-memory object the worker would hold.
    suggestion.status = CVEDerivationClusterProposal.Status.ACCEPTED
    # A new evaluation with no matching derivation makes the resolver return NO_MATCHES.
    make_evaluation()

    refresh_suggestion_derivation_links(suggestion)

    suggestion.refresh_from_db()
    assert suggestion.status == CVEDerivationClusterProposal.Status.PUBLISHED
    assert DerivationClusterProposalLink.objects.filter(proposal=suggestion).exists()


def test_refresh_skips_published_suggestion_on_match(
    make_evaluation: Callable[..., NixEvaluation],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """
    When a suggestion is published while refresh is running, its derivation links
    must not be replaced even when newer matching derivations exist.
    """
    old_eval = make_evaluation()
    new_eval = make_evaluation()

    old_drv = make_drv(pname="foo", evaluation=old_eval)
    make_drv(pname="foo", evaluation=new_eval, attribute=old_drv.attribute)

    suggestion = make_suggestion(
        drvs={old_drv: ProvenanceFlags.PACKAGE_NAME_MATCH},
        status=CVEDerivationClusterProposal.Status.PUBLISHED,
    )
    # Simulate the stale in-memory object the worker would hold.
    suggestion.status = CVEDerivationClusterProposal.Status.ACCEPTED

    refresh_suggestion_derivation_links(suggestion)

    links = DerivationClusterProposalLink.objects.filter(proposal=suggestion)
    assert links.count() == 1
    assert links.get().derivation == old_drv


def test_package_links_populated_alongside_drv_links(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
    make_package: Callable[..., Package],
) -> None:
    """Package links are created alongside derivation links when a derivation is clustered."""
    drv = make_drv(pname="foo")
    pkg = make_package(drv)
    PackageDerivation.objects.create(derivation=drv, package=pkg)
    container = make_container(package_name="foo")

    assert build_new_links(container)

    proposal = CVEDerivationClusterProposal.objects.get(cve=container.cve)
    assert proposal.status == CVEDerivationClusterProposal.Status.PENDING
    link = PackageClusterProposalLink.objects.get(proposal=proposal)
    assert link.package == pkg
    assert link.provenance_flags == ProvenanceFlags.PACKAGE_NAME_MATCH


def test_unclustered_drv_produces_no_package_links(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
) -> None:
    """Derivations not yet assigned to a package are skipped without error."""
    make_drv(pname="foo")
    container = make_container(package_name="foo")

    assert build_new_links(container)

    proposal = CVEDerivationClusterProposal.objects.get(cve=container.cve)
    assert proposal.status == CVEDerivationClusterProposal.Status.PENDING
    assert DerivationClusterProposalLink.objects.filter(proposal=proposal).count() == 1
    assert PackageClusterProposalLink.objects.filter(proposal=proposal).count() == 0


def test_multiple_drvs_same_package_produce_one_package_link(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
    make_package: Callable[..., Package],
) -> None:
    """Multiple matching derivations that belong to the same package produce a single package link."""
    drv1 = make_drv(pname="foo", attribute="foo")
    drv2 = make_drv(pname="foo-cli", attribute="foo-cli")
    pkg = make_package(drv1)
    PackageDerivation.objects.create(derivation=drv1, package=pkg)
    PackageDerivation.objects.create(derivation=drv2, package=pkg)

    container = make_container(package_name="foo")

    assert build_new_links(container)

    proposal = CVEDerivationClusterProposal.objects.get(cve=container.cve)
    assert DerivationClusterProposalLink.objects.filter(proposal=proposal).count() == 2
    assert PackageClusterProposalLink.objects.filter(proposal=proposal).count() == 1


def test_package_link_provenance_flags_merged_across_drvs(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
) -> None:
    """Provenance flags are OR-ed across all derivations belonging to the same package."""
    drv1 = make_drv(pname="alpha", attribute="alpha")
    drv2 = make_drv(pname="beta", attribute="beta")
    pkg = Package.objects.create(name="alpha-beta", homepage="https://example.com")
    PackageDerivation.objects.create(derivation=drv1, package=pkg)
    PackageDerivation.objects.create(derivation=drv2, package=pkg)

    container = make_container(package_name="alpha", product="beta")

    assert build_new_links(container)

    proposal = CVEDerivationClusterProposal.objects.get(cve=container.cve)
    link = PackageClusterProposalLink.objects.get(proposal=proposal)
    assert (
        link.provenance_flags
        == ProvenanceFlags.PACKAGE_NAME_MATCH | ProvenanceFlags.PRODUCT_MATCH
    )


@pytest.mark.xfail(reason="Not implemented", strict=True)
def test_build_new_links_is_atomic(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
) -> None:
    make_drv(pname="foo")
    container = make_container(package_name="foo")

    with mock.patch.object(
        DerivationClusterProposalLink.objects,
        "bulk_create",
        side_effect=Exception("simulated DB failure"),
    ):
        with pytest.raises(Exception, match="simulated DB failure"):
            build_new_links(container)

    # A retry must succeed after a failed first attempt
    assert build_new_links(container)
