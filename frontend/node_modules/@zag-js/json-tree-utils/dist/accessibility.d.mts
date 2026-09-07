import { JsonNode, JsonNodePreviewOptions } from './types.mjs';

declare const getAccessibleDescription: (node: JsonNode, opts?: JsonNodePreviewOptions) => string;

export { getAccessibleDescription };
