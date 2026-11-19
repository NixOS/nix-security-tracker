import django.contrib.postgres.indexes
import django.db.models.functions.text
from django.contrib.postgres.operations import TrigramExtension
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("shared", "0112_githubevent_latest_index"),
    ]

    operations = [
        TrigramExtension(),
        migrations.AddIndex(
            model_name="nixderivation",
            index=django.contrib.postgres.indexes.GinIndex(
                django.contrib.postgres.indexes.OpClass(
                    django.db.models.functions.text.Upper("name"),
                    name="gin_trgm_ops",
                ),
                name="nixderivation_name_trgm_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="nixderivationmeta",
            index=django.contrib.postgres.indexes.BTreeIndex(
                django.db.models.functions.text.Upper("cpe_vendor"),
                django.db.models.functions.text.Upper("cpe_product"),
                name="nixderivationmeta_cpe_upper_idx",
            ),
        ),
        migrations.RemoveIndex(
            model_name="nixderivationmeta",
            name="shared_nixd_cpe_ven_d41f6f_idx",
        ),
    ]
