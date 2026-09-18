"""Fetch curated matching training-data pages from a tracker API."""

from __future__ import annotations

import argparse
import json
import os
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import requests
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.urls import reverse

from shared.matching_training_data import SCHEMA_VERSION

TOKEN_ENV = "MATCHING_TRAINING_DATA_TOKEN"


def _resolve_token(cli_token: str | None) -> str:
    token = cli_token or os.environ.get(TOKEN_ENV)
    if not token:
        raise CommandError(
            f"Provide --token or set the {TOKEN_ENV} environment variable."
        )
    return token


def _page_size(value: str) -> int:
    page_size = int(value)
    if page_size < 1 or page_size > 100:
        raise argparse.ArgumentTypeError("--page-size must be between 1 and 100.")
    return page_size


def _positive_int(value: str) -> int:
    parsed = int(value)
    if parsed < 1:
        raise argparse.ArgumentTypeError("must be a positive integer")
    return parsed


def _endpoint(base_url: str) -> str:
    parsed = urlparse(base_url.rstrip("/") + "/")
    if not parsed.scheme or not parsed.netloc:
        raise CommandError(f"Invalid --base-url: {base_url!r}")
    return parsed._replace(
        path=reverse("matching-training-data"),
        params="",
        query="",
        fragment="",
    ).geturl()


def _ensure_empty_output_dir(output_dir: Path) -> None:
    """Create output_dir if needed; refuse to write into a nonempty directory."""
    output_dir.mkdir(parents=True, exist_ok=True)
    if any(output_dir.iterdir()):
        raise CommandError(
            f"Output directory is not empty: {output_dir}. "
            "Choose an empty directory or remove existing files first."
        )


class Command(BaseCommand):
    help = (
        "Download paginated matching training-data records from a tracker "
        "instance into a local directory."
    )

    def add_arguments(self, parser: argparse.ArgumentParser) -> None:
        parser.add_argument(
            "--base-url",
            default="https://tracker.security.nixos.org",
            help="Tracker base URL. Defaults to the official deployment.",
        )
        parser.add_argument(
            "--output",
            required=True,
            type=Path,
            help="Empty directory to write page-*.json and manifest.json into",
        )
        parser.add_argument(
            "--token",
            default=None,
            help=(
                "Knox API token for a matching_training_data group member. "
                f"Defaults to ${TOKEN_ENV}."
            ),
        )
        parser.add_argument(
            "--page-size",
            type=_page_size,
            default=100,
            help="Page size to request (API max is 100). Default: 100.",
        )
        parser.add_argument(
            "--limit",
            type=_positive_int,
            default=None,
            help="Stop after writing at most N records (for smoke tests).",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        token = _resolve_token(options["token"])
        page_size: int = options["page_size"]
        limit: int | None = options["limit"]
        output_dir: Path = options["output"]
        _ensure_empty_output_dir(output_dir)

        url = _endpoint(options["base_url"])
        params: dict[str, Any] | None = {"page": 1, "page_size": page_size}

        total_count: int | None = None
        pages_written = 0
        records_written = 0

        while True:
            response = requests.get(
                url,
                headers={"Authorization": f"Bearer {token}"},
                params=params,
                timeout=settings.NETWORK_REQUEST_TIMEOUT,
            )

            if response.status_code != 200:
                raise CommandError(
                    f"HTTP {response.status_code} fetching training data: "
                    f"{response.text}"
                )

            try:
                payload = response.json()
            except ValueError as exc:
                raise CommandError("Response was not valid JSON.") from exc

            results = payload.get("results")
            if not isinstance(results, list):
                raise CommandError("Unexpected response shape: missing results list.")

            if total_count is None:
                total_count = int(payload.get("count") or 0)

            if limit is not None:
                remaining = limit - records_written
                if remaining <= 0:
                    break
                results = results[:remaining]

            pages_written += 1
            page_path = output_dir / f"page-{pages_written:05d}.json"
            page_path.write_text(
                json.dumps(results, indent=2, sort_keys=True) + "\n",
                encoding="utf-8",
            )
            records_written += len(results)

            self.stdout.write(
                f"Wrote {page_path.name} "
                f"({len(results)} records; {records_written}/{total_count})"
            )

            if limit is not None and records_written >= limit:
                break

            next_url = payload.get("next")
            if next_url and results:
                url = next_url
                # Absolute next URLs already encode page/page_size.
                params = None
            else:
                break

        manifest: dict[str, Any] = {
            "schema_version": SCHEMA_VERSION,
            "count": records_written,
            "pages": pages_written,
            "base_url": options["base_url"].rstrip("/"),
            "page_size": page_size,
            "fetched_at": datetime.now(UTC).isoformat(),
        }
        if limit is not None:
            manifest["limit"] = limit
        if total_count is not None and total_count != records_written:
            manifest["total_available"] = total_count

        manifest_path = output_dir / "manifest.json"
        manifest_path.write_text(
            json.dumps(manifest, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Fetched {records_written} records across {pages_written} page(s) "
                f"into {output_dir}"
            )
        )
