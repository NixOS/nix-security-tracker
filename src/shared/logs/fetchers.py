from typing import cast

from django.contrib.auth.models import User
from django.db.models import (
    BigIntegerField,
    Case,
    OuterRef,
    Q,
    Subquery,
    Value,
    When,
)
from django.db.models.functions import Cast, Coalesce
from django.forms.models import model_to_dict
from pghistory.models import EventQuerySet

from shared.logs.events import (
    Maintainer,
    RawEventType,
    RawMaintainerEvent,
    RawPackageEvent,
    RawReferenceEvent,
    RawStatusEvent,
    Reference,
)
from shared.models import (
    CVEDerivationClusterProposalStatusEvent,  # type: ignore
    MaintainerOverlayEvent,  # type: ignore
    PackageOverlayEvent,  # type: ignore
    ReferenceOverlayEvent,  # type: ignore
)
from shared.models.linkage import CVEDerivationClusterProposal


def _annotate_username(query: EventQuerySet) -> EventQuerySet:
    """Add username annotation to a query."""
    return query.annotate(
        username=Coalesce(
            Case(
                When(Q(pgh_context__isnull=True), then=Value("ADMIN")),
                When(
                    Q(pgh_context__metadata__contains={"user": None}),
                    then=Value("ANONYMOUS"),
                ),
                default=Subquery(
                    User.objects.filter(
                        id=Cast(
                            OuterRef("pgh_context__metadata__user"),
                            BigIntegerField(),
                        )
                    ).values("username")[:1]
                ),
            ),
            Value("REDACTED"),
        )
    )


def fetch_suggestion_events(
    suggestion_ids: list[int],
) -> dict[int, list[RawEventType]]:
    """Fetch all raw events for multiple suggestions in three batched queries."""
    result: dict[int, list[RawEventType]] = {sid: [] for sid in suggestion_ids}

    if not suggestion_ids:
        return result

    status_qs = _annotate_username(
        CVEDerivationClusterProposalStatusEvent.objects.select_related("pgh_context")
        .exclude(pgh_label="insert")
        .filter(pgh_obj_id__in=suggestion_ids)
    )
    for status_event in status_qs.iterator():
        result[status_event.pgh_obj_id].append(
            RawStatusEvent(
                suggestion_id=status_event.pgh_obj_id,
                timestamp=status_event.pgh_created_at,
                username=status_event.username,
                action=status_event.pgh_label,
                status_value=status_event.status,
                rejection_reason=CVEDerivationClusterProposal.RejectionReason(
                    status_event.rejection_reason
                ).label.__str__()
                if status_event.rejection_reason is not None
                else None,
            )
        )

    package_qs = _annotate_username(
        PackageOverlayEvent.objects.select_related("pgh_context").filter(
            suggestion_id__in=suggestion_ids
        )
    )
    for pkg_event in package_qs.iterator():
        result[pkg_event.suggestion_id].append(
            RawPackageEvent(
                suggestion_id=pkg_event.suggestion_id,
                timestamp=pkg_event.pgh_created_at,
                username=pkg_event.username,
                action=pkg_event.pgh_label,
                package_attribute=pkg_event.package_attribute,
            )
        )

    maintainer_qs = _annotate_username(
        MaintainerOverlayEvent.objects.select_related(
            "pgh_context", "maintainer"
        ).filter(suggestion_id__in=suggestion_ids)
    )
    for m_event in maintainer_qs.iterator():
        result[m_event.suggestion_id].append(
            RawMaintainerEvent(
                suggestion_id=m_event.suggestion_id,
                timestamp=m_event.pgh_created_at,
                username=m_event.username,
                action=m_event.pgh_label,
                maintainer=cast(Maintainer, model_to_dict(m_event.maintainer)),
            )
        )

    reference_qs = _annotate_username(
        ReferenceOverlayEvent.objects.select_related("pgh_context", "reference").filter(
            suggestion_id__in=suggestion_ids
        )
    )
    for m_event in reference_qs.iterator():
        result[m_event.suggestion_id].append(
            RawReferenceEvent(
                suggestion_id=m_event.suggestion_id,
                timestamp=m_event.pgh_created_at,
                username=m_event.username,
                action=m_event.pgh_label,
                reference=Reference(
                    id=m_event.reference.id,
                    url=m_event.reference.url,
                    name=m_event.reference.name,
                ),
            )
        )

    return result
