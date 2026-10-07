from collections.abc import Callable
from datetime import timedelta

import pytest
from rest_framework.reverse import reverse
from rest_framework.test import APIClient

from shared.cache_suggestions import get_src_position
from shared.models.cve import Container
from shared.models.linkage import (
    CVEDerivationClusterProposal,
    PackageOverlay,
    ProvenanceFlags,
)
from shared.models.nix_evaluation import NixDerivation, NixEvaluation
from shared.models.package import Package


@pytest.mark.django_db
def test_published_suggestion_lists_cpe(
    make_container: Callable[..., Container],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    make_package: Callable[..., Package],
    evaluation: NixEvaluation,
) -> None:
    """
    A drv *without* CPE matched to a container *with* CPE will list that CPE as missing.
    """
    drv = make_drv(
        pname="foo",
        evaluation=evaluation,
        cpe_vendor=None,
        cpe_product=None,
        position="/tmp/eval/pkgs/by-name/fo/foo/package.nix:10",
    )
    make_suggestion(
        container=make_container(cpes=["cpe:2.3:a:acme:foo:*:*:*:*:*:*:*:*"]),
        drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH},
        packages={drv: make_package(drv)},
        status=CVEDerivationClusterProposal.Status.PUBLISHED,
    )
    response = APIClient().get(reverse("missing-cpes"))
    assert response.status_code == 200
    assert response.data["results"] == [
        {
            "package": "foo",
            "attributes": ["foo"],
            "positions": [get_src_position(drv)],
            "cpes": [{"vendor": "acme", "product": "foo"}],
        },
    ]


@pytest.mark.django_db
def test_attributes_of_a_package_grouped(
    make_container: Callable[..., Container],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    make_package: Callable[..., Package],
) -> None:
    """
    Attributes matched to a CVE with CPE get aggregegated.
    Source locations get deduplicated.
    """
    foo = make_drv(
        pname="foo",
        cpe_vendor=None,
        cpe_product=None,
        position="/tmp/eval/pkgs/by-name/fo/foo/package.nix:10",
    )
    static_foo = make_drv(
        pname="foo",
        attribute="pkgsStatic.foo",
        cpe_vendor=None,
        cpe_product=None,
        position="/tmp/eval/pkgs/by-name/fo/foo/package.nix:10",
    )
    python_foo = make_drv(
        pname="foo",
        attribute="python3Packages.foo",
        cpe_vendor=None,
        cpe_product=None,
        position="/tmp/eval/pkgs/development/python-modules/foo/default.nix:10",
    )
    package = make_package(foo, static_foo, python_foo, name="foo")
    make_suggestion(
        container=make_container(cpes=["cpe:2.3:a:acme:foo:*:*:*:*:*:*:*:*"]),
        drvs={
            foo: ProvenanceFlags.PACKAGE_NAME_MATCH,
            static_foo: ProvenanceFlags.PACKAGE_NAME_MATCH,
            python_foo: ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
        packages={foo: package, static_foo: package, python_foo: package},
        status=CVEDerivationClusterProposal.Status.PUBLISHED,
    )
    response = APIClient().get(reverse("missing-cpes"))
    assert response.data["results"] == [
        {
            "package": "foo",
            "attributes": ["foo", "pkgsStatic.foo", "python3Packages.foo"],
            "positions": [get_src_position(foo), get_src_position(python_foo)],
            "cpes": [{"vendor": "acme", "product": "foo"}],
        },
    ]


@pytest.mark.django_db
@pytest.mark.parametrize(
    ("status", "rejection_reason", "listed"),
    [
        (CVEDerivationClusterProposal.Status.PUBLISHED, None, True),
        (CVEDerivationClusterProposal.Status.PENDING, None, False),
        (CVEDerivationClusterProposal.Status.ACCEPTED, None, False),
        (CVEDerivationClusterProposal.Status.REJECTED, None, False),
        # Rejecting a suggestion by CVE found in the Nixpkgs source makes it a confirmed match.
        *[
            (
                CVEDerivationClusterProposal.Status.REJECTED,
                reason,
                reason
                == CVEDerivationClusterProposal.RejectionReason.KNOWN_VULNERABILITY,
            )
            for reason in CVEDerivationClusterProposal.RejectionReason
        ],
    ],
)
def test_only_validated_suggestions_list_cpes(
    make_container: Callable[..., Container],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    make_package: Callable[..., Package],
    status: CVEDerivationClusterProposal.Status,
    rejection_reason: CVEDerivationClusterProposal.RejectionReason | None,
    listed: bool,
) -> None:
    drv = make_drv(
        pname="foo",
        cpe_vendor=None,
        cpe_product=None,
        position="/tmp/eval/pkgs/by-name/fo/foo/package.nix:10",
    )
    make_suggestion(
        container=make_container(cpes=["cpe:2.3:a:acme:foo:*:*:*:*:*:*:*:*"]),
        drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH},
        packages={drv: make_package(drv)},
        status=status,
        rejection_reason=rejection_reason,
    )
    response = APIClient().get(reverse("missing-cpes"))
    assert bool(response.data["results"]) == listed


