from pathlib import Path

from django.test import override_settings
from prometheus_client import CollectorRegistry, Gauge

from shared.metrics import (
    observe_eval_batch_ingest,
    observe_matching,
    start_worker_metrics_server,
    write_metrics_textfile,
)


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


def test_write_metrics_textfile_writes_garbage_collection_metrics(
    tmp_path: Path,
) -> None:
    with override_settings(METRICS_TEXTFILE_DIR=tmp_path):
        registry = CollectorRegistry()
        duration = Gauge(
            "sectracker_garbage_collect_duration_seconds",
            "Duration of last garbage collection run by step",
            ["step"],
            registry=registry,
        )
        duration.labels(step="total").set(12.0)
        duration.labels(step="stale_matches").set(3.5)
        deleted = Gauge(
            "sectracker_garbage_collect_deleted",
            "Rows deleted in last garbage collection run by kind",
            ["kind"],
            registry=registry,
        )
        deleted.labels(kind="proposals").set(4.0)
        deleted.labels(kind="derivations").set(9.0)

        write_metrics_textfile("garbage_collection", registry)

    content = (tmp_path / "garbage_collection.prom").read_text()
    assert (
        "# HELP sectracker_garbage_collect_duration_seconds "
        "Duration of last garbage collection run by step"
    ) in content
    assert (
        "# HELP sectracker_garbage_collect_deleted "
        "Rows deleted in last garbage collection run by kind"
    ) in content
    assert 'sectracker_garbage_collect_duration_seconds{step="total"} 12.0' in content
    assert (
        'sectracker_garbage_collect_duration_seconds{step="stale_matches"} 3.5'
        in content
    )
    assert 'sectracker_garbage_collect_deleted{kind="proposals"} 4.0' in content
    assert 'sectracker_garbage_collect_deleted{kind="derivations"} 9.0' in content


def test_write_metrics_textfile_writes_cve_delta_ingest_metrics(
    tmp_path: Path,
) -> None:
    with override_settings(METRICS_TEXTFILE_DIR=tmp_path):
        registry = CollectorRegistry()
        Gauge(
            "sectracker_cve_delta_ingest_duration_seconds",
            "Duration of last CVE delta ingest run",
            registry=registry,
        ).set(8.25)
        Gauge(
            "sectracker_cve_delta_ingest_cves",
            "CVEs ingested in last CVE delta ingest run",
            registry=registry,
        ).set(15.0)
        Gauge(
            "sectracker_cve_delta_ingest_days",
            "Days successfully ingested in last CVE delta ingest run",
            registry=registry,
        ).set(2.0)

        write_metrics_textfile("cve_delta_ingest", registry)

    content = (tmp_path / "cve_delta_ingest.prom").read_text()
    assert (
        "# HELP sectracker_cve_delta_ingest_duration_seconds "
        "Duration of last CVE delta ingest run"
    ) in content
    assert (
        "# HELP sectracker_cve_delta_ingest_cves "
        "CVEs ingested in last CVE delta ingest run"
    ) in content
    assert (
        "# HELP sectracker_cve_delta_ingest_days "
        "Days successfully ingested in last CVE delta ingest run"
    ) in content
    assert "sectracker_cve_delta_ingest_duration_seconds 8.25" in content
    assert "sectracker_cve_delta_ingest_cves 15.0" in content
    assert "sectracker_cve_delta_ingest_days 2.0" in content


def test_observe_matching_records_histogram_samples() -> None:
    from prometheus_client import REGISTRY

    before = (
        REGISTRY.get_sample_value("sectracker_matching_duration_seconds_count") or 0.0
    )
    observe_matching(0.12, 7)
    after = (
        REGISTRY.get_sample_value("sectracker_matching_duration_seconds_count") or 0.0
    )
    assert after == before + 1.0
    candidates = (
        REGISTRY.get_sample_value("sectracker_matching_candidates_count") or 0.0
    )
    assert candidates >= 1.0


def test_observe_eval_batch_ingest_records_histogram_samples() -> None:
    from prometheus_client import REGISTRY

    before = (
        REGISTRY.get_sample_value(
            "sectracker_nix_evaluation_batch_ingest_duration_seconds_count"
        )
        or 0.0
    )
    observe_eval_batch_ingest(0.45, 12)
    after = (
        REGISTRY.get_sample_value(
            "sectracker_nix_evaluation_batch_ingest_duration_seconds_count"
        )
        or 0.0
    )
    assert after == before + 1.0


def test_start_worker_metrics_server_noop_without_port() -> None:
    with override_settings(METRICS_HTTP_PORT=None):
        # Must not raise when port is unset.
        start_worker_metrics_server()
