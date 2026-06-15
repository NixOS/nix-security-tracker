from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.db import models
from django.db.models import Exists, OuterRef
from pgtrigger import UpdateSearchVector

from shared.models.nix_evaluation import NixDerivation, NixMaintainer


class PackageAttrpathQuerySet(models.QuerySet):
    def stale(self) -> models.QuerySet:
        live = PackageDerivation.objects.filter(
            derivation__attribute=OuterRef("attrpath"),
        )
        return self.filter(~Exists(live))


class Package(models.Model):
    name = models.CharField(max_length=126)
    homepage = models.URLField(null=True)
    description = models.TextField(null=True)
    maintainers = models.ManyToManyField(NixMaintainer)

    search_vector = SearchVectorField(null=True)

    class Meta:  # type: ignore[override]
        constraints = [
            models.UniqueConstraint(
                fields=["name", "homepage"],
                nulls_distinct=False,
                name="package_name_homepage_unique",
            ),
        ]
        indexes = [
            GinIndex(fields=["search_vector"]),
        ]
        triggers = [
            UpdateSearchVector(
                name="description_search_vector_idx",
                vector_field="search_vector",
                document_fields=[
                    "description",
                ],
            )
        ]


class PackageAttrpath(models.Model):
    """
    Maps a Nixpkgs attribute path to a package.
    The unique index on `attrpath` enables O(1) lookup during package clustering:
    given a derivation's attribute, find its package without scanning derivations.
    """

    pk = models.CompositePrimaryKey("package", "attrpath")
    package = models.ForeignKey(
        Package, on_delete=models.CASCADE, related_name="attrpaths"
    )
    attrpath = models.CharField(max_length=255, unique=True)

    objects = PackageAttrpathQuerySet.as_manager()


class PackageDerivation(models.Model):
    derivation = models.OneToOneField(
        NixDerivation,
        primary_key=True,
        on_delete=models.CASCADE,
        related_name="package_link",
    )
    package = models.ForeignKey(
        Package, on_delete=models.CASCADE, related_name="derivations"
    )
