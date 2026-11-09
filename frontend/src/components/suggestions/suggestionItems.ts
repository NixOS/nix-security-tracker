import type {
  Maintainer,
  SuggestionCategorizedMaintainers,
  SuggestionCategorizedUrlReferences,
  SuggestionOriginalPackages,
  SuggestionPackage,
  SuggestionPackages,
  SuggestionUrlReference,
} from "@/api/generated/models";

/** How an item relates to its suggestion, which decides its display and available action. */
export type ItemState = "active" | "ignored" | "added";

export type ItemRow<T> = { key: string; item: T; state: ItemState };

type Group<T> = { state: ItemState; items: readonly T[] };

/* FIXME(@florentc): This is a workaround the awkward categorized data structure obtained from the API.
 * It's used so that ignored items keep their place in lists for consistent UI placement.
 * Once we instead obtain arrays of (item, state) from the API, this will no longer be necessary. */

/**
 * Rows of all groups, in their original order regardless of their state.
 * Items missing from the original order (e.g. added by hand) come last, in group order.
 */
function inOriginalOrder<T>(
  originalKeys: string[],
  groups: Group<T>[],
  getKey: (item: T) => string,
): ItemRow<T>[] {
  const position = new Map(originalKeys.map((key, index) => [key, index]));
  const rows = groups.flatMap(({ state, items }) =>
    items.map((item) => ({ key: getKey(item), item, state })),
  );
  const rank = (row: ItemRow<T>) => position.get(row.key) ?? Number.POSITIVE_INFINITY;
  return rows.sort((a, b) => rank(a) - rank(b));
}

export function referenceRows({
  original,
  active,
  ignored,
}: SuggestionCategorizedUrlReferences): ItemRow<SuggestionUrlReference>[] {
  return inOriginalOrder(
    original.map((reference) => reference.url),
    [
      { state: "active", items: active },
      { state: "ignored", items: ignored },
    ],
    (reference) => reference.url,
  );
}

export type PackageEntry = { attribute: string; pkg: SuggestionPackage };

export function packageRows(
  original: SuggestionOriginalPackages,
  active: SuggestionPackages,
  ignored: SuggestionPackages,
): ItemRow<PackageEntry>[] {
  const entries = (packages: SuggestionPackages) =>
    Object.entries(packages).map(([attribute, pkg]) => ({ attribute, pkg }));
  return inOriginalOrder(
    Object.keys(original),
    [
      { state: "active", items: entries(active) },
      { state: "ignored", items: entries(ignored) },
    ],
    (entry) => entry.attribute,
  );
}

/**
 * Orphan maintainers (no longer associated with any active package) are left out, whether active or ignored.
 * Maintainers added by hand are never orphans.
 */
export function maintainerRows({
  original,
  active,
  ignored,
  added,
  orphan,
}: SuggestionCategorizedMaintainers): ItemRow<Maintainer>[] {
  const orphanIds = new Set(orphan.map((maintainer) => maintainer.github_id));
  const notOrphan = (maintainer: Maintainer) => !orphanIds.has(maintainer.github_id);
  return inOriginalOrder(
    original.map((maintainer) => String(maintainer.github_id)),
    [
      { state: "active", items: active.filter(notOrphan) },
      { state: "ignored", items: ignored.filter(notOrphan) },
      { state: "added", items: added },
    ],
    (maintainer) => String(maintainer.github_id),
  );
}
