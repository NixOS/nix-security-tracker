import pytest

from shared.fetchers import make_description, make_reference
from shared.models.cve import Description, Reference


@pytest.mark.django_db
def test_make_description_deduplicates() -> None:
    """Calling make_description twice with identical lang+value returns the same row."""
    data = {"lang": "en", "value": "A test vulnerability description."}
    first = make_description(data)
    second = make_description(data)

    assert first.pk == second.pk
    assert Description.objects.filter(lang="en", value=data["value"]).count() == 1


@pytest.mark.django_db
def test_make_reference_deduplicates() -> None:
    """Calling make_reference twice with identical url+name returns the same row."""
    data = {"url": "https://example.com/advisory", "name": "Advisory"}
    first = make_reference(data)
    second = make_reference(data)

    assert first.pk == second.pk
    assert Reference.objects.filter(url=data["url"], name=data["name"]).count() == 1
