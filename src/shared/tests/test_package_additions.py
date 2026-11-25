from collections.abc import Callable
from datetime import timedelta

import pytest
from django.core.exceptions import ValidationError
from django.test import override_settings

from shared.cache_suggestions import cache_new_suggestions
from shared.listeners.automatic_linkage import refresh_suggestion_derivation_links
from shared.logs.fetchers import fetch_status_events_for_package
from shared.models import PackageOverlayEvent  # type: ignore
from shared.models.cve import Version
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
    PackageClusterProposalLink,
    PackageOverlay,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import (
    NixChannel,
    NixDerivation,
    NixEvaluation,
    NixMaintainer,
    NixpkgsBranch,
)
from shared.package_clustering import cluster_packages


@pytest.fixture
def extra_maintainer(make_maintainer: Callable[..., NixMaintainer]) -> NixMaintainer:
    return make_maintainer(github_id=999, github="extra-maintainer")


@pytest.fixture
def extra_drv(
    make_drv: Callable[..., NixDerivation],
    extra_maintainer: NixMaintainer,
) -> NixDerivation:
    """A derivation in the latest evaluation that the matcher did not link."""
    drv = make_drv(pname="extra", attribute="extra", maintainer=extra_maintainer)
    cluster_packages(NixDerivation.objects.filter(pk=drv.pk))
    return drv


def test_add_package(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
    extra_maintainer: NixMaintainer,
) -> None:
    cached_suggestion.add_packages([extra_drv.attribute])

    overlay = cached_suggestion.package_overlays.get(
        package_attribute=extra_drv.attribute
    )
    assert overlay.type == PackageOverlay.Type.ADDITIONAL
    assert overlay.package == extra_drv.package_link.package

    payload = cached_suggestion.cached.payload
    assert extra_drv.attribute not in payload["original_packages"]
    package = payload["packages"][extra_drv.attribute]
    assert package["derivation_ids"] == [extra_drv.pk]
    (on_branch,) = package["branches"].values()
    assert on_branch["version"] == "1.0"
    assert on_branch["status"] == Version.Status.AFFECTED

    maintainers = payload["categorized_maintainers"]
    assert extra_maintainer.github_id in {m["github_id"] for m in maintainers["active"]}

    link = cached_suggestion.derivationclusterproposallink_set.get(derivation=extra_drv)
    assert link.provenance_flags == ProvenanceFlags.MANUAL
    package_link = cached_suggestion.package_links.get(
        package=extra_drv.package_link.package
    )
    assert package_link.provenance_flags == ProvenanceFlags.MANUAL


def test_added_package_survives_cache_regeneration(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
) -> None:
    cached_suggestion.add_packages([extra_drv.attribute])
    before = cached_suggestion.cached.payload["packages"]

    cache_new_suggestions(cached_suggestion)
    cached_suggestion.refresh_from_db()

    assert cached_suggestion.cached.payload["packages"] == before


def test_added_package_uses_latest_evaluation(
    cached_suggestion: CVEDerivationClusterProposal,
    make_drv: Callable[..., NixDerivation],
    make_evaluation: Callable[..., NixEvaluation],
) -> None:
    old = make_drv(
        pname="extra",
        attribute="extra",
        version="0.9",
        evaluation=make_evaluation(age=timedelta(days=1)),
    )
    new = make_drv(pname="extra", attribute="extra", version="2.0")
    cluster_packages(NixDerivation.objects.filter(pk__in=[old.pk, new.pk]))
    assert old.package_link.package == new.package_link.package

    cached_suggestion.add_packages(["extra"])

    package = cached_suggestion.cached.payload["packages"]["extra"]
    assert package["derivation_ids"] == [new.pk]


def test_add_package_not_in_latest_evaluation(
    cached_suggestion: CVEDerivationClusterProposal,
    make_drv: Callable[..., NixDerivation],
    make_evaluation: Callable[..., NixEvaluation],
) -> None:
    # Only in an evaluation older than the latest one.
    make_drv(pname="gone", evaluation=make_evaluation(age=timedelta(days=1)))

    with pytest.raises(ValidationError, match="Not in any tracked channel: gone"):
        cached_suggestion.add_packages(["gone"])
    assert not cached_suggestion.package_overlays.exists()


