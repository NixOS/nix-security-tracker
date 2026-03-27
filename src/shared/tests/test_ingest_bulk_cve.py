from datetime import date
from typing import Any
from unittest.mock import MagicMock, patch

import pytest
from django.core.management import call_command
from django.core.management.base import CommandError


@patch("shared.management.commands.ingest_bulk_cve.path")
@patch("shared.management.commands.ingest_bulk_cve.transaction")
@patch("shared.management.commands.ingest_bulk_cve.CveIngestion")
@patch("shared.management.commands.ingest_bulk_cve.glob")
@patch("shared.management.commands.ingest_bulk_cve.get_gh")
@patch("shared.management.commands.ingest_bulk_cve.make_cve")
@patch("builtins.open")
class TestIngestBulkCve:
    def test_filtering_logic(
        self,
        mock_open: MagicMock,
        mock_make_cve: MagicMock,
        mock_get_gh: MagicMock,
        mock_glob: MagicMock,
        mock_cve_ingestion: MagicMock,
        mock_transaction: MagicMock,
        mock_path: MagicMock,
    ) -> None:
        # Setup mocks
        mock_path.exists.return_value = True
        mock_path.basename.side_effect = lambda x: x.split("/")[-1]
        mock_release = MagicMock()
        mock_release.tag_name = "daily_2024-01-01"
        mock_release.title = "Daily 2024-01-01"
        mock_get_gh.return_value.get_repo.return_value.get_latest_release.return_value = mock_release

        # Mock CVE files
        cve_files = [
            "/cache/cves/2023/1xxx/CVE-2023-0001.json",
            "/cache/cves/2024/1xxx/CVE-2024-0001.json",
            "/cache/cves/2024/2xxx/CVE-2024-0002.json",
        ]
        mock_glob.return_value = cve_files

        # Mock file content
        cve_data = {
            "/cache/cves/2023/1xxx/CVE-2023-0001.json": {
                "cveMetadata": {"dateUpdated": "2023-12-31T00:00:00Z"}
            },
            "/cache/cves/2024/1xxx/CVE-2024-0001.json": {
                "cveMetadata": {"dateUpdated": "2024-01-02T00:00:00Z"}
            },
            "/cache/cves/2024/2xxx/CVE-2024-0002.json": {
                "cveMetadata": {"dateUpdated": "2024-02-01T00:00:00Z"}
            },
        }

        def side_effect_open(name: str, *args: Any, **kwargs: Any) -> MagicMock:
            m = MagicMock()
            m.name = name
            m.__enter__.return_value = m
            return m

        # We need a more robust mock for open/json.load
        with patch(
            "shared.management.commands.ingest_bulk_cve.json.load"
        ) as mock_json_load:
            mock_json_load.side_effect = (
                lambda f: cve_data[f.name]
                if hasattr(f, "name")
                else cve_data[list(cve_data.keys())[0]]
            )

            mock_open.side_effect = side_effect_open

            # Full range (should ingest all)
            call_command("ingest_bulk_cve")
            assert mock_make_cve.call_count == len(cve_data)
            mock_make_cve.reset_mock()

            # Specific date range
            call_command(
                "ingest_bulk_cve",
                from_date=date.fromisoformat("2024-01-01"),
                to_date=date.fromisoformat("2024-01-31"),
            )
            # CVE-2024-0001.json fits
            assert mock_make_cve.call_count == 1
            mock_make_cve.reset_mock()

            # Year range (fast-path)
            call_command(
                "ingest_bulk_cve",
                from_date=date.fromisoformat("2024-01-01"),
                to_date=date.fromisoformat("2024-12-31"),
            )
            # Both 2024 CVEs fit
            assert mock_make_cve.call_count == 2
            mock_make_cve.reset_mock()

            # Test 4: Invalid date range (from > to)
            with pytest.raises(CommandError, match="is after"):
                call_command(
                    "ingest_bulk_cve",
                    from_date=date.fromisoformat("2024-12-31"),
                    to_date=date.fromisoformat("2024-01-01"),
                )
