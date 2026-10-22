import django.db.models.deletion
from django.db import migrations, models, transaction
from django.db.models import OuterRef, Subquery

BATCH_SIZE = 10000


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
    # If there's overlays left over that don't have a link at this point, they're orphans from garbage-collected derivations on old untriaged suggestions.
    PackageOverlay.objects.filter(package__isnull=True).delete()


def link_events_to_packages(apps, schema_editor):
    """
    Link existing package overlay events to the package of their attribute.
    Events whose attribute has no package are left unlinked.
    """
    PackageOverlayEvent = apps.get_model("shared", "PackageOverlayEvent")
    PackageAttrpath = apps.get_model("shared", "PackageAttrpath")
    pending = PackageOverlayEvent.objects.filter(package__isnull=True).order_by(
        "pgh_id"
    )
    package_id = Subquery(
        PackageAttrpath.objects.filter(attrpath=OuterRef("package_attribute")).values(
            "package_id"
        )[:1]
    )

    last_id = 0
    while True:
        batch = list(
            pending.filter(pgh_id__gt=last_id).values_list("pgh_id", flat=True)[
                :BATCH_SIZE
            ]
        )
        if not batch:
            break
        with transaction.atomic(using=schema_editor.connection.alias):
            schema_editor.execute(
                "ALTER TABLE shared_packageoverlayevent DISABLE TRIGGER ALL"
            )
            PackageOverlayEvent.objects.filter(pgh_id__in=batch).update(
                package_id=package_id
            )
            schema_editor.execute(
                "ALTER TABLE shared_packageoverlayevent ENABLE TRIGGER ALL"
            )
        last_id = batch[-1]


def delete_orphan_events(apps, schema_editor):
    """
    Delete package overlay events whose attribute has no package.
    Their suggestion or its matched derivations were garbage-collected, so nothing refers to them any more.
    """
    PackageOverlayEvent = apps.get_model("shared", "PackageOverlayEvent")
    with transaction.atomic(using=schema_editor.connection.alias):
        schema_editor.execute(
            "ALTER TABLE shared_packageoverlayevent DISABLE TRIGGER ALL"
        )
        PackageOverlayEvent.objects.filter(package__isnull=True).delete()
        schema_editor.execute(
            "ALTER TABLE shared_packageoverlayevent ENABLE TRIGGER ALL"
        )


class Migration(migrations.Migration):
    # Event batches commit separately instead of in one long transaction.
    atomic = False

    dependencies = [
        ('shared', '0106_delete_untracked_branch_links'),
    ]

    operations = [
        migrations.AddField(
            model_name='packageoverlay',
            name='package',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.RESTRICT, related_name='overlays', to='shared.package'),
        ),
        migrations.AddField(
            model_name='packageoverlayevent',
            name='package',
            field=models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', related_query_name='+', to='shared.package'),
        ),
        migrations.RunPython(
            code=link_overlays_to_packages,
            reverse_code=migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name='packageoverlay',
            name='package',
            field=models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='overlays', to='shared.package'),
        ),
        migrations.RunPython(
            code=link_events_to_packages,
            reverse_code=migrations.RunPython.noop,
        ),
        migrations.RunPython(
            code=delete_orphan_events,
            reverse_code=migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name='packageoverlayevent',
            name='package',
            field=models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='+', related_query_name='+', to='shared.package'),
        ),
    ]
