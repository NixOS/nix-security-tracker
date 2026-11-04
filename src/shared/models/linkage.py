from collections.abc import Callable
from copy import copy
from dataclasses import dataclass
from enum import STRICT, IntFlag
from typing import Any

import pghistory
import pgtrigger
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.db.models import Exists, OuterRef, Q
from django.db.models.fields.json import KeyTransform
from django.db.models.signals import post_delete, post_save
from django.db.utils import InternalError
from django.dispatch import receiver
from django.utils.functional import classproperty
from django.utils.translation import gettext_lazy as _

import shared.models.cached
from shared.models.cve import AffectedProduct, CveRecord, Reference
from shared.models.nix_evaluation import NixDerivation, NixMaintainer, TimeStampMixin
from shared.models.package import Package, PackageAttrpath


class Overlay(models.Model):
    """
    This is the base model for all Overlay models should inherit from this.
    """

    class Type(models.TextChoices):
        ADDITIONAL = "additional", _("additional")
        IGNORED = "ignored", _("ignored")

    type = models.CharField(max_length=126, choices=Type.choices)

    class Meta:
        abstract = True


class SuggestionStatus(models.TextChoices):
    PENDING = "pending", _("pending")
    REJECTED = "rejected", _("rejected")
    ACCEPTED = "accepted", _("accepted")
    PUBLISHED = "published", _("published")


STATUS_TRANSITIONS: list[tuple[str, str]] = [
    (SuggestionStatus.PENDING, SuggestionStatus.REJECTED),
    (SuggestionStatus.PENDING, SuggestionStatus.ACCEPTED),
    (SuggestionStatus.REJECTED, SuggestionStatus.ACCEPTED),
    (SuggestionStatus.ACCEPTED, SuggestionStatus.REJECTED),
    (SuggestionStatus.ACCEPTED, SuggestionStatus.PUBLISHED),
]


class BulkValidationError(Exception):
    """
    Raised when a bulk operation cannot be applied to every selected suggestion.

    Carries the reason why, for each offending suggestion, or a single message when the
    operation is refused because of the selection as a whole rather than because of any
    particular suggestion.
    """

    def __init__(
        self, errors: dict[int, dict[str, list[str]]], detail: str | None = None
    ) -> None:
        self.errors = errors
        self.detail = detail
        super().__init__(detail or "Some suggestions do not accept this operation")


class SharedValueState(models.TextChoices):
    """Whether a value shared by a whole selection is active or ignored on all of it."""

    ACTIVE = "active"
    IGNORED = "ignored"


@dataclass(frozen=True)
class SharedValue:
    """A package attribute, maintainer or reference held in the same state by a whole selection."""

    state: SharedValueState
    value: Any


@dataclass(frozen=True)
class SharedState:
    """What a selection of suggestions has in common (see :meth:`shared_state`)."""

    status: str | None
    in_issue_draft: bool | None
    # Empty string when every suggestion holds no comment, None when they differ.
    comment: str | None
    packages: list[SharedValue]
    maintainers: list[SharedValue]
    references: list[SharedValue]


class JSONObjectKeys(models.Func):
    """
    The keys of the JSON object nested under `path`, as a JSON array of strings.

    Lets a query read which packages a cached payload holds without carrying back the
    packages themselves, which are an order of magnitude larger.
    """

    function = "jsonb_path_query_array"
    template = "%(function)s(%(expressions)s, '$.%(path)s.keyvalue().key')"

    def __init__(self, expression: str, path: str, **extra: Any) -> None:
        super().__init__(
            expression, path=path, output_field=models.JSONField(), **extra
        )


def _shared_values(
    per_suggestion: "list[tuple[dict, dict]]",
    sort_key: "Callable[[Any], Any]",
    merge: "Callable[[list[Any]], Any]" = lambda values: values[0],
) -> "list[SharedValue]":
    """
    Keep the values every suggestion holds, in the same state (intersection).

    Each suggestion contributes its active values and its ignored values, keyed by
    whatever identifies them. A value missing from one suggestion, or active in one and
    ignored in another, belongs to neither intersection and is left out.

    Only the key identifies a value, so the copies held by each suggestion may differ
    (a reference carries the name and tags it was given on that suggestion, a maintainer
    the handle known at the time). `merge` combines them into the one reported; by
    default, the first suggestion's copy.
    """
    if not per_suggestion:
        return []

    shared = []
    for state, index in (
        (SharedValueState.ACTIVE, 0),
        (SharedValueState.IGNORED, 1),
    ):
        keys = set.intersection(
            *(set(suggestion[index]) for suggestion in per_suggestion)
        )
        shared += [
            SharedValue(
                state=state,
                value=merge([suggestion[index][key] for suggestion in per_suggestion]),
            )
            for key in keys
        ]
    return sorted(shared, key=lambda shared_value: sort_key(shared_value.value))


