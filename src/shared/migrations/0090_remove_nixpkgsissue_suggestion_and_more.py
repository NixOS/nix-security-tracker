import logging

import django.db.models.deletion
from django.db import migrations, models

logger = logging.getLogger(__name__)


def migrate_suggestion_fk_forward(apps, schema_editor):
    """
    Copy the old one-to-one NixpkgsIssue.suggestion FK into the new
    CVEDerivationClusterProposal.nixpkgs_issue FK.
    """
    NixpkgsIssue = apps.get_model("shared", "NixpkgsIssue")
    for issue in NixpkgsIssue.objects.select_related("suggestion").all():
        if issue.suggestion is not None:
            issue.suggestion.nixpkgs_issue = issue
            issue.suggestion.save(update_fields=["nixpkgs_issue"])


def migrate_suggestion_fk_reverse(apps, schema_editor):
    """
    Restore the old NixpkgsIssue.suggestion FK from the new
    CVEDerivationClusterProposal.nixpkgs_issue FK.

    If an issue has exactly one suggestion the binding is restored exactly.
    If an issue has several suggestions, the first one is picked and a warning
    is logged, because the old schema could only store one.
    """
    NixpkgsIssue = apps.get_model("shared", "NixpkgsIssue")
    CVEDerivationClusterProposal = apps.get_model(
        "shared", "CVEDerivationClusterProposal"
    )
    for issue in NixpkgsIssue.objects.all():
        suggestions = list(
            CVEDerivationClusterProposal.objects.filter(nixpkgs_issue=issue)
        )
        if not suggestions:
            continue
        if len(suggestions) > 1:
            logger.warning(
                "NixpkgsIssue pk=%d has %d suggestions; only the first will be "
                "restored to the old 'suggestion' FK — the rest will be lost.",
                issue.pk,
                len(suggestions),
            )
        issue.suggestion = suggestions[0]
        issue.save(update_fields=["suggestion"])


class Migration(migrations.Migration):

    dependencies = [
        ('shared', '0089_remove_nixderivationmeta_description_search_vector_idx_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='cvederivationclusterproposal',
            name='in_issue_draft',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='nixpkgsissue',
            name='title',
            field=models.CharField(default='', max_length=500),
        ),
        migrations.AddField(
            model_name='cvederivationclusterproposal',
            name='nixpkgs_issue',
            field=models.ForeignKey(null=True, blank=True, on_delete=django.db.models.deletion.SET_NULL, related_name='suggestions', to='shared.nixpkgsissue'),
        ),
        migrations.RunPython(
            migrate_suggestion_fk_forward,
            reverse_code=migrate_suggestion_fk_reverse,
        ),
        migrations.RemoveField(
            model_name='nixpkgsissue',
            name='suggestion',
        ),
    ]

