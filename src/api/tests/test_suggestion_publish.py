from collections.abc import Callable
from datetime import timedelta

import pytest
from django.contrib.auth.models import User
from django.utils import timezone
from pytest_mock import MockerFixture
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.models.issue import NixpkgsIssue
from shared.models.linkage import CVEDerivationClusterProposal


def url(id: int) -> str:
    return reverse("cvederivationclusterproposal-publish", kwargs={"pk": id})


def list_url() -> str:
    return reverse("cvederivationclusterproposal-list")


def test_publish_accepted_suggestion(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff: User,
    mocker: MockerFixture,
) -> None:
    """Publishing an accepted suggestion creates a NixpkgsIssue, a GitHub issue, and marks the suggestion as published."""
    mock_issue = mocker.Mock()
    mock_issue.html_url = "https://github.com/NixOS/nixpkgs/issues/1234"
    mock_create = mocker.patch("shared.github.create_gh_issue", return_value=mock_issue)

    client = APIClient()
    client.force_login(staff)
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )

    response = client.post(url(suggestion.pk), format="json")

    assert response.status_code == 201
    mock_create.assert_called_once()

    suggestion.refresh_from_db()
    assert suggestion.status == CVEDerivationClusterProposal.Status.PUBLISHED
    assert suggestion.in_issue_draft is False
    assert suggestion.nixpkgs_issue is not None

    issue = NixpkgsIssue.objects.get(pk=response.data["id"])
    assert issue.code == response.data["code"]
    assert response.data["github_issue_url"] == mock_issue.html_url
    assert list(issue.suggestions.all()) == [suggestion]


def test_publish_bumps_updated_at_and_sorts_first(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff: User,
    mocker: MockerFixture,
) -> None:
    mock_issue = mocker.Mock()
    mock_issue.html_url = "https://github.com/NixOS/nixpkgs/issues/1234"
    mocker.patch("shared.github.create_gh_issue", return_value=mock_issue)

    client = APIClient()
    client.force_login(staff)

    already_published = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.PUBLISHED
    )
    now = timezone.now()
    CVEDerivationClusterProposal.objects.filter(pk=already_published.pk).update(
        updated_at=now - timedelta(days=1)
    )

    to_publish = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    before_publish = timezone.now()

    response = client.post(url(to_publish.pk), format="json")
    assert response.status_code == 201

    to_publish.refresh_from_db()
    assert to_publish.updated_at >= before_publish

    list_response = client.get(list_url(), {"status": "published"})
    assert list_response.status_code == 200
    ids = [item["id"] for item in list_response.data["results"]]
    assert ids == [to_publish.pk, already_published.pk]


def test_publish_derives_title_from_suggestion(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff: User,
    mocker: MockerFixture,
) -> None:
    mock_issue = mocker.Mock()
    mock_issue.html_url = "https://github.com/NixOS/nixpkgs/issues/1234"
    mocker.patch("shared.github.create_gh_issue", return_value=mock_issue)

    client = APIClient()
    client.force_login(staff)
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    expected_title = suggestion.cached.payload["title"]

    response = client.post(url(suggestion.pk), format="json")

    assert response.status_code == 201
    assert response.data["title"] == expected_title


@pytest.mark.parametrize(
    "status",
    [
        CVEDerivationClusterProposal.Status.PENDING,
        CVEDerivationClusterProposal.Status.REJECTED,
        CVEDerivationClusterProposal.Status.PUBLISHED,
    ],
)
def test_publish_rejects_non_accepted_suggestion(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff: User,
    mocker: MockerFixture,
    status: CVEDerivationClusterProposal.Status,
) -> None:
    mock_create = mocker.patch("shared.github.create_gh_issue")

    client = APIClient()
    client.force_login(staff)
    suggestion = make_cached_suggestion(status=status)

    response = client.post(url(suggestion.pk), format="json")

    assert response.status_code == 400
    mock_create.assert_not_called()


def test_publish_forbidden_for_anonymous(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    client = APIClient()
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    response = client.post(url(suggestion.pk), format="json")
    assert response.status_code in (401, 403)
