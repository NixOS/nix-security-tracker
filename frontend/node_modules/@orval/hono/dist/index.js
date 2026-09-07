Object.defineProperty(exports, '__esModule', { value: true });
//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
let __orval_core = require("@orval/core");
__orval_core = __toESM(__orval_core);
let __orval_zod = require("@orval/zod");
__orval_zod = __toESM(__orval_zod);
let fs_extra = require("fs-extra");
fs_extra = __toESM(fs_extra);
require("openapi3-ts/oas30");

//#region src/route.ts
const hasParam = (path) => /[^{]*{[\w*_-]*}.*/.test(path);
const getRoutePath = (path) => {
	const matches = /([^{]*){?([\w*_-]*)}?(.*)/.exec(path);
	if (!matches?.length) return path;
	const prev = matches[1];
	const param = (0, __orval_core.sanitize)(matches[2], {
		es5keyword: true,
		underscore: true,
		dash: true,
		dot: true
	});
	const next = hasParam(matches[3]) ? getRoutePath(matches[3]) : matches[3];
	return hasParam(path) ? `${prev}\:${param}${next}` : `${prev}${param}${next}`;
};
const getRoute = (route) => {
	return route.split("/").reduce((acc, path, i) => {
		if (!path && !i) return acc;
		if (!path.includes("{")) return `${acc}/${path}`;
		return `${acc}/${getRoutePath(path)}`;
	}, "");
};

//#endregion
//#region src/index.ts
const ZVALIDATOR_SOURCE = fs_extra.default.readFileSync(__orval_core.upath.join(__dirname, "zValidator.ts")).toString("utf8");
const HONO_DEPENDENCIES = [{
	exports: [
		{
			name: "Hono",
			values: true
		},
		{ name: "Context" },
		{ name: "Env" }
	],
	dependency: "hono"
}];
/**
* generateModuleSpecifier generates the specifier that _from_ would use to
* import _to_. This is syntactical and does not validate the paths.
*
* @param from The filesystem path to the importer.
* @param to If a filesystem path, it and _from_ must be use the same frame of
* reference, such as process.cwd() or both be absolute. If only one is
* absolute, the other must be relative to process.cwd().
*
* Otherwise, treated as a package name and returned directly.
*
* @return A module specifier that can be used at _from_ to import _to_. It is
* extensionless to conform with the rest of orval.
*/
const generateModuleSpecifier = (from, to) => {
	if (to.startsWith(".") || __orval_core.upath.isAbsolute(to)) {
		let ret;
		ret = __orval_core.upath.relativeSafe(__orval_core.upath.dirname(from), to);
		ret = ret.replace(/\.ts$/, "");
		ret = ret.replaceAll(__orval_core.upath.separator, "/");
		return ret;
	}
	return to;
};
const getHonoDependencies = () => HONO_DEPENDENCIES;
const getHonoHeader = ({ verbOptions, output, tag, clientImplementation }) => {
	const targetInfo = (0, __orval_core.getFileInfo)(output.target);
	let handlers;
	const importHandlers = Object.values(verbOptions).filter((verbOption) => clientImplementation.includes(`${verbOption.operationName}Handlers`));
	if (output.override.hono.handlers) {
		const handlerFileInfo = (0, __orval_core.getFileInfo)(output.override.hono.handlers);
		handlers = importHandlers.map((verbOption) => {
			const isTagMode = output.mode === "tags" || output.mode === "tags-split";
			const tag$1 = (0, __orval_core.kebab)(verbOption.tags[0] ?? "default");
			const handlersPath = __orval_core.upath.relativeSafe(__orval_core.upath.join(targetInfo.dirname, isTagMode ? tag$1 : ""), __orval_core.upath.join(handlerFileInfo.dirname, `./${verbOption.operationName}`));
			return `import { ${verbOption.operationName}Handlers } from '${handlersPath}';`;
		}).join("\n");
	} else handlers = `import {\n${importHandlers.map((verbOption) => ` ${verbOption.operationName}Handlers`).join(`, \n`)}\n} from './${tag ?? targetInfo.filename}.handlers';`;
	return `${handlers}\n\n
const app = new Hono()\n\n`;
};
const getHonoFooter = () => "export default app";
const generateHonoRoute = ({ operationName, verb }, pathRoute) => {
	const path = getRoute(pathRoute);
	return `
app.${verb.toLowerCase()}('${path}',...${operationName}Handlers)`;
};
const generateHono = (verbOptions, options) => {
	if (options.override.hono.compositeRoute) return {
		implementation: "",
		imports: []
	};
	const routeImplementation = generateHonoRoute(verbOptions, options.pathRoute);
	return {
		implementation: routeImplementation ? `${routeImplementation}\n\n` : "",
		imports: [
			...verbOptions.params.flatMap((param) => param.imports),
			...verbOptions.body.imports,
			...verbOptions.queryParams ? [{ name: verbOptions.queryParams.schema.name }] : []
		]
	};
};
/**
* getHonoHandlers generates TypeScript code for the given verbs and reports
* whether the code requires zValidator.
*/
const getHonoHandlers = (...opts) => opts.reduce(([code, hasZValidator], opts$1) => {
	const { handlerName, contextTypeName, verbOption, validator } = opts$1;
	let currentValidator = "";
	if (validator) {
		if (verbOption.headers) currentValidator += `zValidator('header', ${verbOption.operationName}Header),\n`;
		if (verbOption.params.length > 0) currentValidator += `zValidator('param', ${verbOption.operationName}Params),\n`;
		if (verbOption.queryParams) currentValidator += `zValidator('query', ${verbOption.operationName}QueryParams),\n`;
		if (verbOption.body.definition) currentValidator += `zValidator('json', ${verbOption.operationName}Body),\n`;
		if (validator !== "hono" && verbOption.response.originalSchema?.["200"]?.content?.["application/json"]) currentValidator += `zValidator('response', ${verbOption.operationName}Response),\n`;
	}
	code += `
export const ${handlerName} = factory.createHandlers(
${currentValidator}async (c: ${contextTypeName}) => {

  },
);`;
	hasZValidator ||= currentValidator !== "";
	return [code, hasZValidator];
}, ["", false]);
const getZvalidatorImports = (verbOptions, importPath, isHonoValidator) => {
	const specifiers = [];
	for (const { operationName, headers, params, queryParams, body, response } of verbOptions) {
		if (headers) specifiers.push(`${operationName}Header`);
		if (params.length > 0) specifiers.push(`${operationName}Params`);
		if (queryParams) specifiers.push(`${operationName}QueryParams`);
		if (body.definition) specifiers.push(`${operationName}Body`);
		if (!isHonoValidator && response.originalSchema?.["200"]?.content?.["application/json"] != null) specifiers.push(`${operationName}Response`);
	}
	return specifiers.length === 0 ? "" : `import {\n${specifiers.join(",\n")}\n} from '${importPath}'`;
};
const getVerbOptionGroupByTag = (verbOptions) => {
	return Object.values(verbOptions).reduce((acc, value) => {
		const tag = value.tags[0];
		if (!acc[tag]) acc[tag] = [];
		acc[tag].push(value);
		return acc;
	}, {});
};
const generateHandlerFile = async ({ verbs, path, validatorModule, zodModule, contextModule }) => {
	const validator = validatorModule === "@hono/zod-validator" ? "hono" : validatorModule != null;
	if (fs_extra.default.existsSync(path)) {
		const rawFile = await fs_extra.default.readFile(path, "utf8");
		let content = rawFile;
		content += Object.values(verbs).reduce((acc, verbOption) => {
			const handlerName = `${verbOption.operationName}Handlers`;
			const contextTypeName = `${(0, __orval_core.pascal)(verbOption.operationName)}Context`;
			if (!rawFile.includes(handlerName)) acc += getHonoHandlers({
				handlerName,
				contextTypeName,
				verbOption,
				validator
			})[0];
			return acc;
		}, "");
		return content;
	}
	const [handlerCode, hasZValidator] = getHonoHandlers(...Object.values(verbs).map((verbOption) => ({
		handlerName: `${verbOption.operationName}Handlers`,
		contextTypeName: `${(0, __orval_core.pascal)(verbOption.operationName)}Context`,
		verbOption,
		validator
	})));
	const imports = ["import { createFactory } from 'hono/factory';"];
	if (hasZValidator && validatorModule != null) imports.push(`import { zValidator } from '${generateModuleSpecifier(path, validatorModule)}';`);
	imports.push(`import { ${Object.values(verbs).map((verb) => `${(0, __orval_core.pascal)(verb.operationName)}Context`).join(",\n")} } from '${generateModuleSpecifier(path, contextModule)}';`);
	if (hasZValidator) imports.push(getZvalidatorImports(Object.values(verbs), generateModuleSpecifier(path, zodModule), validatorModule === "@hono/zod-validator"));
	return `${imports.filter((imp) => imp !== "").join("\n")}

const factory = createFactory();${handlerCode}`;
};
const generateHandlerFiles = async (verbOptions, output, validatorModule) => {
	const { extension, dirname, filename } = (0, __orval_core.getFileInfo)(output.target);
	if (output.override.hono.handlers) return Promise.all(Object.values(verbOptions).map(async (verbOption) => {
		const tag = (0, __orval_core.kebab)(verbOption.tags[0] ?? "default");
		const path = __orval_core.upath.join(output.override.hono.handlers ?? "", `./${verbOption.operationName}` + extension);
		return {
			content: await generateHandlerFile({
				path,
				verbs: [verbOption],
				validatorModule,
				zodModule: output.mode === "tags" ? __orval_core.upath.join(dirname, `${(0, __orval_core.kebab)(tag)}.zod`) : __orval_core.upath.join(dirname, tag, tag + ".zod"),
				contextModule: output.mode === "tags" ? __orval_core.upath.join(dirname, `${(0, __orval_core.kebab)(tag)}.context`) : __orval_core.upath.join(dirname, tag, tag + ".context")
			}),
			path
		};
	}));
	if (output.mode === "tags" || output.mode === "tags-split") {
		const groupByTags = getVerbOptionGroupByTag(verbOptions);
		return Promise.all(Object.entries(groupByTags).map(async ([tag, verbs]) => {
			const handlerPath$1 = output.mode === "tags" ? __orval_core.upath.join(dirname, `${(0, __orval_core.kebab)(tag)}.handlers${extension}`) : __orval_core.upath.join(dirname, tag, tag + ".handlers" + extension);
			return {
				content: await generateHandlerFile({
					path: handlerPath$1,
					verbs,
					validatorModule,
					zodModule: output.mode === "tags" ? __orval_core.upath.join(dirname, `${(0, __orval_core.kebab)(tag)}.zod`) : __orval_core.upath.join(dirname, tag, tag + ".zod"),
					contextModule: output.mode === "tags" ? __orval_core.upath.join(dirname, `${(0, __orval_core.kebab)(tag)}.context`) : __orval_core.upath.join(dirname, tag, tag + ".context")
				}),
				path: handlerPath$1
			};
		}));
	}
	const handlerPath = __orval_core.upath.join(dirname, `${filename}.handlers${extension}`);
	return [{
		content: await generateHandlerFile({
			path: handlerPath,
			verbs: Object.values(verbOptions),
			validatorModule,
			zodModule: __orval_core.upath.join(dirname, `${filename}.zod`),
			contextModule: __orval_core.upath.join(dirname, `${filename}.context`)
		}),
		path: handlerPath
	}];
};
const getContext = (verbOption) => {
	let paramType = "";
	if (verbOption.params.length > 0) paramType = `param: {\n ${(0, __orval_core.getParamsInPath)(verbOption.pathRoute).map((name) => {
		const param = verbOption.params.find((p) => p.name === (0, __orval_core.sanitize)((0, __orval_core.camel)(name), { es5keyword: true }));
		const definition = param?.definition.split(":")[1];
		const required = param?.required ?? false;
		return { definition: `${name}${required ? "" : "?"}:${definition}` };
	}).map((property) => property.definition).join(",\n    ")},\n },`;
	const queryType = verbOption.queryParams ? `query: ${verbOption.queryParams?.schema.name},` : "";
	const bodyType = verbOption.body.definition ? `json: ${verbOption.body.definition},` : "";
	const hasIn = !!paramType || !!queryType || !!bodyType;
	return `export type ${(0, __orval_core.pascal)(verbOption.operationName)}Context<E extends Env = any> = Context<E, '${getRoute(verbOption.pathRoute)}'${hasIn ? `, { in: { ${paramType}${queryType}${bodyType} }, out: { ${paramType}${queryType}${bodyType} } }` : ""}>`;
};
const getHeader = (option, info) => {
	if (!option) return "";
	const header = option(info);
	return Array.isArray(header) ? (0, __orval_core.jsDoc)({ description: header }) : header;
};
const generateContextFile = ({ path, verbs, schemaModule }) => {
	let content = `import type { Context, Env } from 'hono';\n\n`;
	const contexts = verbs.map((verb) => getContext(verb));
	const imps = new Set(verbs.flatMap((verb) => {
		const imports = [];
		if (verb.params.length > 0) imports.push(...verb.params.flatMap((param) => param.imports));
		if (verb.queryParams) imports.push({ name: verb.queryParams.schema.name });
		if (verb.body.definition) imports.push(...verb.body.imports);
		return imports;
	}).map((imp) => imp.name).filter((imp) => contexts.some((context) => context.includes(imp))));
	if (contexts.some((context) => context.includes("NonReadonly<"))) {
		content += (0, __orval_core.getOrvalGeneratedTypes)();
		content += "\n";
	}
	if (imps.size > 0) content += `import type {\n${[...imps].toSorted().join(",\n  ")}\n} from '${generateModuleSpecifier(path, schemaModule)}';\n\n`;
	content += contexts.join("\n");
	return content;
};
const generateContextFiles = (verbOptions, output, context, schemaModule) => {
	const header = getHeader(output.override.header, context.specs[context.specKey].info);
	const { extension, dirname, filename } = (0, __orval_core.getFileInfo)(output.target);
	if (output.mode === "tags" || output.mode === "tags-split") {
		const groupByTags = getVerbOptionGroupByTag(verbOptions);
		return Object.entries(groupByTags).map(([tag, verbs]) => {
			const path$1 = output.mode === "tags" ? __orval_core.upath.join(dirname, `${(0, __orval_core.kebab)(tag)}.context${extension}`) : __orval_core.upath.join(dirname, tag, tag + ".context" + extension);
			const code$1 = generateContextFile({
				verbs,
				path: path$1,
				schemaModule
			});
			return {
				content: `${header}${code$1}`,
				path: path$1
			};
		});
	}
	const path = __orval_core.upath.join(dirname, `${filename}.context${extension}`);
	const code = generateContextFile({
		verbs: Object.values(verbOptions),
		path,
		schemaModule
	});
	return [{
		content: `${header}${code}`,
		path
	}];
};
const generateZodFiles = async (verbOptions, output, context) => {
	const { extension, dirname, filename } = (0, __orval_core.getFileInfo)(output.target);
	const header = getHeader(output.override.header, context.specs[context.specKey].info);
	if (output.mode === "tags" || output.mode === "tags-split") {
		const groupByTags = getVerbOptionGroupByTag(verbOptions);
		const builderContexts = await Promise.all(Object.entries(groupByTags).map(async ([tag, verbs]) => {
			const zods$1 = await Promise.all(verbs.map((verbOption) => (0, __orval_zod.generateZod)(verbOption, {
				route: verbOption.route,
				pathRoute: verbOption.pathRoute,
				override: output.override,
				context,
				mock: output.mock,
				output: output.target
			}, output.client)));
			if (zods$1.every((z) => z.implementation === "")) return {
				content: "",
				path: ""
			};
			const allMutators$1 = zods$1.reduce((acc, z) => {
				for (const mutator of z.mutators ?? []) acc[mutator.name] = mutator;
				return acc;
			}, {});
			const mutatorsImports$1 = (0, __orval_core.generateMutatorImports)({ mutators: Object.values(allMutators$1) });
			let content$1 = `${header}import { z as zod } from 'zod';\n${mutatorsImports$1}\n`;
			const zodPath$1 = output.mode === "tags" ? __orval_core.upath.join(dirname, `${(0, __orval_core.kebab)(tag)}.zod${extension}`) : __orval_core.upath.join(dirname, tag, tag + ".zod" + extension);
			content$1 += zods$1.map((zod) => zod.implementation).join("\n");
			return {
				content: content$1,
				path: zodPath$1
			};
		}));
		return Promise.all(builderContexts.filter((context$1) => context$1.content !== ""));
	}
	const zods = await Promise.all(Object.values(verbOptions).map((verbOption) => (0, __orval_zod.generateZod)(verbOption, {
		route: verbOption.route,
		pathRoute: verbOption.pathRoute,
		override: output.override,
		context,
		mock: output.mock,
		output: output.target
	}, output.client)));
	const allMutators = zods.reduce((acc, z) => {
		for (const mutator of z.mutators ?? []) acc[mutator.name] = mutator;
		return acc;
	}, {});
	const mutatorsImports = (0, __orval_core.generateMutatorImports)({ mutators: Object.values(allMutators) });
	let content = `${header}import { z as zod } from 'zod';\n${mutatorsImports}\n`;
	const zodPath = __orval_core.upath.join(dirname, `${filename}.zod${extension}`);
	content += zods.map((zod) => zod.implementation).join("\n");
	return [{
		content,
		path: zodPath
	}];
};
const generateZvalidator = (output, context) => {
	const header = getHeader(output.override.header, context.specs[context.specKey].info);
	let validatorPath = output.override.hono.validatorOutputPath;
	if (!output.override.hono.validatorOutputPath) {
		const { extension, dirname, filename } = (0, __orval_core.getFileInfo)(output.target);
		validatorPath = __orval_core.upath.join(dirname, `${filename}.validator${extension}`);
	}
	return {
		content: `${header}${ZVALIDATOR_SOURCE}`,
		path: validatorPath
	};
};
const generateCompositeRoutes = async (verbOptions, output, context) => {
	const targetInfo = (0, __orval_core.getFileInfo)(output.target);
	const compositeRouteInfo = (0, __orval_core.getFileInfo)(output.override.hono.compositeRoute);
	const header = getHeader(output.override.header, context.specs[context.specKey].info);
	const routes = Object.values(verbOptions).map((verbOption) => {
		return generateHonoRoute(verbOption, verbOption.pathRoute);
	}).join(";");
	const importHandlers = Object.values(verbOptions);
	let ImportHandlersImplementation;
	if (output.override.hono.handlers) {
		const handlerFileInfo = (0, __orval_core.getFileInfo)(output.override.hono.handlers);
		ImportHandlersImplementation = importHandlers.map((verbOption) => verbOption.operationName).map((operationName) => {
			const importHandlerName = `${operationName}Handlers`;
			const handlersPath = generateModuleSpecifier(compositeRouteInfo.path, __orval_core.upath.join(handlerFileInfo.dirname ?? "", `./${operationName}`));
			return `import { ${importHandlerName} } from '${handlersPath}';`;
		}).join("\n");
	} else {
		const tags = importHandlers.map((verbOption) => (0, __orval_core.kebab)(verbOption.tags[0] ?? "default"));
		ImportHandlersImplementation = tags.filter((t, i) => tags.indexOf(t) === i).map((tag) => {
			const importHandlerNames = importHandlers.filter((verbOption) => verbOption.tags[0] === tag).map((verbOption) => ` ${verbOption.operationName}Handlers`).join(`, \n`);
			const handlersPath = generateModuleSpecifier(compositeRouteInfo.path, __orval_core.upath.join(targetInfo.dirname ?? "", tag));
			return `import {\n${importHandlerNames}\n} from '${handlersPath}/${tag}.handlers';`;
		}).join("\n");
	}
	return [{
		content: `${header}import { Hono } from 'hono';
${ImportHandlersImplementation}

const app = new Hono()
${routes}

export default app
`,
		path: output.override.hono.compositeRoute || ""
	}];
};
const generateExtraFiles = async (verbOptions, output, context) => {
	const { path, pathWithoutExtension } = (0, __orval_core.getFileInfo)(output.target);
	const validator = generateZvalidator(output, context);
	let schemaModule;
	if (output.schemas != null) schemaModule = (0, __orval_core.getFileInfo)(output.schemas).dirname;
	else if (output.mode === "single") schemaModule = path;
	else schemaModule = `${pathWithoutExtension}.schemas`;
	const [handlers, contexts, zods, compositeRoutes] = await Promise.all([
		generateHandlerFiles(verbOptions, output, validator.path),
		generateContextFiles(verbOptions, output, context, schemaModule),
		generateZodFiles(verbOptions, output, context),
		output.override.hono.compositeRoute ? generateCompositeRoutes(verbOptions, output, context) : []
	]);
	return [
		...handlers,
		...contexts,
		...zods,
		...output.override.hono.validator && output.override.hono.validator !== "hono" ? [validator] : [],
		...compositeRoutes
	];
};
const honoClientBuilder = {
	client: generateHono,
	dependencies: getHonoDependencies,
	header: getHonoHeader,
	footer: getHonoFooter,
	extraFiles: generateExtraFiles
};
const builder = () => () => honoClientBuilder;
var src_default = builder;

//#endregion
exports.builder = builder;
exports.default = src_default;
exports.generateExtraFiles = generateExtraFiles;
exports.generateHono = generateHono;
exports.getHonoDependencies = getHonoDependencies;
exports.getHonoFooter = getHonoFooter;
exports.getHonoHeader = getHonoHeader;
//# sourceMappingURL=index.js.map