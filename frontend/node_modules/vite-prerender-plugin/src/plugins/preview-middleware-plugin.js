import path from 'node:path';
import { promises as fs } from 'node:fs';

/**
 * Vite's preview server won't route to anything but `/index.html` without
 * a file extension, e.g., `/tutorial` won't serve `/tutorial/index.html`.
 * This leads to some surprises & hydration issues, so we'll fix it ourselves.
 *
 * @param {import('../index.d.ts').PreviewMiddlewareOptions} options
 * @returns {import('vite').Plugin}
 */
export function previewMiddlewarePlugin({ previewMiddlewareFallback } = {}) {
    let outDir;

    return {
        name: 'serve-prerendered-html',
        configResolved(config) {
            outDir = path.resolve(config.root, config.build.outDir);
        },
        configurePreviewServer(server) {
            server.middlewares.use(async (req, _res, next) => {
                if (!req.url) return next();

                const url = new URL(req.url, `http://${req.headers.host}`);
                // If URL has a file extension, bail
                if (url.pathname != url.pathname.split('.').pop()) return next();

                const file = path.join(
                    outDir,
                    url.pathname.split(path.posix.sep).join(path.sep),
                    'index.html',
                );

                try {
                    await fs.access(file);
                    req.url = url.pathname + '/index.html' + url.search;
                } catch {
                    req.url = (previewMiddlewareFallback || '') + '/index.html';
                }

                return next();
            });
        },
    };
}
