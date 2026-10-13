from datetime import UTC, datetime

from django.db import migrations
from django.db.models import Exists, OuterRef

BROKEN_SINCE = datetime(2026, 10, 8, tzinfo=UTC)


def delete_untracked_branch_links(apps, schema_editor):
    NixEvaluation = apps.get_model("shared", "NixEvaluation")
    DerivationClusterProposalLink = apps.get_model(
        "shared", "DerivationClusterProposalLink"
    )
    DerivationClusterProposalLinkEvent = apps.get_model(
        "shared", "DerivationClusterProposalLinkEvent"
    )
    PackageClusterProposalLink = apps.get_model("shared", "PackageClusterProposalLink")
    CachedSuggestions = apps.get_model("shared", "CachedSuggestions")

    tracked = NixEvaluation.objects.filter(
        on_branches__channels__state__in=["deprecated", "beta", "stable", "rolling"]
    )
    added_since = DerivationClusterProposalLinkEvent.objects.filter(
        pgh_label="derivations.add",
        pgh_created_at__gte=BROKEN_SINCE,
    ).values("pgh_obj_id")
    flukes = DerivationClusterProposalLink.objects.exclude(
        derivation__parent_evaluation__in=tracked
    ).filter(
        pk__in=added_since,
        proposal__created_at__gte=BROKEN_SINCE,
    )
    affected = list(flukes.values_list("proposal_id", flat=True).distinct())
    flukes.delete()
    PackageClusterProposalLink.objects.filter(proposal_id__in=affected).exclude(
        Exists(
            DerivationClusterProposalLink.objects.filter(
                proposal_id=OuterRef("proposal_id"),
                derivation__package_link__package_id=OuterRef("package_id"),
            )
        )
    ).delete()
    CachedSuggestions.objects.filter(proposal_id__in=affected).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("shared", "0105_nixevaluation_branch"),
    ]

    operations = [
        migrations.RunPython(delete_untracked_branch_links, migrations.RunPython.noop),
    ]
