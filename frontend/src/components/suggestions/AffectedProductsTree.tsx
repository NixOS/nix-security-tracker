import type {
  SuggestionAffectedProduct,
  SuggestionAffectedProducts,
} from "@/api/generated/models";
import { type TreeViewNode, TreeView } from "@/components/ui/TreeView";
import {
  type AffectedProductTreeNode,
  groupAffectedProducts,
} from "@/utils/groupAffectedProducts";
import { useMemo } from "preact/hooks";
import { AffectedProduct } from "./AffectedProduct";

type AffectedProductTreeViewNode = TreeViewNode & {
  product?: SuggestionAffectedProduct;
};

type Props = {
  affectedProducts: SuggestionAffectedProducts;
};

function toTreeViewNodes(nodes: AffectedProductTreeNode[]): AffectedProductTreeViewNode[] {
  return nodes.map((node) => {
    if (node.type === "leaf") {
      return {
        value: node.id,
        label: node.product.name,
        product: node.product,
      };
    }

    return {
      value: node.id,
      label: `${node.label} (${node.count})`,
      children: toTreeViewNodes(node.children),
    };
  });
}

function collectExpandedBranches(nodes: AffectedProductTreeNode[]): string[] {
  const expanded: string[] = [];

  for (const node of nodes) {
    if (node.type === "branch") {
      if (node.count < 5) {
        expanded.push(node.id);
      }
      expanded.push(...collectExpandedBranches(node.children));
    }
  }

  return expanded;
}

export function AffectedProductsTree({ affectedProducts }: Props) {
  const groupedNodes = useMemo(
    () => groupAffectedProducts(affectedProducts),
    [affectedProducts],
  );

  const rootNode = useMemo<AffectedProductTreeViewNode>(
    () => ({
      value: "affected-products-root",
      label: "Affected products",
      children: toTreeViewNodes(groupedNodes),
    }),
    [groupedNodes],
  );

  const defaultExpandedValue = useMemo(
    () => collectExpandedBranches(groupedNodes),
    [groupedNodes],
  );

  return (
    <TreeView
      rootNode={rootNode}
      defaultExpandedValue={defaultExpandedValue}
      renderItem={(node) => {
        const productNode = node as AffectedProductTreeViewNode;
        if (!productNode.product) {
          return null;
        }
        return <AffectedProduct product={productNode.product} />;
      }}
    />
  );
}
