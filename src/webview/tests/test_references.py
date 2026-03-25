from collections.abc import Callable
import pytest

from shared.listeners.cache_suggestions import cache_new_suggestions
from shared.models.linkage import CVEDerivationClusterProposal
from shared.models.cve import Container, Tag, Reference
from webview.suggestions.context.types import SuggestionContext

@pytest.mark.django_db
def test_suggestion_context_reference_deduplication(
    make_container: Callable[..., Container],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
) -> None:
    container1 = make_container()
    suggestion = make_suggestion(container=container1, status=CVEDerivationClusterProposal.Status.ACCEPTED)
    container2 = make_container(cve=suggestion.cve)

    tag1 = Tag.objects.create(value="CNA-tag")
    tag2 = Tag.objects.create(value="ADP-tag")
    
    ref1 = Reference.objects.create(url="https://duplicate-url.com", name="Duplicate Link")
    ref1.tags.add(tag1)
    container1.references.add(ref1)

    ref2 = Reference.objects.create(url="https://duplicate-url.com", name="Duplicate Link")
    ref2.tags.add(tag2)
    container2.references.add(ref2)
    
    cache_new_suggestions(suggestion)

    context = SuggestionContext(suggestion, user_can_edit=False, pre_fetched_events=[])

    assert len(context.references) == 1, "References were not successfully deduplicated"
    assert context.references[0].url == "https://duplicate-url.com"
    
    assert len(context.references[0].tags) == 2, "Tags belonging to duplicate references were not properly merged"
    
    tag_values = {t.value for t in context.references[0].tags}
    assert "CNA-tag" in tag_values
    assert "ADP-tag" in tag_values
