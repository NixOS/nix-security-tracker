import { Plugin } from "vite";
import type { RollupFilter } from "./utils.mjs";
export interface PreactDevtoolsPluginOptions {
    devtoolsInProd?: boolean;
    devToolsEnabled?: boolean;
    shouldTransform: RollupFilter;
}
export declare function preactDevtoolsPlugin({ devtoolsInProd, devToolsEnabled, shouldTransform, }: PreactDevtoolsPluginOptions): Plugin;
