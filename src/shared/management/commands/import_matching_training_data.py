"""Import matching training-data page files into the local benchmark channel."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import pgtrigger
from django.core.management.base import BaseCommand, CommandError

from shared.matching_training_data import ensure_benchmark_evaluation
from shared.matching_training_data import serializers as mtd


def _positive_int(value: str) -> int:
    parsed = int(value)
    if parsed < 1:
        raise argparse.ArgumentTypeError("must be a positive integer")
    return parsed


def _load_page_files(input_dir: Path) -> list[Path]:
    pages = sorted(input_dir.glob("page-*.json"))
    if not pages:
        raise CommandError(f"No page-*.json files found in {input_dir}")
    return pages


def _load_records(page_path: Path) -> list[dict[str, Any]]:
    try:
        raw = json.loads(page_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise CommandError(f"Failed to read {page_path}") from exc
    if not isinstance(raw, list):
        raise CommandError(f"{page_path} must contain a JSON array of records.")
    return raw


class Command(BaseCommand):
    help = (
        "Import matching training-data records from a fetch output directory "
        "onto the synthetic local benchmark channel."
    )

    def add_arguments(self, parser: argparse.ArgumentParser) -> None:
        parser.add_argument(
            "--input",
            required=True,
            type=Path,
            help="Directory containing page-*.json from fetch_matching_training_data",
        )
        parser.add_argument(
            "--limit",
            type=_positive_int,
            default=None,
            help="Import at most N records (for smoke tests).",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        input_dir: Path = options["input"]
        if not input_dir.is_dir():
            raise CommandError(f"Input directory does not exist: {input_dir}")

        limit: int | None = options["limit"]
        pages = _load_page_files(input_dir)
        imported = 0

        # Quiet the import: pgpubsub insert triggers would otherwise enqueue
        # cache/linkage notifications for every synthetic proposal.
        with pgtrigger.ignore():
            ensure_benchmark_evaluation()
            for page_path in pages:
                page_records = _load_records(page_path)
                for raw in page_records:
                    if limit is not None and imported >= limit:
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"Imported {imported} record(s) (--limit reached)."
                            )
                        )
                        return

                    cve_id = raw["cve_id"]
                    try:
                        serializer = mtd.CVEDerivationClusterProposal(data=raw)
                        serializer.is_valid(raise_exception=True)
                        serializer.save()
                    except Exception as exc:
                        raise CommandError(
                            f"Failed importing {cve_id} from {page_path.name}"
                        ) from exc

                    imported += 1
                self.stdout.write(
                    f"Imported {len(page_records)} record(s) from {page_path.name} "
                    f"({imported} total)"
                )

        self.stdout.write(
            self.style.SUCCESS(f"Imported {imported} record(s) from {input_dir}")
        )
