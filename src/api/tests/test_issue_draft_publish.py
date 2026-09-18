from collections.abc import Callable

from django.contrib.auth.models import User
from pytest_mock import MockerFixture
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.models.issue import NixpkgsIssue
from shared.models.linkage import CVEDerivationClusterProposal


def publish_url() -> str:
    return reverse("cvederivationclusterproposal-publish-issue-draft")


def reset_url() -> str:
    return reverse("cvederivationclusterproposal-reset-issue-draft")


def test_publish_issue_draft_bundles_all_suggestions(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_container: Callable,
    staff: User,
    mocker: MockerFixture,
) -> None:
    """Publishing the issue draft creates a single issue for all bundled suggestions."""
    mock_issue = mocker.Mock()
    mock_issue.html_url = "https://github.com/NixOS/nixpkgs/issues/1234"
    mock_create = mocker.patch("shared.github.create_gh_issue", return_value=mock_issue)

    container1 = make_container(cve_id="CVE-2025-0001")
    container2 = make_container(cve_id="CVE-2025-0002")
    suggestion1 = make_cached_suggestion(
        container=container1,
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        in_issue_draft=True,
    )
    suggestion2 = make_cached_suggestion(
        container=container2,
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        in_issue_draft=True,
    )
    # An accepted suggestion that isn't bundled should be left untouched.
    other = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED,
        in_issue_draft=False,
    )

    client = APIClient()
    client.force_login(staff)

    response = client.post(publish_url(), {"title": "Test bundle issue"}, format="json")

    assert response.status_code == 201
    mock_create.assert_called_once()
    assert mock_create.call_args.args[1] == "Test bundle issue"

    issue = NixpkgsIssue.objects.get(pk=response.data["id"])
    assert set(issue.suggestions.values_list("pk", flat=True)) == {
        suggestion1.pk,
        suggestion2.pk,
    }

    for suggestion in (suggestion1, suggestion2):
        suggestion.refresh_from_db()
        assert suggestion.status == CVEDerivationClusterProposal.Status.PUBLISHED
        assert suggestion.in_issue_draft is False

    other.refresh_from_db()
    assert other.status == CVEDerivationClusterProposal.Status.ACCEPTED
    assert other.in_issue_draft is False


def test_publish_issue_draft_requires_title(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff: User,
    mocker: MockerFixture,
) -> None:
    mock_create = mocker.patch("shared.github.create_gh_issue")
    make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED, in_issue_draft=True
    )

    client = APIClient()
    client.force_login(staff)
    response = client.post(publish_url(), {"title": ""}, format="json")

    assert response.status_code == 400
    mock_create.assert_not_called()


def test_publish_issue_draft_rejects_empty_draft(
    staff: User,
    mocker: MockerFixture,
    db: None,
) -> None:
    mock_create = mocker.patch("shared.github.create_gh_issue")

    client = APIClient()
    client.force_login(staff)
    response = client.post(publish_url(), {"title": "Empty bundle"}, format="json")

    assert response.status_code == 400
    mock_create.assert_not_called()


def test_publish_issue_draft_forbidden_for_anonymous(db: None) -> None:
    client = APIClient()
    response = client.post(publish_url(), {"title": "Test"}, format="json")
    assert response.status_code in (401, 403)


def test_reset_issue_draft_clears_bundle(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    staff: User,
) -> None:
    suggestion1 = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED, in_issue_draft=True
    )
    suggestion2 = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED, in_issue_draft=True
    )

    client = APIClient()
    client.force_login(staff)
    response = client.post(reset_url())

    assert response.status_code == 204
    for suggestion in (suggestion1, suggestion2):
        suggestion.refresh_from_db()
        assert suggestion.in_issue_draft is False


def test_reset_issue_draft_forbidden_for_anonymous(db: None) -> None:
    client = APIClient()
    response = client.post(reset_url())
    assert response.status_code in (401, 403)


def test_reset_issue_draft_noop_when_empty(staff: User, db: None) -> None:
    """Resetting an already-empty draft is a no-op, not an error."""
    client = APIClient()
    client.force_login(staff)
    response = client.post(reset_url())
    assert response.status_code == 204
