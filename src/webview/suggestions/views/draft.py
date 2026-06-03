import logging

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import transaction
from django.http import HttpRequest, HttpResponse, HttpResponseForbidden
from django.shortcuts import redirect
from django.urls import reverse
from django.views import View

from shared.auth import user_can_edit_suggestion
from shared.models.issue import NixpkgsIssue
from shared.models.linkage import CVEDerivationClusterProposal

logger = logging.getLogger(__name__)


class ResetIssueDraftView(LoginRequiredMixin, View):
    """Remove all suggestions from the issue draft."""

    http_method_names = ["post"]

    def post(self, request: HttpRequest) -> HttpResponse:
        if not user_can_edit_suggestion(request.user):
            return HttpResponseForbidden()

        CVEDerivationClusterProposal.objects.filter(in_issue_draft=True).update(
            in_issue_draft=False
        )

        return redirect(reverse("webview:suggestion:issue_draft"))


class PublishIssueDraftView(LoginRequiredMixin, View):
    """Publish all bundled suggestions as a single NixpkgsIssue."""

    http_method_names = ["post"]

    def post(self, request: HttpRequest) -> HttpResponse:
        if not user_can_edit_suggestion(request.user):
            return HttpResponseForbidden()

        title = request.POST.get("issue_title", "").strip()
        if not title:
            messages.error(request, "An issue title is required.")
            return redirect(reverse("webview:suggestion:issue_draft"))

        suggestions = list(
            CVEDerivationClusterProposal.objects.filter(
                in_issue_draft=True
            ).select_related("cached")
        )
        if not suggestions:
            messages.error(request, "Cannot publish an empty issue")
            return redirect(reverse("webview:suggestion:issue_draft"))

        try:
            with transaction.atomic():
                issue = NixpkgsIssue.create_nixpkgs_issue(suggestions, title)
                issue.publish()
                CVEDerivationClusterProposal.objects.filter(
                    pk__in=[s.pk for s in suggestions]
                ).update(
                    status=CVEDerivationClusterProposal.Status.PUBLISHED,
                    in_issue_draft=False,
                )
        except Exception:
            logger.exception("Failed to publish issue draft")
            messages.error(request, "Failed to publish the issue draft.")
            return redirect(reverse("webview:suggestion:issue_draft"))

        return redirect(reverse("webview:issue_detail", kwargs={"code": issue.code}))
