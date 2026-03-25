from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shared', '0099_remove_cpe_cpe_search_vector_idx_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='maintaineroverlay',
            old_name='overlay_type',
            new_name='type',
        ),
        migrations.RenameField(
            model_name='maintaineroverlayevent',
            old_name='overlay_type',
            new_name='type',
        ),
        migrations.RenameField(
            model_name='packageoverlay',
            old_name='overlay_type',
            new_name='type',
        ),
        migrations.RenameField(
            model_name='packageoverlayevent',
            old_name='overlay_type',
            new_name='type',
        ),

        migrations.AlterField(
            model_name='packageoverlay',
            name='type',
            field=models.CharField(choices=[('additional', 'additional'), ('ignored', 'ignored')], max_length=126),
        ),
        migrations.AlterField(
            model_name='packageoverlayevent',
            name='type',
            field=models.CharField(choices=[('additional', 'additional'), ('ignored', 'ignored')], max_length=126),
        ),
        migrations.AlterField(
            model_name='referenceurloverlay',
            name='type',
            field=models.CharField(choices=[('additional', 'additional'), ('ignored', 'ignored')], max_length=126),
        ),
        migrations.AlterField(
            model_name='referenceurloverlayevent',
            name='type',
            field=models.CharField(choices=[('additional', 'additional'), ('ignored', 'ignored')], max_length=126),
        ),
    ]
