from collections.abc import Callable

import pytest
from django.contrib.auth.models import User
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.models.linkage import CVEDerivationClusterProposal


def url(id: int) -> str:
    return reverse("cvederivationclusterproposal-bundle", kwargs={"pk": id})


def test_bundle_accepted_suggestion(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff: User,
) -> None:
    """A committer can add an accepted suggestion to the issue draft."""
    client = APIClient()
    client.force_login(staff)
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    response = client.patch(url(suggestion.pk), {"in_issue_draft": True}, format="json")
    assert response.status_code == 200
    assert response.data == {"in_issue_draft": True}
    suggestion.refresh_from_db()
    assert suggestion.in_issue_draft is True


def test_unbundle_suggestion(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff: User,
) -> None:
    """A committer can remove a suggestion from the issue draft."""
    client = APIClient()
    client.force_login(staff)
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        in_issue_draft=True,
    )
    response = client.patch(
        url(suggestion.pk), {"in_issue_draft": False}, format="json"
    )
    assert response.status_code == 200
    assert response.data == {"in_issue_draft": False}
    suggestion.refresh_from_db()
    assert suggestion.in_issue_draft is False


@pytest.mark.parametrize(
    "status",
    [
        CVEDerivationClusterProposal.Status.PENDING,
        CVEDerivationClusterProposal.Status.REJECTED,
        CVEDerivationClusterProposal.Status.PUBLISHED,
    ],
)
def test_bundle_rejects_non_accepted_suggestion(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff: User,
    status: CVEDerivationClusterProposal.Status,
) -> None:
    """Only accepted suggestions may be added to the issue draft."""
    client = APIClient()
    client.force_login(staff)
    suggestion = make_cached_suggestion(status=status)
    response = client.patch(url(suggestion.pk), {"in_issue_draft": True}, format="json")
    assert response.status_code == 400
    suggestion.refresh_from_db()
    assert suggestion.in_issue_draft is False


def test_bundle_forbidden_for_anonymous(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    client = APIClient()
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    response = client.patch(url(suggestion.pk), {"in_issue_draft": True}, format="json")
    assert response.status_code in (401, 403)
