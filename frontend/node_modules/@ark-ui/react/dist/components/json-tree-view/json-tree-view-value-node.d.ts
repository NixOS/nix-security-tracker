import { JsonNodeHastElement } from '@zag-js/json-tree-utils';
interface JsonTreeViewValueNodeProps {
    node: JsonNodeHastElement;
    renderValue?: (node: JsonNodeHastElement) => React.ReactNode;
}
export declare const JsonTreeViewValueNode: (props: JsonTreeViewValueNodeProps) => React.ReactNode;
export {};
