import pytest

from shared import models
from shared.bulk_ingestion import CveBulkContext, flush, prepare_cve

SAMPLE_CVE_DATA = {
    "dataType": "CVE_RECORD",
    "cveMetadata": {
        "cveId": "CVE-2024-12345",
        "state": "PUBLISHED",
        "assignerOrgId": "00000000-0000-4000-9000-000000000000",
        "assignerShortName": "mitre",
        "dateReserved": "2024-01-01T00:00:00Z",
        "datePublished": "2024-01-02T00:00:00Z",
        "dateUpdated": "2024-01-03T00:00:00Z",
    },
    "containers": {
        "cna": {
            "providerMetadata": {
                "orgId": "00000000-0000-4000-9000-000000000000",
                "shortName": "mitre",
            },
            "title": "A Test Vulnerability",
            "descriptions": [{"lang": "en", "value": "A test description."}],
            "affected": [
                {
                    "vendor": "TestVendor",
                    "product": "TestProduct",
                    "platforms": ["Linux", "Windows"],
                    "versions": [{"version": "1.0", "status": "affected"}],
                    "cpes": ["cpe:2.3:a:testvendor:testproduct:1.0:*:*:*:*:*:*:*"],
                }
            ],
            "problemTypes": [
                {
                    "descriptions": [{"lang": "en", "description": "CWE-79"}],
                    "cweId": "CWE-79",
                }
            ],
            "references": [
                {
                    "url": "https://example.com/advisory",
                    "tags": ["Patch", "Vendor Advisory"],
                }
            ],
            "metrics": [
                {
                    "cvssV3_1": {
                        "version": "3.1",
                        "vectorString": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
                        "baseScore": 9.8,
                        "baseSeverity": "CRITICAL",
                    }
                }
            ],
        }
    },
}


@pytest.mark.django_db
def test_prepare_cve_single() -> None:
    ctx = CveBulkContext()

    # Process the CVE data
    _cve = prepare_cve(SAMPLE_CVE_DATA, ctx=ctx)

    # Verify context lists are populated properly
    assert len(ctx.cve_records) == 1
    assert len(ctx.containers) == 1
    assert len(ctx.descriptions) == 1
    assert len(ctx.affected_products) == 1
    assert len(ctx.versions) == 1
    assert len(ctx.references) == 1

    # Values that should be deduplicated
    assert "Linux" in ctx.platforms_required
    assert "Windows" in ctx.platforms_required
    assert "Patch" in ctx.tags_required
    assert "Vendor Advisory" in ctx.tags_required

    # DB should be empty
    assert models.CveRecord.objects.count() == 0

    # Flush to DB
    flush(ctx)

    # Verify DB objects
    assert models.CveRecord.objects.count() == 1
    assert models.Container.objects.count() == 1
    assert models.Description.objects.count() == 1
    assert models.Platform.objects.count() == 2
    assert models.Tag.objects.count() == 2
    assert models.Reference.objects.count() == 1

    saved_cve = models.CveRecord.objects.first()
    assert saved_cve is not None
    assert saved_cve.cve_id == "CVE-2024-12345"

    container = saved_cve.container.first()
    assert container is not None
    assert container.title == "A Test Vulnerability"

    # M2M correctness
    assert container.descriptions.count() == 1
    assert container.affected.count() == 1

    affected = container.affected.first()
    assert affected is not None
    assert affected.platforms.count() == 2
    assert affected.versions.count() == 1
    assert affected.cpes.count() == 1

    ref = container.references.first()
    assert ref is not None
    assert ref.url == "https://example.com/advisory"
    assert ref.tags.count() == 2


@pytest.mark.django_db
def test_flush_deduplicates_tags_and_platforms() -> None:
    ctx = CveBulkContext()

    import copy

    data_1 = copy.deepcopy(SAMPLE_CVE_DATA)
    data_1["cveMetadata"]["cveId"] = "CVE-2024-0001"

    data_2 = copy.deepcopy(SAMPLE_CVE_DATA)
    data_2["cveMetadata"]["cveId"] = "CVE-2024-0002"

    # Both use "Patch", "Linux" etc.
    prepare_cve(data_1, ctx=ctx)
    prepare_cve(data_2, ctx=ctx)

    assert len(ctx.cve_records) == 2

    flush(ctx)

    # Should only create unique leaves
    assert models.Platform.objects.count() == 2  # Linux, Windows
    assert models.Tag.objects.count() == 2  # Patch, Vendor Advisory
    assert models.Cpe.objects.count() == 1

    # But other components get duplicated per CVE
    assert models.Container.objects.count() == 2
    assert models.Description.objects.count() == 2
