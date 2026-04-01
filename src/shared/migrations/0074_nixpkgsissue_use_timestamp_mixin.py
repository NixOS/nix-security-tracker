from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shared', '0073_alter_affectedproduct_default_status_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='nixpkgsissue',
            old_name='created',
            new_name='created_at',
        ),
        migrations.AlterField(
            model_name='nixpkgsissue',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AddField(
            model_name='nixpkgsissue',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
