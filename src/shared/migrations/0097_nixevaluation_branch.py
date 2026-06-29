import django.db.models.deletion
from django.db import migrations, models


def migrate_evaluation_branch(apps, schema_editor):
    NixEvaluation = apps.get_model("shared", "NixEvaluation")
    for evaluation in NixEvaluation.objects.select_related(
        "channel__release_branch"
    ).all():
        evaluation.branch = evaluation.channel.release_branch
        evaluation.save(update_fields=["branch_id"])


class Migration(migrations.Migration):

    dependencies = [
        ("shared", "0096_nixpkgsbranch_nixchannel_release_branch"),
    ]

    operations = [
        migrations.AddField(
            model_name="nixevaluation",
            name="branch",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="evaluations",
                to="shared.nixpkgsbranch",
            ),
        ),
        migrations.RunPython(
            code=migrate_evaluation_branch,
            reverse_code=migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name="nixevaluation",
            name="branch",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="evaluations",
                to="shared.nixpkgsbranch",
            ),
        ),
        migrations.RemoveConstraint(
            model_name="nixevaluation",
            name="nixevaluation_commit_sha1_unique",
        ),
        migrations.AlterUniqueTogether(
            name="nixevaluation",
            unique_together={("branch", "commit_sha1")},
        ),
        migrations.RemoveField(
            model_name="nixevaluation",
            name="channel",
        ),
    ]
