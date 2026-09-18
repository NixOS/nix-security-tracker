from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("shared", "0102_add_matching_training_data_group"),
    ]

    operations = [
        migrations.AddField(
            model_name="nixderivationmeta",
            name="cpe_product",
            field=models.CharField(max_length=2048, null=True),
        ),
        migrations.AddField(
            model_name="nixderivationmeta",
            name="cpe_vendor",
            field=models.CharField(max_length=512, null=True),
        ),
        migrations.AddIndex(
            model_name="nixderivationmeta",
            index=models.Index(
                fields=["cpe_vendor", "cpe_product"],
                name="shared_nixd_cpe_ven_d41f6f_idx",
            ),
        ),
    ]
