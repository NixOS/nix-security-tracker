from unittest.mock import patch

from django.contrib.messages import get_messages
from django.test import Client
from django.urls import reverse

from shared.github import create_gh_issue
from shared.listeners.cache_suggestions import cache_new_suggestions
from shared.models.cve import (
    Container,
)
from shared.models.linkage import (
    CVEDerivationClusterProposal,
)
from shared.tests.test_github_sync import MockGithub


def test_publish_gh_issue_empty_title(
    db: None,
    cve: Container,
    suggestion: CVEDerivationClusterProposal,
    authenticated_client: Client,
) -> None:
    """Test that creating a GitHub issue will succeed and update the suggestion status, despite empty CVE title"""
    # [tag:test-github-create_issue-title]

    url = reverse("webview:drafts_view")
    # 3/4 of all CVEs in the source data have empty title
    cve.title = ""
    cve.save()
    suggestion.status = CVEDerivationClusterProposal.Status.ACCEPTED
    suggestion.save()
    cache_new_suggestions(suggestion)

    # FIXME(@fricklerhandwerk): Mock Github's `create_issue()` here, not our own procedure! [ref:todo-github-connection]
    # Then we can test in-context that the right arguments have been passed, using `mock.assert_called_with()`.
    with patch("webview.views.create_gh_issue") as mock:
        mock.side_effect = lambda *args, **kwargs: create_gh_issue(
            *args,
            github=MockGithub(expected_issue_title="Test description"),  # type: ignore
            **kwargs,
        )
        response = authenticated_client.post(
            url,
            {
                "suggestion_id": suggestion.pk,
                "new_status": "published",
                "comment": "",  # Empty comment
            },
        )
        mock.assert_called()

    messages = list(get_messages(response.wsgi_request))
    assert not any(m.level_tag == "error" for m in messages), (
        "Errors on issue submission"
    )
    suggestion.refresh_from_db()
    assert suggestion.status == CVEDerivationClusterProposal.Status.PUBLISHED


def test_publish_gh_issue_empty_description(
    db: None,
    cve: Container,
    suggestion: CVEDerivationClusterProposal,
    authenticated_client: Client,
) -> None:
    """Test that creating a GitHub issue will succeed and update suggestion status, despite no CVE description"""
    # [tag:test-github-create_issue-description]

    url = reverse("webview:drafts_view")
    cve.descriptions.clear()
    cve.save()
    suggestion.status = CVEDerivationClusterProposal.Status.ACCEPTED
    suggestion.save()
    cache_new_suggestions(suggestion)

    # FIXME(@fricklerhandwerk): Mock Github's `create_issue()` here, not our own procedure! [ref:todo-github-connection]
    with patch("webview.views.create_gh_issue") as mock:
        mock.side_effect = lambda *args, **kwargs: create_gh_issue(
            *args,
            github=MockGithub(expected_issue_title="Dummy Title"),  # type: ignore
            **kwargs,
        )
        response = authenticated_client.post(
            url,
            {
                "suggestion_id": suggestion.pk,
                "new_status": "published",
                "comment": "",  # Empty comment
            },
        )
        mock.assert_called()

    messages = list(get_messages(response.wsgi_request))
    assert not any(m.level_tag == "error" for m in messages), (
        "Errors on issue submission"
    )
    suggestion.refresh_from_db()
    assert suggestion.status == CVEDerivationClusterProposal.Status.PUBLISHED