class CVEDerivationClusterProposalQuerySet(models.QuerySet):
    def target_proposals(self) -> "CVEDerivationClusterProposalQuerySet":
        """Return the set of proposals eligible for cache regeneration.

        Pending proposals are only regenerated for the current algorithm version —
        outdated-version pending proposals will be superseded by fresh ones once the
        algorithm runs again, so regenerating their caches would be wasted effort.

        Accepted and dismissed proposals are regenerated regardless of algorithm
        version, since triagers have already reviewed them and they must remain
        accessible in the UI.
        """

        return self.filter(
            Q(
                status=CVEDerivationClusterProposal.Status.PENDING,
                algorithm_version=CVEDerivationClusterProposal.CURRENT_ALGORITHM_VERSION,
            )
            | ~Q(status=CVEDerivationClusterProposal.Status.PENDING)
        )

    def untouched(self) -> "CVEDerivationClusterProposalQuerySet":
        """Proposals not yet touched by users or auto-triage (still pending).

        Complement of :meth:`user_curated`. Useful for GC and similar code that
        should only act on suggestions that have never left pending
        (see also the discussion on #1211).
        """
        return self.filter(status=CVEDerivationClusterProposal.Status.PENDING)

    def user_curated(self) -> "CVEDerivationClusterProposalQuerySet":
        """Proposals touched by users or auto-triage (everything except pending).

        Complement of :meth:`untouched`. Includes accepted, rejected (manual and
        auto), and published suggestions used as matching training labels.
        """
        return self.exclude(status=CVEDerivationClusterProposal.Status.PENDING)

    def with_affected_product(
        self, name: str, version: str | None = None
    ) -> "CVEDerivationClusterProposalQuerySet":
        """
        Suggestions whose CVE lists an affected product under this name, optionally with this exact version.

        The name is the one suggestions display: the package name, or the product when there is none.
        The version matches exactly any bound of a version entry of that same product, since versions follow no uniform scheme.
        """
        affected = AffectedProduct.objects.filter(
            Q(package_name=name)
            | ((Q(package_name__isnull=True) | Q(package_name="")) & Q(product=name)),
            container__cve=OuterRef("cve"),
        )
        if version is not None:
            affected = affected.filter(
                Q(versions__version=version)
                | Q(versions__less_than=version)
                | Q(versions__less_equal=version)
            )
        return self.filter(Exists(affected))

    def _apply_to_each(
        self,
        check: "Callable[[CVEDerivationClusterProposal], None]",
        apply: "Callable[[CVEDerivationClusterProposal], None]",
        fresh_cache: bool = False,
        check_selection: "Callable[[CVEDerivationClusterProposalQuerySet], None] | None" = None,
    ) -> int:
        """
        Apply an operation to every selected suggestion, or to none of them.

        The whole selection is checked first, so that an unapplicable operation is
        reported for all the suggestions that refuse it rather than just the first
        one, and so that nothing is written in that case.
        """
        with transaction.atomic():
            if check_selection is not None:
                check_selection(self)

            suggestions = list(self)
            if fresh_cache:
                # NOTE(@florentc): We assume the cache is fresh most of the time.
                # This should only rarely hold the transaction open for long.
                for suggestion in suggestions:
                    suggestion.ensure_fresh_cache()

            errors = {}
            for suggestion in suggestions:
                try:
                    check(suggestion)
                except ValidationError as error:
                    errors[suggestion.pk] = error.message_dict
            if errors:
                raise BulkValidationError(errors)

            for suggestion in suggestions:
                apply(suggestion)
        return len(suggestions)

    def change_status(
        self,
        status: SuggestionStatus,
        rejection_reason: "CVEDerivationClusterProposal.RejectionReason | None" = None,
        comment: str | None = None,
    ) -> int:
        """Move every selected suggestion to the given status."""
        return self._apply_to_each(
            lambda suggestion: suggestion.check_change_status(
                status, rejection_reason, comment
            ),
            lambda suggestion: suggestion.change_status(
                status, rejection_reason, comment
            ),
        )

    def set_comment(self, comment: str | None) -> int:
        """
        Replace the comment every selected suggestion shares.

        Refuses a selection whose suggestions say different things, so that a bulk edit
        cannot silently overwrite comments the caller has not seen.
        """

        def check_shared_comment(
            selection: "CVEDerivationClusterProposalQuerySet",
        ) -> None:
            shared_comments = {
                existing or None
                for existing in selection.values_list("comment", flat=True)
            }
            if len(shared_comments) > 1:
                raise BulkValidationError(
                    {},
                    detail="The selected suggestions do not all hold the same comment, so replacing it would discard what sets them apart. Narrow the selection down to suggestions sharing a single comment.",
                )

        return self._apply_to_each(
            lambda suggestion: None,
            lambda suggestion: suggestion.set_comment(comment),
            check_selection=check_shared_comment,
        )

    def set_in_issue_draft(self, in_issue_draft: bool) -> int:
        """Add every selected suggestion to the issue draft, or remove them all."""
        return self._apply_to_each(
            lambda suggestion: suggestion.check_set_in_issue_draft(in_issue_draft),
            lambda suggestion: suggestion.set_in_issue_draft(in_issue_draft),
        )

    def ignore_package(self, package_attribute: str) -> int:
        """Ignore a package on every selected suggestion."""
        return self._apply_to_each(
            lambda suggestion: suggestion.check_ignore_package(package_attribute),
            lambda suggestion: suggestion.ignore_package(package_attribute),
            fresh_cache=True,
        )

    def restore_package(self, package_attribute: str) -> int:
        """Restore a package on every selected suggestion."""
        return self._apply_to_each(
            lambda suggestion: suggestion.check_restore_package(package_attribute),
            lambda suggestion: suggestion.restore_package(package_attribute),
            fresh_cache=True,
        )

    def ignore_maintainer(self, github_id: int) -> int:
        """Ignore a maintainer on every selected suggestion."""
        return self._apply_to_each(
            lambda suggestion: suggestion.check_ignore_maintainer(github_id),
            lambda suggestion: suggestion.ignore_maintainer(github_id),
            fresh_cache=True,
        )

    def restore_maintainer(self, github_id: int) -> int:
        """Restore a maintainer on every selected suggestion."""
        return self._apply_to_each(
            lambda suggestion: suggestion.check_restore_maintainer(github_id),
            lambda suggestion: suggestion.restore_maintainer(github_id),
            fresh_cache=True,
        )

    def ignore_reference(self, reference_url: str) -> int:
        """Ignore a URL reference on every selected suggestion."""
        return self._apply_to_each(
            lambda suggestion: suggestion.check_ignore_reference(reference_url),
            lambda suggestion: suggestion.ignore_reference(reference_url),
            fresh_cache=True,
        )

    def restore_reference(self, reference_url: str) -> int:
        """Restore a URL reference on every selected suggestion."""
        return self._apply_to_each(
            lambda suggestion: suggestion.check_restore_reference(reference_url),
            lambda suggestion: suggestion.restore_reference(reference_url),
            fresh_cache=True,
        )

    def shared_state(self) -> "SharedState":
        """
        What every selected suggestion has in common, to expose possible bulk operations.

        Maintainers added by hand are left out: the only bulk maintainer operations
        ignore and restore the maintainers a suggestion came with.

        Read from the cache as it stands without refreshing to stay cheap.
        """
        from shared.cache_suggestions import merge_url_references

        def merge_references(refs: list[dict]) -> dict:
            merged = merge_url_references(
                refs[0]["url"], ((r["name"], r["tags"]) for r in refs)
            )
            return {**merged.model_dump(), "tags": sorted(merged.tags)}

        rows = list(
            self.annotate(
                payload_package_keys=JSONObjectKeys("cached__payload", "packages"),
                payload_original_package_keys=JSONObjectKeys(
                    "cached__payload", "original_packages"
                ),
                payload_maintainers=KeyTransform(
                    "categorized_maintainers", "cached__payload"
                ),
                payload_references=KeyTransform(
                    "categorized_url_references", "cached__payload"
                ),
            ).values_list(
                "status",
                "in_issue_draft",
                "comment",
                "payload_package_keys",
                "payload_original_package_keys",
                "payload_maintainers",
                "payload_references",
            )
        )

        statuses = set()
        drafts = set()
        comments = set()
        packages: list[tuple[dict, dict]] = []
        maintainers: list[tuple[dict, dict]] = []
        references: list[tuple[dict, dict]] = []
        for (
            status,
            in_issue_draft,
            comment,
            active_packages,
            original_packages,
            cat_maintainers,
            cat_references,
        ) in rows:
            statuses.add(status)
            drafts.add(in_issue_draft)
            comments.add(comment or "")
            packages.append(
                (
                    {attribute: attribute for attribute in active_packages},
                    {
                        attribute: attribute
                        for attribute in original_packages
                        if attribute not in active_packages
                    },
                )
            )
            maintainers.append(
                (
                    {m["github_id"]: m for m in cat_maintainers["active"]},
                    {m["github_id"]: m for m in cat_maintainers["ignored"]},
                )
            )
            references.append(
                (
                    {r["url"]: r for r in cat_references["active"]},
                    {r["url"]: r for r in cat_references["ignored"]},
                )
            )

        return SharedState(
            status=next(iter(statuses)) if len(statuses) == 1 else None,
            in_issue_draft=next(iter(drafts)) if len(drafts) == 1 else None,
            comment=next(iter(comments)) if len(comments) == 1 else None,
            packages=_shared_values(packages, sort_key=lambda v: v),
            maintainers=_shared_values(maintainers, sort_key=lambda v: v["github"]),
            references=_shared_values(
                references,
                sort_key=lambda v: v["url"],
                merge=merge_references,
            ),
        )


