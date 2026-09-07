import { JsonNodePreviewOptions } from '@zag-js/json-tree-utils';
import { Provider } from 'react';
export interface JsonTreeViewOptions extends Partial<JsonNodePreviewOptions> {
    /**
     * Whether to show quotes on the keys.
     */
    quotesOnKeys?: boolean;
}
export declare const JsonTreeViewPropsProvider: Provider<JsonTreeViewOptions>, useJsonTreeViewPropsContext: () => JsonTreeViewOptions;
