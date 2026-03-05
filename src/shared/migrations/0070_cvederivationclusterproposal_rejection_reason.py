from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("shared", "0069_remove_nixderivation_dependencies_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="cvederivationclusterproposal",
            name="rejection_reason",
            field=models.CharField(
                blank=True,
                choices=[
                    ("exclusively_hosted_service", "exclusively hosted service"),
                ],
                help_text="Machine-generated reason for automatic rejection",
                max_length=126,
                null=True,
            ),
        ),
    ]
