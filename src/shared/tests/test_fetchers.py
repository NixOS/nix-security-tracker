from shared.fetchers import make_container, make_metric
from shared.models.cve import Container, CveRecord, Metric, Organization


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


def _bare_cve_record() -> CveRecord:
    org, _ = Organization.objects.get_or_create(
        uuid="11111111-1111-1111-1111-111111111111", short_name="test-org"
    )
    return CveRecord.objects.create(cve_id="CVE-2025-0002", assigner=org)


# A real CVE Record problemTypes entry per the CVE JSON 5.0 schema: an array of
# objects that each hold a "descriptions" array, whose items carry lang,
# description, cweId, type and (optionally) references.
_PROBLEM_TYPES = [
    {
        "descriptions": [
            {
                "lang": "en",
                "description": "Cross-site Scripting (XSS)",
                "cweId": "CWE-79",
                "type": "CWE",
            }
        ]
    }
]


def test_make_container_ingests_problem_types_with_cwe_metadata(
    db: None,
) -> None:
    """A CVE container's problemTypes must be ingested at all (the schema
    keys the array by the plural 'descriptions', not 'description') *and*
    each ingested ProblemType must keep the cweId/type/description metadata
    carried on its schema-shaped entry.

    Both symptoms come from the same flatten step (fetchers.py, building the
    `problems` list from `data["problemTypes"]`): reading the wrong key
    collapses the list to empty (zero problem types), while dropping fields
    off the flattened entries would null out cwe_id/_type/description on
    whatever *is* created. A fix that only addresses one half leaves this
    single test red.
    """
    cve = _bare_cve_record()
    data = {
        "providerMetadata": {"orgId": "22222222-2222-2222-2222-222222222222"},
        "problemTypes": _PROBLEM_TYPES,
    }

    container = make_container(data, _type=Container.Type.CNA, cve=cve)

    assert container.problem_types.count() == 1
    problem_type = container.problem_types.get()
    assert problem_type.cwe_id == "CWE-79"
    assert problem_type._type == "CWE"
    assert list(problem_type.description.values_list("value", flat=True)) == [
        "Cross-site Scripting (XSS)"
    ]
