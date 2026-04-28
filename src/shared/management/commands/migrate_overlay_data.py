import logging
from typing import Any

from django.core.management.base import BaseCommand
from django.db import connection

from shared.models import (
    MaintainerOverlay,
    MaintainerOverlayEvent,
    PackageOverlay,
    PackageOverlayEvent,
)

logger = logging.getLogger(__name__)


def migrate_records(migration: dict) -> None:
    model = migration["class"]
    data_mapping = migration["data_mapping"]
    model_id = migration["model_id"]
    field_to_update = migration["field_to_update"]
    table_name = model._meta.db_table

    print(f"Running data migration for {table_name}")

    if migration["is_event_table"]:
        with connection.cursor() as cursor:
            # Disable the append-only trigger as we have "append-only" trigger
            # that prevents updates and deletes.
            # let temporarily disable it for the migration.
            cursor.execute(f"ALTER TABLE {table_name} DISABLE TRIGGER ALL")

    try:
        for old_data, new_data in data_mapping.items():
            print(f"Migration {old_data} -> {new_data}")
            total_updated = 0
            batch_size = 1000

            while True:
                batch_ids = list(
                    model.objects.filter(**{field_to_update: old_data}).values_list(
                        model_id, flat=True
                    )[:batch_size]
                )
                if not batch_ids:
                    break

                updated = model.objects.filter(**{f"{model_id}__in": batch_ids}).update(
                    **{field_to_update: new_data}
                )
                total_updated += updated
                print(f"Total number of record updated {total_updated}")

            print(
                f"\n Completed Migration for: {old_data} -> {new_data} - ({total_updated} rows)"
            )
    finally:
        # re-enabling the trigger back.
        if migration["is_event_table"]:
            with connection.cursor() as cursor:
                cursor.execute(f"ALTER TABLE {table_name} ENABLE TRIGGER ALL")


class Command(BaseCommand):
    help = "Migrate data of overlay records"

    def handle(self, *args: Any, **kwargs: Any) -> None:
        migration_mapping = [
            {
                "class": MaintainerOverlay,
                "model_id": "id",
                "field_to_update": "overlay_type",
                "data_mapping": {"add": "additional", "remove": "ignored"},
                "is_event_table": False,
            },
            {
                "class": PackageOverlay,
                "model_id": "id",
                "field_to_update": "overlay_type",
                "data_mapping": {"remove": "ignored"},
                "is_event_table": False,
            },
            {
                "class": MaintainerOverlayEvent,
                "model_id": "pgh_id",
                "field_to_update": "overlay_type",
                "data_mapping": {"add": "additional", "remove": "ignored"},
                "is_event_table": True,
            },
            {
                "class": PackageOverlayEvent,
                "model_id": "pgh_id",
                "field_to_update": "overlay_type",
                "data_mapping": {"remove": "ignored"},
                "is_event_table": True,
            },
            {
                "class": MaintainerOverlayEvent,
                "model_id": "pgh_id",
                "field_to_update": "pgh_label",
                "data_mapping": {
                    "maintainers.add": "maintainer.add",
                    "maintainers.remove": "maintainer.delete",
                },
                "is_event_table": True,
            },
            {
                "class": PackageOverlayEvent,
                "model_id": "pgh_id",
                "field_to_update": "pgh_label",
                "data_mapping": {
                    "package.add": "package.restore",
                    "package.remove": "package.ignore",
                },
                "is_event_table": True,
            },
        ]

        print("Starting migration process.")

        for migration in migration_mapping:
            migrate_records(migration)

        print("Completed full migration successfully")
