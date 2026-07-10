"""Application metrics helpers for Prometheus export."""

from __future__ import annotations

from django.conf import settings
from prometheus_client import CollectorRegistry, write_to_textfile


def write_metrics_textfile(name: str, registry: CollectorRegistry) -> None:
    """
    Write metrics for the node_exporter textfile collector.
    """
    if settings.METRICS_TEXTFILE_DIR is None:
        return
    prom_path = (settings.METRICS_TEXTFILE_DIR / name).with_suffix(".prom")
    write_to_textfile(str(prom_path), registry)
