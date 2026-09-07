import { JsonNode } from '@zag-js/json-tree-utils';
interface JsonTreeViewKeyNodeProps {
    /**
     * The node to render.
     */
    node: JsonNode;
    /**
     * Whether to show quotes on the key.
     */
    showQuotes?: boolean;
}
export declare const JsonTreeViewKeyNode: (props: JsonTreeViewKeyNodeProps) => React.ReactNode;
export {};
