from shared.fetchers import make_metric
from shared.models.cve import Metric


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
