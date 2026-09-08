from collections.abc import Mapping, Sequence
from dataclasses import dataclass, field
from typing import Any

import pgtrigger
from django.contrib.postgres.search import SearchVector
from django.db import transaction
from django.db.models import Model

from shared import models
from shared.fetchers import make_date, to_camel_case


def _get_or_create_cache(
    model_class: type[Model], field_name: str, values: set[str]
) -> dict[str, Model]:
    """
    Given a set of strings, bulk gets or creates the corresponding models.
    Returns a dictionary mapping the string value to the saved Model instance.
    """
    if not values:
        return {}

    existing = {
        getattr(obj, field_name): obj
        for obj in model_class.objects.filter(**{f"{field_name}__in": values})
    }

    missing_values = values - set(existing.keys())
    if missing_values:
        new_objs = [model_class(**{field_name: val}) for val in missing_values]
        model_class.objects.bulk_create(new_objs)
        for obj in model_class.objects.filter(**{f"{field_name}__in": missing_values}):
            existing[getattr(obj, field_name)] = obj

    return existing


@dataclass
class CveBulkContext:
    # Deduplicated by field name or UUID
    orgs: dict[str, models.Organization] = field(default_factory=dict)

    tags_required: set[str] = field(default_factory=set)
    platforms_required: set[str] = field(default_factory=set)
    cpes_required: set[str] = field(default_factory=set)
    modules_required: set[str] = field(default_factory=set)
    program_files_required: set[str] = field(default_factory=set)
    program_routines_required: set[str] = field(default_factory=set)

    tags: dict[str, models.Tag] = field(default_factory=dict)
    platforms: dict[str, models.Platform] = field(default_factory=dict)
    cpes: dict[str, models.Cpe] = field(default_factory=dict)
    modules: dict[str, models.Module] = field(default_factory=dict)
    program_files: dict[str, models.ProgramFile] = field(default_factory=dict)
    program_routines: dict[str, models.ProgramRoutine] = field(default_factory=dict)

    # Objects to bulk_create (these will get PKs populated by Django)
    cve_records: list[models.CveRecord] = field(default_factory=list)
    supporting_media: list[models.SupportingMedia] = field(default_factory=list)
    descriptions: list[models.Description] = field(default_factory=list)
    references: list[models.Reference] = field(default_factory=list)
    problem_types: list[models.ProblemType] = field(default_factory=list)
    metrics: list[models.Metric] = field(default_factory=list)
    events: list[models.Event] = field(default_factory=list)
    credits: list[models.Credit] = field(default_factory=list)
    versions: list[models.Version] = field(default_factory=list)
    affected_products: list[models.AffectedProduct] = field(default_factory=list)
    containers: list[models.Container] = field(default_factory=list)

    # M2M link Tuples: (source_obj, target_obj)
    m2m_description_media: list[tuple[models.Description, models.SupportingMedia]] = (
        field(default_factory=list)
    )
    m2m_reference_tags: list[tuple[models.Reference, str]] = field(default_factory=list)
    m2m_problemtype_description: list[tuple[models.ProblemType, models.Description]] = (
        field(default_factory=list)
    )
    m2m_problemtype_references: list[tuple[models.ProblemType, models.Reference]] = (
        field(default_factory=list)
    )
    m2m_metric_scenarios: list[tuple[models.Metric, models.Description]] = field(
        default_factory=list
    )

    m2m_affected_platforms: list[tuple[models.AffectedProduct, str]] = field(
        default_factory=list
    )
    m2m_affected_versions: list[tuple[models.AffectedProduct, models.Version]] = field(
        default_factory=list
    )
    m2m_affected_cpes: list[tuple[models.AffectedProduct, str]] = field(
        default_factory=list
    )
    m2m_affected_modules: list[tuple[models.AffectedProduct, str]] = field(
        default_factory=list
    )
    m2m_affected_program_files: list[tuple[models.AffectedProduct, str]] = field(
        default_factory=list
    )
    m2m_affected_program_routines: list[tuple[models.AffectedProduct, str]] = field(
        default_factory=list
    )

    m2m_container_descriptions: list[tuple[models.Container, models.Description]] = (
        field(default_factory=list)
    )
    m2m_container_affected: list[tuple[models.Container, models.AffectedProduct]] = (
        field(default_factory=list)
    )
    m2m_container_problem_types: list[tuple[models.Container, models.ProblemType]] = (
        field(default_factory=list)
    )
    m2m_container_references: list[tuple[models.Container, models.Reference]] = field(
        default_factory=list
    )
    m2m_container_metrics: list[tuple[models.Container, models.Metric]] = field(
        default_factory=list
    )
    m2m_container_configurations: list[tuple[models.Container, models.Description]] = (
        field(default_factory=list)
    )
    m2m_container_workarounds: list[tuple[models.Container, models.Description]] = (
        field(default_factory=list)
    )
    m2m_container_solutions: list[tuple[models.Container, models.Description]] = field(
        default_factory=list
    )
    m2m_container_exploits: list[tuple[models.Container, models.Description]] = field(
        default_factory=list
    )
    m2m_container_timeline: list[tuple[models.Container, models.Event]] = field(
        default_factory=list
    )
    m2m_container_tags: list[tuple[models.Container, str]] = field(default_factory=list)
    m2m_container_credits: list[tuple[models.Container, models.Credit]] = field(
        default_factory=list
    )


