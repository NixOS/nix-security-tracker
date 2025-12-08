from unittest.mock import patch

from allauth.socialaccount.models import SocialAccount
from django.contrib.auth.models import User
from django.contrib.messages import get_messages
from django.test import Client, TestCase
from django.urls import reverse

from shared.github import create_gh_issue
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
from shared.tests.test_github_sync import MockGithub


class IssueTests(TestCase):
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

    def test_publish_gh_issue_empty_title(self) -> None:
        """Test that creating a GitHub issue will succeed and update the suggestion status, despite empty CVE title"""
        # [tag:test-github-create_issue-title]

        url = reverse("webview:drafts_view")
        # 3/4 of all CVEs in the source data have empty title
        self.cve_container.title = ""
        self.cve_container.save()
        self.suggestion.status = CVEDerivationClusterProposal.Status.ACCEPTED
        self.suggestion.save()
        cache_new_suggestions(self.suggestion)

        # FIXME(@fricklerhandwerk): Mock Github's `create_issue()` here, not our own procedure! [ref:todo-github-connection]
        # Then we can test in-context that the right arguments have been passed, using `mock.assert_called_with()`.
        with patch("webview.views.create_gh_issue") as mock:
            mock.side_effect = lambda *args, **kwargs: create_gh_issue(
                *args,
                github=MockGithub(expected_issue_title="Test description"),  # type: ignore
                **kwargs,
            )

            response = self.client.post(
                url,
                {
                    "suggestion_id": self.suggestion.pk,
                    "new_status": "published",
                    "comment": "",  # Empty comment
                },
            )

        messages = list(get_messages(response.wsgi_request))
        self.assertFalse(
            any(m.level_tag == "error" for m in messages),
            "Errors on issue submission",
        )
        self.suggestion.refresh_from_db()
        self.assertEqual(
            self.suggestion.status,
            CVEDerivationClusterProposal.Status.PUBLISHED,
        )
