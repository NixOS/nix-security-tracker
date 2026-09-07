Object.defineProperty(exports, '__esModule', { value: true });
const require_generate = require('./generate-C06u8D0b.js');
let __orval_core = require("@orval/core");
__orval_core = require_generate.__toESM(__orval_core);

//#region src/index.ts
const generate = async (optionsExport, workspace = process.cwd(), options) => {
	if (!optionsExport || (0, __orval_core.isString)(optionsExport)) return require_generate.generateConfig(optionsExport, options);
	const normalizedOptions = await require_generate.normalizeOptions(optionsExport, workspace, options);
	if (options?.watch) require_generate.startWatcher(options?.watch, async () => {
		try {
			await require_generate.generateSpec(workspace, normalizedOptions);
		} catch (error) {
			(0, __orval_core.logError)(error, options?.projectName);
		}
	}, normalizedOptions.input.target);
	else try {
		await require_generate.generateSpec(workspace, normalizedOptions);
		return;
	} catch (error) {
		(0, __orval_core.logError)(error, options?.projectName);
	}
};
var src_default = generate;

//#endregion
exports.default = src_default;
exports.defineConfig = require_generate.defineConfig;
exports.generate = generate;
Object.keys(__orval_core).forEach(function (k) {
  if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: function () { return __orval_core[k]; }
  });
});

//# sourceMappingURL=index.js.map