def prepare_organization(
    uuid: str | None, ctx: CveBulkContext, short_name: str | None = None
) -> models.Organization | None:
    if uuid is None:
        return None

    if uuid not in ctx.orgs:
        ctx.orgs[uuid] = models.Organization(uuid=uuid, short_name=short_name)

    return ctx.orgs[uuid]


def prepare_media(data: dict[str, str], ctx: CveBulkContext) -> models.SupportingMedia:
    obj = models.SupportingMedia(
        _type=data["type"], base64=data.get("base64", False), value=data["value"]
    )
    ctx.supporting_media.append(obj)
    return obj


def prepare_description(
    data: dict[str, Any], ctx: CveBulkContext
) -> models.Description:
    obj = models.Description(lang=data["lang"], value=data["value"])
    ctx.descriptions.append(obj)

    for m_data in data.get("supportingMedia", []):
        media = prepare_media(m_data, ctx)
        ctx.m2m_description_media.append((obj, media))

    return obj


def prepare_reference(data: dict[str, Any], ctx: CveBulkContext) -> models.Reference:
    obj = models.Reference(url=data["url"], name=data.get("name", ""))
    ctx.references.append(obj)

    for tag_data in data.get("tags", []):
        tag = tag_data
        if isinstance(tag, dict):
            tag = tag.get("name") or tag.get("value")
        if tag:
            ctx.tags_required.add(tag)
            ctx.m2m_reference_tags.append((obj, tag))

    return obj


def prepare_problem_type(
    data: dict[str, Any], ctx: CveBulkContext
) -> models.ProblemType:
    obj = models.ProblemType(cwe_id=data.get("cweId"), _type=data.get("type"))
    ctx.problem_types.append(obj)

    desc = prepare_description(
        {"lang": data["lang"], "value": data["description"]}, ctx
    )
    ctx.m2m_problemtype_description.append((obj, desc))

    for ref_data in data.get("references", []):
        ref = prepare_reference(ref_data, ctx)
        ctx.m2m_problemtype_references.append((obj, ref))

    return obj


def prepare_metric(data: dict[str, Any], ctx: CveBulkContext) -> models.Metric:
    obj_kwargs: dict[str, Any] = {"format": "cvssV3_1"}
    raw_cvss = data.get("cvssV3_1", {})
    obj_kwargs["raw_cvss_json"] = raw_cvss

    if raw_cvss:
        obj_kwargs["scope"] = raw_cvss.get("scope")
        obj_kwargs["vector_string"] = raw_cvss.get("vectorString")
        obj_kwargs["base_score"] = float(raw_cvss.get("baseScore"))

        vector_fields = (
            "attack_complexity",
            "attack_vector",
            "availability_impact",
            "confidentiality_impact",
            "integrity_impact",
            "privileges_required",
            "user_interaction",
        )
        for field in vector_fields:
            obj_kwargs[field] = raw_cvss.get(to_camel_case(field))

    obj = models.Metric(**obj_kwargs)
    ctx.metrics.append(obj)

    for sc_data in data.get("scenarios", []):
        desc = prepare_description(sc_data, ctx)
        ctx.m2m_metric_scenarios.append((obj, desc))

    return obj


def prepare_event(data: dict[str, Any], ctx: CveBulkContext) -> models.Event:
    desc = prepare_description(data, ctx)
    obj = models.Event(time=make_date(data["time"]), description=desc)
    ctx.events.append(obj)
    return obj


def prepare_credit(data: dict[str, Any], ctx: CveBulkContext) -> models.Credit:
    user_org = prepare_organization(uuid=data.get("user"), ctx=ctx)
    desc = prepare_description(data, ctx)
    obj = models.Credit(
        _type=data.get("type", "finder"), user=user_org, description=desc
    )
    ctx.credits.append(obj)
    return obj


