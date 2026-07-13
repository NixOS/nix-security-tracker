"""Application metrics helpers for Prometheus export."""

from __future__ import annotations

import logging
import os

from django.conf import settings
from prometheus_client import (
    CollectorRegistry,
    Histogram,
    start_http_server,
    write_to_textfile,
)
from prometheus_client.multiprocess import MultiProcessCollector

logger = logging.getLogger(__name__)

_matching_duration = Histogram(
    "sectracker_matching_duration_seconds",
    "Duration of CVE-to-derivation matching (build_new_links)",
    buckets=(0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0, float("inf")),
)
_matching_candidates = Histogram(
    "sectracker_matching_candidates",
    "Candidate derivations considered during matching",
    buckets=(0, 1, 5, 10, 25, 50, 100, 250, 500, 1000, 5000, float("inf")),
)
_eval_batch_duration = Histogram(
    "sectracker_nix_evaluation_batch_ingest_duration_seconds",
    "Duration of realtime Nixpkgs evaluation attribute batch ingest",
    buckets=(0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0, 60.0, float("inf")),
)
_eval_batch_attributes = Histogram(
    "sectracker_nix_evaluation_batch_ingest_attributes",
    "Attributes ingested per realtime evaluation batch",
    buckets=(1, 5, 10, 25, 50, 100, 250, 500, 1000, 5000, 25000, float("inf")),
)

_metrics_server_started = False


def write_metrics_textfile(name: str, registry: CollectorRegistry) -> None:
    """
    Write metrics for the node_exporter textfile collector.
    """
    if settings.METRICS_TEXTFILE_DIR is None:
        return
    prom_path = (settings.METRICS_TEXTFILE_DIR / name).with_suffix(".prom")
    write_to_textfile(str(prom_path), registry)


def observe_matching(duration_seconds: float, candidates: int) -> None:
    """Record matching wall time and candidate cardinality."""
    _matching_duration.observe(duration_seconds)
    _matching_candidates.observe(float(candidates))


def observe_eval_batch_ingest(duration_seconds: float, attributes: int) -> None:
    """Record eval batch ingest wall time and batch size."""
    _eval_batch_duration.observe(duration_seconds)
    _eval_batch_attributes.observe(float(attributes))


def start_worker_metrics_server() -> None:
    """
    Expose the default registry on METRICS_HTTP_PORT.

    No-op when the port is unset, when already started, or when multiprocess
    mode is active (the evaluator sidecar serves MultiProcessCollector instead).
    """
    global _metrics_server_started
    if _metrics_server_started:
        return
    if os.environ.get("PROMETHEUS_MULTIPROC_DIR"):
        return
    port = settings.METRICS_HTTP_PORT
    if port is None:
        return
    start_http_server(port)
    _metrics_server_started = True
    logger.info("Prometheus worker metrics listening on port %s", port)


def serve_multiprocess_metrics(port: int) -> None:
    """Serve aggregated multiprocess metrics (evaluator sidecar)."""
    registry = CollectorRegistry()
    MultiProcessCollector(registry)
    start_http_server(port, registry=registry)
    logger.info("Prometheus multiprocess metrics listening on port %s", port)
