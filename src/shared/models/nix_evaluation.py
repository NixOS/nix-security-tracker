from django.conf import settings
from django.contrib.postgres import fields
from django.contrib.postgres.indexes import BTreeIndex, GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.core.exceptions import ObjectDoesNotExist
from django.db import models
from django.db.models import F, Window
from django.db.models.functions import RowNumber
from django.utils.translation import gettext_lazy as _
from pgtrigger import UpdateSearchVector


class TimeStampMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:  # type: ignore[override]
        abstract = True


class NixMaintainer(models.Model):
    """
    This represents a maintainer in the `maintainers` field of a package.
    """

    github_id = models.IntegerField(unique=True, primary_key=True)
    github = models.CharField(max_length=200)
    email = models.CharField(max_length=200, null=True)
    matrix = models.CharField(max_length=200, null=True)
    name = models.CharField(max_length=200, null=True)

    def __str__(self) -> str:
        return f"@{self.github}"


class NixLicense(models.Model):
    """
    This represents a Nix license data, we don't keep only the SPDX ID
    for maximal faithfulness to what nixpkgs tells us.

    We refuse any license without an SPDX ID, it is not realistic
    to handle them without as this would make reconcilation hard.
    """

    spdx_id = models.CharField(max_length=255, unique=True)
    deprecated = models.BooleanField()
    free = models.BooleanField()
    full_name = models.CharField(max_length=255, null=True)
    short_name = models.CharField(max_length=255, null=True)
    redistributable = models.BooleanField()
    url = models.URLField(null=True)

    def __str__(self) -> str:
        return f"{self.spdx_id}"


class NixSourceProvenance(models.Model):
    """
    Source provenance informs you about whether
    something is a binary native code or comes from a real source build.
    """

    qualifier = models.CharField(max_length=255)
    source = models.BooleanField()

    @property
    def binary(self) -> bool:
        return not self.source


class NixPlatform(models.Model):
    """
    e.g. x86_64-linux.
    """

    system_double = models.CharField(max_length=255, unique=True)

    def __str__(self) -> str:
        return self.system_double


class NixDerivationMeta(models.Model):
    """
    All the meta attribute of a derivation
    is synthesized here.
    """

    name = models.CharField(max_length=255, null=True)
    maintainers = models.ManyToManyField(NixMaintainer)
    licenses = models.ManyToManyField(NixLicense)
    source_provenances = models.ManyToManyField(NixSourceProvenance)

    known_vulnerabilities = fields.ArrayField(
        models.CharField(max_length=255), default=list
    )

    insecure = models.BooleanField()
    available = models.BooleanField()
    broken = models.BooleanField()
    unfree = models.BooleanField()
    unsupported = models.BooleanField()

    homepage = models.URLField(null=True)

    description = models.TextField(null=True)
    main_program = models.CharField(max_length=255, null=True)

    # FIXME(raitobezarius):
    # Ridiculously big, we should encode all reasonable known platforms
    # into a static BitField (~120 of them, so 7 bits?).
    # Ideally, we should find a way to deal with "inspect patterns"
    # which are really dynamic things, maybe just project over our set of statically
    # known platforms.
    # platforms = models.ManyToManyField(NixPlatform)

    position = models.URLField(null=True)

    def get_description(self) -> str | None:
        description: str | None = None
        try:
            description = self.derivation.package_link.package.description
        except ObjectDoesNotExist:
            description = self.description
        return description

    def __str__(self) -> str:
        return self.description or ""


class NixpkgsBranch(models.Model):
    """
    A Nixpkgs branch that gets evaluated, e.g. `master` or `release-26.05`.
    """

    name = models.CharField(max_length=126, primary_key=True)
    head_sha1_commit = models.CharField(max_length=126)

    def __str__(self) -> str:
        return self.name


class NixChannel(TimeStampMixin):
    """
    This represents a "Nixpkgs" (*) channel, e.g.
    - a Git object representing a branch that moves regularly.
    - a state, e.g. EOL, deprecated, stable, unstable.
    - if it's not unstable, release number.

    (*): Anything that looks like Nixpkgs is also good.
    """

    class ChannelState(models.TextChoices):
        END_OF_LIFE = "unmaintained", _("End of life")
        DEPRECATED = "deprecated", _("Deprecated")
        BETA = "beta", _("Beta")
        STABLE = "stable", _("Stable")
        UNSTABLE = "rolling", _("Unstable")

    class Variant(models.TextChoices):
        PRIMARY = "primary", _("primary")
        SMALL = "small", _("small")
        DARWIN = "darwin", _("darwin")

    # States we care about for evaluation and prospective matching, as those are considered to be maintained.
    # Mutable per channel over time.
    TRACKED_STATES = (
        ChannelState.DEPRECATED,
        ChannelState.BETA,
        ChannelState.STABLE,
        ChannelState.UNSTABLE,
    )

    # The underlying Nixpkgs branch (e.g. `master` or `release-25.05`).
    release_branch = models.ForeignKey(
        NixpkgsBranch,
        on_delete=models.PROTECT,
        related_name="channels",
    )
    # A channel branch is the `nixos-$number` branch of
    # `nixos-unstable(-small)` for unstable(-small). Not to confuse with the
    # channel tarballs and scripts from releases.nixos.org.
    channel_branch = models.CharField(max_length=255, primary_key=True)
    # The currently known HEAD SHA1 commit of that channel.
    head_sha1_commit = models.CharField(max_length=255)
    state = models.CharField(max_length=126, choices=ChannelState.choices)
    variant = models.CharField(max_length=126, choices=Variant.choices, null=True)

    def __str__(self) -> str:
        return self.channel_branch

    @property
    def is_tracking_branch(self) -> bool:
        """
        Whether the channel corresponds to a the tracking branch.

        It's the source of truth for metadata such as package descriptions and maintainer information.
        """
        return self.release_branch.name == settings.TRACKING_BRANCH


