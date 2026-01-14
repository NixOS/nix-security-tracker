from django.db import migrations
from django.db.models import Count


def delete_invalid(apps, schema_editor):
    CVEDerivationClusterProposal = apps.get_model('shared', 'CVEDerivationClusterProposal')
    DerivationClusterProposalLink = apps.get_model('shared', 'DerivationClusterProposalLink')
    CachedSuggestions = apps.get_model('shared', 'CachedSuggestions')

    # Delete proposals with no derivations
    no_deriv_ids = list(
        CVEDerivationClusterProposal.objects.filter(
            derivations__isnull=True
        ).values_list('id', flat=True)
    )
    CachedSuggestions.objects.filter(proposal_id__in=no_deriv_ids).delete()
    CVEDerivationClusterProposal.objects.filter(id__in=no_deriv_ids).delete()

    # Delete proposals with >1000 derivations
    many_deriv_ids = list(
        CVEDerivationClusterProposal.objects.annotate(
            num_drvs=Count("derivations")
        ).filter(num_drvs__gt=1000).values_list('id', flat=True)
    )
    DerivationClusterProposalLink.objects.filter(proposal_id__in=many_deriv_ids).delete()
    CachedSuggestions.objects.filter(proposal_id__in=many_deriv_ids).delete()
    CVEDerivationClusterProposal.objects.filter(id__in=many_deriv_ids).delete()

    # Delete proposals with no package names
    no_pkg_names = list(
        CVEDerivationClusterProposal.objects.annotate(
            non_null_packages=Count('cve__container__affected__package_name')
        ).filter(non_null_packages=0).values_list('id', flat=True)
    )
    DerivationClusterProposalLink.objects.filter(proposal_id__in=no_pkg_names).delete()
    CachedSuggestions.objects.filter(proposal_id__in=no_pkg_names).delete()
    CVEDerivationClusterProposal.objects.filter(id__in=no_pkg_names).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('shared', '0062_nixderivationdependencythrough_and_more'),
    ]

    operations = [
        migrations.RunPython(delete_invalid, migrations.RunPython.noop),
    ]