@pghistory.track(
    pghistory.InsertEvent(),
    pghistory.UpdateEvent(),
    pghistory.ManualEvent("rematch"),
    fields=["status", "rejection_reason"],
    model_name="CVEDerivationClusterProposalStatusEvent",
)
class CVEDerivationClusterProposal(TimeStampMixin):
    """
    A proposal to link a CVE to a set of derivations.
    """

    Status = SuggestionStatus
    objects = CVEDerivationClusterProposalQuerySet.as_manager()

    class RejectionReason(models.TextChoices):
        EXCLUSIVELY_HOSTED_SERVICE = (
            "exclusively_hosted_service",
            _("exclusively hosted service"),
        )
        NOT_IN_NIXPKGS = (
            "not_in_nixpkgs",
            _("not in Nixpkgs"),
        )
        HARDWARE_ONLY_CPE = (
            "hardware_only_cpe",
            _("hardware only"),
        )
        MAX_MATCHES_EXCEEDED = (
            "max_matches_exceeded",
            _("max. allowed matches exceeded"),
        )
        KNOWN_VULNERABILITY = (
            "known_vulnerability",
            _("already tracked in derivation metadata"),
        )
        NO_MATCHES = (
            "no_matches",
            _("no matching packages found"),
        )

    @classproperty
    def CURRENT_ALGORITHM_VERSION(cls) -> int:  # noqa: N802
        return 2

    cached: "shared.models.cached.CachedSuggestions"

    cve = models.ForeignKey(
        CveRecord, related_name="derivation_links_proposals", on_delete=models.CASCADE
    )
    # NixDerivations of the same product and with a version in the affected range
    derivations = models.ManyToManyField(
        NixDerivation,
        related_name="cve_links_proposals",
        through="DerivationClusterProposalLink",
    )

    status = models.CharField(
        max_length=126, choices=Status.choices, default=Status.PENDING
    )

    # Only suggstions in status ACCEPTED can be in issue_draft
    in_issue_draft = models.BooleanField(default=False)

    nixpkgs_issue = models.ForeignKey(
        "NixpkgsIssue",  # In quotes to postpone to runtime and avoid circular dependency
        null=True,
        blank=True,
        related_name="suggestions",
        on_delete=models.SET_NULL,
    )

    comment = models.CharField(
        max_length=1000,
        null=True,
        blank=True,
        help_text=_(
            "Optional free text comment for additional notes, context, dismissal reason"
        ),
    )

    # Absence of rejection reason either means the suggestion is not is REJECTED status,
    # or that the rejection reason is provided in the free form comment section (implying it's non empty)
    rejection_reason = models.CharField(
        max_length=126,
        choices=RejectionReason.choices,
        null=True,
        blank=True,
        help_text=_("Reason for rejection (automatic or manual)"),
    )

    rejection_match_count = models.PositiveIntegerField(null=True, blank=True)
    rejection_max_matches_limit = models.PositiveIntegerField(null=True, blank=True)

    algorithm_version = models.IntegerField(
        default=0,
        help_text=_("Version of the matching algorithm that generated this proposal"),
    )

    @property
    def is_frozen(self) -> bool:
        return self.status not in [
            CVEDerivationClusterProposal.Status.PENDING,
            CVEDerivationClusterProposal.Status.ACCEPTED,
        ]

    @property
    def references(self) -> list[Reference]:
        """Get all unique references from all containers of the CVE attached to this suggestion."""
        return list(Reference.objects.filter(container__cve=self.cve).distinct())

    @property
    def is_cache_stale(self) -> bool:
        return not getattr(self, "cached", None) or self.cached.is_stale

    def ensure_fresh_cache(self) -> None:
        """Regenerate stale or missing cache for this suggestion."""
        if self.is_cache_stale:
            from shared.cache_suggestions import cache_new_suggestions

            cache_new_suggestions(self)
            self.refresh_from_db()

    def check_ignore_package(self, package_attribute: str) -> None:
        """
        Raise unless this package can be ignored on this suggestion.
        """
        original_packages = self.cached.payload["original_packages"]
        if package_attribute not in original_packages:
            raise ValidationError(
                {"package_attribute": "Package not found in the suggestion"}
            )
        if self.package_overlays.filter(
            package_attribute=package_attribute,
            type=PackageOverlay.Type.IGNORED,
        ).exists():
            raise ValidationError({"package_attribute": "Package is already ignored"})

    def ignore_package(self, package_attribute: str) -> None:
        """Ignore a package, updating the overlay and the cache."""
        with transaction.atomic():
            self.check_ignore_package(package_attribute)
            self.package_overlays.get_or_create(
                package_attribute=package_attribute,
                defaults={
                    "type": PackageOverlay.Type.IGNORED,
                    "package_id": PackageAttrpath.objects.get(
                        attrpath=package_attribute
                    ).package.id,
                },
            )
            self._recompute_package_cache()

    def check_restore_package(self, package_attribute: str) -> None:
        """
        Raise unless this package can be restored on this suggestion.
        """
        if not self.package_overlays.filter(
            package_attribute=package_attribute,
            type=PackageOverlay.Type.IGNORED,
        ).exists():
            raise ValidationError(
                {"package_attribute": "No ignore overlay found for this package"}
            )

    def restore_package(self, package_attribute: str) -> None:
        """Restore a previously ignored package."""
        with transaction.atomic():
            self.check_restore_package(package_attribute)
            overlay = self.package_overlays.get(
                package_attribute=package_attribute,
                type=PackageOverlay.Type.IGNORED,
            )
            overlay.delete()
            self._recompute_package_cache()

    def _recompute_package_cache(self) -> None:
        """Recompute the cached `packages` and `categorized_maintainers` from
        the current set of package overlays."""
        from shared.cache_suggestions import (
            CachedSuggestion,
            apply_package_overlays,
            categorize_maintainers,
        )

        self.cached.payload["packages"] = apply_package_overlays(
            self.cached.payload["original_packages"],
            self.package_overlays.all(),
        )
        original_packages = {
            k: CachedSuggestion.Package.model_validate(v)
            for k, v in self.cached.payload["original_packages"].items()
        }
        active_packages = {
            k: CachedSuggestion.Package.model_validate(v)
            for k, v in self.cached.payload["packages"].items()
        }
        self.cached.payload["categorized_maintainers"] = categorize_maintainers(
            original_packages,
            active_packages,
            self.maintainer_overlays.all(),
        ).model_dump()
        self.cached.save()

    def check_ignore_reference(self, reference_url: str) -> None:
        """
        Raise unless this URL reference can be ignored on this suggestion.
        """
        cat_refs = self.cached.payload["categorized_url_references"]
        if not any(r["url"] == reference_url for r in cat_refs["original"]):
            raise ValidationError(
                {"reference_url": "Reference not found in the suggestion"}
            )
        if self.reference_url_overlays.filter(
            reference_url=reference_url, type=ReferenceUrlOverlay.Type.IGNORED
        ).exists():
            raise ValidationError({"reference_url": "Reference is already ignored"})

    def ignore_reference(self, reference_url: str) -> None:
        """Ignore a URL reference, updating the overlay and the cache."""
        with transaction.atomic():
            self.check_ignore_reference(reference_url)
            cat_refs = self.cached.payload["categorized_url_references"]
            ref = next(r for r in cat_refs["original"] if r["url"] == reference_url)
            self.reference_url_overlays.get_or_create(
                reference_url=reference_url,
                defaults={
                    "deduplicated_name": ref["name"],
                    "type": ReferenceUrlOverlay.Type.IGNORED,
                },
            )
            cat_refs["active"] = [
                r for r in cat_refs["active"] if r["url"] != reference_url
            ]
            cat_refs["ignored"].append(ref)
            self.cached.save()

    def check_restore_reference(self, reference_url: str) -> None:
        """
        Raise unless this URL reference can be restored on this suggestion.
        """
        cat_refs = self.cached.payload["categorized_url_references"]
        if not any(r["url"] == reference_url for r in cat_refs["ignored"]):
            raise ValidationError(
                {"reference_url": "Reference not found in ignored references"}
            )
        if not self.reference_url_overlays.filter(
            reference_url=reference_url, type=ReferenceUrlOverlay.Type.IGNORED
        ).exists():
            raise ValidationError(
                {"reference_url": "No ignore overlay found for this reference"}
            )

    def restore_reference(self, reference_url: str) -> None:
        """Restore a previously ignored URL reference."""
        with transaction.atomic():
            self.check_restore_reference(reference_url)
            cat_refs = self.cached.payload["categorized_url_references"]
            ref = next(r for r in cat_refs["ignored"] if r["url"] == reference_url)
            overlay = self.reference_url_overlays.get(
                reference_url=reference_url, type=ReferenceUrlOverlay.Type.IGNORED
            )
            overlay.delete()
            cat_refs["ignored"] = [
                r for r in cat_refs["ignored"] if r["url"] != reference_url
            ]
            cat_refs["active"].append(ref)
            self.cached.save()

    def check_ignore_maintainer(self, github_id: int) -> None:
        """
        Raise unless this maintainer can be ignored on this suggestion.
        """
        cat_maintainers = self.cached.payload["categorized_maintainers"]
        if not any(m["github_id"] == github_id for m in cat_maintainers["original"]):
            raise ValidationError(
                {"github_id": "Maintainer not found in original maintainers"}
            )
        if self.maintainer_overlays.filter(
            maintainer__github_id=github_id, type=MaintainerOverlay.Type.IGNORED
        ).exists():
            raise ValidationError({"github_id": "Maintainer is already ignored"})

    def ignore_maintainer(self, github_id: int) -> None:
        """Ignore a maintainer, updating the overlay and the cache."""
        with transaction.atomic():
            self.check_ignore_maintainer(github_id)
            cat_maintainers = self.cached.payload["categorized_maintainers"]
            maintainer_data = next(
                m for m in cat_maintainers["original"] if m["github_id"] == github_id
            )
            maintainer = NixMaintainer.objects.get(github_id=github_id)
            edit, created = self.maintainer_overlays.get_or_create(
                maintainer=maintainer,
                defaults={"type": MaintainerOverlay.Type.IGNORED},
            )
            if not created and edit.type != MaintainerOverlay.Type.IGNORED:
                edit.type = MaintainerOverlay.Type.IGNORED
                edit.save()
            cat_maintainers["active"] = [
                m for m in cat_maintainers["active"] if m["github_id"] != github_id
            ]
            cat_maintainers["ignored"].append(maintainer_data)
            self.cached.save()

    def check_restore_maintainer(self, github_id: int) -> None:
        """
        Raise unless this maintainer can be restored on this suggestion.
        """
        cat_maintainers = self.cached.payload["categorized_maintainers"]
        if not any(m["github_id"] == github_id for m in cat_maintainers["ignored"]):
            raise ValidationError(
                {"github_id": "Maintainer not found in ignored maintainers"}
            )
        if not self.maintainer_overlays.filter(
            maintainer__github_id=github_id, type=MaintainerOverlay.Type.IGNORED
        ).exists():
            raise ValidationError(
                {"github_id": "No ignore overlay found for this maintainer"}
            )

    def restore_maintainer(self, github_id: int) -> None:
        """Restore a previously ignored maintainer."""
        with transaction.atomic():
            self.check_restore_maintainer(github_id)
            cat_maintainers = self.cached.payload["categorized_maintainers"]
            maintainer_data = next(
                m for m in cat_maintainers["ignored"] if m["github_id"] == github_id
            )
            overlay = self.maintainer_overlays.get(
                maintainer__github_id=github_id, type=MaintainerOverlay.Type.IGNORED
            )
            overlay.delete()
            cat_maintainers["ignored"] = [
                m for m in cat_maintainers["ignored"] if m["github_id"] != github_id
            ]
            cat_maintainers["active"].append(maintainer_data)
            self.cached.save()

    def add_maintainer(self, github_handle: str) -> NixMaintainer:
        """Manually add a maintainer that is not part of the original maintainers."""
        # FIXME(@fricklerhandwerk): Extract helper into utilities collection.
        from shared.cache_suggestions import to_dict

        # FIXME(@fricklerhandwerk): Extract applicaton-specific GitHub-related logic into separate module.
        from shared.github import fetch_user_info

        cat_maintainers = self.cached.payload["categorized_maintainers"]
        if any(m["github"] == github_handle for m in cat_maintainers["original"]):
            raise ValidationError({"github_handle": "Already a maintainer"})

        maintainer = NixMaintainer.objects.filter(github=github_handle).first()
        if maintainer is None:
            gh_user = fetch_user_info(github_handle)
            if gh_user is None:
                raise ValidationError(
                    {"github_handle": "Could not fetch maintainer from GitHub"}
                )
            maintainer, _ = NixMaintainer.objects.update_or_create(
                github_id=gh_user["id"],
                defaults={
                    "github": gh_user["login"],
                    "name": gh_user.get("name"),
                    "email": gh_user.get("email"),
                },
            )

        with transaction.atomic():
            if any(m["github"] == github_handle for m in cat_maintainers["original"]):
                raise ValidationError({"github_handle": "Already a maintainer"})

            edit, created = self.maintainer_overlays.get_or_create(
                maintainer=maintainer,
                defaults={"type": MaintainerOverlay.Type.ADDITIONAL},
            )
            if not created and edit.type != MaintainerOverlay.Type.ADDITIONAL:
                edit.type = MaintainerOverlay.Type.ADDITIONAL
                edit.save()

            if not any(
                m["github_id"] == maintainer.github_id for m in cat_maintainers["added"]
            ):
                cat_maintainers["added"].append(to_dict(maintainer))
            self.cached.save()

        return maintainer

    def delete_maintainer(self, github_id: int) -> None:
        """Delete a maintainer that was manually added."""
        with transaction.atomic():
            cat_maintainers = self.cached.payload["categorized_maintainers"]
            maintainer_data = next(
                (m for m in cat_maintainers["added"] if m["github_id"] == github_id),
                None,
            )
            if maintainer_data is None:
                raise ValidationError(
                    {"github_id": "Only manually added maintainers can be deleted"}
                )

            overlay = self.maintainer_overlays.filter(
                maintainer__github_id=github_id, type=MaintainerOverlay.Type.ADDITIONAL
            ).first()
            if not overlay:
                raise ValidationError(
                    {"github_id": "No add overlay found for this maintainer"}
                )

            overlay.delete()
            cat_maintainers["added"] = [
                m for m in cat_maintainers["added"] if m["github_id"] != github_id
            ]
            self.cached.save()

    def set_comment(self, comment: str | None) -> None:
        """Update the free-text comment independently of status changes."""
        self.comment = comment or None
        self.save(update_fields=["comment"])

    def check_set_in_issue_draft(self, in_issue_draft: bool) -> None:
        """
        Raise unless this suggestion can be put in or taken out of the issue draft.
        """
        candidate = copy(self)
        candidate.in_issue_draft = in_issue_draft
        candidate.full_clean()

    def set_in_issue_draft(self, in_issue_draft: bool) -> None:
        """Add or remove this suggestion from the issue draft bundle."""
        self.in_issue_draft = in_issue_draft
        self.full_clean()
        self.save(update_fields=["in_issue_draft"])

    def check_change_status(
        self,
        status: SuggestionStatus,
        rejection_reason: RejectionReason | None = None,
        comment: str | None = None,
    ) -> None:
        """
        Raise unless this suggestion can move to the given status.

        Mirrors what the database would reject anyway, so that a caller acting on
        several suggestions at once can tell beforehand which ones it cannot handle.
        """
        if status == self.status:
            raise ValidationError({"status": f"Already in status '{self.status}'"})
        if (self.status, status) not in STATUS_TRANSITIONS:
            raise ValidationError(
                {
                    "status": f"Invalid status transition from '{self.status}' to '{status}'"
                }
            )
        candidate = copy(self)
        candidate.status = status
        candidate.rejection_reason = rejection_reason
        if comment:
            candidate.comment = comment
        if status != SuggestionStatus.ACCEPTED:
            candidate.in_issue_draft = False
        candidate.full_clean()

    def change_status(
        self,
        status: SuggestionStatus,
        rejection_reason: RejectionReason | None = None,
        comment: str | None = None,
    ) -> None:
        if status == self.status:
            raise ValidationError({"status": f"Already in status '{self.status}'"})

        # Automatically remove from issue draft when changing status away from accepted
        if status != SuggestionStatus.ACCEPTED:
            self.in_issue_draft = False

        self.status = status
        self.rejection_reason = rejection_reason
        if comment:
            self.comment = comment
        self.full_clean()
        try:
            self.save()
        except InternalError:
            raise ValidationError(
                {
                    "status": f"Invalid status transition from '{self.status}' to '{status}'"
                }
            )

    def clean(self) -> None:
        if self.status == SuggestionStatus.REJECTED:
            if self.rejection_reason is None and not self.comment:
                raise ValidationError(
                    {
                        "rejection_reason": "Rejecting a suggestion requires a reason or a comment"
                    }
                )
            elif self.rejection_reason == self.RejectionReason.MAX_MATCHES_EXCEEDED:
                if (
                    self.rejection_match_count is not None
                    and self.rejection_max_matches_limit is not None
                ):
                    pass
                elif (
                    self.rejection_match_count is None
                    and self.rejection_max_matches_limit is None
                ):
                    raise ValidationError(
                        {
                            "rejection_reason": "MAX_MATCHES_EXCEEDED requires match count and limit"
                        }
                    )
                else:
                    raise ValidationError(
                        {
                            "rejection_reason": "MAX_MATCHES_EXCEEDED requires both match count and limit"
                        }
                    )
            elif self.rejection_reason in (
                None,  # when comment is set
                self.RejectionReason.EXCLUSIVELY_HOSTED_SERVICE,
                self.RejectionReason.NOT_IN_NIXPKGS,
                self.RejectionReason.HARDWARE_ONLY_CPE,
                self.RejectionReason.KNOWN_VULNERABILITY,
            ):
                pass
            else:
                raise ValidationError(
                    {"rejection_reason": "Unhandled rejection reason"}
                )
        else:
            if self.rejection_reason is not None:
                raise ValidationError(
                    {
                        "rejection_reason": "Cannot set rejection reason on suggeston that is not rejected"
                    }
                )
        if self.in_issue_draft and self.status != SuggestionStatus.ACCEPTED:
            raise ValidationError(
                {
                    "in_issue_draft": "A suggestion can only be in an issue draft when it is accepted"
                }
            )

    def save(self, *args: Any, **kwargs: Any) -> None:
        # Automatically remove from issue draft when changing status away from accepted
        if self.status != SuggestionStatus.ACCEPTED:
            self.in_issue_draft = False
        super().save(*args, **kwargs)

    class Meta:  # type: ignore[override]
        triggers = [
            pgtrigger.FSM(
                name="status_fsm",
                field="status",
                transitions=STATUS_TRANSITIONS,
            ),
        ]

    @property
    def is_active_algorithm_match(self) -> bool:
        return self.algorithm_version == self.CURRENT_ALGORITHM_VERSION