def prepare_version(data: dict[str, Any], ctx: CveBulkContext) -> models.Version:
    obj = models.Version(
        version=data.get("version"),
        status=data.get("status", models.Version.Status.UNKNOWN),
        version_type=data.get("versionType"),
        less_than=data.get("lessThan"),
        less_equal=data.get("lessThanOrEqual"),
    )
    ctx.versions.append(obj)
    return obj


def prepare_affected_product(
    data: dict[str, Any], ctx: CveBulkContext
) -> models.AffectedProduct:
    obj = models.AffectedProduct(
        vendor=data.get("vendor"),
        product=data.get("product"),
        collection_url=data.get("collectionURL"),
        package_name=data.get("packageName"),
        repo=data.get("repo"),
        default_status=data.get("defaultStatus", models.AffectedProduct.Status.UNKNOWN),
    )
    ctx.affected_products.append(obj)

    for platform in data.get("platforms", []):
        ctx.platforms_required.add(platform)
        ctx.m2m_affected_platforms.append((obj, platform))

    for v_data in data.get("versions", []):
        ver = prepare_version(v_data, ctx)
        ctx.m2m_affected_versions.append((obj, ver))

    for cpe in data.get("cpes", []):
        ctx.cpes_required.add(cpe)
        ctx.m2m_affected_cpes.append((obj, cpe))

    for module in data.get("modules", []):
        ctx.modules_required.add(module)
        ctx.m2m_affected_modules.append((obj, module))

    for pfile in data.get("programFiles", []):
        ctx.program_files_required.add(pfile)
        ctx.m2m_affected_program_files.append((obj, pfile))

    for prout in data.get("programRoutines", []):
        ctx.program_routines_required.add(prout)
        ctx.m2m_affected_program_routines.append((obj, prout))

    return obj


def prepare_cve_record(
    data: dict[str, Any], ctx: CveBulkContext, cve: models.CveRecord | None = None
) -> models.CveRecord:
    if cve is None:
        cve = models.CveRecord()

    cve.cve_id = data["cveId"]
    cve.state = data["state"]

    org = prepare_organization(
        uuid=data["assignerOrgId"], ctx=ctx, short_name=data.get("assignerShortName")
    )
    assert org is not None, "Organisation cannot be empty"

    cve.assigner = org
    cve.requester = prepare_organization(uuid=data.get("requesterUserId"), ctx=ctx)

    cve.date_reserved = make_date(data.get("dateReserved"))
    cve.date_updated = make_date(data.get("dateUpdated"))
    cve.date_published = make_date(data.get("datePublished"))
    cve.serial = data.get("serial", 1)

    # Do not append if we are given an existing cve record to update
    if cve.pk is None:
        ctx.cve_records.append(cve)

    return cve


def prepare_container(
    data: dict[str, Any], _type: str, cve: models.CveRecord, ctx: CveBulkContext
) -> models.Container:
    provider_org = prepare_organization(
        uuid=data["providerMetadata"].get("orgId"),
        ctx=ctx,
        short_name=data["providerMetadata"].get("shortName"),
    )

    obj_kwargs: dict[str, Any] = {
        "_type": _type,
        "cve": cve,
        "provider": provider_org,
        "title": data.get("title", ""),
        "date_public": make_date(data.get("datePublic")),
        "source": data.get("source", dict()),
    }

    if _type == models.Container.Type.CNA:
        obj_kwargs["date_assigned"] = make_date(data.get("dateAssigned"))

    obj = models.Container(**obj_kwargs)
    ctx.containers.append(obj)

    for d_data in data.get("descriptions", []):
        desc = prepare_description(d_data, ctx)
        ctx.m2m_container_descriptions.append((obj, desc))

    for a_data in data.get("affected", []):
        affected = prepare_affected_product(a_data, ctx)
        ctx.m2m_container_affected.append((obj, affected))

    problems = [
        desc
        for problem in data.get("problemTypes", [])
        for desc in problem.get("description", [])
    ]
    for p_data in problems:
        pt = prepare_problem_type(p_data, ctx)
        ctx.m2m_container_problem_types.append((obj, pt))

    for r_data in data.get("references", []):
        ref = prepare_reference(r_data, ctx)
        ctx.m2m_container_references.append((obj, ref))

    for m_data in data.get("metrics", []):
        metric = prepare_metric(m_data, ctx)
        ctx.m2m_container_metrics.append((obj, metric))

    for c_data in data.get("configurations", []):
        desc = prepare_description(c_data, ctx)
        ctx.m2m_container_configurations.append((obj, desc))

    for w_data in data.get("workarounds", []):
        desc = prepare_description(w_data, ctx)
        ctx.m2m_container_workarounds.append((obj, desc))

    for s_data in data.get("solutions", []):
        desc = prepare_description(s_data, ctx)
        ctx.m2m_container_solutions.append((obj, desc))

    for e_data in data.get("exploits", []):
        desc = prepare_description(e_data, ctx)
        ctx.m2m_container_exploits.append((obj, desc))

    for e_data in data.get("timeline", []):
        event = prepare_event(e_data, ctx)
        ctx.m2m_container_timeline.append((obj, event))

    for tag in data.get("tags", []):
        ctx.tags_required.add(tag)
        ctx.m2m_container_tags.append((obj, tag))

    for c_data in data.get("credits", []):
        credit = prepare_credit(c_data, ctx)
        ctx.m2m_container_credits.append((obj, credit))

    return obj


