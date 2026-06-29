import django.db.models.deletion
from django.db import migrations, models


def populate_release_branch(apps, schema_editor):
    NixChannel = apps.get_model("shared", "NixChannel")
    NixpkgsBranch = apps.get_model("shared", "NixpkgsBranch")
    for channel in NixChannel.objects.all():
        branch, _ = NixpkgsBranch.objects.get_or_create(
            name=channel.release_branch_name,
            defaults={
                "repository": channel.repository,
                "head_sha1_commit": channel.head_sha1_commit,
            },
        )
        channel.release_branch = branch
        channel.save(update_fields=["release_branch"])


class Migration(migrations.Migration):

    dependencies = [
        ("shared", "0095_max_matches_exceeded_rejection"),
    ]

    operations = [
        migrations.CreateModel(
            name="NixpkgsBranch",
            fields=[
                (
                    "name",
                    models.CharField(max_length=126, primary_key=True, serialize=False),
                ),
                ("repository", models.CharField(max_length=255)),
                ("head_sha1_commit", models.CharField(max_length=126)),
            ],
        ),
        migrations.RenameField(
            model_name="nixchannel",
            old_name="release_branch",
            new_name="release_branch_name",
        ),
        migrations.AddField(
            model_name="nixchannel",
            name="release_branch",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="channels",
                to="shared.nixpkgsbranch",
            ),
        ),
        migrations.RunPython(
            code=populate_release_branch,
            reverse_code=migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name="nixchannel",
            name="release_branch",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="channels",
                to="shared.nixpkgsbranch",
            ),
        ),
        migrations.RemoveField(
            model_name="nixchannel",
            name="release_branch_name",
        ),
        migrations.RemoveField(
            model_name="nixchannel",
            name="repository",
        ),
    ]
