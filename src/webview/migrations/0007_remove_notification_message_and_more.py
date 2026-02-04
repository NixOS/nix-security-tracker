import django.db.models.deletion
from django.db import migrations, models


def migrate_notifications_to_text(apps, schema_editor):
    # XXX(@fricklerhandwerk): Raw SQL here because moving data to a subclass calls `save()` on the parent, expecting parent fields on the child object.
    # Those aren't populated when we create a new `TextNotification()` though, and instead of copying them manually we can just set the fields in SQL directly.
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO webview_textnotification (notification_ptr_id, title, message)
            SELECT n.id, n._title, n._message
            FROM webview_notification n
            WHERE NOT EXISTS (
                SELECT 1 FROM webview_suggestionnotification s
                WHERE s.notification_ptr_id = n.id
            )
        """)


def reverse_migration(apps, schema_editor):
    Notification = apps.get_model('webview', 'Notification')
    TextNotification = apps.get_model('webview', 'TextNotification')

    for text_notif in TextNotification.objects.all():
        Notification.objects.filter(pk=text_notif.pk).update(
            _title=text_notif.title,
            _message=text_notif.message,
        )


class Migration(migrations.Migration):
    dependencies = [
        ('webview', '0006_suggestionnotification'),
    ]

    operations = [
        migrations.RenameField(
            model_name='notification',
            old_name='title',
            new_name='_title',
        ),
        migrations.RenameField(
            model_name='notification',
            old_name='message',
            new_name='_message',
        ),
        migrations.CreateModel(
            name='TextNotification',
            fields=[
                ('notification_ptr', models.OneToOneField(auto_created=True, on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='webview.notification')),
                ('title', models.CharField(max_length=255)),
                ('message', models.TextField()),
            ],
            options={
                'abstract': False,
            },
            bases=('webview.notification',),
        ),
        migrations.RunPython(migrate_notifications_to_text, reverse_migration),
        migrations.RemoveField(
            model_name='notification',
            name='_title',
        ),
        migrations.RemoveField(
            model_name='notification',
            name='_message',
        ),
    ]
