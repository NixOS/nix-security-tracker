import { ConfigExternal, GlobalOptions, Options, OptionsExport } from "@orval/core";
export * from "@orval/core";

//#region src/utils/options.d.ts
/**
 * Type helper to make it easier to use orval.config.ts
 * accepts a direct {@link ConfigExternal} object.
 */
declare function defineConfig(options: ConfigExternal): ConfigExternal;
//#endregion
//#region src/index.d.ts
declare const generate: (optionsExport?: string | OptionsExport, workspace?: string, options?: GlobalOptions) => Promise<void>;
//#endregion
export { type Options, generate as default, generate, defineConfig };
//# sourceMappingURL=index.d.ts.map