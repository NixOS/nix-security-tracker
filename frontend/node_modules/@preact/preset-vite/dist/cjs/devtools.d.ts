import { Plugin } from "vite";
import type { RollupFilter } from "./utils.js";
export interface PreactDevtoolsPluginOptions {
    devtoolsInProd?: boolean;
    devToolsEnabled?: boolean;
    shouldTransform: RollupFilter;
}
export declare function preactDevtoolsPlugin({ devtoolsInProd, devToolsEnabled, shouldTransform, }: PreactDevtoolsPluginOptions): Plugin;