@pghistory.track(
    pghistory.ManualEvent("maintainer.add"),
    pghistory.ManualEvent("maintainer.delete"),
    pghistory.ManualEvent("maintainer.restore"),
    pghistory.ManualEvent("maintainer.ignore"),
)
class MaintainerOverlay(Overlay):
    """
    An element in the overlay set of maintainers of a suggestion.
    """

    maintainer = models.ForeignKey(NixMaintainer, on_delete=models.PROTECT)
    suggestion = models.ForeignKey(
        CVEDerivationClusterProposal,
        related_name="maintainer_overlays",
        on_delete=models.CASCADE,
    )

    class Meta(Overlay.Meta):
        constraints = [
            # Ensures that a maintainer can only be added or removed once per
            # suggestion.
            models.UniqueConstraint(
                fields=["suggestion", "maintainer"],
                name="unique_maintainer_overlay_per_suggestion",
            )
        ]


@pghistory.track(
    pghistory.ManualEvent("package.restore"),
    pghistory.ManualEvent("package.ignore"),
    attrs={
        "package": models.ForeignKey(
            Package,
            on_delete=models.RESTRICT,
            # Like pghistory's own copies of tracked references, keep history out of the package's reverse relations.
            related_name="+",
            related_query_name="+",
        )
    },
)
class PackageOverlay(Overlay):
    """
    An element in the overlay set of packages of a suggestion.
    """

    package_attribute = models.CharField(max_length=255)

    package = models.ForeignKey(
        Package,
        on_delete=models.RESTRICT,
        related_name="overlays",
    )
    suggestion = models.ForeignKey(
        CVEDerivationClusterProposal,
        related_name="package_overlays",
        on_delete=models.CASCADE,
    )

    class Meta(Overlay.Meta):
        constraints = [
            models.UniqueConstraint(
                fields=["suggestion", "package_attribute"],
                name="unique_package_overlay_per_suggestion",
            )
        ]


