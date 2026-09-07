import { JsonNode, JsonNodePreviewOptions } from './types.js';

declare const getAccessibleDescription: (node: JsonNode, opts?: JsonNodePreviewOptions) => string;

export { getAccessibleDescription };