@pytest.mark.django_db
def test_ignored_package_not_listed(
    make_container: Callable[..., Container],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    make_package: Callable[..., Package],
) -> None:
    foo = make_drv(
        pname="foo",
        cpe_vendor=None,
        cpe_product=None,
        position="/tmp/eval/pkgs/by-name/fo/foo/package.nix:10",
    )
    bar = make_drv(
        pname="bar",
        cpe_vendor=None,
        cpe_product=None,
        position="/tmp/eval/pkgs/by-name/ba/bar/package.nix:10",
    )
    suggestion = make_suggestion(
        container=make_container(cpes=["cpe:2.3:a:acme:foo:*:*:*:*:*:*:*:*"]),
        drvs={
            foo: ProvenanceFlags.PACKAGE_NAME_MATCH,
            bar: ProvenanceFlags.PACKAGE_NAME_MATCH,
        },
        packages={foo: make_package(foo), bar: make_package(bar)},
        status=CVEDerivationClusterProposal.Status.PUBLISHED,
    )
    PackageOverlay.objects.create(
        suggestion=suggestion,
        package_attribute="bar",
        package=Package.objects.get(name="bar"),
        type=PackageOverlay.Type.IGNORED,
    )
    response = APIClient().get(reverse("missing-cpes"))
    assert response.data["results"] == [
        {
            "package": "foo",
            "attributes": ["foo"],
            "positions": [get_src_position(foo)],
            "cpes": [{"vendor": "acme", "product": "foo"}],
        },
    ]


@pytest.mark.django_db
def test_all_cpes_of_a_cve_listed(
    make_container: Callable[..., Container],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    make_package: Callable[..., Package],
) -> None:
    drv = make_drv(
        pname="foo",
        cpe_vendor=None,
        cpe_product=None,
        position="/tmp/eval/pkgs/by-name/fo/foo/package.nix:10",
    )
    make_suggestion(
        container=make_container(
            cpes=[
                "cpe:2.3:a:acme:libfoo:*:*:*:*:*:*:*:*",
                "cpe:2.3:a:acme:foo:*:*:*:*:*:*:*:*",
            ]
        ),
        drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH},
        packages={drv: make_package(drv)},
        status=CVEDerivationClusterProposal.Status.PUBLISHED,
    )
    response = APIClient().get(reverse("missing-cpes"))
    assert response.data["results"] == [
        {
            "package": "foo",
            "attributes": ["foo"],
            "positions": [get_src_position(drv)],
            "cpes": [
                {"vendor": "acme", "product": "foo"},
                {"vendor": "acme", "product": "libfoo"},
            ],
        },
    ]


@pytest.mark.django_db
def test_cpe_declared_in_latest_evaluation_not_listed(
    make_container: Callable[..., Container],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    make_package: Callable[..., Package],
    make_evaluation: Callable[..., NixEvaluation],
) -> None:
    drv = make_drv(
        pname="foo",
        cpe_vendor=None,
        cpe_product=None,
        position="/tmp/eval/pkgs/by-name/fo/foo/package.nix:10",
        evaluation=make_evaluation(age=timedelta(days=1)),
    )
    make_suggestion(
        container=make_container(cpes=["cpe:2.3:a:acme:foo:*:*:*:*:*:*:*:*"]),
        drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH},
        packages={drv: make_package(drv)},
        status=CVEDerivationClusterProposal.Status.PUBLISHED,
    )
    make_drv(
        pname="foo",
        cpe_vendor="acme",
        cpe_product="foo",
        position="/tmp/eval/pkgs/by-name/fo/foo/package.nix:10",
        evaluation=make_evaluation(),
    )
    response = APIClient().get(reverse("missing-cpes"))
    assert response.data["results"] == []


