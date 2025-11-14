from allauth.socialaccount.models import SocialAccount
from django.contrib.auth.models import User
from django.contrib.messages import get_messages
from django.test import Client, TestCase
from django.urls import reverse

from shared.listeners.cache_suggestions import cache_new_suggestions
from shared.models.cve import (
    AffectedProduct,
    CveRecord,
    Description,
    Metric,
    Organization,
    Version,
)
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    DerivationClusterProposalLink,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import (
    NixChannel,
    NixDerivation,
    NixDerivationMeta,
    NixEvaluation,
    NixMaintainer,
)


class CommentTests(TestCase):
    def setUp(self) -> None:
        # Create user and log in
        self.user = User.objects.create_user(username="admin", password="pw")
        self.user.is_staff = True
        self.user.save()

        # Create a GitHub social account for the user
        SocialAccount.objects.get_or_create(
            user=self.user,
            provider="github",
            uid="123456",
            extra_data={"login": "admin"},
        )

        self.client = Client()
        self.client.login(username="admin", password="pw")

        # Create CVE and related objects
        self.assigner = Organization.objects.create(uuid=1, short_name="foo")
        self.cve_record = CveRecord.objects.create(
            cve_id="CVE-2025-0001",
            assigner=self.assigner,
        )
        self.description = Description.objects.create(value="Test description")
        self.metric = Metric.objects.create(format="cvssV3_1", raw_cvss_json={})
        self.affected_product = AffectedProduct.objects.create(
            package_name="dummy-package"
        )
        self.affected_product.versions.add(
            Version.objects.create(status=Version.Status.AFFECTED, version="1.0")
        )
        self.cve_container = self.cve_record.container.create(
            provider=self.assigner,
            title="Dummy Title",
        )
        self.cve_container.affected.add(self.affected_product)
        self.cve_container.descriptions.add(self.description)
        self.cve_container.metrics.add(self.metric)

        # Create maintainer and metadata
        self.maintainer = NixMaintainer.objects.create(
            github_id=123,
            github="testuser",
            name="Test User",
            email="test@example.com",
        )
        self.meta = NixDerivationMeta.objects.create(
            description="Dummy derivation",
            insecure=False,
            available=True,
            broken=False,
            unfree=False,
            unsupported=False,
        )
        self.meta.maintainers.add(self.maintainer)

        # Create evaluation and derivation
        self.evaluation = NixEvaluation.objects.create(
            channel=NixChannel.objects.create(
                staging_branch="release-24.05",
                channel_branch="nixos-24.05",
                head_sha1_commit="deadbeef",
                state=NixChannel.ChannelState.STABLE,
                release_version="24.05",
                repository="https://github.com/NixOS/nixpkgs",
            ),
            commit_sha1="deadbeef",
            state=NixEvaluation.EvaluationState.COMPLETED,
        )

        self.derivation = NixDerivation.objects.create(
            attribute="package1",
            derivation_path="/nix/store/package1.drv",
            name="package1-1.0",
            metadata=self.meta,
            system="x86_64-linux",
            parent_evaluation=self.evaluation,
        )

        # Create suggestion and link derivation
        self.suggestion = CVEDerivationClusterProposal.objects.create(
            status=CVEDerivationClusterProposal.Status.PENDING,
            cve_id=self.cve_record.pk,
        )
        DerivationClusterProposalLink.objects.create(
            proposal=self.suggestion,
            derivation=self.derivation,
            provenance_flags=ProvenanceFlags.PACKAGE_NAME_MATCH,
        )

        # Cache the suggestion
        cache_new_suggestions(self.suggestion)
        self.suggestion.refresh_from_db()

    def test_dismiss_requires_comment_htmx(self) -> None:
        """Test that dismissing a suggestion requires a comment (HTMX case)"""
        url = reverse("webview:suggestions_view")

        # Try to dismiss without a comment using HTMX
        response = self.client.post(
            url,
            {
                "suggestion_id": self.suggestion.pk,
                "new_status": "rejected",
                "comment": "",  # Empty comment
            },
            HTTP_HX_REQUEST="true",  # Simulate HTMX request
        )

        # Should return 200 with error_message in context for HTMX
        self.assertEqual(response.status_code, 200)
        self.assertIn("error_message", response.context)
        self.assertEqual(
            response.context["error_message"], "You must provide a dismissal comment"
        )

    def test_dismiss_requires_comment_no_js(self) -> None:
        """Test that dismissing a suggestion requires a comment (no-JS case)"""
        url = reverse("webview:suggestions_view")

        # Try to dismiss without a comment (non-JS behavior)
        response = self.client.post(
            url,
            {
                "suggestion_id": self.suggestion.pk,
                "new_status": "rejected",
                "comment": "",  # Empty comment
                "no-js": "",  # Indicate non-JS mode
            },
        )

        # Should redirect back to the same page
        self.assertEqual(response.status_code, 302)

        # Follow the redirect and check for Django messages
        follow_response = self.client.get(url)
        self.assertEqual(follow_response.status_code, 200)

        # Check that the correct error message was added to Django messages
        messages = list(get_messages(follow_response.wsgi_request))
        self.assertEqual(len(messages), 1)
        self.assertEqual(str(messages[0]), "You must provide a dismissal comment")

        # Verify the suggestion is still in the suggestions view (not dismissed)
        suggestions = follow_response.context["object_list"]
        our_suggestion = next(
            (s for s in suggestions if s.proposal_id == self.suggestion.pk), None
        )
        self.assertIsNotNone(
            our_suggestion, "Suggestion should still be in pending status"
        )

    def test_dismiss_with_comment_succeeds(self) -> None:
        """Test that dismissing with a comment works and the comment appears in the view context"""

        url = reverse("webview:suggestions_view")
        dismissal_comment = (
            "This suggestion is not relevant because the package is deprecated."
        )

        # Dismiss with a comment
        response = self.client.post(
            url,
            {
                "suggestion_id": self.suggestion.pk,
                "new_status": "rejected",
                "comment": dismissal_comment,
            },
        )

        # Should succeed
        self.assertEqual(response.status_code, 200)

        # Verify the suggestion appears in dismissed view with the comment
        dismissed_response = self.client.get(reverse("webview:dismissed_view"))
        self.assertEqual(dismissed_response.status_code, 200)

        # Find the suggestion in the context
        suggestions = dismissed_response.context["object_list"]
        our_suggestion = next(
            (s for s in suggestions if s.proposal_id == self.suggestion.pk), None
        )
        self.assertIsNotNone(our_suggestion)

        # Verify the comment appears in the suggestion context
        suggestion_in_context = dismissed_response.context["object_list"][0].proposal
        self.assertEqual(suggestion_in_context.comment, dismissal_comment)

    def test_accept_without_comment_succeeds(self) -> None:
        """Test that accepting a suggestion without a comment is allowed"""
        url = reverse("webview:suggestions_view")

        # Accept without a comment
        response = self.client.post(
            url,
            {
                "suggestion_id": self.suggestion.pk,
                "new_status": "accepted",
                "comment": "",  # Empty comment
            },
        )

        # Should succeed
        self.assertEqual(response.status_code, 200)

        # Verify the suggestion appears in drafts view
        drafts_response = self.client.get(reverse("webview:drafts_view"))
        self.assertEqual(drafts_response.status_code, 200)

        # Find our suggestion in the context
        suggestions = drafts_response.context["object_list"]
        suggestion = next(
            (s for s in suggestions if s.proposal_id == self.suggestion.pk), None
        )
        self.assertIsNotNone(suggestion)

    def test_accept_with_comment_shows_comment_in_context(self) -> None:
        """Test that accepting with a comment shows the comment in the view context"""
        url = reverse("webview:suggestions_view")
        acceptance_comment = "This looks good, creating draft issue."

        # Accept with a comment
        response = self.client.post(
            url,
            {
                "suggestion_id": self.suggestion.pk,
                "new_status": "accepted",
                "comment": acceptance_comment,
            },
        )

        # Should succeed
        self.assertEqual(response.status_code, 200)

        # Verify the suggestion appears in drafts view with the comment
        drafts_response = self.client.get(reverse("webview:drafts_view"))
        self.assertEqual(drafts_response.status_code, 200)

        # Find the suggestion in the context and verify the comment
        suggestion = drafts_response.context["object_list"][0].proposal
        self.assertEqual(suggestion.comment, acceptance_comment)

    def test_updating_comment_on_existing_suggestion(self) -> None:
        """Test that updating a comment on an existing suggestion works"""
        # First accept with initial comment
        initial_comment = "Initial comment"
        url = reverse("webview:suggestions_view")

        self.client.post(
            url,
            {
                "suggestion_id": self.suggestion.pk,
                "new_status": "accepted",
                "comment": initial_comment,
            },
        )

        # Now update just the comment (no status change)
        updated_comment = "Updated comment with more details"
        drafts_url = reverse("webview:drafts_view")

        response = self.client.post(
            drafts_url,
            {
                "suggestion_id": self.suggestion.pk,
                "comment": updated_comment,
                # No new_status means just updating comment
            },
        )

        # Should succeed
        self.assertEqual(response.status_code, 200)

        # Verify the updated comment appears in the context
        drafts_response = self.client.get(drafts_url)
        self.assertEqual(drafts_response.status_code, 200)

        suggestion = drafts_response.context["object_list"][0].proposal
        self.assertEqual(suggestion.comment, updated_comment)
