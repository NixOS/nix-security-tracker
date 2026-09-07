# typedoc-plugin-coverage

A plugin for TypeDoc to generate a documentation coverage badge.

This plugin will write a `coverage.svg` badge and/or `coverage.json` to your output directory when generating HTML documentation that
includes the percentage of your API surface which is documented. It will respect TypeDoc's `requiredToBeDocumented` option,
and only report missing documentation if reflections covered by that option are undocumented.

If the numbers don't match what you expected, or don't match what TypeDoc implies should be documented, set `--logLevel Verbose` to see
additional logging about what was considered documented/not documented.

## Installation

Add `typedoc-plugin-coverage` to the `plugin` array in your `typedoc.config.mjs` configuration file to load the plugin. A JavaScript
configuration file is recommended so that your editor's autocomplete discovers plugin options.

```ts
import { coveragePlugin } from "typedoc-plugin-coverage";

/** @type {import("typedoc").TypeDocOptions} */
const config = {
	plugin: [coveragePlugin],
};

export default config;
```

Note: Prior to TypeDoc 0.28.20, coverage information is written when generating HTML output, so will not be
created if output is being produced with JSON or Markdown only.

## Options

To configure the plugin, add any of the following options:

| Option               | Description                                                    | Default                                  |
| -------------------- | -------------------------------------------------------------- | ---------------------------------------- |
| `coverageLabel`      | Label shown on the produced SVG                                | "document"                               |
| `coverageColor`      | Color of the coverage badge background                         | Dynamic according to coverage percentage |
| `coverageOutputPath` | Path where the coverage badge will be written                  | `<html output directory>/coverage.svg`   |
| `coverageOutputType` | Type of the coverage file to be written (`svg`, `json`, `all`) | `svg`                                    |
| `coverageSvgWidth`   | Defines the width, in pixels, of the generated svg file        | 104                                      |

Default colors/icon sourced from [esdoc-coverage-plugin](https://github.com/esdoc/esdoc-plugins/tree/master/esdoc-coverage-plugin)

```js
import { coveragePlugin } from "typedoc-plugin-coverage";

/** @type {import("typedoc").TypeDocOptions} */
const config = {
	// If using a JS config file, you can reference the plugin function here:
	plugin: [coveragePlugin],
	// If using a JSON config file, reference the package name:
	// plugin: ["typedoc-plugin-coverage"],

	coverageLabel: "Documented",
	// coverageColor: "#5330c8",
	coverageOutputPath: "./out/documentation-coverage.json",
	coverageOutputType: "all",
	coverageSvgWidth: 120,
};

export default config;
```