@pghistory.track(
    pghistory.ManualEvent("reference.restore"),
    pghistory.ManualEvent("reference.ignore"),
)
class ReferenceUrlOverlay(Overlay):
    """
    A single manual overlay of the list of references of a suggestion.
    These overlays are per url, so one overlay may apply to several references which share the same URL.
    """

    reference_url = models.URLField(max_length=2048, blank=True)
    deduplicated_name = models.CharField(
        max_length=512, blank=True
    )  # Used as a base for the activity log events
    suggestion = models.ForeignKey(
        CVEDerivationClusterProposal,
        related_name="reference_url_overlays",
        on_delete=models.CASCADE,
    )

    class Meta(Overlay.Meta):
        constraints = [
            # Ensures that a reference can only be added or removed once per
            # suggestion.
            models.UniqueConstraint(
                fields=["suggestion", "reference_url"],
                name="unique_reference_url_overlay_per_suggestion",
            )
        ]


@receiver(post_save, sender=PackageOverlay)
def track_package_overlay_save(
    sender: type[PackageOverlay],
    instance: PackageOverlay,
    created: bool,
    **kwargs: Any,
) -> None:
    if created:
        pghistory.create_event(
            obj=instance,
            label="package.ignore",
        )


@receiver(post_delete, sender=PackageOverlay)
def track_package_overlay_delete(
    sender: type[PackageOverlay], instance: PackageOverlay, **kwargs: Any
) -> None:
    pghistory.create_event(
        obj=instance,
        label="package.restore",
    )


