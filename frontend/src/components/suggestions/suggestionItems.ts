import type {
  Maintainer,
  PackageGroup,
  SuggestionCategorizedMaintainers,
  SuggestionCategorizedUrlReferences,
  SuggestionOriginalPackages,
  SuggestionPackage,
  SuggestionPackageBranches,
  SuggestionPackages,
  SuggestionUrlReference,
} from "@/api/generated/models";

/** How an item relates to its suggestion, which decides its display and available action. */
export type ItemState = "active" | "ignored" | "added";

export type ItemRow<T> = { key: string; item: T; state: ItemState };

type Group<T> = { state: ItemState; items: readonly T[] };

export function ignoredRows<T>(rows: readonly ItemRow<T>[]): ItemRow<T>[] {
  return rows.filter((row) => row.state === "ignored");
}

export function allIgnored<T>(rows: readonly ItemRow<T>[]): boolean {
  return rows.every((row) => row.state === "ignored");
}

/** Rows to display, ignored ones only when asked for. */
export function shownRows<T>(rows: readonly ItemRow<T>[], showIgnored: boolean): ItemRow<T>[] {
  return showIgnored ? [...rows] : rows.filter((row) => row.state !== "ignored");
}

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
 * Versions on the evaluated branches shared by all attributes of a package, if they agree.
 * Attributes agree when they have the same version and source on the same branches.
 */
export function sharedBranches(
  rows: readonly ItemRow<PackageEntry>[],
): SuggestionPackageBranches | undefined {
  const [first, ...others] = rows.map((row) => row.item.pkg.branches);
  if (!first) return undefined;
  const names = Object.keys(first);
  const agrees = (branches: SuggestionPackageBranches) =>
    Object.keys(branches).length === names.length &&
    names.every(
      (name) =>
        branches[name] !== undefined &&
        branches[name].version === first[name].version &&
        branches[name].src_position === first[name].src_position,
    );
  return others.every(agrees) ? first : undefined;
}

/** Attributes in one row of the packages list, several when they belong to the same package. */
export type PackageSlot = { group?: PackageGroup; attributes: ItemRow<PackageEntry>[] };

/**
 * Rows of the packages list, where attributes of the same package share one slot.
 * A slot is at the original position of its first attribute, and is ignored only when all its attributes are.
 */
export function packageSlotRows(
  original: SuggestionOriginalPackages,
  active: SuggestionPackages,
  ignored: SuggestionPackages,
  groups: readonly PackageGroup[],
): ItemRow<PackageSlot>[] {
  const groupOf = new Map(
    groups.flatMap((group) => group.attributes.map((a) => [a, group] as const)),
  );
  const slots = new Map<string, PackageSlot>();
  for (const row of packageRows(original, active, ignored)) {
    const group = groupOf.get(row.item.attribute);
    const key = group ? `package-${group.package_id}` : row.key;
    const slot = slots.get(key) ?? { group, attributes: [] };
    slot.attributes.push(row);
    slots.set(key, slot);
  }
  return [...slots].map(([key, item]) => ({
    key,
    item,
    state: allIgnored(item.attributes) ? "ignored" : "active",
  }));
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
