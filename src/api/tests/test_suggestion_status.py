from collections.abc import Callable

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from shared.models.linkage import (
    CVEDerivationClusterProposal,
)


@pytest.mark.parametrize(
    # This is a smoke test to check the wiring, deliberately not exhaustive.
    # We rely on `pgtrigger` declarations and `model.clean()` to enforce constraints simple enough to be inspected manually.
    ("from_status", "to_status", "post_data", "code", "error"),
    [
        (
            CVEDerivationClusterProposal.Status.PENDING,
            CVEDerivationClusterProposal.Status.PENDING,
            {},
            400,
            "Already in status",
        ),
        (
            CVEDerivationClusterProposal.Status.PENDING,
            CVEDerivationClusterProposal.Status.ACCEPTED,
            {},
            200,
            None,
        ),
        (
            CVEDerivationClusterProposal.Status.PENDING,
            CVEDerivationClusterProposal.Status.ACCEPTED,
            {
                "rejection_reason": CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS
            },
            400,
            "Cannot set rejection reason",
        ),
        (
            CVEDerivationClusterProposal.Status.ACCEPTED,
            CVEDerivationClusterProposal.Status.REJECTED,
            {},
            400,
            "requires a reason",
        ),
        (
            CVEDerivationClusterProposal.Status.ACCEPTED,
            CVEDerivationClusterProposal.Status.REJECTED,
            {"comment": "foo", "rejection_reason": None},
            200,
            None,
        ),
        (
            CVEDerivationClusterProposal.Status.PENDING,
            CVEDerivationClusterProposal.Status.REJECTED,
            {
                "rejection_reason": CVEDerivationClusterProposal.RejectionReason.NOT_IN_NIXPKGS
            },
            200,
            None,
        ),
    ],
)
def test_suggestion_change_state(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff: User,
    from_status: CVEDerivationClusterProposal.Status,
    to_status: CVEDerivationClusterProposal.Status,
    post_data: dict,
    code: int,
    error: str | None,
) -> None:
    client = APIClient()
    client.force_login(staff)
    cached_suggestion = make_cached_suggestion(status=from_status)
    response = client.post(
        f"/api/v1/suggestions/{cached_suggestion.pk}/change_status",
        {
            "status": to_status,
        }
        | post_data,
        format="json",
    )
    assert response.status_code == code
    if error is not None:
        assert error in response.text
    else:
        assert response.data == {"status": to_status} | post_data
