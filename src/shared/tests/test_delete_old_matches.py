from collections.abc import Callable
from datetime import timedelta
from io import StringIO

import pytest
from django.contrib.auth.models import User
from django.core.management import call_command
from django.utils import timezone

from shared.models.cve import Container, CveRecord
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
    MaintainerOverlay,
    PackageOverlay,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import NixDerivation


@pytest.mark.django_db
def test_deletes_old_untriaged_match_preserves_core_data(
    cve: Container,
    drv: NixDerivation,
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """A PENDING proposal is deleted, but CveRecord, NixDerivation, and Container are preserved."""
    # Use the injected `cve` fixture and modify its date
    CveRecord.objects.filter(pk=cve.cve.pk).update(
        date_published=timezone.now() - timedelta(days=366)
    )
    # create the proposal using the injected fixtures
    make_suggestion(container=cve, drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH})

    assert CVEDerivationClusterProposal.objects.count() == 1
    assert CveRecord.objects.count() == 1
    assert NixDerivation.objects.count() == 1
    assert Container.objects.count() == 1

    call_command("delete_old_matches", stdout=StringIO())

    assert CVEDerivationClusterProposal.objects.count() == 0
    # Crux of the test: core data isn't cascade deleted
    assert CveRecord.objects.count() == 1
    assert NixDerivation.objects.count() == 1
    assert Container.objects.count() == 1


