import logging

import pytest

from shared.fetchers import make_cpe, make_metric
from shared.models.cve import Cpe, Metric


def test_make_metric_none(
    db: None,
) -> None:
    metric = make_metric({})

    assert metric is None


def test_make_metric_prefer_v4(
    db: None,
    cvss_v3_metric: dict,
    cvss_v4_metric: dict,
) -> None:
    metric = make_metric(cvss_v3_metric | cvss_v4_metric)
    assert metric
    assert metric.format == Metric.Format.V40
    assert metric.vector_string == cvss_v4_metric[Metric.Format.V40]["vectorString"]


def test_make_metric_fallback_v3(
    db: None,
    cvss_v3_metric: dict,
) -> None:
    metric = make_metric(cvss_v3_metric)
    assert metric
    assert metric.format == Metric.Format.V30
    assert metric.vector_string == cvss_v3_metric[Metric.Format.V30]["vectorString"]


def test_make_cpe_accepts_valid(db: None) -> None:
    name = "cpe:2.3:a:vendor:product:1.0:*:*:*:*:*:*:*"
    cpe = make_cpe(name)
    assert cpe is not None
    assert cpe.name == name
    assert Cpe.objects.filter(name=name).exists()


def test_make_cpe_discards_malformed(
    db: None, caplog: pytest.LogCaptureFixture
) -> None:
    with caplog.at_level(logging.WARNING):
        assert make_cpe("not-a-cpe") is None
        assert make_cpe("cpe:2.3:a:foo:bar:1.0") is None

    assert not Cpe.objects.filter(name="not-a-cpe").exists()
    assert "Discarding malformed CPE" in caplog.text