@receiver(post_save, sender=MaintainerOverlay)
def track_maintainer_overlay_save(
    sender: type[MaintainerOverlay],
    instance: MaintainerOverlay,
    created: bool,
    **kwargs: Any,
) -> None:
    if created:
        label = (
            "maintainer.add"
            if instance.type == MaintainerOverlay.Type.ADDITIONAL
            else "maintainer.ignore"
        )
        pghistory.create_event(
            obj=instance,
            label=label,
        )


@receiver(post_delete, sender=MaintainerOverlay)
def track_maintainer_overlay_delete(
    sender: type[MaintainerOverlay], instance: MaintainerOverlay, **kwargs: Any
) -> None:
    label = (
        "maintainer.delete"
        if instance.type == MaintainerOverlay.Type.ADDITIONAL
        else "maintainer.restore"
    )
    pghistory.create_event(
        obj=instance,
        label=label,
    )


@receiver(post_save, sender=ReferenceUrlOverlay)
def track_reference_overlay_save(
    sender: type[ReferenceUrlOverlay],
    instance: ReferenceUrlOverlay,
    created: bool,
    **kwargs: Any,
) -> None:
    if created:
        if instance.type == ReferenceUrlOverlay.Type.IGNORED:
            pghistory.create_event(
                obj=instance,
                label="reference.ignore",
            )


