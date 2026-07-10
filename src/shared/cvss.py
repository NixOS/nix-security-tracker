from typing import NamedTuple, TypedDict

from cvss import CVSS3, CVSS4, constants3, constants4

from shared.models.cve import Metric

type CvssScore = float
type CvssSeverity = str


class HumanReadableMetric(TypedDict):
    label: str
    value: str


CVSS_PARSERS = {
    Metric.Format.V40: (CVSS4, constants4.METRICS_ABBREVIATIONS),
    Metric.Format.V31: (CVSS3, constants3.METRICS_ABBREVIATIONS),
    Metric.Format.V30: (CVSS3, constants3.METRICS_ABBREVIATIONS),
}


class CvssFields(NamedTuple):
    base_score: CvssScore | None
    base_severity: CvssSeverity | None
    human_readable: list[HumanReadableMetric] | None


_NONE = CvssFields(None, None, None)


def compute_cvss_fields(metric_dict: dict) -> CvssFields:
    """Return parsed CVSS fields for a raw metric dict, or a null CvssFields on failure."""
    fmt = metric_dict.get("format", "")
    vector_string = metric_dict.get("vector_string", "")
    for prefix, (parser, abbreviations) in CVSS_PARSERS.items():
        if fmt.startswith(prefix):
            parsed = parser(vector_string)
            score, *_ = parsed.scores()
            severity, *_ = parsed.severities()
            human_readable: list[HumanReadableMetric] = [
                {
                    "label": f"{abbreviations[k]} ({k})",
                    # The *value* description is also indexed by *key*, not by the value itself!
                    "value": f"{parsed.get_value_description(k)} ({v})",
                }
                for k, v in parsed.metrics.items()
            ]
            return CvssFields(float(score), severity.upper(), human_readable)
    return _NONE
