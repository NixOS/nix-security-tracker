import { ChevronsDownUpIcon, ChevronsUpDownIcon, TargetIcon } from "lucide-preact";
import { useMemo, useState } from "preact/hooks";
import type { SuggestionAffectedProduct } from "@/api/generated/models";
import { TreeView, type TreeViewNode } from "@/components/ui/TreeView";
import {
  type AffectedProductTreeNode,
  affectedBranchIds,
  allBranchIds,
  groupAffectedProducts,
} from "@/utils/groupAffectedProducts";
import { AffectedProduct } from "./AffectedProduct";

type AffectedProductTreeViewNode = TreeViewNode & {
  product?: SuggestionAffectedProduct;
};

type Props = {
  affectedProducts: readonly SuggestionAffectedProduct[];
};

function toTreeViewNodes(nodes: AffectedProductTreeNode[]): AffectedProductTreeViewNode[] {
  return nodes.map((node) =>
    node.type === "leaf"
      ? { value: node.id, label: node.label, product: node.product }
      : {
          value: node.id,
          label: node.label,
          count: node.count,
          children: toTreeViewNodes(node.children),
        },
  );
}

export function AffectedProductsTree({ affectedProducts }: Props) {
  const groupedNodes = useMemo(() => groupAffectedProducts(affectedProducts), [affectedProducts]);

  const rootNode = useMemo<AffectedProductTreeViewNode>(
    () => ({
      value: "affected-products-root",
      label: "Affected products",
      children: toTreeViewNodes(groupedNodes),
    }),
    [groupedNodes],
  );

  const branchIds = useMemo(() => allBranchIds(groupedNodes), [groupedNodes]);

  // Expansion is controlled, but has to fall back to the automatic one whenever
  // the tree itself changes (navigating to another suggestion reuses this component).
  const [expanded, setExpanded] = useState(() => ({
    source: groupedNodes,
    value: affectedBranchIds(groupedNodes),
  }));
  const expandedValue =
    expanded.source === groupedNodes ? expanded.value : affectedBranchIds(groupedNodes);

  const setExpandedValue = (value: string[]) => setExpanded({ source: groupedNodes, value });

  return (
    <div className="column gap-small" data-testid="affected-products-tree">
      {branchIds.length > 0 && (
        <div className="row gap wrap justify-right">
          <button
            type="button"
            className="row gap-small centered cursor-pointer btn"
            onClick={() => setExpandedValue([])}
          >
            <ChevronsDownUpIcon size="1em" />
            Collapse all
          </button>
          <button
            type="button"
            className="row gap-small centered cursor-pointer btn"
            onClick={() => setExpandedValue(affectedBranchIds(groupedNodes))}
          >
            <TargetIcon size="1em" />
            Expand affected
          </button>
          <button
            type="button"
            className="row gap-small centered cursor-pointer btn"
            onClick={() => setExpandedValue(branchIds)}
          >
            <ChevronsUpDownIcon size="1em" />
            Expand all
          </button>
        </div>
      )}
      <TreeView
        rootNode={rootNode}
        expandedValue={expandedValue}
        onExpandedChange={setExpandedValue}
        renderItem={(node) => {
          const { product } = node as AffectedProductTreeViewNode;
          return product ? <AffectedProduct product={product} /> : null;
        }}
      />
    </div>
  );
}
