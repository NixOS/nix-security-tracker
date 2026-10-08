from collections.abc import Callable

from playwright.sync_api import Page, expect
from pytest_django.live_server_helper import LiveServer

from shared.models.cve import Container, Version
from shared.models.linkage import CVEDerivationClusterProposal

from .routes import SUGGESTION_DETAIL

# Products sharing the `eap8` prefix, one of them affected, plus an unrelated
# `libxml2` group where nothing is affected.
GROUPED_PRODUCTS: list[tuple[str, list[tuple[str, str]]]] = [
    ("eap8-netty-core", [(Version.Status.AFFECTED, "3.0")]),
    ("eap8-netty-codec", [(Version.Status.UNAFFECTED, "4.0")]),
    ("eap8-tomcat", [(Version.Status.UNAFFECTED, "5.0")]),
    ("libxml2-core", [(Version.Status.UNAFFECTED, "1.1")]),
    ("libxml2-utils", [(Version.Status.UNKNOWN, "2.0")]),
]


def goto_suggestion(
    page: Page, live_server: LiveServer, suggestion: CVEDerivationClusterProposal
) -> None:
    page.goto(live_server.url + SUGGESTION_DETAIL + f"/{suggestion.pk}")
    expect(page.get_by_role("heading", name="Affected products")).to_be_visible()


def test_affected_products_grouped_by_shared_name_prefix(
    live_server: LiveServer,
    page: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_container: Callable[..., Container],
) -> None:
    """Products sharing a name prefix are grouped under a branch showing that prefix and a count."""
    suggestion = make_cached_suggestion(
        container=make_container(extra_affected=GROUPED_PRODUCTS)
    )
    goto_suggestion(page, live_server, suggestion)

    tree = page.get_by_test_id("affected-products-tree")
    eap8 = tree.locator('[data-part="branch-control"]', has_text="eap8").first
    expect(eap8.get_by_text("eap8", exact=True)).to_be_visible()
    expect(eap8.get_by_text("3", exact=True)).to_be_visible()

    libxml2 = tree.locator('[data-part="branch-control"]', has_text="libxml2").first
    expect(libxml2.get_by_text("libxml2", exact=True)).to_be_visible()
    expect(libxml2.get_by_text("2", exact=True)).to_be_visible()


def test_affected_products_expands_branches_leading_to_affected_versions(
    live_server: LiveServer,
    page: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_container: Callable[..., Container],
) -> None:
    """Only branches holding a product with an `affected` version are expanded on load."""
    suggestion = make_cached_suggestion(
        container=make_container(extra_affected=GROUPED_PRODUCTS)
    )
    goto_suggestion(page, live_server, suggestion)

    tree = page.get_by_test_id("affected-products-tree")
    expect(tree.get_by_text("eap8-netty-core", exact=True)).to_be_visible()
    # Its sibling is only reachable because the shared branch had to be expanded.
    expect(tree.get_by_text("eap8-netty-codec", exact=True)).to_be_visible()
    # Nothing is affected under `libxml2`, so it stays collapsed.
    expect(tree.get_by_text("libxml2-core", exact=True)).to_have_count(0)
    expect(tree.get_by_text("libxml2-utils", exact=True)).to_have_count(0)


def test_affected_products_collapses_single_child_branch_chains(
    live_server: LiveServer,
    page: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_container: Callable[..., Container],
) -> None:
    """Segments shared by every product of a branch are joined into one label."""
    suggestion = make_cached_suggestion(
        container=make_container(
            package_name="zlib-ng-alpha",
            extra_affected=[("zlib-ng-beta", [(Version.Status.UNAFFECTED, "2.0")])],
        )
    )
    goto_suggestion(page, live_server, suggestion)

    tree = page.get_by_test_id("affected-products-tree")
    branches = tree.locator('[data-part="branch-control"]')
    # `zlib-ng-alpha` and `zlib-ng-beta` give a single `zlib-ng` branch rather than a `zlib` branch holding an `ng` branch.
    expect(branches).to_have_count(1)
    expect(branches.get_by_text("zlib-ng", exact=True)).to_be_visible()


def test_affected_products_expand_and_collapse_all(
    live_server: LiveServer,
    page: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_container: Callable[..., Container],
) -> None:
    """The expand/collapse controls override the automatic expansion."""
    suggestion = make_cached_suggestion(
        container=make_container(extra_affected=GROUPED_PRODUCTS)
    )
    goto_suggestion(page, live_server, suggestion)

    tree = page.get_by_test_id("affected-products-tree")
    tree.get_by_role("button", name="Expand all").click()
    expect(tree.get_by_text("libxml2-utils", exact=True)).to_be_visible()

    tree.get_by_role("button", name="Collapse all").click()
    expect(tree.get_by_text("libxml2-utils", exact=True)).to_have_count(0)
    expect(tree.get_by_text("eap8-netty-core", exact=True)).to_have_count(0)


def test_affected_products_expand_affected_restores_automatic_expansion(
    live_server: LiveServer,
    page: Page,
    make_cached_suggestion: Callable[..., CVEDerivationClusterProposal],
    make_container: Callable[..., Container],
) -> None:
    """`Expand affected` goes back to showing only the branches holding affected versions."""
    suggestion = make_cached_suggestion(
        container=make_container(extra_affected=GROUPED_PRODUCTS)
    )
    goto_suggestion(page, live_server, suggestion)

    tree = page.get_by_test_id("affected-products-tree")
    tree.get_by_role("button", name="Expand all").click()
    expect(tree.get_by_text("libxml2-utils", exact=True)).to_be_visible()

    tree.get_by_role("button", name="Expand affected").click()
    expect(tree.get_by_text("eap8-netty-core", exact=True)).to_be_visible()
    expect(tree.get_by_text("libxml2-utils", exact=True)).to_have_count(0)
