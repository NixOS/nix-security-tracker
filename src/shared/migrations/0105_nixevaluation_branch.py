import pgtrigger.compiler
import pgtrigger.migrations
from django.db import migrations, models


def migrate_evaluation_branch(apps, schema_editor):
    NixEvaluation = apps.get_model("shared", "NixEvaluation")
    for evaluation in NixEvaluation.objects.select_related(
        "channel__release_branch"
    ).all():
        evaluation.on_branches.add(evaluation.channel.release_branch)


def cleanup_stale_notifications(apps, schema_editor):
    Notification = apps.get_model("pgpubsub", "Notification")
    # Old triggers from previous database schema versions which may be stuck
    Notification.objects.filter(channel="pgpubsub_aa9f7").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("shared", "0104_sha1_commit_constraints"),
    ]

    operations = [
        migrations.AddField(
            model_name="nixevaluation",
            name="on_branches",
            field=models.ManyToManyField(
                related_name="evaluations", to="shared.nixpkgsbranch"
            ),
        ),
        migrations.RunPython(
            code=migrate_evaluation_branch,
            reverse_code=migrations.RunPython.noop,
        ),
        migrations.RemoveField(
            model_name="nixevaluation",
            name="channel",
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name='nixchannel',
            name='pgpubsub_3c4a2',
        ),
        pgtrigger.migrations.RemoveTrigger(
            model_name='nixchannel',
            name='pgpubsub_f33a1',
        ),
        migrations.RunPython(
            code=cleanup_stale_notifications,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