@receiver(post_delete, sender=ReferenceUrlOverlay)
def track_reference_overlay_delete(
    sender: type[ReferenceUrlOverlay], instance: ReferenceUrlOverlay, **kwargs: Any
) -> None:
    if instance.type == ReferenceUrlOverlay.Type.IGNORED:
        pghistory.create_event(
            obj=instance,
            label="reference.restore",
        )


class ProvenanceFlags(IntFlag, boundary=STRICT):
    CPE_MATCH = 1 << 7
    PACKAGE_NAME_MATCH = 1 << 0
    PRODUCT_MATCH = 1 << 6
    VERSION_CONSTRAINT_INRANGE = 1 << 1
    VERSION_CONSTRAINT_OUTOFRANGE = 1 << 2
    NO_SOURCE_VERSION_CONSTRAINT = 1 << 3
    # Whether the hardware constraint is matched for this derivation.
    HARDWARE_CONSTRAINT_INRANGE = 1 << 4
    KERNEL_CONSTRAINT_INRANGE = 1 << 5


# CVEDerivationClusterProposal `derivations` changes have to be tracked via its `through` model.
@pghistory.track(
    pghistory.InsertEvent("derivations.add"),
    pghistory.DeleteEvent("derivations.remove"),
)
class DerivationClusterProposalLink(models.Model):
    """
    A link between a NixDerivation and a CVEDerivationClusterProposal.
    """

    proposal = models.ForeignKey(CVEDerivationClusterProposal, on_delete=models.CASCADE)

    derivation = models.ForeignKey(NixDerivation, on_delete=models.PROTECT)

    # TODO: how to design the integrity here?
    # we probably want to add a fancy check here.
    provenance_flags = models.IntegerField()


class PackageClusterProposalLink(models.Model):
    proposal = models.ForeignKey(
        CVEDerivationClusterProposal,
        on_delete=models.CASCADE,
        related_name="package_links",
    )
    package = models.ForeignKey(
        Package,
        on_delete=models.PROTECT,
        related_name="cve_links",
    )
    provenance_flags = models.IntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["proposal", "package"],
                name="unique_package_per_proposal",
            )
        ]
