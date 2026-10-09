from django.db import migrations
from django.db.models import OuterRef, Subquery


def link_overlays_to_packages(apps, schema_editor):
    """Link existing package overlays to the package of their attribute."""
    PackageOverlay = apps.get_model("shared", "PackageOverlay")
    PackageAttrpath = apps.get_model("shared", "PackageAttrpath")
    PackageOverlay.objects.filter(package__isnull=True).update(
        package_id=Subquery(
            PackageAttrpath.objects.filter(
                attrpath=OuterRef("package_attribute")
            ).values("package_id")[:1]
        )
    )


class Migration(migrations.Migration):

    dependencies = [
        ('shared', '0105_nixevaluation_branch'),
    ]

    operations = [
        migrations.RunPython(
            code=link_overlays_to_packages,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
