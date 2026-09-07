#!/usr/bin/env node
const require_generate = require('../generate-C06u8D0b.js');
let __orval_core = require("@orval/core");
__orval_core = require_generate.__toESM(__orval_core);
let __commander_js_extra_typings = require("@commander-js/extra-typings");
__commander_js_extra_typings = require_generate.__toESM(__commander_js_extra_typings);

//#region src/bin/orval.ts
const orvalMessage = (0, __orval_core.startMessage)({
	name: require_generate.package_default.name,
	version: require_generate.package_default.version,
	description: require_generate.package_default.description
});
const cli = __commander_js_extra_typings.program.name("orval").description(orvalMessage).version(require_generate.package_default.version);
cli.option("-o, --output <path>", "output file destination").option("-i, --input <path>", "input file (yaml or json openapi specs)").option("-c, --config <path>", "override flags by a config file").option("-p, --project <name>", "focus a project of the config").addOption(new __commander_js_extra_typings.Option("-m, --mode <name>", "default mode that will be used").choices(Object.values(__orval_core.OutputMode))).option("-w, --watch [path]", "Watch mode, if path is not specified, it watches the input target").addOption(new __commander_js_extra_typings.Option("--client <name>", "default client that will be used").choices(Object.values(__orval_core.OutputClient))).option("--mock", "activate the mock").option("--clean [path...]", "Clean output directory").option("--prettier", "Prettier generated files").option("--biome", "biome generated files").option("--tsconfig <path>", "path to your tsconfig file").action(async (options) => {
	(0, __orval_core.log)(orvalMessage);
	if (!options.config && (0, __orval_core.isString)(options.input) && (0, __orval_core.isString)(options.output)) {
		const normalizedOptions = await require_generate.normalizeOptions({
			input: options.input,
			output: {
				target: options.output,
				clean: options.clean,
				prettier: options.prettier,
				biome: options.biome,
				mock: options.mock,
				client: options.client,
				mode: options.mode,
				tsconfig: options.tsconfig
			}
		});
		if (options.watch) await require_generate.startWatcher(options.watch, async () => {
			try {
				await require_generate.generateSpec(process.cwd(), normalizedOptions);
			} catch (error) {
				(0, __orval_core.logError)(error);
				process.exit(1);
			}
		}, normalizedOptions.input.target);
		else try {
			await require_generate.generateSpec(process.cwd(), normalizedOptions);
		} catch (error) {
			if (error instanceof __orval_core.ErrorWithTag) (0, __orval_core.logError)(error.cause, error.tag);
			else (0, __orval_core.logError)(error);
			process.exit(1);
		}
	} else await require_generate.generateConfig(options.config, {
		projectName: options.project,
		watch: options.watch,
		clean: options.clean,
		prettier: options.prettier,
		biome: options.biome,
		mock: options.mock,
		client: options.client,
		mode: options.mode,
		tsconfig: options.tsconfig,
		input: options.input,
		output: options.output
	});
});
cli.parseAsync(process.argv);

//#endregion
//# sourceMappingURL=orval.js.map