class NixEvaluationQuerySet(models.QuerySet):
    def latest_per_channel(self) -> "NixEvaluationQuerySet":
        return self.annotate(
            row_num=Window(
                expression=RowNumber(),
                partition_by=[F("channel")],
                order_by=F("updated_at").desc(),
            ),
        ).filter(row_num=1)

    def latest_completed_per_channel(self) -> "NixEvaluationQuerySet":
        return self.filter(
            state=NixEvaluation.EvaluationState.COMPLETED
        ).latest_per_channel()


class NixEvaluation(TimeStampMixin):
    """
    This is a Nix evaluation of a repository,
    potentially ongoing.

    It contains its derivations via `derivations` attribute
    set by the `NixDerivation` model.
    """

    objects = NixEvaluationQuerySet.as_manager()

    class EvaluationState(models.TextChoices):
        COMPLETED = "COMPLETED", _("Completed")
        WAITING = (
            "WAITING",
            _("Waiting to be started"),
        )
        IN_PROGRESS = (
            "IN_PROGRESS",
            _("In progress"),
        )
        # Crash means resource exhaustion, unexpected crash, or forced shutdown of the worker
        CRASHED = (
            "CRASHED",
            _("Crashed"),
        )
        # Failed means critical evaluation errors
        FAILED = "FAILED", _("Failed")

    # Parent channel of that evaluation.
    channel = models.ForeignKey(
        NixChannel, related_name="evaluations", on_delete=models.PROTECT
    )
    # Commit SHA1 on which the evaluation was done precisely.
    commit_sha1 = models.CharField(max_length=255)
    # State in which the evaluation is in.
    state = models.CharField(max_length=126, choices=EvaluationState.choices)
    # How many times have been we trying to evaluate
    # this? We use it for the crash backoff loop.
    attempt = models.IntegerField(default=0)
    # Last failure reason
    failure_reason = models.TextField(null=True)
    # Time elapsed in seconds for this evaluation.
    elapsed = models.FloatField(null=True)

    def __str__(self) -> str:
        return f"{self.channel} {self.commit_sha1[:8]}"

    class Meta:  # type: ignore[override]
        constraints = [
            models.UniqueConstraint(
                fields=["commit_sha1"], name="nixevaluation_commit_sha1_unique"
            )
        ]


class NixDerivation(models.Model):
    """
    This represents a Nix derivation "evaluated",
    we fill this model using two things:

    - evaluation result
    - parsing the .drv
    """

    attribute = models.CharField(max_length=255)
    derivation_path = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    # FIXME(@fricklerhandwerk): [tag:deduplicate-metadata] We always need the metadata, so it shouldn't be in a separate table.
    # Also we're currently paying for the join for practically all accesses: only 2k out of 35M have no metadata at all.
    metadata = models.OneToOneField(
        NixDerivationMeta,
        related_name="derivation",
        on_delete=models.CASCADE,
        null=True,
    )
    system = models.CharField(max_length=255)
    parent_evaluation = models.ForeignKey(
        NixEvaluation, related_name="derivations", on_delete=models.PROTECT
    )

    search_vector = SearchVectorField(null=True)

    def __str__(self) -> str:
        hash = self.derivation_path.split("-")[0].split("/")[-1]
        return f"{self.name} {hash[:8]}"

    class Meta:  # type: ignore[override]
        indexes = [
            BTreeIndex(fields=["name"]),
            BTreeIndex(fields=["attribute"]),
            GinIndex(fields=["search_vector"]),
        ]

        triggers = [
            # Add a trigger to maintain the search vector updated with row changes
            UpdateSearchVector(
                name="attribute_name_search_vector_idx",
                vector_field="search_vector",
                document_fields=[
                    "attribute",
                    "name",
                ],
            )
        ]


# Major channels are the important channels that a user wants to keep an eye on.
# FIXME figure this out dynamically [ref:channel-structure]
# This should aggregate by `status` and pick the `primary` channels.
# Probably `nixpkgs-unstable` needs a keep its special role:
# https://github.com/NixOS/infra/pull/921
MAJOR_CHANNELS = [
    "unstable",
    "26.05",
]


# The major channel that a branch name (e.g. nixpkgs-24.05-darwin) belongs to
def get_major_channel(branch_name: str) -> str | None:
    for mc in MAJOR_CHANNELS:
        if mc in branch_name:
            return f"nixos-{mc}"
    return None
