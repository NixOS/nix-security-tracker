import django.db.models.deletion
import pgtrigger.compiler
import pgtrigger.migrations
from django.db import migrations, models
from collections import defaultdict

def migrate_reference_overlays(apps, schema_editor):
    """
    Migrate ReferenceOverlay data to ReferenceUrlOverlay.
    This deduplicates ReferenceOverlays.
    For a given suggestion, we introduce a ReferenceUrlOverlay only if there existed corresponding ReferenceOverlays for ALL the references sharing a given url.
    """
    ReferenceOverlay = apps.get_model('shared', 'ReferenceOverlay')
    ReferenceUrlOverlay = apps.get_model('shared', 'ReferenceUrlOverlay')
    Reference = apps.get_model('shared', 'Reference')
    
    # Group by (suggestion_id, url) to deduplicate while keeping track of original overlays
    url_overlays = defaultdict(lambda: {"type": None, "deduplicated_name": "", "suggestion": None, "overlay_refs": set()})
    
    for overlay in ReferenceOverlay.objects.select_related('reference', 'suggestion'):
        key = (overlay.suggestion.id, overlay.reference.url)
        data = url_overlays[key]

        data["overlay_refs"].add(overlay.reference.id) # type: ignore[attr-defined]
        
        if data["type"] is None:
            # Set data from first overlay
            data["type"] = overlay.type
            data["deduplicated_name"] = overlay.reference.name
            data["suggestion"] = overlay.suggestion
        elif overlay.reference.name and data["deduplicated_name"] != overlay.reference.name:
            # Empty name in case of name mismatches
            data["deduplicated_name"] = ""
    
    # Creation of the reference url overlays
    for (_, url), data in url_overlays.items():
        # Get all references for this suggestion that have this URL
        all_refs_with_url = set(Reference.objects.filter(
            container__cve=data["suggestion"].cve, # type: ignore[attr-defined]
            url=url
        ).values_list('id', flat=True))
        
        # Only create the ignore ReferenceUrlOverlay if ALL references with this URL have overlays
        if data["overlay_refs"] == all_refs_with_url:
            ReferenceUrlOverlay.objects.create(
                type=data["type"],
                reference_url=url,
                deduplicated_name=data["deduplicated_name"],
                suggestion=data["suggestion"],
            )


class Migration(migrations.Migration):

    dependencies = [
        ('pghistory', '0007_auto_20250421_0444'),
        ('shared', '0080_rename_edit_type_maintaineroverlay_overlay_type_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='ReferenceUrlOverlay',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type', models.CharField(choices=[('ignored', 'ignored')], max_length=126)),
                ('reference_url', models.URLField(blank=True, max_length=2048)),
                ('deduplicated_name', models.CharField(blank=True, max_length=512)),
                ('suggestion', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reference_url_overlays', to='shared.cvederivationclusterproposal')),
            ],
        ),

        migrations.AddConstraint(
            model_name='referenceurloverlay',
            constraint=models.UniqueConstraint(fields=('suggestion', 'reference_url'), name='unique_reference_url_overlay_per_suggestion'),
        ),

        # Migrate data from old to new structure
        migrations.RunPython(
            migrate_reference_overlays,
            # This migration is about deduplicating. Information will be lost and there is no way to reverse.
        ),

        migrations.CreateModel(
            name='ReferenceUrlOverlayEvent',
            fields=[
                ('pgh_id', models.AutoField(primary_key=True, serialize=False)),
                ('pgh_created_at', models.DateTimeField(auto_now_add=True)),
                ('pgh_label', models.TextField(help_text='The event label.')),
                ('id', models.BigIntegerField()),
                ('type', models.CharField(choices=[('ignored', 'ignored')], max_length=126)),
                ('reference_url', models.URLField(blank=True, max_length=2048)),
                ('deduplicated_name', models.CharField(blank=True, max_length=512)),
                ('pgh_context', models.ForeignKey(db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='pghistory.context')),
                ('pgh_obj', models.ForeignKey(db_constraint=False, on_delete=django.db.models.deletion.DO_NOTHING, related_name='events', to='shared.referenceurloverlay')),
                ('suggestion', models.ForeignKey(db_constraint=False, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', related_query_name='+', to='shared.cvederivationclusterproposal')),
            ],
            options={
                'abstract': False,
            },
        ),

        migrations.RemoveField(
            model_name='referenceoverlayevent',
            name='pgh_obj',
        ),
        migrations.RemoveField(
            model_name='referenceoverlayevent',
            name='pgh_context',
        ),
        migrations.RemoveField(
            model_name='referenceoverlayevent',
            name='reference',
        ),
        migrations.RemoveField(
            model_name='referenceoverlayevent',
            name='suggestion',
        ),

        migrations.DeleteModel(
            name='ReferenceOverlay',
        ),
        migrations.DeleteModel(
            name='ReferenceOverlayEvent',
        ),
        pgtrigger.migrations.AddTrigger(
            model_name='referenceurloverlayevent',
            trigger=pgtrigger.compiler.Trigger(name='append_only', sql=pgtrigger.compiler.UpsertTriggerSql(func="RAISE EXCEPTION 'pgtrigger: Cannot update or delete rows from % table', TG_TABLE_NAME;", hash='42ebeb9c48651b6e4e88c58a2a376aab61d19ceb', operation='UPDATE OR DELETE', pgid='pgtrigger_append_only_b33b2', table='shared_referenceurloverlayevent', when='BEFORE')),
        ),
    ]
