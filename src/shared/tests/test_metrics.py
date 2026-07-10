from pathlib import Path

from django.test import override_settings
from prometheus_client import CollectorRegistry, Gauge

from shared.metrics import write_metrics_textfile


def test_write_metrics_textfile_produces_prometheus_format(tmp_path: Path) -> None:
    with override_settings(METRICS_TEXTFILE_DIR=tmp_path):
        registry = CollectorRegistry()
        Gauge(
            "sectracker_example_seconds",
            "Example metric for tests",
            registry=registry,
        ).set(12.5)

        write_metrics_textfile("sample", registry)

    content = (tmp_path / "sample.prom").read_text()
    assert "# HELP sectracker_example_seconds Example metric for tests" in content
    assert "# TYPE sectracker_example_seconds gauge" in content
    assert "sectracker_example_seconds 12.5" in content


def test_write_metrics_textfile_writes_cache_regeneration_metrics(
    tmp_path: Path,
) -> None:
    with override_settings(METRICS_TEXTFILE_DIR=tmp_path):
        registry = CollectorRegistry()
        Gauge(
            "sectracker_cache_regeneration_duration_seconds",
            "Duration of last cache regeneration run",
            registry=registry,
        ).set(42.0)
        Gauge(
            "sectracker_cache_regeneration_suggestions",
            "Suggestions regenerated in last run",
            registry=registry,
        ).set(7.0)

        write_metrics_textfile("cache_regeneration", registry)

    content = (tmp_path / "cache_regeneration.prom").read_text()
    assert (
        "# HELP sectracker_cache_regeneration_duration_seconds "
        "Duration of last cache regeneration run"
    ) in content
    assert (
        "# HELP sectracker_cache_regeneration_suggestions "
        "Suggestions regenerated in last run"
    ) in content
    assert "sectracker_cache_regeneration_duration_seconds 42.0" in content
    assert "sectracker_cache_regeneration_suggestions 7.0" in content