def prepare_cve(
    data: dict[str, Any],
    ctx: CveBulkContext,
    record: models.CveRecord | None = None,
    triaged: bool = False,
) -> models.CveRecord:
    cve = prepare_cve_record(data["cveMetadata"], ctx=ctx, cve=record)
    cve.triaged = triaged

    # If it's an existing record, we update it and skip containers as per original behaviour
    if record is not None:
        cve.save()
        return record

    prepare_container(
        data["containers"]["cna"], _type=models.Container.Type.CNA, cve=cve, ctx=ctx
    )

    for adp in data["containers"].get("adp", []):
        prepare_container(adp, _type=models.Container.Type.ADP, cve=cve, ctx=ctx)

    return cve


def _bulk_m2m(
    through_model: type[Model],
    tuples: Sequence[tuple[Any, Any]],
    source_field: str,
    target_field: str,
) -> None:
    """
    Helper to bulk create M2M relationships using a through model.
    """
    if not tuples:
        return

    objs = [
        through_model(
            **{f"{source_field}_id": source.pk, f"{target_field}_id": target.pk}
        )
        for source, target in tuples
    ]
    through_model.objects.bulk_create(objs)


def _bulk_m2m_str(
    through_model: type[Model],
    tuples: Sequence[tuple[Any, str]],
    source_field: str,
    target_field: str,
    cache: Mapping[str, Any],
) -> None:
    """
    Helper to bulk create M2M where the target is a string that maps to a saved Model via a cache.
    """
    if not tuples:
        return

    objs = [
        through_model(
            **{f"{source_field}_id": source.pk, f"{target_field}_id": cache[target].pk}
        )
        for source, target in tuples
    ]
    through_model.objects.bulk_create(objs)


