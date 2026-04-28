from django.core.serializers.json import DjangoJSONEncoder
from django.db import models
from django.utils.functional import classproperty

from shared.models.linkage import CVEDerivationClusterProposal
from shared.models.nix_evaluation import TimeStampMixin


class CachedSuggestionsQuerySet(models.QuerySet):
    def stale(self) -> models.QuerySet:
        return self.filter(schema_version__lt=self.model.CURRENT_SCHEMA_VERSION)


class CachedSuggestions(TimeStampMixin):
    """
    A cached consolidated view of suggestions.
    """

    objects = CachedSuggestionsQuerySet.as_manager()

    @classproperty
    def CURRENT_SCHEMA_VERSION(cls) -> int:  # noqa: N802, N805
        return 2

    proposal = models.OneToOneField(
        CVEDerivationClusterProposal,
        related_name="cached",
        on_delete=models.CASCADE,
        primary_key=True,
    )

    # The exact format of this payload will change until it's properly defined.
    payload = models.JSONField(encoder=DjangoJSONEncoder)

    schema_version = models.PositiveIntegerField(default=0)

    @property
    def is_stale(self) -> bool:
        return self.schema_version < self.CURRENT_SCHEMA_VERSION  # type: ignore
