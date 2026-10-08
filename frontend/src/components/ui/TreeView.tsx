import {
  createTreeCollection,
  TreeViewBranch,
  TreeViewBranchContent,
  TreeViewBranchControl,
  TreeViewBranchIndicator,
  TreeViewBranchText,
  TreeViewItem,
  TreeViewNodeProvider,
  TreeViewRoot,
  TreeViewTree,
} from "@ark-ui/react/tree-view";
import { ChevronRightIcon } from "lucide-preact";
import type { ComponentChildren } from "preact";
import { useMemo } from "preact/hooks";
import styles from "./TreeView.module.css";

export type TreeViewNode = {
  value: string;
  label: string;
  /** Number of items, rendered next to the label. */
  count?: number;
  children?: TreeViewNode[];
};

type RenderItem = (node: TreeViewNode) => ComponentChildren;

type TreeViewProps = {
  rootNode: TreeViewNode;
  /** Uncontrolled initial expansion. Ignored when `expandedValue` is given. */
  defaultExpandedValue?: string[];
  /** Controlled expansion. Requires `onExpandedChange` to stay interactive. */
  expandedValue?: string[];
  onExpandedChange?: (expandedValue: string[]) => void;
  renderItem: RenderItem;
  lazyMount?: boolean;
};

type TreeNodesProps = {
  nodes: TreeViewNode[];
  parentIndexPath: number[];
  renderItem: RenderItem;
};

function TreeNodes({ nodes, parentIndexPath, renderItem }: TreeNodesProps) {
  return (
    <>
      {nodes.map((node, index) => {
        const indexPath = [...parentIndexPath, index];
        const isBranch = (node.children?.length ?? 0) > 0;

        return (
          <TreeViewNodeProvider key={node.value} node={node} indexPath={indexPath}>
            {isBranch ? (
              <TreeViewBranch className="column gap-small">
                <TreeViewBranchControl
                  className={`row gap-small centered cursor-pointer ${styles.branchControl}`}
                >
                  <TreeViewBranchIndicator className={styles.branchIndicator}>
                    <ChevronRightIcon size="1em" />
                  </TreeViewBranchIndicator>
                  <TreeViewBranchText className="bold">{node.label}</TreeViewBranchText>
                  {node.count !== undefined && <span className="text-gray">{node.count}</span>}
                </TreeViewBranchControl>
                <TreeViewBranchContent className={`column gap-small ${styles.branchContent}`}>
                  <TreeNodes
                    nodes={node.children ?? []}
                    parentIndexPath={indexPath}
                    renderItem={renderItem}
                  />
                </TreeViewBranchContent>
              </TreeViewBranch>
            ) : (
              <TreeViewItem>{renderItem(node)}</TreeViewItem>
            )}
          </TreeViewNodeProvider>
        );
      })}
    </>
  );
}

export function TreeView({
  rootNode,
  defaultExpandedValue,
  expandedValue,
  onExpandedChange,
  renderItem,
  lazyMount = true,
}: TreeViewProps) {
  const collection = useMemo(() => createTreeCollection({ rootNode }), [rootNode]);

  return (
    <TreeViewRoot
      collection={collection}
      defaultExpandedValue={defaultExpandedValue}
      expandedValue={expandedValue}
      onExpandedChange={(details) => onExpandedChange?.(details.expandedValue)}
      lazyMount={lazyMount}
      unmountOnExit={lazyMount}
    >
      <TreeViewTree className="column gap-small">
        <TreeNodes nodes={rootNode.children ?? []} parentIndexPath={[]} renderItem={renderItem} />
      </TreeViewTree>
    </TreeViewRoot>
  );
}
