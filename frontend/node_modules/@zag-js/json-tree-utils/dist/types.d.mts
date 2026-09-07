type JsonNodeType = "object" | "array" | "boolean" | "number" | "string" | "null" | "set" | "map" | "weakset" | "weakmap" | "regex" | "date" | "undefined" | "symbol" | "bigint" | "arraybuffer" | "sharedarraybuffer" | "buffer" | "dataview" | "blob" | "file" | "url" | "urlsearchparams" | "formdata" | "promise" | "headers" | "int8array" | "uint8array" | "uint8clampedarray" | "int16array" | "uint16array" | "int32array" | "uint32array" | "float32array" | "float64array" | "bigint64array" | "biguint64array" | "iterable" | "error" | "function" | "circular" | "element" | "document" | "window" | "react-element";
type JsonNodeKeyPath = (string | number)[];
type JsonNodeSyntaxKind = "constructor" | "brace" | "preview" | "preview-text" | "function-type" | "function-body" | "colon" | "circular" | "operator" | "error-stack";
interface JsonNodeElement {
    type: "element";
    tagName: "span" | "div" | "a";
    properties: {
        root?: boolean;
        nodeType?: JsonNodeType;
        kind?: JsonNodeSyntaxKind;
        [key: string]: any;
    };
    children: Array<JsonNodeElement | JsonNodeText>;
}
interface JsonNodeText {
    type: "text";
    value: string | number | boolean | null | undefined;
}
type JsonNodeHastElement = JsonNodeElement | JsonNodeText;
interface JsonNode<T = any> {
    value: T;
    type: JsonNodeType;
    keyPath: JsonNodeKeyPath;
    constructorName?: string | undefined;
    isNonEnumerable?: boolean;
    propertyDescriptor?: PropertyDescriptor | undefined;
    children?: JsonNode[];
}
interface JsonNodePreviewOptions {
    maxPreviewItems: number;
    collapseStringsAfterLength: number;
    groupArraysAfterLength: number;
    showNonenumerable: boolean;
}
interface JsonDataTypeOptions<T = any> {
    type: JsonNodeType | ((value: T) => JsonNodeType);
    check: (value: any) => boolean;
    node: JsonNodeCreatorFn<T>;
    description: string | ((node: JsonNode<T>, opts: JsonNodePreviewOptions) => string);
    previewText?: (node: JsonNode<T>, opts: JsonNodePreviewOptions) => string;
    previewElement: (node: JsonNode<T>, opts: JsonNodePreviewOptions) => JsonNodeElement;
}
interface JsonNodeCreatorParams<T = any> {
    value: T;
    keyPath: JsonNodeKeyPath;
    options: JsonNodePreviewOptions | undefined;
    createNode: (keyPath: JsonNodeKeyPath, value: unknown) => JsonNode;
}
type JsonNodeCreatorFn<T = any> = (opts: JsonNodeCreatorParams<T>) => JsonNode;

export type { JsonDataTypeOptions, JsonNode, JsonNodeCreatorFn, JsonNodeCreatorParams, JsonNodeElement, JsonNodeHastElement, JsonNodeKeyPath, JsonNodePreviewOptions, JsonNodeSyntaxKind, JsonNodeText, JsonNodeType };
