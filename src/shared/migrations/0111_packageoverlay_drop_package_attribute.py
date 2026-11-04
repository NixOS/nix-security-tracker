from django.db import migrations, models
from django.db.models import Min


def dedupe_package_overlays(apps, schema_editor):
    """
    Keep one overlay per package and suggestion.
    """
    PackageOverlay = apps.get_model("shared", "PackageOverlay")
    keep = (
        PackageOverlay.objects.values("suggestion_id", "package_id")
        .annotate(keep=Min("pk"))
        .values_list("keep", flat=True)
    )
    PackageOverlay.objects.exclude(pk__in=keep).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("shared", "0110_githubsyncerror"),
    ]

    operations = [
        migrations.RunPython(code=dedupe_package_overlays),
        migrations.RemoveConstraint(
            model_name="packageoverlay",
            name="unique_package_overlay_per_suggestion",
        ),
        migrations.AddConstraint(
            model_name="packageoverlay",
            constraint=models.UniqueConstraint(
                fields=("suggestion", "package"),
                name="unique_package_overlay_per_suggestion",
            ),
        ),
        migrations.RemoveField(
            model_name="packageoverlay",
            name="package_attribute",
        ),
        migrations.RemoveField(
            model_name="packageoverlayevent",
            name="package_attribute",
        ),
    ]
