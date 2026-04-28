from collections.abc import Callable
from unittest.mock import patch

import pytest
from django.conf import settings
from django.test import override_settings
from django.urls import reverse

from shared.github import create_gh_issue
from shared.models.linkage import CVEDerivationClusterProposal
from shared.tests.test_github_sync import MockGithub


@pytest.mark.django_db
def test_create_gh_issue_includes_tracker_link_in_body(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """
    Verify that create_gh_issue includes the tracker_issue_uri in the
    body of the created GitHub issue.
    """
    accepted_suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )
    tracker_issue_uri = "https://tracker.example.org/issue/123"

    mock_gh = MockGithub()
    create_gh_issue(
        accepted_suggestion.cached,
        tracker_issue_uri,
        github=mock_gh,  # type: ignore
    )

    # Verify that the tracker link is in the body of the created issue
    repo = mock_gh.get_repo(f"{settings.GH_ORGANIZATION}/{settings.GH_ISSUES_REPO}")
    assert len(repo.created_issues) == 1
    body = repo.created_issues[0]["body"]
    assert tracker_issue_uri in body, (
        f"Link {tracker_issue_uri} not found in body: {body}"
    )


@pytest.mark.django_db
def test_publish_uses_base_url(
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    """
    Verify that when a GitHub issue is published via the model, the backlink
    to the tracker uses the BASE_URL setting.
    """
    suggestion = make_cached_suggestion(
        status=CVEDerivationClusterProposal.Status.ACCEPTED
    )

    base_url = "https://tracker.example.org"

    from shared.models import NixpkgsIssue

    tracker_issue = NixpkgsIssue.create_nixpkgs_issue(suggestion)

    with (
        patch("shared.github.create_gh_issue") as mock_create_gh_issue,
        override_settings(BASE_URL=base_url),
    ):
        mock_create_gh_issue.return_value.html_url = "https://github.com/mock/issue/1"

        # Trigger the publication via the model instance method
        tracker_issue.publish(new_comment="Test comment")

        # Verify that create_gh_issue was called with the correct tracker link
        assert mock_create_gh_issue.called
        # args[1] is tracker_issue_link
        tracker_issue_link = mock_create_gh_issue.call_args[0][1]

    expected_issue_path = reverse(
        "webview:issue_detail",
        args=[tracker_issue.code],
    )
    expected_link = f"{base_url.rstrip('/')}{expected_issue_path}"

    assert tracker_issue_link == expected_link, (
        f"Expected tracker link '{expected_link}', but got: '{tracker_issue_link}'"
    )
