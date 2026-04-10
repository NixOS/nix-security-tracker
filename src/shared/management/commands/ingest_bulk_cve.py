import argparse
import json
import logging
import shutil
import tempfile
import zipfile
from datetime import date
from glob import glob
from os import mkdir, path
from typing import Any

import requests
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from github.GitRelease import GitRelease

from shared.fetchers import make_cve
from shared.github import get_gh
from shared.models import CveIngestion

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Ingest CVEs in bulk using the Mitre CVE repo"

    def add_arguments(self, parser: argparse.ArgumentParser) -> None:
        parser.add_argument(
            "-f",
            "--from",
            dest="from_date",
            type=date.fromisoformat,
            help="Start date (including) for CVE ingestion (YYYY-MM-DD).",
            default=date.min,
        )
        parser.add_argument(
            "-t",
            "--to",
            dest="to_date",
            type=date.fromisoformat,
            help="End date (including) for CVE ingestion (YYYY-MM-DD).",
            default=date.today(),
        )
        parser.add_argument(
            "--force-download",
            action="store_true",
            help="Ignore the local data cache content and download the CVEs zip again.",
        )

    def _get_release(self) -> GitRelease:
        # Initialize a GitHub connection
        g = get_gh()

        # Select the CVEList repository
        repo = g.get_repo("CVEProject/cvelistV5")

        # Fetch the latest daily release
        release = repo.get_latest_release()
        logger.info(f"Fetched latest release: {release.title}")
        return release

    def _download_gh_bundle(self, data_cache_dir: str, release: GitRelease) -> None:
        # Get the bulk cve list asset
        bundle = release.assets[0]

        if not bundle.name.endswith(".zip"):
            logger.error(f"Wrong bundle asset: {bundle.name}")

            raise CommandError("Unable to get bundled CVEs.")

        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_arc = f"{tmp_dir}/cves.zip.zip"

            # Download the zip file
            logger.info(f"Downloading the bundle: {bundle.name}")
            r = requests.get(bundle.browser_download_url)

            if r.status_code != 200:
                raise CommandError(
                    f"Unable to download the bundle, error {r.status_code}"
                )

            with open(tmp_arc, "wb") as fz:
                fz.write(r.content)

            # Extract the archive into $DATA_CACHE_DIR
            with zipfile.ZipFile(tmp_arc) as z_arc:
                logger.info("Extract the first archive to cves.zip")

                z_arc.extractall(path=tmp_dir)

            with zipfile.ZipFile(f"{tmp_dir}/cves.zip") as z_arc:
                logger.info("Extract the second archive to cves")

                z_arc.extractall(path=data_cache_dir)

    def _set_cve_data_cache_dir(self) -> tuple[str, str]:
        data_cache_dir = settings.CVE_CACHE_DIR

        if not path.exists(data_cache_dir):
            mkdir(path.join(data_cache_dir))

        return data_cache_dir, path.join(data_cache_dir, "cves")

    def handle(self, *args: str, **kwargs: Any) -> None:  # pyright: ignore reportUnusedVariable
        data_cache_dir, cve_data_cache_dir = self._set_cve_data_cache_dir()
        release = self._get_release()
        try:
            v_date = date.fromisoformat(release.tag_name.split("_")[1])
        except (IndexError, ValueError) as e:
            raise CommandError(f"Invalid tag_name format: {release.tag_name!r}\n{e}")

        # delete if force-download
        if kwargs["force_download"] and path.exists(cve_data_cache_dir):
            shutil.rmtree(cve_data_cache_dir)

        if not path.exists(cve_data_cache_dir):
            self._download_gh_bundle(data_cache_dir, release)

        # Traverse the tree and import cves if they already exist
        # Return the list in lexicographical order
        cve_list = sorted(glob(f"{cve_data_cache_dir}/*/*/*.json"), key=path.basename)

        from_date: date = kwargs["from_date"]
        to_date: date = kwargs["to_date"]

        if from_date > to_date:
            raise CommandError(
                f"Invalid date range: --from ({from_date}) is after --to ({to_date})"
            )

        # Open a single transaction for the db
        with transaction.atomic():
            count = 0
            for j_cve in cve_list:
                name = path.basename(j_cve)
                # Fast-path: Skip files based on year in filename (CVE-YYYY-XXXX.json)
                try:
                    cve_year = int(name.split("-")[1])
                    if cve_year < from_date.year or cve_year > to_date.year:
                        continue
                except IndexError as e:
                    self.stderr.write(
                        f"Could not split year field from CVE ID '{name}': {e}"  # noqa
                    )
                    continue
                except ValueError as e:
                    self.stderr.write(
                        f"Could not parse year from '{name}': {e}"  # noqa
                    )
                    continue

                # Precise-path: Check metadata dateUpdated/datePublished
                with open(j_cve) as fc:
                    cve_json = json.load(fc)
                    metadata = cve_json.get("cveMetadata", {})
                    cve_date_str = metadata.get("dateUpdated") or metadata.get(
                        "datePublished"
                    )
                    if cve_date_str:
                        # Handle potential milliseconds/Z/offsets (ISO 8601)
                        cve_date = date.fromisoformat(cve_date_str.split("T")[0])
                        if not (from_date <= cve_date <= to_date):
                            continue

                    make_cve(cve_json, triaged=False)
                    count += 1
                    print(".", end="", flush=True)

            print()  # Final newline after progress dots
            logger.info(f"{count} CVEs ingested.")
            logger.info(f"Saving the ingestion valid up to {v_date}")
            CveIngestion.objects.create(valid_to=v_date, delta=False)