def flush(ctx: CveBulkContext) -> None:
    """
    Executes all bulk inserts and M2M link inserts in topological order,
    within an inner atomic block.
    """
    with (
        pgtrigger.ignore(
            "shared.Cpe:cpe_search_vector_idx",
            "shared.Description:description_search_vector_idx",
            "shared.Container:cve_container_search_vector",
            "shared.AffectedProduct:affected_search_vector",
        ),
        transaction.atomic(),
    ):
        # Fetch/Create deduplication caches
        if ctx.orgs:
            models.Organization.objects.bulk_create(
                ctx.orgs.values(), ignore_conflicts=True
            )

        ctx.tags = _get_or_create_cache(models.Tag, "value", ctx.tags_required)
        ctx.platforms = _get_or_create_cache(
            models.Platform, "name", ctx.platforms_required
        )
        ctx.cpes = _get_or_create_cache(models.Cpe, "name", ctx.cpes_required)
        ctx.modules = _get_or_create_cache(models.Module, "name", ctx.modules_required)
        ctx.program_files = _get_or_create_cache(
            models.ProgramFile, "name", ctx.program_files_required
        )
        ctx.program_routines = _get_or_create_cache(
            models.ProgramRoutine, "name", ctx.program_routines_required
        )

        # Bulk create base models
        models.CveRecord.objects.bulk_create(ctx.cve_records)
        models.SupportingMedia.objects.bulk_create(ctx.supporting_media)
        models.Description.objects.bulk_create(ctx.descriptions)
        models.Reference.objects.bulk_create(ctx.references)
        models.ProblemType.objects.bulk_create(ctx.problem_types)
        models.Metric.objects.bulk_create(ctx.metrics)
        models.Event.objects.bulk_create(ctx.events)
        models.Credit.objects.bulk_create(ctx.credits)
        models.Version.objects.bulk_create(ctx.versions)
        models.AffectedProduct.objects.bulk_create(ctx.affected_products)
        models.Container.objects.bulk_create(ctx.containers)

        # Bulk create M2M relationships (through models)
        _bulk_m2m(
            models.Description.media.through,
            ctx.m2m_description_media,
            "description",
            "supportingmedia",
        )

        _bulk_m2m_str(
            models.Reference.tags.through,
            ctx.m2m_reference_tags,
            "reference",
            "tag",
            ctx.tags,
        )

        _bulk_m2m(
            models.ProblemType.description.through,
            ctx.m2m_problemtype_description,
            "problemtype",
            "description",
        )
        _bulk_m2m(
            models.ProblemType.references.through,
            ctx.m2m_problemtype_references,
            "problemtype",
            "reference",
        )

        _bulk_m2m(
            models.Metric.scenarios.through,
            ctx.m2m_metric_scenarios,
            "metric",
            "description",
        )

        _bulk_m2m_str(
            models.AffectedProduct.platforms.through,
            ctx.m2m_affected_platforms,
            "affectedproduct",
            "platform",
            ctx.platforms,
        )
        _bulk_m2m(
            models.AffectedProduct.versions.through,
            ctx.m2m_affected_versions,
            "affectedproduct",
            "version",
        )
        _bulk_m2m_str(
            models.AffectedProduct.cpes.through,
            ctx.m2m_affected_cpes,
            "affectedproduct",
            "cpe",
            ctx.cpes,
        )
        _bulk_m2m_str(
            models.AffectedProduct.modules.through,
            ctx.m2m_affected_modules,
            "affectedproduct",
            "module",
            ctx.modules,
        )
        _bulk_m2m_str(
            models.AffectedProduct.program_files.through,
            ctx.m2m_affected_program_files,
            "affectedproduct",
            "programfile",
            ctx.program_files,
        )
        _bulk_m2m_str(
            models.AffectedProduct.program_routines.through,
            ctx.m2m_affected_program_routines,
            "affectedproduct",
            "programroutine",
            ctx.program_routines,
        )

        _bulk_m2m(
            models.Container.descriptions.through,
            ctx.m2m_container_descriptions,
            "container",
            "description",
        )
        _bulk_m2m(
            models.Container.affected.through,
            ctx.m2m_container_affected,
            "container",
            "affectedproduct",
        )
        _bulk_m2m(
            models.Container.problem_types.through,
            ctx.m2m_container_problem_types,
            "container",
            "problemtype",
        )
        _bulk_m2m(
            models.Container.references.through,
            ctx.m2m_container_references,
            "container",
            "reference",
        )
        _bulk_m2m(
            models.Container.metrics.through,
            ctx.m2m_container_metrics,
            "container",
            "metric",
        )
        _bulk_m2m(
            models.Container.configurations.through,
            ctx.m2m_container_configurations,
            "container",
            "description",
        )
        _bulk_m2m(
            models.Container.workarounds.through,
            ctx.m2m_container_workarounds,
            "container",
            "description",
        )
        _bulk_m2m(
            models.Container.solutions.through,
            ctx.m2m_container_solutions,
            "container",
            "description",
        )
        _bulk_m2m(
            models.Container.exploits.through,
            ctx.m2m_container_exploits,
            "container",
            "description",
        )
        _bulk_m2m(
            models.Container.timeline.through,
            ctx.m2m_container_timeline,
            "container",
            "event",
        )
        _bulk_m2m_str(
            models.Container.tags.through,
            ctx.m2m_container_tags,
            "container",
            "tag",
            ctx.tags,
        )
        _bulk_m2m(
            models.Container.credits.through,
            ctx.m2m_container_credits,
            "container",
            "credit",
        )


def update_search_vectors() -> None:
    """
    Manually bulk updates the search_vector fields for models that rely on them.
    This should be called at the end of the ingestion process if triggers were ignored.
    """
    models.Cpe.objects.filter(search_vector__isnull=True).update(
        search_vector=SearchVector("name")
    )
    models.Description.objects.filter(search_vector__isnull=True).update(
        search_vector=SearchVector("value")
    )
    models.Container.objects.filter(search_vector__isnull=True).update(
        search_vector=SearchVector("title")
    )
    models.AffectedProduct.objects.filter(search_vector__isnull=True).update(
        search_vector=SearchVector("vendor", "product", "package_name", "repo")
    )
