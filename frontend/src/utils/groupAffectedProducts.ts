import type {
  SuggestionAffectedProduct,
  SuggestionAffectedProducts,
} from "@/api/generated/models";

const CHUNK_SPLIT = /[^a-zA-Z0-9]+/;

export type AffectedProductTreeLeaf = {
  type: "leaf";
  id: string;
  product: SuggestionAffectedProduct;
};

export type AffectedProductTreeBranch = {
  type: "branch";
  id: string;
  label: string;
  count: number;
  children: AffectedProductTreeNode[];
};

export type AffectedProductTreeNode = AffectedProductTreeLeaf | AffectedProductTreeBranch;

type ProductEntry = {
  fullName: string;
  segments: string[];
  product: SuggestionAffectedProduct;
};

function splitName(name: string): string[] {
  return name.split(CHUNK_SPLIT).filter((segment) => segment.length > 0);
}

function countLeaves(nodes: AffectedProductTreeNode[]): number {
  return nodes.reduce((total, node) => {
    if (node.type === "leaf") {
      return total + 1;
    }
    return total + node.count;
  }, 0);
}

function toLeaf(entry: ProductEntry): AffectedProductTreeLeaf {
  return {
    type: "leaf",
    id: entry.fullName,
    product: entry.product,
  };
}

function compareNodes(a: AffectedProductTreeNode, b: AffectedProductTreeNode): number {
  const aLabel = a.type === "leaf" ? a.product.name : a.label;
  const bLabel = b.type === "leaf" ? b.product.name : b.label;
  return aLabel.localeCompare(bLabel);
}

function buildTree(entries: ProductEntry[], pathPrefix: string): AffectedProductTreeNode[] {
  if (entries.length === 0) {
    return [];
  }

  if (entries.length === 1) {
    return [toLeaf(entries[0])];
  }

  const groupedByFirstSegment = new Map<string, ProductEntry[]>();
  for (const entry of entries) {
    if (entry.segments.length === 0) {
      continue;
    }
    const segment = entry.segments[0];
    const group = groupedByFirstSegment.get(segment);
    if (group) {
      group.push(entry);
    } else {
      groupedByFirstSegment.set(segment, [entry]);
    }
  }

  let bestSegment: string | null = null;
  let bestGroupSize = 0;
  for (const [segment, group] of groupedByFirstSegment) {
    if (group.length >= 2 && group.length > bestGroupSize) {
      bestSegment = segment;
      bestGroupSize = group.length;
    }
  }

  if (!bestSegment) {
    return entries.map(toLeaf).sort(compareNodes);
  }

  const branchEntries = groupedByFirstSegment.get(bestSegment) ?? [];
  const otherEntries = entries.filter((entry) => entry.segments[0] !== bestSegment);
  const branchId = pathPrefix ? `${pathPrefix}/${bestSegment}` : bestSegment;
  const childEntries = branchEntries.map((entry) => ({
    ...entry,
    segments: entry.segments.slice(1),
  }));

  const branch: AffectedProductTreeBranch = {
    type: "branch",
    id: branchId,
    label: bestSegment,
    count: 0,
    children: buildTree(childEntries, branchId),
  };
  branch.count = countLeaves(branch.children);

  return [...buildTree(otherEntries, pathPrefix), branch].sort(compareNodes);
}

export function groupAffectedProducts(
  affectedProducts: SuggestionAffectedProducts,
): AffectedProductTreeNode[] {
  const entries: ProductEntry[] = Object.entries(affectedProducts).map(([name, product]) => ({
    fullName: name,
    segments: splitName(name),
    product,
  }));

  return buildTree(entries, "");
}