@pytest.mark.django_db
def test_preserves_recent_match(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Proposals linked to CVEs published <1 year ago are left untouched."""
    container = make_container()
    CveRecord.objects.filter(pk=container.cve.pk).update(
        date_published=timezone.now() - timedelta(days=100)
    )
    make_suggestion(container=container)

    call_command("delete_old_matches", stdout=StringIO())

    assert CVEDerivationClusterProposal.objects.count() == 1


@pytest.mark.django_db
def test_preserves_triaged_match(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Proposals published >1 year ago that are triaged (ACCEPTED/REJECTED) are NOT deleted."""
    # Accepted
    accepted_container = make_container(cve_id="CVE-2025-0001")
    CveRecord.objects.filter(pk=accepted_container.cve.pk).update(
        date_published=timezone.now() - timedelta(days=400)
    )
    accepted_suggestion = make_suggestion(container=accepted_container)
    accepted_suggestion.status = CVEDerivationClusterProposal.Status.ACCEPTED
    accepted_suggestion.save()

    # Rejected
    rejected_container = make_container(cve_id="CVE-2025-0002")
    CveRecord.objects.filter(pk=rejected_container.cve.pk).update(
        date_published=timezone.now() - timedelta(days=400)
    )
    rejected_suggestion = make_suggestion(container=rejected_container)
    rejected_suggestion.status = CVEDerivationClusterProposal.Status.REJECTED
    rejected_suggestion.save()

    assert CVEDerivationClusterProposal.objects.count() == 2

    call_command("delete_old_matches", stdout=StringIO())

    assert CVEDerivationClusterProposal.objects.count() == 2


@pytest.mark.django_db
def test_only_old_matches_are_deleted(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """When both old and recent matches exist, only old ones are removed."""
    old_container = make_container(cve_id="CVE-2020-0001")
    CveRecord.objects.filter(pk=old_container.cve.pk).update(
        date_published=timezone.now() - timedelta(days=400)
    )
    make_suggestion(container=old_container)

    recent_container = make_container(cve_id="CVE-2025-0001")
    CveRecord.objects.filter(pk=recent_container.cve.pk).update(
        date_published=timezone.now() - timedelta(days=30)
    )
    make_suggestion(container=recent_container)

    assert CVEDerivationClusterProposal.objects.count() == 2

    call_command("delete_old_matches", stdout=StringIO())

    assert CVEDerivationClusterProposal.objects.count() == 1
    assert CVEDerivationClusterProposal.objects.filter(
        cve=recent_container.cve
    ).exists()


@pytest.mark.django_db
def test_deletes_all_related_data(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """Deleting a proposal also removes CachedSuggestions and link rows via CASCADE."""
    container = make_container()
    CveRecord.objects.filter(pk=container.cve.pk).update(
        date_published=timezone.now() - timedelta(days=400)
    )
    suggestion = make_cached_suggestion(container=container)

    assert DerivationClusterProposalLink.objects.filter(proposal=suggestion).exists()
    # CachedSuggestions existence is verified via the related accessor
    assert hasattr(suggestion, "cached")

    call_command("delete_old_matches", stdout=StringIO())

    assert CVEDerivationClusterProposal.objects.count() == 0
    assert DerivationClusterProposalLink.objects.count() == 0
    # CachedSuggestions table should also be empty
    from shared.models.cached import CachedSuggestions

    assert CachedSuggestions.objects.count() == 0


@pytest.mark.django_db
def test_package_and_maintainer_edits_are_cleaned_up(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_maintainer: Callable[..., object],  # NixMaintainer
) -> None:
    """PackageOverlay and MaintainerOverlay rows are removed alongside the proposal."""
    from shared.models.nix_evaluation import NixMaintainer

    container = make_container()
    CveRecord.objects.filter(pk=container.cve.pk).update(
        date_published=timezone.now() - timedelta(days=400)
    )
    suggestion = make_suggestion(container=container)

    maintainer: NixMaintainer = make_maintainer()  # type: ignore[assignment]
    MaintainerOverlay.objects.create(
        edit_type=MaintainerOverlay.Type.ADDITIONAL,
        maintainer=maintainer,
        suggestion=suggestion,
    )
    PackageOverlay.objects.create(
        edit_type=PackageOverlay.Type.IGNORED,
        package_attribute="foo",
        suggestion=suggestion,
    )

    assert MaintainerOverlay.objects.count() == 1
    assert PackageOverlay.objects.count() == 1

    call_command("delete_old_matches", stdout=StringIO())

    assert MaintainerOverlay.objects.count() == 0
    assert PackageOverlay.objects.count() == 0


@pytest.mark.django_db
def test_suggestion_notifications_are_cleaned_up_safely(
    make_container: Callable[..., Container],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    user: User,
) -> None:
    """Old suggestions with notifications are deleted via CASCADE and the unread counter is updated."""
    from webview.models import SuggestionNotification

    container = make_container()
    CveRecord.objects.filter(pk=container.cve.pk).update(
        date_published=timezone.now() - timedelta(days=400)
    )
    suggestion = make_suggestion(container=container)

    # Use Profile method to create notification so counter is incremented
    user.profile.create_notification(suggestion)

    assert SuggestionNotification.objects.count() == 1
    assert user.profile.unread_notifications_count == 1

    call_command("delete_old_matches", stdout=StringIO())

    # Verify CASCADE worked
    assert SuggestionNotification.objects.count() == 0
    # Verify signal corrected the counter
    user.profile.refresh_from_db()
    assert user.profile.unread_notifications_count == 0


@pytest.mark.django_db
def test_dry_run_deletes_nothing(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """--dry-run reports the count but leaves all data intact."""
    container = make_container()
    CveRecord.objects.filter(pk=container.cve.pk).update(
        date_published=timezone.now() - timedelta(days=400)
    )
    make_suggestion(container=container)

    out = StringIO()
    call_command("delete_old_matches", "--dry-run", stdout=out)

    assert CVEDerivationClusterProposal.objects.count() == 1
    output = out.getvalue()
    assert "Dry run" in output
    assert "1 proposal" in output


@pytest.mark.django_db
def test_fallback_to_date_reserved_when_no_published_date(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """CVEs with no date_published but an old date_reserved are still cleaned up."""
    container = make_container()
    CveRecord.objects.filter(pk=container.cve.pk).update(
        date_published=None, date_reserved=timezone.now() - timedelta(days=400)
    )
    make_suggestion(container=container)

    call_command("delete_old_matches", stdout=StringIO())

    assert CVEDerivationClusterProposal.objects.count() == 0


@pytest.mark.django_db
def test_recent_reserved_only_cve_is_kept(
    make_container: Callable[..., Container],
    make_drv: Callable[..., NixDerivation],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """CVEs with no date_published and a recent date_reserved are NOT deleted."""
    container = make_container()
    CveRecord.objects.filter(pk=container.cve.pk).update(
        date_published=None, date_reserved=timezone.now() - timedelta(days=100)
    )
    make_suggestion(container=container)

    call_command("delete_old_matches", stdout=StringIO())

    assert CVEDerivationClusterProposal.objects.count() == 1
