import type { SuggestionAffectedProduct } from "@/api/generated/models";

/** Name segments are the alphanumeric runs of a product name, e.g. `eap8-foo_1` -> `eap8`, `foo`, `1`. */
const SEGMENT_PATTERN = /[a-zA-Z0-9]+/g;

export type AffectedProductTreeLeaf = {
  type: "leaf";
  id: string;
  label: string;
  hasAffected: boolean;
  product: SuggestionAffectedProduct;
};

export type AffectedProductTreeBranch = {
  type: "branch";
  id: string;
  label: string;
  /** Number of products in the whole subtree. */
  count: number;
  hasAffected: boolean;
  children: AffectedProductTreeNode[];
};

export type AffectedProductTreeNode = AffectedProductTreeLeaf | AffectedProductTreeBranch;

type Segment = { text: string; start: number; end: number };

type Entry = {
  product: SuggestionAffectedProduct;
  segments: Segment[];
  hasAffected: boolean;
};

function splitName(name: string): Segment[] {
  return [...name.matchAll(SEGMENT_PATTERN)].map((match) => ({
    text: match[0],
    start: match.index,
    end: match.index + match[0].length,
  }));
}

function isAffected(product: SuggestionAffectedProduct): boolean {
  return product.version_constraints.some(([status]) => status === "affected");
}

function toLeaf(entry: Entry): AffectedProductTreeLeaf {
  return {
    type: "leaf",
    id: `product:${entry.product.name}`,
    label: entry.product.name,
    hasAffected: entry.hasAffected,
    product: entry.product,
  };
}

function byLabel(a: AffectedProductTreeNode, b: AffectedProductTreeNode): number {
  return a.label.localeCompare(b.label);
}

/**
 * Build a branch out of entries sharing the segment at `depth`.
 *
 * Consecutive segments shared by every entry are absorbed into the branch label,
 * so `eap8-foo-a` and `eap8-foo-b` yield a single `eap8-foo` branch rather than a
 * chain of single-child branches.
 */
function buildBranch(entries: Entry[], depth: number): AffectedProductTreeBranch {
  let end = depth + 1;
  while (
    entries[0].segments[end] !== undefined &&
    entries.every((entry) => entry.segments[end]?.text === entries[0].segments[end]?.text)
  ) {
    end += 1;
  }

  // Slice the first name rather than joining segments, to keep the original separators.
  const { name } = entries[0].product;
  const label = name.slice(entries[0].segments[depth].start, entries[0].segments[end - 1].end);

  return {
    // The name prefix covered by this branch identifies it uniquely among all branches.
    id: `group:${name.slice(0, entries[0].segments[end - 1].end)}`,
    type: "branch",
    label,
    count: entries.length,
    hasAffected: entries.some((entry) => entry.hasAffected),
    children: buildNodes(entries, end),
  };
}

function buildNodes(entries: Entry[], depth: number): AffectedProductTreeNode[] {
  const groups = new Map<string, Entry[]>();
  const nodes: AffectedProductTreeNode[] = [];

  for (const entry of entries) {
    const segment = entry.segments[depth];
    if (segment === undefined) {
      // The name ends here: it cannot group anything deeper.
      nodes.push(toLeaf(entry));
      continue;
    }
    const group = groups.get(segment.text);
    if (group) {
      group.push(entry);
    } else {
      groups.set(segment.text, [entry]);
    }
  }

  for (const group of groups.values()) {
    nodes.push(group.length === 1 ? toLeaf(group[0]) : buildBranch(group, depth));
  }

  return nodes.sort(byLabel);
}

export function groupAffectedProducts(
  affectedProducts: readonly SuggestionAffectedProduct[],
): AffectedProductTreeNode[] {
  const entries: Entry[] = affectedProducts.map((product) => ({
    product,
    segments: splitName(product.name),
    hasAffected: isAffected(product),
  }));

  return buildNodes(entries, 0);
}

/** Branch ids worth showing right away: those leading to a product with an affected version. */
export function affectedBranchIds(nodes: AffectedProductTreeNode[]): string[] {
  return nodes.flatMap((node) =>
    node.type === "branch" && node.hasAffected
      ? [node.id, ...affectedBranchIds(node.children)]
      : [],
  );
}

export function allBranchIds(nodes: AffectedProductTreeNode[]): string[] {
  return nodes.flatMap((node) =>
    node.type === "branch" ? [node.id, ...allBranchIds(node.children)] : [],
  );
}
