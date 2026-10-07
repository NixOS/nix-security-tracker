import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shared', '0107_packageoverlay_package_packageoverlayevent_package'),
    ]

    operations = [
        migrations.AlterField(
            model_name='packageoverlay',
            name='package',
            field=models.ForeignKey(on_delete=django.db.models.deletion.RESTRICT, related_name='overlays', to='shared.package'),
        ),
    ]
