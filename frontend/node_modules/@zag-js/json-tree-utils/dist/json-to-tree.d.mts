import { JsonNodePreviewOptions, JsonNode } from './types.mjs';

interface JsonToTreeOptions {
    visited?: WeakSet<WeakKey> | undefined;
    keyPath?: (string | number)[] | undefined;
    options?: JsonNodePreviewOptions | undefined;
    depth?: number | undefined;
}
declare const jsonToTree: (data: unknown, props?: JsonToTreeOptions) => JsonNode;

export { type JsonToTreeOptions, jsonToTree };
