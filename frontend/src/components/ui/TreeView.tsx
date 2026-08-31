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
  children?: TreeViewNode[];
};

type TreeViewProps = {
  rootNode: TreeViewNode;
  defaultExpandedValue?: string[];
  renderItem: (node: TreeViewNode) => ComponentChildren;
  lazyMount?: boolean;
};

type TreeNodesProps = {
  nodes: TreeViewNode[];
  parentIndexPath: number[];
  renderItem: (node: TreeViewNode) => ComponentChildren;
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
              <TreeViewBranch>
                <TreeViewBranchControl className={`row gap-small align-center ${styles.branchControl}`}>
                  <TreeViewBranchIndicator className={styles.branchIndicator}>
                    <ChevronRightIcon size="1em" />
                  </TreeViewBranchIndicator>
                  <TreeViewBranchText className={styles.branchLabel}>{node.label}</TreeViewBranchText>
                </TreeViewBranchControl>
                <TreeViewBranchContent className={styles.branchContent}>
                  <TreeNodes
                    nodes={node.children ?? []}
                    parentIndexPath={indexPath}
                    renderItem={renderItem}
                  />
                </TreeViewBranchContent>
              </TreeViewBranch>
            ) : (
              <TreeViewItem className={styles.item}>{renderItem(node)}</TreeViewItem>
            )}
          </TreeViewNodeProvider>
        );
      })}
    </>
  );
}

export function TreeView({
  rootNode,
  defaultExpandedValue = [],
  renderItem,
  lazyMount = true,
}: TreeViewProps) {
  const collection = useMemo(
    () =>
      createTreeCollection({
        rootNode,
      }),
    [rootNode],
  );

  return (
    <TreeViewRoot
      collection={collection}
      defaultExpandedValue={defaultExpandedValue}
      lazyMount={lazyMount}
      unmountOnExit={lazyMount}
      className={styles.tree}
    >
      <TreeViewTree>
        <TreeNodes nodes={rootNode.children ?? []} parentIndexPath={[]} renderItem={renderItem} />
      </TreeViewTree>
    </TreeViewRoot>
  );
}
