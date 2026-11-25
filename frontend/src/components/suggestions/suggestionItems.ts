import type {
  Maintainer,
  SuggestionMaintainers,
  SuggestionPackage,
  SuggestionPackages,
  SuggestionUrlReference,
  SuggestionUrlReferences,
} from "@/api/generated/models";

/** How an item relates to its suggestion, which decides its display and available action. */
export type ItemState = "active" | "ignored" | "added";

export type ItemRow<T> = { key: string; item: T; state: ItemState };

/**
 * Rows of a status record, sorted by `sortKey`.
 * Cached suggestions don't preserve the original order of items, so the order is made deterministic here.
 */
function sortedRows<T>(rows: ItemRow<T>[], sortKey: (row: ItemRow<T>) => string): ItemRow<T>[] {
  return rows.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
}

export function referenceRows(
  references: SuggestionUrlReferences,
): ItemRow<SuggestionUrlReference>[] {
  return sortedRows(
    Object.entries(references).map(([url, { reference, status }]) => ({
      key: url,
      item: reference,
      state: status,
    })),
    (row) => row.key,
  );
}

export type PackageEntry = { attribute: string; pkg: SuggestionPackage };

export function packageRows(packages: SuggestionPackages): ItemRow<PackageEntry>[] {
  return sortedRows(
    Object.entries(packages).map(([attribute, { package: pkg, status }]) => ({
      key: attribute,
      item: { attribute, pkg },
      state: status,
    })),
    (row) => row.key,
  );
}

/**
 * Orphan maintainers (no longer associated with any active package) are left out, whether active or ignored.
 * Maintainers added by hand are never orphans, and come last.
 */
export function maintainerRows(maintainers: SuggestionMaintainers): ItemRow<Maintainer>[] {
  const rows = Object.entries(maintainers)
    .filter(([, { orphan }]) => !orphan)
    .map(([githubId, { maintainer, status }]) => ({
      key: githubId,
      item: maintainer,
      state: status,
    }));
  const byHandle = (row: ItemRow<Maintainer>) => row.item.github.toLowerCase();
  return [
    ...sortedRows(
      rows.filter((row) => row.state !== "added"),
      byHandle,
    ),
    ...sortedRows(
      rows.filter((row) => row.state === "added"),
      byHandle,
    ),
  ];
}

/** Whether the suggestion came with any maintainer, i.e. not only maintainers added by hand. */
export function hasOriginalMaintainers(maintainers: SuggestionMaintainers): boolean {
  return Object.values(maintainers).some(({ status }) => status !== "added");
}
