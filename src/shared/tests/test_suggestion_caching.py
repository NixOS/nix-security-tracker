from shared.listeners.cache_suggestions import cache_new_suggestions
from shared.models.cached import CachedSuggestions
from shared.models.cve import Container
from shared.models.linkage import CVEDerivationClusterProposal
from shared.models.nix_evaluation import NixDerivation


# XXX(@fricklerhandwerk): This test isn't doing a lot except run the code once and assert that the result is non-empty.
# Once we have a Pydantic class for the cached value, we'll have a bit more certainty that the data has the shape we want, but ultimately we probabyly want property tests here.
def test_caching(
    cve: Container,
    drv: NixDerivation,
    suggestion: CVEDerivationClusterProposal,
) -> None:
    cached = CachedSuggestions.objects.filter(proposal=suggestion)
    assert not cached.exists()
    cache_new_suggestions(suggestion)
    value = cached.get()
    assert cve.cve.cve_id == value.payload["cve_id"]
    assert drv.attribute in value.payload["packages"]
