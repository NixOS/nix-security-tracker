from shared.models.cve import Metric
from shared.models.linkage import CVEDerivationClusterProposal
from webview.templatetags.viewutils import severity_badge


def test_severity_badge(
    cached_suggestion: CVEDerivationClusterProposal,
) -> None:
    metric = severity_badge(cached_suggestion.cached.payload["metrics"])

    expected = (
        Metric.objects.filter(
            container__cve=cached_suggestion.cve,
        )
        .order_by("-format")
        .first()
    )

    assert expected
    assert metric["cvss"]["format"] == expected.format
    assert metric["cvss"]["vector_string"] == expected.vector_string
    assert metric["cvss"]["base_score"]
    assert metric["cvss"]["base_severity"]
    assert metric["human_readable"]