@pytest.mark.django_db
def test_cpe_dropped_from_latest_evaluation_listed(
    make_container: Callable[..., Container],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    make_package: Callable[..., Package],
    make_evaluation: Callable[..., NixEvaluation],
) -> None:
    drv = make_drv(
        pname="foo",
        cpe_vendor="acme",
        cpe_product="foo",
        position="/tmp/eval/pkgs/by-name/fo/foo/package.nix:10",
        evaluation=make_evaluation(age=timedelta(days=1)),
    )
    make_suggestion(
        container=make_container(cpes=["cpe:2.3:a:acme:foo:*:*:*:*:*:*:*:*"]),
        drvs={drv: ProvenanceFlags.CPE_MATCH},
        packages={drv: make_package(drv)},
        status=CVEDerivationClusterProposal.Status.PUBLISHED,
    )
    latest = make_drv(
        pname="foo",
        cpe_vendor=None,
        cpe_product=None,
        position="/tmp/eval/pkgs/by-name/fo/foo/package.nix:10",
        evaluation=make_evaluation(),
    )
    response = APIClient().get(reverse("missing-cpes"))
    assert response.data["results"] == [
        {
            "package": "foo",
            "attributes": ["foo"],
            "positions": [get_src_position(latest)],
            "cpes": [{"vendor": "acme", "product": "foo"}],
        },
    ]


@pytest.mark.django_db
def test_cpe_differing_from_latest_evaluation_listed(
    make_container: Callable[..., Container],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    make_package: Callable[..., Package],
    make_evaluation: Callable[..., NixEvaluation],
) -> None:
    drv = make_drv(
        pname="foo",
        cpe_vendor=None,
        cpe_product=None,
        position="/tmp/eval/pkgs/by-name/fo/foo/package.nix:10",
        evaluation=make_evaluation(age=timedelta(days=1)),
    )
    make_suggestion(
        container=make_container(
            cpes=[
                "cpe:2.3:a:acme:foo:*:*:*:*:*:*:*:*",
                "cpe:2.3:a:acme:bar:*:*:*:*:*:*:*:*",
            ]
        ),
        drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH},
        packages={drv: make_package(drv)},
        status=CVEDerivationClusterProposal.Status.PUBLISHED,
    )
    latest = make_drv(
        pname="foo",
        cpe_vendor="acme",
        cpe_product="bar",
        position="/tmp/eval/pkgs/by-name/fo/foo/package.nix:10",
        evaluation=make_evaluation(),
    )
    response = APIClient().get(reverse("missing-cpes"))
    assert response.data["results"] == [
        {
            "package": "foo",
            "attributes": ["foo"],
            "positions": [get_src_position(latest)],
            "cpes": [{"vendor": "acme", "product": "foo"}],
        },
    ]


@pytest.mark.django_db
def test_attribute_removed_from_latest_evaluation_not_listed(
    make_container: Callable[..., Container],
    make_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_drv: Callable[..., NixDerivation],
    make_package: Callable[..., Package],
    make_evaluation: Callable[..., NixEvaluation],
) -> None:
    drv = make_drv(
        pname="foo",
        cpe_vendor=None,
        cpe_product=None,
        position="/tmp/eval/pkgs/by-name/fo/foo/package.nix:10",
        evaluation=make_evaluation(age=timedelta(days=1)),
    )
    make_suggestion(
        container=make_container(cpes=["cpe:2.3:a:acme:foo:*:*:*:*:*:*:*:*"]),
        drvs={drv: ProvenanceFlags.PACKAGE_NAME_MATCH},
        packages={drv: make_package(drv)},
        status=CVEDerivationClusterProposal.Status.PUBLISHED,
    )
    make_evaluation()
    response = APIClient().get(reverse("missing-cpes"))
    assert response.data["results"] == []