def test_add_package_without_metadata(
    cached_suggestion: CVEDerivationClusterProposal,
    evaluation: NixEvaluation,
) -> None:
    """Derivations without metadata can't be clustered into packages."""
    NixDerivation.objects.create(
        attribute="nometa",
        derivation_path="/nix/store/<hash>-nometa-1.0.drv",
        name="nometa-1.0",
        system="x86_64-linux",
        parent_evaluation=evaluation,
    )

    with pytest.raises(ValidationError, match="Not in any tracked channel: nometa"):
        cached_suggestion.add_packages(["nometa"])


def test_add_package_unknown_attribute(
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    with pytest.raises(
        ValidationError, match="Not in any tracked channel: does-not-exist"
    ):
        cached_suggestion.add_packages(["does-not-exist"])
    assert not cached_suggestion.package_overlays.exists()


def test_add_package_already_original(
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
) -> None:
    with pytest.raises(ValidationError, match="already part of the suggestion"):
        cached_suggestion.add_packages([drv.attribute])


def test_add_package_ignored_but_no_longer_matched(
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
) -> None:
    """An ignored package the matcher no longer finds can't be restored, so it can be added again."""
    cached_suggestion.ignore_packages([drv.attribute])
    cached_suggestion.derivationclusterproposallink_set.filter(derivation=drv).delete()
    cache_new_suggestions(cached_suggestion)
    cached_suggestion.refresh_from_db()

    cached_suggestion.add_packages([drv.attribute])

    (overlay,) = cached_suggestion.package_overlays.all()
    assert overlay.type == PackageOverlay.Type.ADDITIONAL
    assert drv.attribute in cached_suggestion.cached.payload["packages"]


def test_add_package_already_ignored_original(
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
) -> None:
    """Ignored original packages are restored, not added."""
    cached_suggestion.ignore_packages([drv.attribute])
    with pytest.raises(ValidationError, match="already part of the suggestion"):
        cached_suggestion.add_packages([drv.attribute])


def test_add_package_twice(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
) -> None:
    cached_suggestion.add_packages([extra_drv.attribute])
    with pytest.raises(ValidationError, match="Packages already added"):
        cached_suggestion.add_packages([extra_drv.attribute])


def test_remove_package(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
    extra_maintainer: NixMaintainer,
) -> None:
    cached_suggestion.add_packages([extra_drv.attribute])
    cached_suggestion.remove_packages([extra_drv.attribute])

    assert not cached_suggestion.package_overlays.exists()
    assert not cached_suggestion.derivationclusterproposallink_set.manual().exists()
    assert not cached_suggestion.package_links.manual().exists()
    payload = cached_suggestion.cached.payload
    assert extra_drv.attribute not in payload["packages"]
    all_maintainers = {
        m["github_id"]
        for category in payload["categorized_maintainers"].values()
        for m in category
    }
    assert extra_maintainer.github_id not in all_maintainers


def test_attribute_groups_follow_additions(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
) -> None:
    def grouped() -> set[str]:
        return {
            attribute
            for group in cached_suggestion.cached.payload["attribute_package_groups"]
            for attribute in group["attributes"]
        }

    cached_suggestion.add_packages([extra_drv.attribute])
    assert extra_drv.attribute in grouped()

    cached_suggestion.remove_packages([extra_drv.attribute])
    assert extra_drv.attribute not in grouped()


def test_remove_package_not_added(
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
) -> None:
    with pytest.raises(ValidationError, match="not added manually"):
        cached_suggestion.remove_packages([drv.attribute])


def test_ignore_added_package(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
) -> None:
    """Added packages are not part of the original packages and cannot be ignored."""
    cached_suggestion.add_packages([extra_drv.attribute])
    with pytest.raises(ValidationError, match="remove them instead"):
        cached_suggestion.ignore_packages([extra_drv.attribute])


def test_add_and_ignore_coexist(
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
    extra_drv: NixDerivation,
) -> None:
    cached_suggestion.ignore_packages([drv.attribute])
    cached_suggestion.add_packages([extra_drv.attribute])

    packages = cached_suggestion.cached.payload["packages"]
    assert set(packages) == {extra_drv.attribute}

    cached_suggestion.restore_packages([drv.attribute])
    packages = cached_suggestion.cached.payload["packages"]
    assert set(packages) == {drv.attribute, extra_drv.attribute}


def test_add_remove_events(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
) -> None:
    cached_suggestion.add_packages([extra_drv.attribute])
    cached_suggestion.remove_packages([extra_drv.attribute])

    labels = list(
        PackageOverlayEvent.objects.filter(suggestion_id=cached_suggestion.pk)
        .order_by("pgh_id")
        .values_list("pgh_label", flat=True)
    )
    assert labels == ["package.add", "package.delete"]


def test_package_feed_includes_added_package(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
) -> None:
    assert fetch_status_events_for_package(extra_drv.attribute) == []

    cached_suggestion.add_packages([extra_drv.attribute])

    events = fetch_status_events_for_package(extra_drv.attribute)
    assert {e.suggestion_id for e in events} == {cached_suggestion.pk}


def matcher_finds(suggestion: CVEDerivationClusterProposal, drv: NixDerivation) -> None:
    """Simulate a rematch that links `drv` to the suggestion."""
    link, created = DerivationClusterProposalLink.objects.get_or_create(
        proposal=suggestion,
        derivation=drv,
        defaults={"provenance_flags": ProvenanceFlags.PACKAGE_NAME_MATCH},
    )
    if not created:
        link.provenance_flags |= ProvenanceFlags.PACKAGE_NAME_MATCH
        link.save()
    cache_new_suggestions(suggestion)
    suggestion.refresh_from_db()


def test_added_package_found_by_matcher_stays_added(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
) -> None:
    cached_suggestion.add_packages([extra_drv.attribute])
    matcher_finds(cached_suggestion, extra_drv)

    assert extra_drv.attribute in cached_suggestion.cached.payload["original_packages"]
    assert extra_drv.attribute in cached_suggestion.added_package_attributes()

    cached_suggestion.remove_packages([extra_drv.attribute])
    assert extra_drv.attribute not in cached_suggestion.added_package_attributes()
    assert extra_drv.attribute in cached_suggestion.cached.payload["packages"]
    link = cached_suggestion.derivationclusterproposallink_set.get(derivation=extra_drv)
    assert link.provenance_flags == ProvenanceFlags.PACKAGE_NAME_MATCH


def test_adding_merges_into_matcher_links(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
) -> None:
    matcher_finds(cached_suggestion, extra_drv)

    cached_suggestion.link_added_packages({extra_drv.attribute})

    (link,) = cached_suggestion.derivationclusterproposallink_set.filter(
        derivation=extra_drv
    )
    assert link.provenance_flags == (
        ProvenanceFlags.PACKAGE_NAME_MATCH | ProvenanceFlags.MANUAL
    )


def test_ignore_added_package_found_by_matcher(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
) -> None:
    """Ignoring a package that is both added and matched replaces the addition."""
    cached_suggestion.add_packages([extra_drv.attribute])
    matcher_finds(cached_suggestion, extra_drv)

    cached_suggestion.ignore_packages([extra_drv.attribute])

    overlay = cached_suggestion.package_overlays.get(
        package_attribute=extra_drv.attribute
    )
    assert overlay.type == PackageOverlay.Type.IGNORED
    assert extra_drv.attribute not in cached_suggestion.cached.payload["packages"]
    labels = list(
        PackageOverlayEvent.objects.filter(suggestion_id=cached_suggestion.pk)
        .order_by("pgh_id")
        .values_list("pgh_label", flat=True)
    )
    assert labels == ["package.add", "package.ignore"]

    cached_suggestion.restore_packages([extra_drv.attribute])
    assert not cached_suggestion.package_overlays.exists()
    assert extra_drv.attribute in cached_suggestion.cached.payload["packages"]


def test_refresh_relinks_added_package_from_latest_evaluation(
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
    extra_drv: NixDerivation,
    make_drv: Callable[..., NixDerivation],
    make_evaluation: Callable[..., NixEvaluation],
) -> None:
    cached_suggestion.add_packages([extra_drv.attribute])
    evaluation = make_evaluation()
    make_drv(pname=drv.attribute, evaluation=evaluation)
    newer = make_drv(pname="extra", version="2.0", evaluation=evaluation)

    refresh_suggestion_derivation_links(cached_suggestion)

    assert set(
        cached_suggestion.derivationclusterproposallink_set.manual().values_list(
            "derivation", flat=True
        )
    ) == {newer.pk}


def test_added_package_hidden_while_not_in_any_channel(
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
    extra_drv: NixDerivation,
    make_drv: Callable[..., NixDerivation],
    make_evaluation: Callable[..., NixEvaluation],
) -> None:
    cached_suggestion.add_packages([extra_drv.attribute])

    # The attribute disappears from Nixpkgs.
    make_drv(pname=drv.attribute, evaluation=make_evaluation())
    refresh_suggestion_derivation_links(cached_suggestion)
    cache_new_suggestions(cached_suggestion)
    cached_suggestion.refresh_from_db()

    assert extra_drv.attribute in cached_suggestion.added_package_attributes()
    assert extra_drv.attribute not in cached_suggestion.cached.payload["packages"]
    with pytest.raises(ValidationError, match="currently not in any tracked channel"):
        cached_suggestion.add_packages([extra_drv.attribute])

    # It comes back.
    evaluation = make_evaluation()
    make_drv(pname=drv.attribute, evaluation=evaluation)
    make_drv(pname="extra", evaluation=evaluation)
    refresh_suggestion_derivation_links(cached_suggestion)
    cache_new_suggestions(cached_suggestion)
    cached_suggestion.refresh_from_db()

    assert extra_drv.attribute in cached_suggestion.cached.payload["packages"]


@override_settings(MAX_MATCHES=0)
def test_rejecting_refresh_keeps_added_packages(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
) -> None:
    cached_suggestion.add_packages([extra_drv.attribute])

    refresh_suggestion_derivation_links(cached_suggestion)

    assert cached_suggestion.status == CVEDerivationClusterProposal.Status.REJECTED
    assert set(
        cached_suggestion.derivationclusterproposallink_set.values_list(
            "derivation", "provenance_flags"
        )
    ) == {(extra_drv.pk, ProvenanceFlags.MANUAL)}
    assert set(
        PackageClusterProposalLink.objects.filter(
            proposal=cached_suggestion
        ).values_list("package", flat=True)
    ) == {extra_drv.package_link.package_id}


def test_matched_and_added_package_shows_all_linked_branches(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
    make_drv: Callable[..., NixDerivation],
    make_branch: Callable[..., NixpkgsBranch],
    make_channel: Callable[..., NixChannel],
    make_evaluation: Callable[..., NixEvaluation],
) -> None:
    """The matcher finding fewer branches than the addition doesn't hide the others."""
    stable = make_channel(
        channel_branch="nixos-25.11", release_branch=make_branch("release-25.11")
    )
    on_stable = make_drv(pname="extra", evaluation=make_evaluation(channel=stable))
    cached_suggestion.add_packages([extra_drv.attribute])

    matcher_finds(cached_suggestion, extra_drv)

    package = cached_suggestion.cached.payload["packages"][extra_drv.attribute]
    assert set(package["branches"]) == {"master", "release-25.11"}
    assert set(package["derivation_ids"]) == {extra_drv.pk, on_stable.pk}


def test_links_without_flags_count_as_matched(
    cached_suggestion: CVEDerivationClusterProposal,
    extra_drv: NixDerivation,
) -> None:
    DerivationClusterProposalLink.objects.create(
        proposal=cached_suggestion, derivation=extra_drv, provenance_flags=0
    )

    cache_new_suggestions(cached_suggestion)
    cached_suggestion.refresh_from_db()

    assert extra_drv.attribute in cached_suggestion.cached.payload["original_packages"]


def test_shared_state_leaves_out_added_packages(
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
    extra_drv: NixDerivation,
) -> None:
    """Bulk operations can ignore matched packages, but added ones can only be deleted."""
    cached_suggestion.add_packages([extra_drv.attribute])

    state = CVEDerivationClusterProposal.objects.filter(
        pk=cached_suggestion.pk
    ).shared_state()

    assert {value.value for value in state.packages} == {drv.attribute}


def test_package_feed_with_another_package_ignored(
    cached_suggestion: CVEDerivationClusterProposal,
    drv: NixDerivation,
    extra_drv: NixDerivation,
) -> None:
    cached_suggestion.add_packages([extra_drv.attribute])
    cached_suggestion.ignore_packages([drv.attribute])

    events = fetch_status_events_for_package(extra_drv.attribute)

    assert {e.suggestion_id for e in events} == {cached_suggestion.pk}
