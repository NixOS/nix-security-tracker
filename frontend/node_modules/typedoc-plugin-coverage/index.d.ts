import { Application } from "typedoc";
/**
 * Options for the type of coverage file to be written.
 * @enum
 */
export declare const CoverageOutputType: {
    /**
     * Write the coverage badge as an SVG file.
     */
    readonly svg: "svg";
    /**
     * Write the coverage as a JSON file.
     */
    readonly json: "json";
    /**
     * Write both the coverage badge as an SVG file and the coverage as a JSON file.
     */
    readonly all: "all";
};
export type CoverageOutputType = (typeof CoverageOutputType)[keyof typeof CoverageOutputType];
declare module "typedoc" {
    interface TypeDocOptionMap {
        /**
         * The text to display on the coverage badge label.
         * @defaultValue "document"
         */
        coverageLabel: string;
        /**
         * The color to use for the coverage badge label.
         * Defaults to a dynamic color based on the coverage percentage.
         */
        coverageColor: string;
        /**
         * The location where the SVG coverage badge will be written.
         * @defaultValue `<output directory>/coverage.svg`
         * @remarks
         * This will also be used to determine the location of the JSON output if `coverageOutputType` is set to `json` or `all` (replacing the `.svg` extension with `.json`).
         */
        coverageOutputPath: string;
        /**
         * Whether to write the coverage badge as an SVG file, JSON file or both.
         * @defaultValue `svg`
         */
        coverageOutputType: CoverageOutputType;
        /**
         * The width of the printed SVG in pixels.
         * @defaultValue `104`
         */
        coverageSvgWidth: number;
    }
}
/**
 * Alias of {@linkcode coveragePlugin} which is used by TypeDoc when the plugin's name
 * is specified in the `plugins` option.
 */
export declare function load(app: Application): void;
/**
 * Load the `typedoc-plugin-coverage` plugin.
 * @param app - The {@linkcode Application} instance to load the plugin into.
 */
export declare function coveragePlugin(app: Application): void;
