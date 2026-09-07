import { prerenderPlugin } from './plugins/prerender-plugin.js';
import { previewMiddlewarePlugin } from './plugins/preview-middleware-plugin.js';

/**
 * @param {import('./index.d.ts').Options} options
 * @returns {import('vite').Plugin[]}
 */
export function vitePrerenderPlugin(options = {}) {
    const { previewMiddlewareFallback, ...prerenderOptions } = options;

    return [
        prerenderPlugin(prerenderOptions),
        previewMiddlewarePlugin({ previewMiddlewareFallback }),
    ];
}
