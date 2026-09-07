import { JsonNodePreviewOptions, JsonNode } from './types.js';

declare const ROOT_KEY = "$";
declare const PATH_SEP = ".";
declare function isRootKeyPath(keyPath: Array<string | number>): boolean;
declare function keyPathToId(keyPath: Array<string | number>): string;
declare function keyPathToKey(keyPath: Array<string | number>, opts?: {
    excludeRoot?: boolean;
}): string;
declare function nodeToValue(node: JsonNode): string;
declare function jsonPathToValue(path: string): string;
declare function nodeToString(node: JsonNode): string;
declare function getRootNode(data: unknown, opts?: Partial<JsonNodePreviewOptions>): JsonNode;
declare const DEFAULT_PREVIEW_OPTIONS: JsonNodePreviewOptions;
declare const getPreviewOptions: (opts?: Partial<JsonNodePreviewOptions> | undefined) => JsonNodePreviewOptions;

export { DEFAULT_PREVIEW_OPTIONS, PATH_SEP, ROOT_KEY, getPreviewOptions, getRootNode, isRootKeyPath, jsonPathToValue, keyPathToId, keyPathToKey, nodeToString, nodeToValue };
