import django.db.models.deletion
from django.db import migrations, models


def populate_release_branch(apps, schema_editor):
    NixChannel = apps.get_model("shared", "NixChannel")
    NixpkgsBranch = apps.get_model("shared", "NixpkgsBranch")
    for channel in NixChannel.objects.all():
        branch, _ = NixpkgsBranch.objects.get_or_create(
            name=channel.release_branch_name,
            defaults={"head_sha1_commit": channel.head_sha1_commit},
        )
        channel.release_branch = branch
        channel.save(update_fields=["release_branch"])


class Migration(migrations.Migration):

    dependencies = [
        ("shared", "0100_rename_overlay_type_column_to_type_column"),
    ]

    operations = [
        migrations.CreateModel(
            name="NixpkgsBranch",
            fields=[
                (
                    "name",
                    models.CharField(max_length=126, primary_key=True, serialize=False),
                ),
                ("head_sha1_commit", models.CharField(max_length=40)),
            ],
            options={
                "constraints": [
                    models.CheckConstraint(
                        check=models.Q(head_sha1_commit__regex="^[0-9a-f]{40}$"),
                        name="nixpkgsbranch_head_sha1_commit_valid",
                    )
                ]
            },
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
        # The table has triggers registered.
        # Altering it within the migration will defer them to after the transaction, thus failing the whole thing.
        migrations.RunSQL("ALTER TABLE shared_nixchannel DISABLE TRIGGER USER"),
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
        migrations.RunSQL("ALTER TABLE shared_nixchannel ENABLE TRIGGER USER"),
    ]
