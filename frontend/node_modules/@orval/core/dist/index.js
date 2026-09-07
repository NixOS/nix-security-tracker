//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (all) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	return target;
};
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
let lodash_isempty = require("lodash.isempty");
lodash_isempty = __toESM(lodash_isempty);
let esutils = require("esutils");
esutils = __toESM(esutils);
let node_path = require("node:path");
node_path = __toESM(node_path);
let node_fs = require("node:fs");
node_fs = __toESM(node_fs);
let chalk = require("chalk");
chalk = __toESM(chalk);
let esbuild = require("esbuild");
esbuild = __toESM(esbuild);
let globby = require("globby");
globby = __toESM(globby);
let micromatch = require("micromatch");
micromatch = __toESM(micromatch);
let debug = require("debug");
debug = __toESM(debug);
let compare_versions = require("compare-versions");
compare_versions = __toESM(compare_versions);
let node_url = require("node:url");
node_url = __toESM(node_url);
let node_readline = require("node:readline");
node_readline = __toESM(node_readline);
let swagger2openapi = require("swagger2openapi");
swagger2openapi = __toESM(swagger2openapi);
let __ibm_cloud_openapi_ruleset = require("@ibm-cloud/openapi-ruleset");
__ibm_cloud_openapi_ruleset = __toESM(__ibm_cloud_openapi_ruleset);
let __stoplight_spectral_core = require("@stoplight/spectral-core");
__stoplight_spectral_core = __toESM(__stoplight_spectral_core);
let lodash_uniqby = require("lodash.uniqby");
lodash_uniqby = __toESM(lodash_uniqby);
let lodash_uniq = require("lodash.uniq");
lodash_uniq = __toESM(lodash_uniq);
let lodash_uniqwith = require("lodash.uniqwith");
lodash_uniqwith = __toESM(lodash_uniqwith);
let acorn = require("acorn");
acorn = __toESM(acorn);
let fs_extra = require("fs-extra");
fs_extra = __toESM(fs_extra);

//#region src/types.ts
const PropertySortOrder = {
	ALPHABETICAL: "Alphabetical",
	SPECIFICATION: "Specification"
};
const NamingConvention = {
	CAMEL_CASE: "camelCase",
	PASCAL_CASE: "PascalCase",
	SNAKE_CASE: "snake_case",
	KEBAB_CASE: "kebab-case"
};
const EnumGeneration = {
	CONST: "const",
	ENUM: "enum",
	UNION: "union"
};
const OutputClient = {
	ANGULAR: "angular",
	AXIOS: "axios",
	AXIOS_FUNCTIONS: "axios-functions",
	REACT_QUERY: "react-query",
	SVELTE_QUERY: "svelte-query",
	VUE_QUERY: "vue-query",
	SWR: "swr",
	ZOD: "zod",
	HONO: "hono",
	FETCH: "fetch",
	MCP: "mcp"
};
const OutputHttpClient = {
	AXIOS: "axios",
	FETCH: "fetch"
};
const OutputMode = {
	SINGLE: "single",
	SPLIT: "split",
	TAGS: "tags",
	TAGS_SPLIT: "tags-split"
};
const OutputMockType = { MSW: "msw" };
const FormDataArrayHandling = {
	SERIALIZE: "serialize",
	EXPLODE: "explode",
	SERIALIZE_WITH_BRACKETS: "serialize-with-brackets"
};
const Verbs = {
	POST: "post",
	PUT: "put",
	GET: "get",
	PATCH: "patch",
	DELETE: "delete",
	HEAD: "head"
};
const GetterPropType = {
	PARAM: "param",
	NAMED_PATH_PARAMS: "namedPathParams",
	BODY: "body",
	QUERY_PARAM: "queryParam",
	HEADER: "header"
};
const SchemaType = {
	integer: "integer",
	number: "number",
	string: "string",
	boolean: "boolean",
	object: "object",
	null: "null",
	array: "array",
	enum: "enum",
	unknown: "unknown"
};
var ErrorWithTag = class extends Error {
	tag;
	constructor(message, tag, options) {
		super(message, options);
		this.tag = tag;
	}
};

//#endregion
//#region src/constants.ts
const generalJSTypes = [
	"number",
	"string",
	"null",
	"unknown",
	"undefined",
	"object",
	"blob"
];
const generalJSTypesWithArray = generalJSTypes.reduce((acc, type) => {
	acc.push(type, `Array<${type}>`, `${type}[]`);
	return acc;
}, []);
const VERBS_WITH_BODY = [
	Verbs.POST,
	Verbs.PUT,
	Verbs.PATCH,
	Verbs.DELETE
];
const URL_REGEX = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
const TEMPLATE_TAG_REGEX = /\${(.+?)}/g;

//#endregion
//#region src/utils/extension.ts
const getExtension = (path$3) => path$3.toLowerCase().includes(".yaml") || path$3.toLowerCase().includes(".yml") ? "yaml" : "json";

//#endregion
//#region src/utils/debug.ts
const filter = process.env.ORVAL_DEBUG_FILTER;
const DEBUG = process.env.DEBUG;
function createDebugger(ns, options = {}) {
	const log$1 = (0, debug.default)(ns);
	const { onlyWhenFocused } = options;
	const focus = typeof onlyWhenFocused === "string" ? onlyWhenFocused : ns;
	return (msg, ...args) => {
		if (filter && !msg.includes(filter)) return;
		if (onlyWhenFocused && !DEBUG?.includes(focus)) return;
		log$1(msg, ...args);
	};
}

//#endregion
//#region src/utils/file.ts
const getFileInfo = (target = "", { backupFilename = "filename", extension = ".ts" } = {}) => {
	const isDir = isDirectory(target);
	const filePath = isDir ? node_path.default.join(target, backupFilename + extension) : target;
	const pathWithoutExtension = filePath.replace(/\.[^/.]+$/, "");
	const dir = node_path.default.dirname(filePath);
	const filename = node_path.default.basename(filePath, extension.startsWith(".") ? extension : `.${extension}`);
	return {
		path: filePath,
		pathWithoutExtension,
		extension,
		isDirectory: isDir,
		dirname: dir,
		filename
	};
};
const debug$1 = createDebugger("orval:file-load");
const cache = /* @__PURE__ */ new Map();
async function loadFile(filePath, options) {
	const { root = process.cwd(), defaultFileName, alias, tsconfig } = options ?? {};
	const start = Date.now();
	let resolvedPath;
	let isMjs = false;
	if (filePath) resolvedPath = node_path.default.resolve(filePath);
	else if (defaultFileName) {
		const jsFile = node_path.default.resolve(root, `${defaultFileName}.js`);
		if (node_fs.default.existsSync(jsFile)) resolvedPath = jsFile;
		if (!resolvedPath) {
			const mjsFile = node_path.default.resolve(root, `${defaultFileName}.mjs`);
			if (node_fs.default.existsSync(mjsFile)) {
				resolvedPath = mjsFile;
				isMjs = true;
			}
		}
		if (!resolvedPath) {
			const cjsFile = node_path.default.resolve(root, `${defaultFileName}.cjs`);
			if (node_fs.default.existsSync(cjsFile)) resolvedPath = cjsFile;
		}
		if (!resolvedPath) {
			const tsFile = node_path.default.resolve(root, `${defaultFileName}.ts`);
			if (node_fs.default.existsSync(tsFile)) resolvedPath = tsFile;
		}
	}
	if (!resolvedPath) if (filePath) throw new Error(chalk.default.red(`File not found => ${filePath}`));
	else if (defaultFileName) throw new Error(chalk.default.red(`File not found => ${defaultFileName}.{js,mjs,cjs,ts}`));
	else throw new Error(chalk.default.red(`File not found`));
	const normalizeResolvedPath = normalizeSafe(resolvedPath);
	const cachedData = cache.get(resolvedPath);
	if (cachedData) return {
		path: normalizeResolvedPath,
		...cachedData,
		cached: true
	};
	try {
		const { code: file } = await bundleFile(resolvedPath, isMjs, root || node_path.default.dirname(normalizeResolvedPath), alias, tsconfig?.compilerOptions);
		debug$1(`bundled file loaded in ${Date.now() - start}ms`);
		cache.set(resolvedPath, { file });
		return {
			path: normalizeResolvedPath,
			file
		};
	} catch (error) {
		cache.set(resolvedPath, { error });
		return {
			path: normalizeResolvedPath,
			error
		};
	}
}
async function bundleFile(fileName, mjs = false, workspace, alias, compilerOptions) {
	const result = await (0, esbuild.build)({
		absWorkingDir: process.cwd(),
		entryPoints: [fileName],
		outfile: "out.js",
		write: false,
		platform: "node",
		bundle: true,
		format: mjs ? "esm" : "cjs",
		sourcemap: "inline",
		metafile: true,
		target: compilerOptions?.target || "es6",
		minify: false,
		minifyIdentifiers: false,
		minifySyntax: false,
		minifyWhitespace: false,
		treeShaking: false,
		keepNames: false,
		plugins: [
			...alias || compilerOptions?.paths ? [{
				name: "aliasing",
				setup(build$1) {
					build$1.onResolve({ filter: /^[\w@][^:]/ }, async ({ path: id }) => {
						if (alias) {
							const matchKeys = Object.keys(alias);
							const match = matchKeys.find((key) => id.startsWith(key) || micromatch.default.isMatch(id, matchKeys));
							if (match) {
								const find = micromatch.default.scan(match);
								const replacement$1 = micromatch.default.scan(alias[match]);
								const base = node_path.default.resolve(workspace, replacement$1.base);
								const newPath = find.base ? id.replace(find.base, base) : joinSafe(base, id);
								const aliased = node_path.default.extname(newPath) ? newPath : `${newPath}.ts`;
								if (!node_fs.default.existsSync(aliased)) return;
								return { path: aliased };
							}
						}
						if (compilerOptions?.paths) {
							const matchKeys = Object.keys(compilerOptions?.paths);
							const match = matchKeys.find((key) => id.startsWith(key) || micromatch.default.isMatch(id, matchKeys));
							if (match) {
								const find = micromatch.default.scan(match);
								const replacement$1 = micromatch.default.scan(compilerOptions?.paths[match][0]);
								const base = node_path.default.resolve(workspace, replacement$1.base);
								const newPath = find.base ? id.replace(find.base, base) : joinSafe(base, id);
								const aliased = node_path.default.extname(newPath) ? newPath : `${newPath}.ts`;
								if (!node_fs.default.existsSync(aliased)) return;
								return { path: aliased };
							}
						}
					});
				}
			}] : [],
			{
				name: "externalize-deps",
				setup(build$1) {
					build$1.onResolve({ filter: /.*/ }, (args) => {
						const id = args.path;
						if (!id.startsWith(".") && !node_path.default.isAbsolute(id)) return { external: true };
					});
				}
			},
			{
				name: "replace-import-meta",
				setup(build$1) {
					build$1.onLoad({ filter: /\.[jt]s$/ }, async (args) => {
						const contents = await node_fs.default.promises.readFile(args.path, "utf8");
						return {
							loader: args.path.endsWith(".ts") ? "ts" : "js",
							contents: contents.replaceAll(/\bimport\.meta\.url\b/g, JSON.stringify(`file://${args.path}`)).replaceAll(/\b__dirname\b/g, JSON.stringify(node_path.default.dirname(args.path))).replaceAll(/\b__filename\b/g, JSON.stringify(args.path))
						};
					});
				}
			}
		]
	});
	const { text } = result.outputFiles[0];
	return {
		code: text,
		dependencies: result.metafile ? Object.keys(result.metafile.inputs) : []
	};
}
async function removeFilesAndEmptyFolders(patterns, dir) {
	const files = await (0, globby.default)(patterns, {
		cwd: dir,
		absolute: true
	});
	await Promise.all(files.map((file) => node_fs.default.promises.unlink(file)));
	const sortedDirectories = (await (0, globby.default)(["**/*"], {
		cwd: dir,
		absolute: true,
		onlyDirectories: true
	})).sort((a, b) => {
		const depthA = a.split("/").length;
		return b.split("/").length - depthA;
	});
	for (const directory of sortedDirectories) try {
		if ((await node_fs.default.promises.readdir(directory)).length === 0) await node_fs.default.promises.rmdir(directory);
	} catch {}
}

//#endregion
//#region src/utils/path.ts
var path_exports = /* @__PURE__ */ __export({
	basename: () => basename,
	dirname: () => dirname,
	extname: () => extname,
	getSchemaFileName: () => getSchemaFileName,
	getSpecName: () => getSpecName,
	isAbsolute: () => isAbsolute,
	join: () => join,
	joinSafe: () => joinSafe,
	normalizeSafe: () => normalizeSafe,
	relativeSafe: () => relativeSafe,
	resolve: () => resolve,
	separator: () => separator
});
const path$1 = {};
const isFunction$1 = (val) => typeof val == "function";
const isString$1 = (val) => {
	if (typeof val === "string") return true;
	if (typeof val === "object" && val !== null) return Object.toString.call(val) == "[object String]";
	return false;
};
for (const [propName, propValue] of Object.entries(node_path.default)) if (isFunction$1(propValue)) path$1[propName] = ((propName$1) => {
	return (...args) => {
		args = args.map((p) => {
			return isString$1(p) ? toUnix(p) : p;
		});
		const result = node_path.default[propName$1](...args);
		return isString$1(result) ? toUnix(result) : result;
	};
})(propName);
else path$1[propName] = propValue;
const { join, resolve, extname, dirname, basename, isAbsolute } = path$1;
/**
* Behaves exactly like `path.relative(from, to)`, but keeps the first meaningful "./"
*/
const relativeSafe = (from, to) => {
	const normalizedRelativePath = path$1.relative(from, to);
	return normalizeSafe(`.${separator}${normalizedRelativePath}`);
};
const getSpecName = (specKey, target) => {
	if (isUrl(specKey)) return specKey;
	return "/" + path$1.normalize(path$1.relative(getFileInfo(target).dirname, specKey)).split("../").join("").replace(`.${getExtension(specKey)}`, "");
};
const getSchemaFileName = (path$3) => {
	return path$3.replace(`.${getExtension(path$3)}`, "").slice(path$3.lastIndexOf("/") + 1);
};
const separator = "/";
const toUnix = function(value) {
	value = value.replaceAll("\\", "/");
	value = value.replaceAll(/(?<!^)\/+/g, "/");
	return value;
};
const normalizeSafe = (value) => {
	let result;
	value = toUnix(value);
	result = path$1.normalize(value);
	if (value.startsWith("./") && !result.startsWith("./") && !result.startsWith("..")) result = "./" + result;
	else if (value.startsWith("//") && !result.startsWith("//")) result = value.startsWith("//./") ? "//." + result : "/" + result;
	return result;
};
const joinSafe = function(...values) {
	let result = path$1.join(...values);
	if (values.length > 0) {
		const firstValue = toUnix(values[0]);
		if (firstValue.startsWith("./") && !result.startsWith("./") && !result.startsWith("..")) result = "./" + result;
		else if (firstValue.startsWith("//") && !result.startsWith("//")) result = firstValue.startsWith("//./") ? "//." + result : "/" + result;
	}
	return result;
};

//#endregion
//#region src/utils/assertion.ts
/**
* Discriminator helper for `ReferenceObject`
*
* @param property
*/
const isReference = (property) => {
	return Boolean(property?.$ref);
};
const isDirectory = (path$3) => {
	return !extname(path$3);
};
function isObject(x) {
	return Object.prototype.toString.call(x) === "[object Object]";
}
function isModule(x) {
	return Object.prototype.toString.call(x) === "[object Module]";
}
function isString(x) {
	return typeof x === "string";
}
function isNumber(x) {
	return typeof x === "number";
}
function isNumeric(x) {
	return /^-?\d+$/.test(x);
}
function isBoolean(x) {
	return typeof x === "boolean";
}
function isFunction(x) {
	return typeof x === "function";
}
function isUndefined(x) {
	return x === void 0;
}
function isNull(x) {
	return x === null;
}
function isSchema(x) {
	if (!isObject(x)) return false;
	if (isString(x.type) && Object.values(SchemaType).includes(x.type)) return true;
	const combine = x.allOf || x.anyOf || x.oneOf;
	if (Array.isArray(combine)) return true;
	if (isObject(x.properties)) return true;
	return false;
}
const isVerb = (verb) => Object.values(Verbs).includes(verb);
const isRootKey = (specKey, target) => {
	return specKey === target;
};
const isUrl = (str) => {
	let givenURL;
	try {
		givenURL = new URL(str);
	} catch {
		return false;
	}
	return givenURL.protocol === "http:" || givenURL.protocol === "https:";
};

//#endregion
//#region src/utils/async-reduce.ts
async function asyncReduce(array, reducer, initValue) {
	let accumulate = typeof initValue === "object" ? Object.create(initValue) : initValue;
	for (const item of array) accumulate = await reducer(accumulate, item);
	return accumulate;
}

//#endregion
//#region src/utils/case.ts
const unicodes = function(s, prefix) {
	prefix = prefix || "";
	return s.replaceAll(/(^|-)/g, String.raw`$1\u` + prefix).replaceAll(",", String.raw`\u` + prefix);
};
const symbols = unicodes("20-26,28-2F,3A-40,5B-60,7B-7E,A0-BF,D7,F7", "00");
const lowers = "a-z" + unicodes("DF-F6,F8-FF", "00");
const uppers = "A-Z" + unicodes("C0-D6,D8-DE", "00");
const impropers = String.raw`A|An|And|As|At|But|By|En|For|If|In|Of|On|Or|The|To|Vs?\.?|Via`;
const regexps = {
	capitalize: new RegExp("(^|[" + symbols + "])([" + lowers + "])", "g"),
	pascal: new RegExp("(^|[" + symbols + "])+([" + lowers + uppers + "])", "g"),
	fill: new RegExp("[" + symbols + "]+(.|$)", "g"),
	sentence: new RegExp(String.raw`(^\s*|[\?\!\.]+"?\s+"?|,\s+")([` + lowers + "])", "g"),
	improper: new RegExp(String.raw`\b(` + impropers + String.raw`)\b`, "g"),
	relax: new RegExp("([^" + uppers + "])([" + uppers + "]*)([" + uppers + "])(?=[^" + uppers + "]|$)", "g"),
	upper: /* @__PURE__ */ new RegExp("^[^" + lowers + "]+$"),
	hole: /[^\s]\s[^\s]/,
	apostrophe: /'/g,
	room: /* @__PURE__ */ new RegExp("[" + symbols + "]")
};
const deapostrophe = (s) => {
	return s.replace(regexps.apostrophe, "");
};
const up = String.prototype.toUpperCase;
const low = String.prototype.toLowerCase;
const fill = (s, fillWith, isDeapostrophe = false) => {
	s = s.replace(regexps.fill, function(m, next) {
		return next ? fillWith + next : "";
	});
	if (isDeapostrophe) s = deapostrophe(s);
	return s;
};
const decap = (s, char = 0) => {
	return low.call(s.charAt(char)) + s.slice(char + 1);
};
const relax = (m, before, acronym, caps) => {
	return before + " " + (acronym ? acronym + " " : "") + caps;
};
const prep = (s, isFill = false, isPascal = false, isUpper = false) => {
	s = s == void 0 ? "" : s + "";
	if (!isUpper && regexps.upper.test(s)) s = low.call(s);
	if (!isFill && !regexps.hole.test(s)) {
		var holey = fill(s, " ");
		if (regexps.hole.test(holey)) s = holey;
	}
	if (!isPascal && !regexps.room.test(s)) s = s.replace(regexps.relax, relax);
	return s;
};
const lower = (s, fillWith, isDeapostrophe) => {
	return fill(low.call(prep(s, !!fillWith)), fillWith, isDeapostrophe);
};
const pascalMemory = {};
const pascal = (s) => {
	if (pascalMemory[s]) return pascalMemory[s];
	const isStartWithUnderscore = s?.startsWith("_");
	if (regexps.upper.test(s)) s = low.call(s);
	const pascalString = (s?.match(/[a-zA-Z0-9\u00C0-\u017F]+/g) || []).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
	const pascalWithUnderscore = isStartWithUnderscore ? `_${pascalString}` : pascalString;
	pascalMemory[s] = pascalWithUnderscore;
	return pascalWithUnderscore;
};
const camel = (s) => {
	const isStartWithUnderscore = s?.startsWith("_");
	const camelString = decap(pascal(s), isStartWithUnderscore ? 1 : 0);
	return isStartWithUnderscore ? `_${camelString}` : camelString;
};
const snake = (s) => {
	return lower(s, "_", true);
};
const kebab = (s) => {
	return lower(s, "-", true);
};
const upper = (s, fillWith, isDeapostrophe) => {
	return fill(up.call(prep(s, !!fillWith, false, true)), fillWith, isDeapostrophe);
};
const conventionName = (name, convention) => {
	let nameConventionTransform = camel;
	switch (convention) {
		case NamingConvention.PASCAL_CASE:
			nameConventionTransform = pascal;
			break;
		case NamingConvention.SNAKE_CASE:
			nameConventionTransform = snake;
			break;
		case NamingConvention.KEBAB_CASE:
			nameConventionTransform = kebab;
			break;
	}
	return nameConventionTransform(name);
};

//#endregion
//#region src/utils/compare-version.ts
const compareVersions = (firstVersion, secondVersions, operator = ">=") => {
	if (firstVersion === "latest" || firstVersion === "*") return true;
	if (firstVersion.startsWith("catalog:")) return true;
	return (0, compare_versions.compare)(firstVersion.replace(/(\s(.*))/, ""), secondVersions, operator);
};

//#endregion
//#region src/utils/doc.ts
const search = String.raw`\*/`;
const replacement = String.raw`*\/`;
const regex$1 = new RegExp(search, "g");
function jsDoc(schema, tryOneLine = false, context) {
	if (context?.output?.override?.jsDoc) {
		const { filter: filter$1 } = context.output.override.jsDoc;
		if (filter$1) return keyValuePairsToJsDoc(filter$1(schema));
	}
	const { description, deprecated, summary, minLength, maxLength, minimum, maximum, exclusiveMinimum, exclusiveMaximum, minItems, maxItems, nullable, pattern } = schema;
	const lines = (Array.isArray(description) ? description.filter((d) => !d.includes("eslint-disable")) : [description || ""]).map((line) => line.replaceAll(regex$1, replacement));
	const count$1 = [
		description,
		deprecated,
		summary,
		minLength?.toString(),
		maxLength?.toString(),
		minimum?.toString(),
		maximum?.toString(),
		exclusiveMinimum?.toString(),
		exclusiveMaximum?.toString(),
		minItems?.toString(),
		maxItems?.toString(),
		nullable?.toString(),
		pattern
	].reduce((acc, it) => it ? acc + 1 : acc, 0);
	if (!count$1) return "";
	const oneLine = count$1 === 1 && tryOneLine;
	const eslintDisable = Array.isArray(description) ? description.find((d) => d.includes("eslint-disable"))?.replaceAll(regex$1, replacement) : void 0;
	let doc = `${eslintDisable ? `/* ${eslintDisable} */\n` : ""}/**`;
	if (description) {
		if (!oneLine) doc += `\n${tryOneLine ? "  " : ""} *`;
		doc += ` ${lines.join("\n * ")}`;
	}
	function appendPrefix() {
		if (!oneLine) doc += `\n${tryOneLine ? "  " : ""} *`;
	}
	function tryAppendStringDocLine(key, value) {
		if (value) {
			appendPrefix();
			doc += ` @${key} ${value.replaceAll(regex$1, replacement)}`;
		}
	}
	function tryAppendBooleanDocLine(key, value) {
		if (value === true) {
			appendPrefix();
			doc += ` @${key}`;
		}
	}
	function tryAppendNumberDocLine(key, value) {
		if (value !== void 0) {
			appendPrefix();
			doc += ` @${key} ${value}`;
		}
	}
	tryAppendBooleanDocLine("deprecated", deprecated);
	tryAppendStringDocLine("summary", summary?.replaceAll(regex$1, replacement));
	tryAppendNumberDocLine("minLength", minLength);
	tryAppendNumberDocLine("maxLength", maxLength);
	tryAppendNumberDocLine("minimum", minimum);
	tryAppendNumberDocLine("maximum", maximum);
	tryAppendBooleanDocLine("exclusiveMinimum", exclusiveMinimum);
	tryAppendBooleanDocLine("exclusiveMaximum", exclusiveMaximum);
	tryAppendNumberDocLine("minItems", minItems);
	tryAppendNumberDocLine("maxItems", maxItems);
	tryAppendBooleanDocLine("nullable", nullable);
	tryAppendStringDocLine("pattern", pattern);
	doc += oneLine ? " " : `\n ${tryOneLine ? "  " : ""}`;
	doc += "*/\n";
	return doc;
}
function keyValuePairsToJsDoc(keyValues) {
	if (keyValues.length === 0) return "";
	let doc = "/**\n";
	for (const { key, value } of keyValues) doc += ` * @${key} ${value}\n`;
	doc += " */\n";
	return doc;
}

//#endregion
//#region src/utils/dynamic-import.ts
const dynamicImport = async (toImport, from = process.cwd(), takeDefault = true) => {
	if (!toImport) return toImport;
	try {
		if (isString(toImport)) {
			const filePath = node_path.default.resolve(from, toImport);
			const fileUrl = (0, node_url.pathToFileURL)(filePath);
			const data = node_path.default.extname(fileUrl.href) === ".json" ? await import(fileUrl.href, { with: { type: "json" } }) : await import(fileUrl.href);
			if (takeDefault && (isObject(data) || isModule(data)) && data.default) return data.default;
			return data;
		}
		return toImport;
	} catch (error) {
		throw new Error(`Oups... 🍻. Path: ${toImport} => ${error}`);
	}
};

//#endregion
//#region src/utils/file-extensions.ts
const getMockFileExtensionByTypeName = (mock) => {
	if (isFunction(mock)) return "msw";
	switch (mock.type) {
		default: return "msw";
	}
};

//#endregion
//#region src/utils/is-body-verb.ts
const getIsBodyVerb = (verb) => VERBS_WITH_BODY.includes(verb);

//#endregion
//#region src/utils/logger.ts
const log = console.log;
const startMessage = ({ name, version, description }) => `🍻 ${chalk.default.cyan.bold(name)} ${chalk.default.green(`v${version}`)}${description ? ` - ${description}` : ""}`;
const logError = (err, tag) => {
	log(chalk.default.red([
		"🛑",
		tag ? `${tag} -` : void 0,
		err instanceof Error ? err.stack : err
	].filter(Boolean).join(" ")));
};
const mismatchArgsMessage = (mismatchArgs) => {
	log(chalk.default.yellow(`${mismatchArgs.join(", ")} ${mismatchArgs.length === 1 ? "is" : "are"} not defined in your configuration!`));
};
const createSuccessMessage = (backend) => {
	log(`🎉 ${backend ? `${chalk.default.green(backend)} - ` : ""}Your OpenAPI spec has been converted into ready to use orval!`);
};
const ibmOpenapiValidatorWarnings = (warnings) => {
	log(chalk.default.yellow("(!) Warnings"));
	for (const i of warnings) log(chalk.default.yellow(`Message : ${i.message}\nPath    : ${i.path.join(", ")}`));
};
const ibmOpenapiValidatorErrors = (errors) => {
	log(chalk.default.red("(!) Errors"));
	for (const i of errors) log(chalk.default.red(`Message : ${i.message}\nPath    : ${i.path.join(", ")}`));
};
const LogLevels = {
	silent: 0,
	error: 1,
	warn: 2,
	info: 3
};
let lastType;
let lastMsg;
let sameCount = 0;
function clearScreen() {
	const repeatCount = process.stdout.rows - 2;
	const blank = repeatCount > 0 ? "\n".repeat(repeatCount) : "";
	console.log(blank);
	node_readline.default.cursorTo(process.stdout, 0, 0);
	node_readline.default.clearScreenDown(process.stdout);
}
function createLogger(level = "info", options = {}) {
	const { prefix = "[vite]", allowClearScreen = true } = options;
	const thresh = LogLevels[level];
	const clear = allowClearScreen && process.stdout.isTTY && !process.env.CI ? clearScreen : () => {};
	function output(type, msg, options$1 = {}) {
		if (thresh >= LogLevels[type]) {
			const method = type === "info" ? "log" : type;
			const format = () => {
				if (options$1.timestamp) {
					const tag = type === "info" ? chalk.default.cyan.bold(prefix) : type === "warn" ? chalk.default.yellow.bold(prefix) : chalk.default.red.bold(prefix);
					return `${chalk.default.dim((/* @__PURE__ */ new Date()).toLocaleTimeString())} ${tag} ${msg}`;
				} else return msg;
			};
			if (type === lastType && msg === lastMsg) {
				sameCount++;
				clear();
				console[method](format(), chalk.default.yellow(`(x${sameCount + 1})`));
			} else {
				sameCount = 0;
				lastMsg = msg;
				lastType = type;
				if (options$1.clear) clear();
				console[method](format());
			}
		}
	}
	const warnedMessages = /* @__PURE__ */ new Set();
	const logger = {
		hasWarned: false,
		info(msg, opts) {
			output("info", msg, opts);
		},
		warn(msg, opts) {
			logger.hasWarned = true;
			output("warn", msg, opts);
		},
		warnOnce(msg, opts) {
			if (warnedMessages.has(msg)) return;
			logger.hasWarned = true;
			output("warn", msg, opts);
			warnedMessages.add(msg);
		},
		error(msg, opts) {
			logger.hasWarned = true;
			output("error", msg, opts);
		},
		clearScreen(type) {
			if (thresh >= LogLevels[type]) clear();
		}
	};
	return logger;
}

//#endregion
//#region src/utils/merge-deep.ts
const isObject$1 = (obj) => obj && typeof obj === "object";
function mergeDeep(source, target) {
	if (!isObject$1(target) || !isObject$1(source)) return source;
	return Object.entries(target).reduce((acc, [key, value]) => {
		const sourceValue = acc[key];
		if (Array.isArray(sourceValue) && Array.isArray(value)) acc[key] = [...sourceValue, ...value];
		else if (isObject$1(sourceValue) && isObject$1(value)) acc[key] = mergeDeep(sourceValue, value);
		else acc[key] = value;
		return acc;
	}, Object.assign({}, source));
}

//#endregion
//#region src/utils/occurrence.ts
const count = (str = "", key) => {
	if (!str) return 0;
	return (str.match(new RegExp(key, "g")) ?? []).length;
};

//#endregion
//#region src/utils/open-api-converter.ts
const openApiConverter = async (schema, options = {}, specKey) => {
	try {
		return new Promise((resolve$1) => {
			if (!schema.openapi && schema.swagger === "2.0") (0, swagger2openapi.convertObj)(schema, options, (err, value) => {
				if (err) {
					log(chalk.default.yellow(`${specKey}\n=> ${err}`));
					resolve$1(schema);
				} else resolve$1(value.openapi);
			});
			else resolve$1(schema);
		});
	} catch (error) {
		throw new Error(`Oups... 🍻.\nPath: ${specKey}\nParsing Error: ${error}`);
	}
};

//#endregion
//#region src/utils/sort.ts
const sortByPriority = (arr) => arr.sort((a, b) => {
	if (a.default) return 1;
	if (b.default) return -1;
	if (a.required && b.required) return 0;
	if (a.required) return -1;
	if (b.required) return 1;
	return 0;
});

//#endregion
//#region src/utils/string.ts
const stringify = (data) => {
	if (isUndefined(data) || isNull(data)) return;
	if (isString(data)) return `'${data}'`;
	if (isNumber(data) || isBoolean(data) || isFunction(data)) return `${data}`;
	if (Array.isArray(data)) return `[${data.map(stringify).join(", ")}]`;
	return Object.entries(data).reduce((acc, [key, value], index, arr) => {
		const strValue = stringify(value);
		if (arr.length === 1) return `{ ${key}: ${strValue}, }`;
		if (!index) return `{ ${key}: ${strValue}, `;
		if (arr.length - 1 === index) return acc + `${key}: ${strValue}, }`;
		return acc + `${key}: ${strValue}, `;
	}, "");
};
const sanitize = (value, options) => {
	const { whitespace = "", underscore = "", dot = "", dash = "", es5keyword = false, es5IdentifierName = false, special = false } = options ?? {};
	let newValue = value;
	if (!special) newValue = newValue.replaceAll(/[!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]/g, "");
	if (whitespace !== true) newValue = newValue.replaceAll(/[\s]/g, whitespace);
	if (underscore !== true) newValue = newValue.replaceAll(/['_']/g, underscore);
	if (dot !== true) newValue = newValue.replaceAll(/[.]/g, dot);
	if (dash !== true) newValue = newValue.replaceAll(/[-]/g, dash);
	if (es5keyword) newValue = esutils.keyword.isKeywordES5(newValue, true) ? `_${newValue}` : newValue;
	if (es5IdentifierName) if (/^[0-9]/.test(newValue)) newValue = `N${newValue}`;
	else newValue = esutils.keyword.isIdentifierNameES5(newValue) ? newValue : `_${newValue}`;
	return newValue;
};
const toObjectString = (props, path$3) => {
	if (props.length === 0) return "";
	return (typeof path$3 === "string" ? props.map((prop) => path$3.split(".").reduce((obj, key) => obj && typeof obj === "object" ? obj[key] : void 0, prop)) : props).join(",\n    ") + ",";
};
const NUMBERS = {
	"0": "zero",
	"1": "one",
	"2": "two",
	"3": "three",
	"4": "four",
	"5": "five",
	"6": "six",
	"7": "seven",
	"8": "eight",
	"9": "nine"
};
const getNumberWord = (num) => {
	return num.toString().split("").reduce((acc, n) => acc + NUMBERS[n], "");
};
const escape = (str, char = "'") => str?.replace(char, `\\${char}`);
/**
* Escape all characters not included in SingleStringCharacters and
* DoubleStringCharacters on
* http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
*
* Based on https://github.com/joliss/js-string-escape/blob/master/index.js
*
* @param input String to escape
*/
const jsStringEscape = (input) => input.replaceAll(/["'\\\n\r\u2028\u2029/*]/g, (character) => {
	switch (character) {
		case "\"":
		case "'":
		case "\\":
		case "/":
		case "*": return "\\" + character;
		case "\n": return String.raw`\n`;
		case "\r": return String.raw`\r`;
		case "\u2028": return String.raw`\u2028`;
		case "\u2029": return String.raw`\u2029`;
		default: return "";
	}
});

//#endregion
//#region src/utils/tsconfig.ts
const isSyntheticDefaultImportsAllow = (config) => {
	if (!config) return true;
	return !!(config?.compilerOptions?.allowSyntheticDefaultImports ?? config?.compilerOptions?.esModuleInterop);
};

//#endregion
//#region src/utils/validator.ts
/**
* Validate the spec with ibm-openapi-validator (with a custom pretty logger).
* More information: https://github.com/IBM/openapi-validator/#configuration
* @param specs openAPI spec
*/
const ibmOpenapiValidator = async (specs, validation) => {
	const ruleset = typeof validation === "boolean" ? __ibm_cloud_openapi_ruleset.default : validation;
	const spectral = new __stoplight_spectral_core.Spectral();
	spectral.setRuleset(ruleset);
	const results = await spectral.run(specs);
	const errors = [];
	const warnings = [];
	for (const { severity, message, path: path$3 } of results) {
		const entry = {
			message,
			path: path$3.map((x) => x.toString())
		};
		switch (severity) {
			case 0:
				errors.push(entry);
				break;
			case 1:
				warnings.push(entry);
				break;
		}
	}
	if (warnings.length > 0) ibmOpenapiValidatorWarnings(warnings);
	if (errors.length > 0) {
		ibmOpenapiValidatorErrors(errors);
		throw new Error("Spec validation failed");
	}
};

//#endregion
//#region src/getters/enum.ts
function getEnumNames(schemaObject) {
	const names = schemaObject?.["x-enumNames"] ?? schemaObject?.["x-enumnames"] ?? schemaObject?.["x-enum-varnames"];
	if (!names) return;
	return names.map((name) => jsStringEscape(name));
}
function getEnumDescriptions(schemaObject) {
	const descriptions = schemaObject?.["x-enumDescriptions"] ?? schemaObject?.["x-enumdescriptions"] ?? schemaObject?.["x-enum-descriptions"];
	if (!descriptions) return;
	return descriptions.map((description) => jsStringEscape(description));
}
const getEnum = (value, enumName, names, enumGenerationType, descriptions, enumNamingConvention) => {
	if (enumGenerationType === EnumGeneration.CONST) return getTypeConstEnum(value, enumName, names, descriptions, enumNamingConvention);
	if (enumGenerationType === EnumGeneration.ENUM) return getNativeEnum(value, enumName, names, enumNamingConvention);
	if (enumGenerationType === EnumGeneration.UNION) return getUnion(value, enumName);
	throw new Error(`Invalid enumGenerationType: ${enumGenerationType}`);
};
const getTypeConstEnum = (value, enumName, names, descriptions, enumNamingConvention) => {
	let enumValue = `export type ${enumName} = typeof ${enumName}[keyof typeof ${enumName}]`;
	if (value.endsWith(" | null")) {
		value = value.replace(" | null", "");
		enumValue += " | null";
	}
	enumValue += ";\n";
	const implementation = getEnumImplementation(value, names, descriptions, enumNamingConvention);
	enumValue += "\n\n";
	enumValue += "// eslint-disable-next-line @typescript-eslint/no-redeclare\n";
	enumValue += `export const ${enumName} = {\n${implementation}} as const;\n`;
	return enumValue;
};
const getEnumImplementation = (value, names, descriptions, enumNamingConvention) => {
	if (value === "") return "";
	return [...new Set(value.split(" | "))].reduce((acc, val, index) => {
		const name = names?.[index];
		const description = descriptions?.[index];
		const comment = description ? `  /** ${description} */\n` : "";
		if (name) return acc + comment + `  ${esutils.keyword.isIdentifierNameES5(name) ? name : `'${name}'`}: ${val},\n`;
		let key = val.startsWith("'") ? val.slice(1, -1) : val;
		if (isNumeric(key)) key = toNumberKey(key);
		if (key.length > 1) key = sanitize(key, {
			whitespace: "_",
			underscore: true,
			dash: true,
			special: true
		});
		if (enumNamingConvention) key = conventionName(key, enumNamingConvention);
		return acc + comment + `  ${esutils.keyword.isIdentifierNameES5(key) ? key : `'${key}'`}: ${val},\n`;
	}, "");
};
const getNativeEnum = (value, enumName, names, enumNamingConvention) => {
	const enumItems = getNativeEnumItems(value, names, enumNamingConvention);
	return `export enum ${enumName} {\n${enumItems}\n}`;
};
const getNativeEnumItems = (value, names, enumNamingConvention) => {
	if (value === "") return "";
	return [...new Set(value.split(" | "))].reduce((acc, val, index) => {
		const name = names?.[index];
		if (name) return acc + `  ${esutils.keyword.isIdentifierNameES5(name) ? name : `'${name}'`}= ${val},\n`;
		let key = val.startsWith("'") ? val.slice(1, -1) : val;
		if (isNumeric(key)) key = toNumberKey(key);
		if (key.length > 1) key = sanitize(key, {
			whitespace: "_",
			underscore: true,
			dash: true,
			special: true
		});
		if (enumNamingConvention) key = conventionName(key, enumNamingConvention);
		return acc + `  ${esutils.keyword.isIdentifierNameES5(key) ? key : `'${key}'`}= ${val},\n`;
	}, "");
};
const toNumberKey = (value) => {
	if (value.startsWith("-")) return `NUMBER_MINUS_${value.slice(1)}`;
	if (value.startsWith("+")) return `NUMBER_PLUS_${value.slice(1)}`;
	return `NUMBER_${value}`;
};
const getUnion = (value, enumName) => {
	return `export type ${enumName} = ${value};`;
};

//#endregion
//#region src/getters/ref.ts
const RefComponentSuffix = {
	schemas: "",
	responses: "Response",
	parameters: "Parameter",
	requestBodies: "Body"
};
const regex = new RegExp("~1", "g");
const resolveUrl = (from, to) => {
	const resolvedUrl = new URL(to, new URL(from, "resolve://"));
	if (resolvedUrl.protocol === "resolve:") {
		const { pathname, search: search$1, hash } = resolvedUrl;
		return pathname + search$1 + hash;
	}
	return resolvedUrl.toString();
};
/**
* Return the output type from the $ref
*
* @param $ref
*/
const getRefInfo = ($ref, context) => {
	const [pathname, ref] = $ref.split("#");
	const refPaths = ref?.slice(1).split("/").map((part) => decodeURIComponent(part.replaceAll(regex, "/")));
	const getOverrideSuffix = (override, paths) => {
		const firstLevel = override[paths[0]];
		if (!firstLevel) return "";
		return firstLevel[paths[1]]?.suffix ?? "";
	};
	const suffix = refPaths ? getOverrideSuffix(context.output.override, refPaths) : "";
	const originalName = ref ? refPaths[refPaths.length - 1] : getSchemaFileName(pathname);
	if (!pathname) return {
		name: sanitize(pascal(originalName) + suffix, {
			es5keyword: true,
			es5IdentifierName: true,
			underscore: true,
			dash: true
		}),
		originalName,
		refPaths
	};
	let path$3;
	if (isUrl($ref)) path$3 = $ref;
	else if (isUrl(context.specKey)) path$3 = resolveUrl(context.specKey, pathname);
	else path$3 = resolve(getFileInfo(context.specKey).dirname, pathname);
	return {
		name: sanitize(pascal(originalName) + suffix, {
			es5keyword: true,
			es5IdentifierName: true,
			underscore: true,
			dash: true
		}),
		originalName,
		specKey: path$3,
		refPaths
	};
};

//#endregion
//#region src/resolvers/ref.ts
const resolveRef = (schema, context, imports = []) => {
	if (schema?.schema?.$ref) {
		const resolvedRef = resolveRef(schema?.schema, context, imports);
		if ("examples" in schema) schema.examples = resolveExampleRefs(schema.examples, context);
		if ("examples" in resolvedRef.schema) resolvedRef.schema.examples = resolveExampleRefs(resolvedRef.schema.examples, context);
		return {
			schema: {
				...schema,
				schema: resolvedRef.schema
			},
			imports
		};
	}
	if (!isReference(schema)) {
		if ("examples" in schema) schema.examples = resolveExampleRefs(schema.examples, context);
		return {
			schema,
			imports
		};
	}
	const { currentSchema, refInfo: { specKey, name, originalName } } = getSchema$1(schema, context);
	if (!currentSchema) throw new Error(`Oops... 🍻. Ref not found: ${schema.$ref}`);
	return resolveRef(currentSchema, {
		...context,
		specKey: specKey || context.specKey
	}, [...imports, {
		name,
		specKey,
		schemaName: originalName
	}]);
};
function getSchema$1(schema, context) {
	const refInfo = getRefInfo(schema.$ref, context);
	const { specKey, refPaths } = refInfo;
	let schemaByRefPaths = refPaths && Array.isArray(refPaths) ? refPaths.reduce((obj, key) => obj && key in obj ? obj[key] : void 0, context.specs[specKey || context.specKey]) : void 0;
	if (!schemaByRefPaths) schemaByRefPaths = context.specs?.[specKey || context.specKey];
	if (isReference(schemaByRefPaths)) return getSchema$1(schemaByRefPaths, context);
	return {
		currentSchema: schemaByRefPaths ? schemaByRefPaths : context.specs[specKey || context.specKey],
		refInfo
	};
}
const resolveExampleRefs = (examples, context) => {
	if (!examples) return;
	return Array.isArray(examples) ? examples.map((example) => {
		if (isReference(example)) {
			const { schema } = resolveRef(example, context);
			return schema.value;
		}
		return example;
	}) : Object.entries(examples).reduce((acc, [key, example]) => {
		let schema = example;
		if (isReference(example)) schema = resolveRef(example, context).schema.value;
		return {
			...acc,
			[key]: schema
		};
	}, {});
};

//#endregion
//#region src/resolvers/value.ts
const resolveValue = ({ schema, name, context }) => {
	if (isReference(schema)) {
		const { schema: schemaObject, imports } = resolveRef(schema, context);
		const resolvedImport = imports[0];
		const importSpecKey = resolvedImport.specKey || (context.specKey === context.target ? void 0 : context.specKey);
		let hasReadonlyProps = false;
		if (!name || !context.parents?.includes(name)) hasReadonlyProps = getScalar({
			item: schemaObject,
			name: resolvedImport.name,
			context: {
				...context,
				specKey: importSpecKey || context.specKey,
				...name ? { parents: [...context.parents || [], name] } : {}
			}
		}).hasReadonlyProps;
		return {
			value: resolvedImport.name,
			imports: [{
				name: resolvedImport.name,
				specKey: importSpecKey,
				schemaName: resolvedImport.schemaName
			}],
			type: schemaObject?.type || "object",
			schemas: [],
			isEnum: !!schemaObject?.enum,
			originalSchema: schemaObject,
			hasReadonlyProps,
			isRef: true
		};
	}
	return {
		...getScalar({
			item: schema,
			name,
			context
		}),
		originalSchema: schema,
		isRef: false
	};
};

//#endregion
//#region src/resolvers/object.ts
const resolveObjectOriginal = ({ schema, propName, combined = false, context }) => {
	const resolvedValue = resolveValue({
		schema,
		name: propName,
		context
	});
	const doc = jsDoc(resolvedValue.originalSchema ?? {});
	if (propName && !resolvedValue.isEnum && resolvedValue?.type === "object" && (/* @__PURE__ */ new RegExp(/{|&|\|/)).test(resolvedValue.value)) {
		let model = "";
		const isConstant = "const" in schema;
		const constantIsString = "type" in schema && (schema.type === "string" || Array.isArray(schema.type) && schema.type.includes("string"));
		model += isConstant ? `${doc}export const ${propName} = ${constantIsString ? `'${schema.const}'` : schema.const} as const;\n` : `${doc}export type ${propName} = ${resolvedValue.value};\n`;
		return {
			value: propName,
			imports: [{
				name: propName,
				isConstant
			}],
			schemas: [...resolvedValue.schemas, {
				name: propName,
				model,
				imports: resolvedValue.imports
			}],
			isEnum: false,
			type: "object",
			originalSchema: resolvedValue.originalSchema,
			isRef: resolvedValue.isRef,
			hasReadonlyProps: resolvedValue.hasReadonlyProps
		};
	}
	if (propName && resolvedValue.isEnum && !combined && !resolvedValue.isRef) {
		const enumValue = getEnum(resolvedValue.value, propName, getEnumNames(resolvedValue.originalSchema), context.output.override.enumGenerationType, getEnumDescriptions(resolvedValue.originalSchema), context.output.override.namingConvention?.enum);
		return {
			value: propName,
			imports: [{ name: propName }],
			schemas: [...resolvedValue.schemas, {
				name: propName,
				model: doc + enumValue,
				imports: resolvedValue.imports
			}],
			isEnum: false,
			type: "enum",
			originalSchema: resolvedValue.originalSchema,
			isRef: resolvedValue.isRef,
			hasReadonlyProps: resolvedValue.hasReadonlyProps
		};
	}
	return resolvedValue;
};
const resolveObjectCacheMap = /* @__PURE__ */ new Map();
const resolveObject = ({ schema, propName, combined = false, context }) => {
	const hashKey = JSON.stringify({
		schema,
		propName,
		combined,
		specKey: context.specKey
	});
	if (resolveObjectCacheMap.has(hashKey)) return resolveObjectCacheMap.get(hashKey);
	const result = resolveObjectOriginal({
		schema,
		propName,
		combined,
		context
	});
	resolveObjectCacheMap.set(hashKey, result);
	return result;
};

//#endregion
//#region src/getters/array.ts
/**
* Return the output type from an array
*
* @param item item with type === "array"
*/
const getArray = ({ schema, name, context }) => {
	const schema31 = schema;
	if (schema31.prefixItems) {
		const resolvedObjects = schema31.prefixItems.map((item, index) => resolveObject({
			schema: item,
			propName: name + context.output.override.components.schemas.itemSuffix + index,
			context
		}));
		if (schema31.items) {
			const additional = resolveObject({
				schema: schema31.items,
				propName: name + context.output.override.components.schemas.itemSuffix + "Additional",
				context
			});
			resolvedObjects.push({
				...additional,
				value: `...${additional.value}[]`
			});
		}
		return {
			type: "array",
			isEnum: false,
			isRef: false,
			value: `[${resolvedObjects.map((o) => o.value).join(", ")}]`,
			imports: resolvedObjects.flatMap((o) => o.imports),
			schemas: resolvedObjects.flatMap((o) => o.schemas),
			hasReadonlyProps: resolvedObjects.some((o) => o.hasReadonlyProps),
			example: schema.example,
			examples: resolveExampleRefs(schema.examples, context)
		};
	}
	if (schema.items) {
		const resolvedObject = resolveObject({
			schema: schema.items,
			propName: name + context.output.override.components.schemas.itemSuffix,
			context
		});
		return {
			value: `${schema.readOnly === true && !context.output.override.suppressReadonlyModifier ? "readonly " : ""}${resolvedObject.value.includes("|") ? `(${resolvedObject.value})[]` : `${resolvedObject.value}[]`}`,
			imports: resolvedObject.imports,
			schemas: resolvedObject.schemas,
			isEnum: false,
			type: "array",
			isRef: false,
			hasReadonlyProps: resolvedObject.hasReadonlyProps,
			example: schema.example,
			examples: resolveExampleRefs(schema.examples, context)
		};
	} else if (compareVersions(context.specs[context.specKey].openapi, "3.1", ">=")) return {
		value: "unknown[]",
		imports: [],
		schemas: [],
		isEnum: false,
		type: "array",
		isRef: false,
		hasReadonlyProps: false
	};
	else throw new Error(`All arrays must have an \`items\` key defined (name=${name}, schema=${JSON.stringify(schema)})`);
};

//#endregion
//#region src/getters/res-req-types.ts
const formDataContentTypes = new Set(["multipart/form-data"]);
const formUrlEncodedContentTypes = new Set(["application/x-www-form-urlencoded"]);
const getResReqContentTypes = ({ mediaType, propName, context }) => {
	if (!mediaType.schema) return;
	return resolveObject({
		schema: mediaType.schema,
		propName,
		context
	});
};
const getResReqTypes = (responsesOrRequests, name, context, defaultType = "unknown", uniqueKey = "value") => {
	const typesArray = responsesOrRequests.filter(([_, res]) => Boolean(res)).map(([key, res]) => {
		if (isReference(res)) {
			const { schema: bodySchema, imports: [{ name: name$1, specKey, schemaName }] } = resolveRef(res, context);
			const [contentType, mediaType] = Object.entries(bodySchema.content ?? {})[0] ?? [];
			const isFormData = formDataContentTypes.has(contentType);
			const isFormUrlEncoded = formUrlEncodedContentTypes.has(contentType);
			if (!isFormData && !isFormUrlEncoded || !mediaType?.schema) return [{
				value: name$1,
				imports: [{
					name: name$1,
					specKey,
					schemaName
				}],
				schemas: [],
				type: "unknown",
				isEnum: false,
				isRef: true,
				hasReadonlyProps: false,
				originalSchema: mediaType?.schema,
				example: mediaType?.example,
				examples: resolveExampleRefs(mediaType?.examples, context),
				key,
				contentType
			}];
			const formData = isFormData ? getSchemaFormDataAndUrlEncoded({
				name: name$1,
				schemaObject: mediaType?.schema,
				context: {
					...context,
					specKey: specKey || context.specKey
				},
				isRequestBodyOptional: "required" in bodySchema && bodySchema.required === false,
				isRef: true
			}) : void 0;
			const formUrlEncoded = isFormUrlEncoded ? getSchemaFormDataAndUrlEncoded({
				name: name$1,
				schemaObject: mediaType?.schema,
				context: {
					...context,
					specKey: specKey || context.specKey
				},
				isRequestBodyOptional: "required" in bodySchema && bodySchema.required === false,
				isUrlEncoded: true,
				isRef: true
			}) : void 0;
			const additionalImports = getFormDataAdditionalImports({
				schemaObject: mediaType?.schema,
				context: {
					...context,
					specKey: specKey || context.specKey
				}
			});
			return [{
				value: name$1,
				imports: [{
					name: name$1,
					specKey,
					schemaName
				}, ...additionalImports],
				schemas: [],
				type: "unknown",
				isEnum: false,
				hasReadonlyProps: false,
				formData,
				formUrlEncoded,
				isRef: true,
				originalSchema: mediaType?.schema,
				example: mediaType.example,
				examples: resolveExampleRefs(mediaType.examples, context),
				key,
				contentType
			}];
		}
		if (res.content) return Object.entries(res.content).map(([contentType, mediaType], index, arr) => {
			let propName = key ? pascal(name) + pascal(key) : void 0;
			if (propName && arr.length > 1) propName = propName + pascal(getNumberWord(index + 1));
			const resolvedValue = getResReqContentTypes({
				mediaType,
				propName,
				context
			});
			if (!resolvedValue) return;
			const isFormData = formDataContentTypes.has(contentType);
			const isFormUrlEncoded = formUrlEncodedContentTypes.has(contentType);
			if (!isFormData && !isFormUrlEncoded || !propName) return {
				...resolvedValue,
				imports: resolvedValue.imports,
				contentType,
				example: mediaType.example,
				examples: resolveExampleRefs(mediaType.examples, context)
			};
			const formData = isFormData ? getSchemaFormDataAndUrlEncoded({
				name: propName,
				schemaObject: mediaType.schema,
				context,
				isRequestBodyOptional: "required" in res && res.required === false
			}) : void 0;
			const formUrlEncoded = isFormUrlEncoded ? getSchemaFormDataAndUrlEncoded({
				name: propName,
				schemaObject: mediaType.schema,
				context,
				isUrlEncoded: true,
				isRequestBodyOptional: "required" in res && res.required === false
			}) : void 0;
			const additionalImports = getFormDataAdditionalImports({
				schemaObject: mediaType.schema,
				context
			});
			return {
				...resolvedValue,
				imports: [...resolvedValue.imports, ...additionalImports],
				formData,
				formUrlEncoded,
				contentType,
				example: mediaType.example,
				examples: resolveExampleRefs(mediaType.examples, context)
			};
		}).filter(Boolean).map((x) => ({
			...x,
			key
		}));
		return [{
			value: defaultType,
			imports: [],
			schemas: [],
			type: defaultType,
			isEnum: false,
			key,
			isRef: false,
			hasReadonlyProps: false,
			contentType: "application/json"
		}];
	});
	return (0, lodash_uniqby.default)(typesArray.flat(), uniqueKey);
};
const getFormDataAdditionalImports = ({ schemaObject, context }) => {
	const { schema } = resolveRef(schemaObject, context);
	if (schema.type !== "object") return [];
	const combinedSchemas = schema.oneOf || schema.anyOf;
	if (!combinedSchemas) return [];
	return combinedSchemas.map((schema$1) => resolveRef(schema$1, context).imports[0]).filter(Boolean);
};
const getSchemaFormDataAndUrlEncoded = ({ name, schemaObject, context, isRequestBodyOptional, isUrlEncoded, isRef }) => {
	const { schema, imports } = resolveRef(schemaObject, context);
	const propName = camel(!isRef && isReference(schemaObject) ? imports[0].name : name);
	const additionalImports = [];
	const variableName = isUrlEncoded ? "formUrlEncoded" : "formData";
	let form = isUrlEncoded ? `const ${variableName} = new URLSearchParams();\n` : `const ${variableName} = new FormData();\n`;
	const combinedSchemas = schema.oneOf || schema.anyOf || schema.allOf;
	if (schema.type === "object" || schema.type === void 0 && combinedSchemas) {
		if (combinedSchemas) {
			const shouldCast = !!schema.oneOf || !!schema.anyOf;
			const combinedSchemasFormData = combinedSchemas.map((schema$1) => {
				const { schema: combinedSchema, imports: imports$1 } = resolveRef(schema$1, context);
				let newPropName = propName;
				let newPropDefinition = "";
				if (shouldCast && imports$1[0]) {
					additionalImports.push(imports$1[0]);
					newPropName = `${propName}${pascal(imports$1[0].name)}`;
					newPropDefinition = `const ${newPropName} = (${propName} as ${imports$1[0].name}${isRequestBodyOptional ? " | undefined" : ""});\n`;
				}
				return newPropDefinition + resolveSchemaPropertiesToFormData({
					schema: combinedSchema,
					variableName,
					propName: newPropName,
					context,
					isRequestBodyOptional
				});
			}).filter(Boolean).join("\n");
			form += combinedSchemasFormData;
		}
		if (schema.properties) {
			const formDataValues = resolveSchemaPropertiesToFormData({
				schema,
				variableName,
				propName,
				context,
				isRequestBodyOptional
			});
			form += formDataValues;
		}
		return form;
	}
	if (schema.type === "array") {
		let valueStr = "value";
		if (schema.items) {
			const { schema: itemSchema } = resolveRef(schema.items, context);
			if (itemSchema.type === "object" || itemSchema.type === "array") valueStr = "JSON.stringify(value)";
			else if (itemSchema.type === "number" || itemSchema.type === "integer" || itemSchema.type === "boolean") valueStr = "value.toString()";
		}
		return `${form}${propName}.forEach(value => ${variableName}.append('data', ${valueStr}))\n`;
	}
	if (schema.type === "number" || schema.type === "integer" || schema.type === "boolean") return `${form}${variableName}.append('data', ${propName}.toString())\n`;
	return `${form}${variableName}.append('data', ${propName})\n`;
};
const resolveSchemaPropertiesToFormData = ({ schema, variableName, propName, context, isRequestBodyOptional, keyPrefix = "", depth = 0 }) => {
	return Object.entries(schema.properties ?? {}).reduce((acc, [key, value]) => {
		const { schema: property } = resolveRef(value, context);
		if (property.readOnly) return acc;
		let formDataValue = "";
		const formattedKeyPrefix = isRequestBodyOptional ? esutils.keyword.isIdentifierNameES5(key) ? "?" : "?." : "";
		const formattedKey = esutils.keyword.isIdentifierNameES5(key) ? `.${key}` : `['${key}']`;
		const valueKey = `${propName}${formattedKeyPrefix}${formattedKey}`;
		const nonOptionalValueKey = `${propName}${formattedKey}`;
		if (property.type === "object") formDataValue = context.output.override.formData.arrayHandling === FormDataArrayHandling.EXPLODE ? resolveSchemaPropertiesToFormData({
			schema: property,
			variableName,
			propName: nonOptionalValueKey,
			context,
			isRequestBodyOptional,
			keyPrefix: `${keyPrefix}${key}.`,
			depth: depth + 1
		}) : `${variableName}.append(\`${keyPrefix}${key}\`, JSON.stringify(${nonOptionalValueKey}));\n`;
		else if (property.type === "array") {
			let valueStr = "value";
			let hasNonPrimitiveChild = false;
			if (property.items) {
				const { schema: itemSchema } = resolveRef(property.items, context);
				if (itemSchema.type === "object" || itemSchema.type === "array") if (context.output.override.formData.arrayHandling === FormDataArrayHandling.EXPLODE) {
					hasNonPrimitiveChild = true;
					const resolvedValue = resolveSchemaPropertiesToFormData({
						schema: itemSchema,
						variableName,
						propName: "value",
						context,
						isRequestBodyOptional,
						keyPrefix: `${keyPrefix}${key}[\${index${depth > 0 ? depth : ""}}].`,
						depth: depth + 1
					});
					formDataValue = `${valueKey}.forEach((value, index${depth > 0 ? depth : ""}) => {
    ${resolvedValue}});\n`;
				} else valueStr = "JSON.stringify(value)";
				else if (itemSchema.type === "number" || itemSchema.type?.includes("number") || itemSchema.type === "integer" || itemSchema.type?.includes("integer") || itemSchema.type === "boolean" || itemSchema.type?.includes("boolean")) valueStr = "value.toString()";
			}
			if (context.output.override.formData.arrayHandling === FormDataArrayHandling.EXPLODE) {
				if (!hasNonPrimitiveChild) formDataValue = `${valueKey}.forEach((value, index${depth > 0 ? depth : ""}) => ${variableName}.append(\`${keyPrefix}${key}[\${index${depth > 0 ? depth : ""}}]\`, ${valueStr}));\n`;
			} else formDataValue = `${valueKey}.forEach(value => ${variableName}.append(\`${keyPrefix}${key}${context.output.override.formData.arrayHandling === FormDataArrayHandling.SERIALIZE_WITH_BRACKETS ? "[]" : ""}\`, ${valueStr}));\n`;
		} else if (property.type === "number" || property.type?.includes("number") || property.type === "integer" || property.type?.includes("integer") || property.type === "boolean" || property.type?.includes("boolean")) formDataValue = `${variableName}.append(\`${keyPrefix}${key}\`, ${nonOptionalValueKey}.toString())\n`;
		else formDataValue = `${variableName}.append(\`${keyPrefix}${key}\`, ${nonOptionalValueKey})\n`;
		let existSubSchemaNullable = false;
		if (property.allOf || property.anyOf || property.oneOf) {
			const subSchemas = (property.allOf || property.anyOf || property.oneOf)?.map((c) => resolveObject({
				schema: c,
				combined: true,
				context
			}));
			if (subSchemas?.some((subSchema) => {
				return [
					"number",
					"integer",
					"boolean"
				].includes(subSchema.type);
			})) formDataValue = `${variableName}.append(\`${key}\`, ${nonOptionalValueKey}.toString())\n`;
			if (subSchemas?.some((subSchema) => {
				return subSchema.type === "null";
			})) existSubSchemaNullable = true;
		}
		const isRequired = schema.required?.includes(key) && !isRequestBodyOptional;
		if (property.nullable || property.type?.includes("null") || existSubSchemaNullable) {
			if (isRequired) return acc + `if(${valueKey} !== null) {\n ${formDataValue} }\n`;
			return acc + `if(${valueKey} !== undefined && ${nonOptionalValueKey} !== null) {\n ${formDataValue} }\n`;
		}
		if (isRequired) return acc + formDataValue;
		return acc + `if(${valueKey} !== undefined) {\n ${formDataValue} }\n`;
	}, "");
};

//#endregion
//#region src/getters/body.ts
const getBody = ({ requestBody, operationName, context, contentType }) => {
	const allBodyTypes = getResReqTypes([[context.output.override.components.requestBodies.suffix, requestBody]], operationName, context);
	const filteredBodyTypes = contentType ? allBodyTypes.filter((type) => {
		let include = true;
		let exclude = false;
		if (contentType.include) include = contentType.include.includes(type.contentType);
		if (contentType.exclude) exclude = contentType.exclude.includes(type.contentType);
		return include && !exclude;
	}) : allBodyTypes;
	const imports = filteredBodyTypes.flatMap(({ imports: imports$1 }) => imports$1);
	const schemas = filteredBodyTypes.flatMap(({ schemas: schemas$1 }) => schemas$1);
	const definition = filteredBodyTypes.map(({ value }) => value).join(" | ");
	const nonReadonlyDefinition = filteredBodyTypes.some((x) => x.hasReadonlyProps) && definition ? `NonReadonly<${definition}>` : definition;
	let implementation = generalJSTypesWithArray.includes(definition.toLowerCase()) || filteredBodyTypes.length > 1 ? camel(operationName) + context.output.override.components.requestBodies.suffix : camel(definition);
	let isOptional = false;
	if (implementation) {
		implementation = sanitize(implementation, {
			underscore: "_",
			whitespace: "_",
			dash: true,
			es5keyword: true,
			es5IdentifierName: true
		});
		if (isReference(requestBody)) {
			const { schema: bodySchema } = resolveRef(requestBody, context);
			if (bodySchema.required !== void 0) isOptional = !bodySchema.required;
		} else if (requestBody.required !== void 0) isOptional = !requestBody.required;
	}
	return {
		originalSchema: requestBody,
		definition: nonReadonlyDefinition,
		implementation,
		imports,
		schemas,
		isOptional,
		...filteredBodyTypes.length === 1 ? {
			formData: filteredBodyTypes[0].formData,
			formUrlEncoded: filteredBodyTypes[0].formUrlEncoded,
			contentType: filteredBodyTypes[0].contentType
		} : {
			formData: "",
			formUrlEncoded: "",
			contentType: ""
		}
	};
};

//#endregion
//#region src/getters/imports.ts
const getAliasedImports = ({ name, resolvedValue, existingImports, context }) => context.output.schemas && resolvedValue.isRef ? resolvedValue.imports.map((imp) => {
	if (!needCreateImportAlias({
		name,
		imp,
		existingImports
	})) return imp;
	const specName = pascal(getSpecName(imp.specKey ?? "", context.specKey));
	const normalizedSpecName = /^\d/.test(specName) ? `__${specName}` : specName;
	return {
		...imp,
		alias: `${normalizedSpecName}__${imp.name}`
	};
}) : resolvedValue.imports;
const needCreateImportAlias = ({ existingImports, imp, name }) => !imp.alias && (imp.name === name || existingImports.some((existingImport) => imp.name === existingImport.name && imp.specKey !== existingImport.specKey));
const getImportAliasForRefOrValue = ({ context, imports, resolvedValue }) => {
	if (!context.output.schemas || !resolvedValue.isRef) return resolvedValue.value;
	return imports.find((imp) => imp.name === resolvedValue.value)?.alias ?? resolvedValue.value;
};

//#endregion
//#region src/getters/keys.ts
const getKey = (key) => {
	return esutils.keyword.isIdentifierNameES5(key) ? key : `'${key}'`;
};

//#endregion
//#region src/getters/object.ts
/**
* Return the output type from an object
*
* @param item item with type === "object"
*/
const getObject = ({ item, name, context, nullable }) => {
	if (isReference(item)) {
		const { name: name$1, specKey } = getRefInfo(item.$ref, context);
		return {
			value: name$1 + nullable,
			imports: [{
				name: name$1,
				specKey
			}],
			schemas: [],
			isEnum: false,
			type: "object",
			isRef: true,
			hasReadonlyProps: item.readOnly || false,
			example: item.example,
			examples: resolveExampleRefs(item.examples, context)
		};
	}
	if (item.allOf || item.oneOf || item.anyOf) {
		const separator$1 = item.allOf ? "allOf" : item.oneOf ? "oneOf" : "anyOf";
		return combineSchemas({
			schema: item,
			name,
			separator: separator$1,
			context,
			nullable
		});
	}
	if (Array.isArray(item.type)) return combineSchemas({
		schema: { anyOf: item.type.map((type) => ({
			...item,
			type
		})) },
		name,
		separator: "anyOf",
		context,
		nullable
	});
	if (item.properties && Object.entries(item.properties).length > 0) {
		const entries = Object.entries(item.properties);
		if (context.output.propertySortOrder === PropertySortOrder.ALPHABETICAL) entries.sort((a, b) => {
			return a[0].localeCompare(b[0]);
		});
		return entries.reduce((acc, [key, schema], index, arr) => {
			const isRequired = (Array.isArray(item.required) ? item.required : []).includes(key);
			let propName = "";
			if (name) {
				const isKeyStartWithUnderscore = key.startsWith("_");
				propName += pascal(`${isKeyStartWithUnderscore ? "_" : ""}${name}_${key}`);
			}
			const allSpecSchemas = context.specs[context.target]?.components?.schemas ?? {};
			if (Object.keys(allSpecSchemas).some((schemaName) => pascal(schemaName) === propName)) propName = propName + "Property";
			const resolvedValue = resolveObject({
				schema,
				propName,
				context
			});
			const isReadOnly = item.readOnly || schema.readOnly;
			if (!index) acc.value += "{";
			const doc = jsDoc(schema, true, context);
			acc.hasReadonlyProps ||= isReadOnly || false;
			const aliasedImports = getAliasedImports({
				name,
				context,
				resolvedValue,
				existingImports: acc.imports
			});
			acc.imports.push(...aliasedImports);
			const propValue = getImportAliasForRefOrValue({
				context,
				resolvedValue,
				imports: aliasedImports
			});
			acc.value += `\n  ${doc ? `${doc}  ` : ""}${isReadOnly && !context.output.override.suppressReadonlyModifier ? "readonly " : ""}${getKey(key)}${isRequired ? "" : "?"}: ${propValue};`;
			acc.schemas.push(...resolvedValue.schemas);
			if (arr.length - 1 === index) {
				if (item.additionalProperties) if (isBoolean(item.additionalProperties)) acc.value += `\n  [key: string]: unknown;\n }`;
				else {
					const resolvedValue$1 = resolveValue({
						schema: item.additionalProperties,
						name,
						context
					});
					acc.value += `\n  [key: string]: ${resolvedValue$1.value};\n}`;
				}
				else acc.value += "\n}";
				acc.value += nullable;
			}
			return acc;
		}, {
			imports: [],
			schemas: [],
			value: "",
			isEnum: false,
			type: "object",
			isRef: false,
			schema: {},
			hasReadonlyProps: false,
			example: item.example,
			examples: resolveExampleRefs(item.examples, context)
		});
	}
	if (item.additionalProperties) {
		if (isBoolean(item.additionalProperties)) return {
			value: `{ [key: string]: unknown }` + nullable,
			imports: [],
			schemas: [],
			isEnum: false,
			type: "object",
			isRef: false,
			hasReadonlyProps: item.readOnly || false
		};
		const resolvedValue = resolveValue({
			schema: item.additionalProperties,
			name,
			context
		});
		return {
			value: `{[key: string]: ${resolvedValue.value}}` + nullable,
			imports: resolvedValue.imports ?? [],
			schemas: resolvedValue.schemas ?? [],
			isEnum: false,
			type: "object",
			isRef: false,
			hasReadonlyProps: resolvedValue.hasReadonlyProps
		};
	}
	const itemWithConst = item;
	if (itemWithConst.const) return {
		value: `'${itemWithConst.const}'` + nullable,
		imports: [],
		schemas: [],
		isEnum: false,
		type: "string",
		isRef: false,
		hasReadonlyProps: item.readOnly || false
	};
	return {
		value: (item.type === "object" ? "{ [key: string]: unknown }" : "unknown") + nullable,
		imports: [],
		schemas: [],
		isEnum: false,
		type: "object",
		isRef: false,
		hasReadonlyProps: item.readOnly || false
	};
};

//#endregion
//#region src/getters/scalar.ts
/**
* Return the typescript equivalent of open-api data type
*
* @param item
* @ref https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md#data-types
*/
const getScalar = ({ item, name, context }) => {
	const nullable = item.nullable ? " | null" : "";
	const enumItems = item.enum?.filter((enumItem) => enumItem !== null);
	if (!item.type && item.items) item.type = "array";
	switch (item.type) {
		case "number":
		case "integer": {
			let value = context.output.override.useBigInt && (item.format === "int64" || item.format === "uint64") ? "bigint" : "number";
			let isEnum = false;
			if (enumItems) {
				value = enumItems.map((enumItem) => `${enumItem}`).join(" | ");
				isEnum = true;
			}
			const itemWithConst = item;
			if (itemWithConst.const !== void 0) value = itemWithConst.const;
			return {
				value: value + nullable,
				isEnum,
				type: "number",
				schemas: [],
				imports: [],
				isRef: false,
				hasReadonlyProps: item.readOnly || false,
				example: item.example,
				examples: resolveExampleRefs(item.examples, context)
			};
		}
		case "boolean": {
			let value = "boolean";
			const itemWithConst = item;
			if (itemWithConst.const !== void 0) value = itemWithConst.const;
			return {
				value: value + nullable,
				type: "boolean",
				isEnum: false,
				schemas: [],
				imports: [],
				isRef: false,
				hasReadonlyProps: item.readOnly || false,
				example: item.example,
				examples: resolveExampleRefs(item.examples, context)
			};
		}
		case "array": {
			const { value,...rest } = getArray({
				schema: item,
				name,
				context
			});
			return {
				value: value + nullable,
				...rest
			};
		}
		case "string": {
			let value = "string";
			let isEnum = false;
			if (enumItems) {
				value = enumItems.map((enumItem) => isString(enumItem) ? `'${escape(enumItem)}'` : `${enumItem}`).filter(Boolean).join(` | `);
				isEnum = true;
			}
			if (item.format === "binary") value = "Blob";
			if (context.output.override.useDates && (item.format === "date" || item.format === "date-time")) value = "Date";
			const itemWithConst = item;
			if (itemWithConst.const) value = `'${itemWithConst.const}'`;
			return {
				value: value + nullable,
				isEnum,
				type: "string",
				imports: [],
				schemas: [],
				isRef: false,
				hasReadonlyProps: item.readOnly || false,
				example: item.example,
				examples: resolveExampleRefs(item.examples, context)
			};
		}
		case "null": return {
			value: "null",
			isEnum: false,
			type: "null",
			imports: [],
			schemas: [],
			isRef: false,
			hasReadonlyProps: item.readOnly || false
		};
		case "object":
		default: {
			if (Array.isArray(item.type)) return combineSchemas({
				schema: { anyOf: item.type.map((type) => ({
					...item,
					type
				})) },
				name,
				separator: "anyOf",
				context,
				nullable
			});
			if (enumItems) return {
				value: enumItems.map((enumItem) => isString(enumItem) ? `'${escape(enumItem)}'` : `${enumItem}`).filter(Boolean).join(` | `) + nullable,
				isEnum: true,
				type: "string",
				imports: [],
				schemas: [],
				isRef: false,
				hasReadonlyProps: item.readOnly || false,
				example: item.example,
				examples: resolveExampleRefs(item.examples, context)
			};
			const { value,...rest } = getObject({
				item,
				name,
				context,
				nullable
			});
			return {
				value,
				...rest
			};
		}
	}
};

//#endregion
//#region src/getters/combine.ts
const combineValues = ({ resolvedData, resolvedValue, separator: separator$1, context }) => {
	if (resolvedData.isEnum.every(Boolean)) return `${resolvedData.values.join(` | `)}${resolvedValue ? ` | ${resolvedValue.value}` : ""}`;
	if (separator$1 === "allOf") {
		let resolvedDataValue = resolvedData.values.join(` & `);
		if (resolvedData.originalSchema.length > 0 && resolvedValue) {
			const discriminatedPropertySchemas = resolvedData.originalSchema.filter((s) => s?.discriminator && resolvedValue.value.includes(` ${s.discriminator.propertyName}:`));
			if (discriminatedPropertySchemas.length > 0) resolvedDataValue = `Omit<${resolvedDataValue}, '${discriminatedPropertySchemas.map((s) => s.discriminator?.propertyName).join("' | '")}'>`;
		}
		const joined = `${resolvedDataValue}${resolvedValue ? ` & ${resolvedValue.value}` : ""}`;
		const overrideRequiredProperties = resolvedData.requiredProperties.filter((prop) => !resolvedData.originalSchema.some((schema) => schema?.properties?.[prop] && schema.required?.includes(prop)));
		if (overrideRequiredProperties.length > 0) return `${joined} & Required<Pick<${joined}, '${overrideRequiredProperties.join("' | '")}'>>`;
		return joined;
	}
	let values = resolvedData.values;
	if (resolvedData.allProperties.length && context.output.unionAddMissingProperties) {
		values = [];
		for (let i = 0; i < resolvedData.values.length; i += 1) {
			const subSchema = resolvedData.originalSchema[i];
			if (subSchema?.type !== "object") {
				values.push(resolvedData.values[i]);
				continue;
			}
			const missingProperties = (0, lodash_uniq.default)(resolvedData.allProperties.filter((p) => !Object.keys(subSchema.properties).includes(p)));
			values.push(`${resolvedData.values[i]}${missingProperties.length > 0 ? ` & {${missingProperties.map((p) => `${p}?: never`).join("; ")}}` : ""}`);
		}
	}
	if (resolvedValue) return `(${values.join(` & ${resolvedValue.value}) | (`)} & ${resolvedValue.value})`;
	return values.join(" | ");
};
const combineSchemas = ({ name, schema, separator: separator$1, context, nullable }) => {
	const items = schema[separator$1] ?? [];
	const resolvedData = items.reduce((acc, subSchema) => {
		let propName = name ? name + pascal(separator$1) : void 0;
		if (propName && acc.schemas.length > 0) propName = propName + pascal(getNumberWord(acc.schemas.length + 1));
		if (separator$1 === "allOf" && isSchema(subSchema) && subSchema.required) acc.requiredProperties.push(...subSchema.required);
		const resolvedValue$1 = resolveObject({
			schema: subSchema,
			propName,
			combined: true,
			context
		});
		const aliasedImports = getAliasedImports({
			context,
			name,
			resolvedValue: resolvedValue$1,
			existingImports: acc.imports
		});
		const value = getImportAliasForRefOrValue({
			context,
			resolvedValue: resolvedValue$1,
			imports: aliasedImports
		});
		acc.values.push(value);
		acc.imports.push(...aliasedImports);
		acc.schemas.push(...resolvedValue$1.schemas);
		acc.isEnum.push(resolvedValue$1.isEnum);
		acc.types.push(resolvedValue$1.type);
		acc.isRef.push(resolvedValue$1.isRef);
		acc.originalSchema.push(resolvedValue$1.originalSchema);
		acc.hasReadonlyProps ||= resolvedValue$1.hasReadonlyProps;
		if (resolvedValue$1.type === "object" && resolvedValue$1.originalSchema.properties) acc.allProperties.push(...Object.keys(resolvedValue$1.originalSchema.properties));
		return acc;
	}, {
		values: [],
		imports: [],
		schemas: [],
		isEnum: [],
		isRef: [],
		types: [],
		originalSchema: [],
		allProperties: [],
		hasReadonlyProps: false,
		example: schema.example,
		examples: resolveExampleRefs(schema.examples, context),
		requiredProperties: separator$1 === "allOf" ? schema.required ?? [] : []
	});
	if (resolvedData.isEnum.every(Boolean) && name && items.length > 1) {
		const newEnum = `// eslint-disable-next-line @typescript-eslint/no-redeclare\nexport const ${pascal(name)} = ${getCombineEnumValue(resolvedData)}`;
		return {
			value: `typeof ${pascal(name)}[keyof typeof ${pascal(name)}] ${nullable}`,
			imports: [{ name: pascal(name) }],
			schemas: [...resolvedData.schemas, {
				imports: resolvedData.imports.map((toImport) => ({
					...toImport,
					values: true
				})),
				model: newEnum,
				name
			}],
			isEnum: false,
			type: "object",
			isRef: false,
			hasReadonlyProps: resolvedData.hasReadonlyProps,
			example: schema.example,
			examples: resolveExampleRefs(schema.examples, context)
		};
	}
	let resolvedValue;
	if (schema.properties) resolvedValue = getScalar({
		item: Object.fromEntries(Object.entries(schema).filter(([key]) => key !== separator$1)),
		name,
		context
	});
	return {
		value: combineValues({
			resolvedData,
			separator: separator$1,
			resolvedValue,
			context
		}) + nullable,
		imports: resolvedValue ? [...resolvedData.imports, ...resolvedValue.imports] : resolvedData.imports,
		schemas: resolvedValue ? [...resolvedData.schemas, ...resolvedValue.schemas] : resolvedData.schemas,
		isEnum: false,
		type: "object",
		isRef: false,
		hasReadonlyProps: resolvedData?.hasReadonlyProps || resolvedValue?.hasReadonlyProps || false,
		example: schema.example,
		examples: resolveExampleRefs(schema.examples, context)
	};
};
const getCombineEnumValue = ({ values, isRef, originalSchema }) => {
	if (values.length === 1) {
		if (isRef[0]) return values[0];
		return `{${getEnumImplementation(values[0])}} as const`;
	}
	return `{${values.map((e, i) => {
		if (isRef[i]) return `...${e},`;
		const names = getEnumNames(originalSchema[i]);
		const descriptions = getEnumDescriptions(originalSchema[i]);
		return getEnumImplementation(e, names, descriptions);
	}).join("")}} as const`;
};

//#endregion
//#region src/getters/discriminators.ts
const resolveDiscriminators = (schemas, context) => {
	const transformedSchemas = { ...schemas };
	for (const schema of Object.values(transformedSchemas)) if (schema.discriminator?.mapping) {
		const { mapping, propertyName } = schema.discriminator;
		for (const [mappingKey, mappingValue] of Object.entries(mapping)) {
			let subTypeSchema;
			try {
				const { originalName } = getRefInfo(mappingValue, context);
				const name = pascal(originalName);
				subTypeSchema = transformedSchemas[name] ?? transformedSchemas[originalName];
			} catch {
				subTypeSchema = transformedSchemas[mappingValue];
			}
			if (!subTypeSchema) continue;
			const property = subTypeSchema.properties?.[propertyName];
			subTypeSchema.properties = {
				...subTypeSchema.properties,
				[propertyName]: {
					type: "string",
					enum: [...property?.enum?.filter((value) => value !== mappingKey) ?? [], mappingKey]
				}
			};
			subTypeSchema.required = [...subTypeSchema.required ?? [], propertyName];
		}
	}
	return transformedSchemas;
};

//#endregion
//#region src/getters/operation.ts
const getOperationId = (operation, route, verb) => {
	if (operation.operationId) return operation.operationId;
	return pascal([verb, ...route.split("/").map((p) => sanitize(p, {
		dash: true,
		underscore: "-",
		dot: "-",
		whitespace: "-"
	}))].join("-"));
};

//#endregion
//#region src/getters/parameters.ts
const getParameters = ({ parameters = [], context }) => {
	return parameters.reduce((acc, p) => {
		if (isReference(p)) {
			const { schema: parameter, imports } = resolveRef(p, context);
			if (parameter.in === "path" || parameter.in === "query" || parameter.in === "header") acc[parameter.in].push({
				parameter,
				imports
			});
		} else if (p.in === "query" || p.in === "path" || p.in === "header") acc[p.in].push({
			parameter: p,
			imports: []
		});
		return acc;
	}, {
		path: [],
		query: [],
		header: []
	});
};

//#endregion
//#region src/getters/params.ts
/**
* Return every params in a path
*
* @example
* ```
* getParamsInPath("/pet/{category}/{name}/");
* // => ["category", "name"]
* ```
* @param path
*/
const getParamsInPath = (path$3) => {
	let n;
	const output = [];
	const templatePathRegex = /\{(.*?)\}/g;
	while ((n = templatePathRegex.exec(path$3)) !== null) output.push(n[1]);
	return output;
};
const getParams = ({ route, pathParams = [], operationId, context, output }) => {
	return getParamsInPath(route).map((p) => {
		const pathParam = pathParams.find(({ parameter }) => sanitize(camel(parameter.name), {
			es5keyword: true,
			underscore: true,
			dash: true
		}) === p);
		if (!pathParam) throw new Error(`The path params ${p} can't be found in parameters (${operationId})`);
		const { name: nameWithoutSanitize, required = false, schema } = pathParam.parameter;
		const name = sanitize(camel(nameWithoutSanitize), { es5keyword: true });
		if (!schema) return {
			name,
			definition: `${name}${required ? "" : "?"}: unknown`,
			implementation: `${name}${required ? "" : "?"}: unknown`,
			default: false,
			required,
			imports: []
		};
		const resolvedValue = resolveValue({
			schema,
			context: {
				...context,
				...pathParam.imports.length > 0 ? { specKey: pathParam.imports[0].specKey } : {}
			}
		});
		let paramType = resolvedValue.value;
		if (output.allParamsOptional) paramType = `${paramType} | undefined | null`;
		const definition = `${name}${!required || resolvedValue.originalSchema.default ? "?" : ""}: ${paramType}`;
		const implementation = `${name}${!required && !resolvedValue.originalSchema.default ? "?" : ""}${resolvedValue.originalSchema.default ? `: ${paramType} = ${stringify(resolvedValue.originalSchema.default)}` : `: ${paramType}`}`;
		return {
			name,
			definition,
			implementation,
			default: resolvedValue.originalSchema.default,
			required,
			imports: resolvedValue.imports,
			originalSchema: resolvedValue.originalSchema
		};
	});
};

//#endregion
//#region src/getters/props.ts
const getProps = ({ body, queryParams, params, operationName, headers, context }) => {
	const bodyProp = {
		name: body.implementation,
		definition: `${body.implementation}${body.isOptional ? "?" : ""}: ${body.definition}`,
		implementation: `${body.implementation}${body.isOptional ? "?" : ""}: ${body.definition}`,
		default: false,
		required: !body.isOptional,
		type: GetterPropType.BODY
	};
	const queryParamsProp = {
		name: "params",
		definition: getQueryParamDefinition(queryParams, context),
		implementation: getQueryParamDefinition(queryParams, context),
		default: false,
		required: isUndefined(queryParams?.isOptional) ? !context.output.allParamsOptional : !queryParams?.isOptional && !context.output.allParamsOptional,
		type: GetterPropType.QUERY_PARAM
	};
	const headersProp = {
		name: "headers",
		definition: `headers${headers?.isOptional ? "?" : ""}: ${headers?.schema.name}`,
		implementation: `headers${headers?.isOptional ? "?" : ""}: ${headers?.schema.name}`,
		default: false,
		required: isUndefined(headers?.isOptional) ? false : !headers?.isOptional,
		type: GetterPropType.HEADER
	};
	let paramGetterProps;
	if (context.output.override.useNamedParameters && params.length > 0) {
		const parameterTypeName = `${pascal(operationName)}PathParameters`;
		const name = "pathParams";
		const namedParametersTypeDefinition = `export type ${parameterTypeName} = {\n ${params.map((property) => property.definition).join(",\n    ")},\n }`;
		const isOptional = params.every((param) => param.default);
		const implementation = `{ ${params.map((property) => property.default ? `${property.name} = ${property.default}` : property.name).join(", ")} }: ${parameterTypeName}${isOptional ? " = {}" : ""}`;
		const destructured = `{ ${params.map((property) => property.name).join(", ")} }`;
		paramGetterProps = [{
			type: GetterPropType.NAMED_PATH_PARAMS,
			name,
			definition: `${name}: ${parameterTypeName}`,
			implementation,
			default: false,
			destructured,
			required: true,
			schema: {
				name: parameterTypeName,
				model: namedParametersTypeDefinition,
				imports: params.flatMap((property) => property.imports)
			}
		}];
	} else paramGetterProps = params.map((param) => ({
		...param,
		type: GetterPropType.PARAM
	}));
	const props = [
		...paramGetterProps,
		...body.definition ? [bodyProp] : [],
		...queryParams ? [queryParamsProp] : [],
		...headers ? [headersProp] : []
	];
	return sortByPriority(props);
};
function getQueryParamDefinition(queryParams, context) {
	let paramType = queryParams?.schema.name;
	if (OutputClient.ANGULAR === context.output.client) paramType = `DeepNonNullable<${paramType}>`;
	return `params${queryParams?.isOptional || context.output.allParamsOptional ? "?" : ""}: ${paramType}`;
}

//#endregion
//#region src/getters/query-params.ts
const getQueryParamsTypes = (queryParams, operationName, context) => {
	return queryParams.map(({ parameter, imports: parameterImports }) => {
		const { name, required, schema: schemaParam, content } = parameter;
		const queryName = sanitize(`${pascal(operationName)}${pascal(name)}`, {
			underscore: "_",
			whitespace: "_",
			dash: true,
			es5keyword: true,
			es5IdentifierName: true
		});
		const schema = schemaParam || content["application/json"].schema;
		const resolvedValue = resolveValue({
			schema,
			context,
			name: queryName
		});
		const key = getKey(name);
		const doc = jsDoc({
			description: parameter.description,
			...schema
		}, void 0, context);
		if (parameterImports.length > 0) return {
			definition: `${doc}${key}${!required || schema.default ? "?" : ""}: ${parameterImports[0].name};`,
			imports: parameterImports,
			schemas: [],
			originalSchema: resolvedValue.originalSchema
		};
		if (resolvedValue.isEnum && !resolvedValue.isRef) {
			const enumName = queryName;
			const enumValue = getEnum(resolvedValue.value, enumName, getEnumNames(resolvedValue.originalSchema), context.output.override.enumGenerationType, getEnumDescriptions(resolvedValue.originalSchema), context.output.override.namingConvention?.enum);
			return {
				definition: `${doc}${key}${!required || schema.default ? "?" : ""}: ${enumName};`,
				imports: [{ name: enumName }],
				schemas: [...resolvedValue.schemas, {
					name: enumName,
					model: enumValue,
					imports: resolvedValue.imports
				}],
				originalSchema: resolvedValue.originalSchema
			};
		}
		return {
			definition: `${doc}${key}${!required || schema.default ? "?" : ""}: ${resolvedValue.value};`,
			imports: resolvedValue.imports,
			schemas: resolvedValue.schemas,
			originalSchema: resolvedValue.originalSchema
		};
	});
};
const getQueryParams = ({ queryParams = [], operationName, context, suffix = "params" }) => {
	if (queryParams.length === 0) return;
	const types = getQueryParamsTypes(queryParams, operationName, context);
	const imports = types.flatMap(({ imports: imports$1 }) => imports$1);
	const schemas = types.flatMap(({ schemas: schemas$1 }) => schemas$1);
	const name = `${pascal(operationName)}${pascal(suffix)}`;
	const type = types.map(({ definition }) => definition).join("\n");
	const allOptional = queryParams.every(({ parameter }) => !parameter.required);
	return {
		schema: {
			name,
			model: `export type ${name} = {\n${type}\n};\n`,
			imports
		},
		deps: schemas,
		isOptional: allOptional
	};
};

//#endregion
//#region src/getters/response.ts
const getResponse = ({ responses, operationName, context, contentType }) => {
	if (!responses) return {
		imports: [],
		definition: {
			success: "",
			errors: ""
		},
		isBlob: false,
		types: {
			success: [],
			errors: []
		},
		schemas: [],
		contentTypes: []
	};
	const types = getResReqTypes(Object.entries(responses), operationName, context, "void", (type) => `${type.key}-${type.value}`);
	const filteredTypes = contentType ? types.filter((type) => {
		let include = true;
		let exclude = false;
		if (contentType.include) include = contentType.include.includes(type.contentType);
		if (contentType.exclude) exclude = contentType.exclude.includes(type.contentType);
		return include && !exclude;
	}) : types;
	const imports = filteredTypes.flatMap(({ imports: imports$1 }) => imports$1);
	const schemas = filteredTypes.flatMap(({ schemas: schemas$1 }) => schemas$1);
	const contentTypes = [...new Set(filteredTypes.map(({ contentType: contentType$1 }) => contentType$1))];
	const groupedByStatus = filteredTypes.reduce((acc, type) => {
		if (type.key.startsWith("2")) acc.success.push(type);
		else acc.errors.push(type);
		return acc;
	}, {
		success: [],
		errors: []
	});
	const success = groupedByStatus.success.map(({ value, formData }) => formData ? "Blob" : value).join(" | ");
	const errors = groupedByStatus.errors.map(({ value }) => value).join(" | ");
	const defaultType = filteredTypes.find(({ key }) => key === "default")?.value;
	return {
		imports,
		definition: {
			success: success || (defaultType ?? "unknown"),
			errors: errors || (defaultType ?? "unknown")
		},
		isBlob: success === "Blob",
		types: groupedByStatus,
		contentTypes,
		schemas,
		originalSchema: responses
	};
};

//#endregion
//#region src/getters/route.ts
const TEMPLATE_TAG_IN_PATH_REGEX = /\/([\w]+)(?:\$\{)/g;
const hasParam = (path$3) => /[^{]*{[\w*_-]*}.*/.test(path$3);
const getRoutePath = (path$3) => {
	const matches = /([^{]*){?([\w*_-]*)}?(.*)/.exec(path$3);
	if (!matches?.length) return path$3;
	const prev = matches[1];
	const param = sanitize(camel(matches[2]), {
		es5keyword: true,
		underscore: true,
		dash: true,
		dot: true
	});
	const next = hasParam(matches[3]) ? getRoutePath(matches[3]) : matches[3];
	return hasParam(path$3) ? `${prev}\${${param}}${next}` : `${prev}${param}${next}`;
};
const getRoute = (route) => {
	return route.split("/").reduce((acc, path$3, i) => {
		if (!path$3 && !i) return acc;
		if (!path$3.includes("{")) return `${acc}/${path$3}`;
		return `${acc}/${getRoutePath(path$3)}`;
	}, "");
};
const getFullRoute = (route, servers, baseUrl) => {
	const getBaseUrl = () => {
		if (!baseUrl) return "";
		if (typeof baseUrl === "string") return baseUrl;
		if (baseUrl.getBaseUrlFromSpecification) {
			if (!servers) throw new Error("Orval is configured to use baseUrl from the specifications 'servers' field, but there exist no servers in the specification.");
			const server = servers.at(Math.min(baseUrl.index ?? 0, servers.length - 1));
			if (!server) return "";
			if (!server.variables) return server.url;
			let url = server.url;
			const variables = baseUrl.variables;
			for (const variableKey of Object.keys(server.variables)) {
				const variable = server.variables[variableKey];
				if (variables?.[variableKey]) {
					if (variable.enum && !variable.enum.some((e) => e == variables[variableKey])) throw new Error(`Invalid variable value '${variables[variableKey]}' for variable '${variableKey}' when resolving ${server.url}. Valid values are: ${variable.enum.join(", ")}.`);
					url = url.replaceAll(`{${variableKey}}`, variables[variableKey]);
				} else url = url.replaceAll(`{${variableKey}}`, String(variable.default));
			}
			return url;
		}
		return baseUrl.baseUrl;
	};
	let fullRoute = route;
	const base = getBaseUrl();
	if (base) {
		if (base.endsWith("/") && route.startsWith("/")) fullRoute = route.slice(1);
		fullRoute = `${base}${fullRoute}`;
	}
	return fullRoute;
};
const getRouteAsArray = (route) => route.replaceAll(TEMPLATE_TAG_IN_PATH_REGEX, "/$1/${").split("/").filter((i) => i !== "").map((i) => i.includes("${") ? i.replace(TEMPLATE_TAG_REGEX, "$1") : `'${i}'`).join(",").replace(",,", "");

//#endregion
//#region src/generators/component-definition.ts
const generateComponentDefinition = (responses = {}, context, suffix) => {
	if ((0, lodash_isempty.default)(responses)) return [];
	return Object.entries(responses).reduce((acc, [name, response]) => {
		const allResponseTypes = getResReqTypes([[suffix, response]], name, context, "void");
		const imports = allResponseTypes.flatMap(({ imports: imports$1 }) => imports$1);
		const schemas = allResponseTypes.flatMap(({ schemas: schemas$1 }) => schemas$1);
		const type = allResponseTypes.map(({ value }) => value).join(" | ");
		const modelName = sanitize(`${pascal(name)}${suffix}`, {
			underscore: "_",
			whitespace: "_",
			dash: true,
			es5keyword: true,
			es5IdentifierName: true
		});
		const model = `${jsDoc(response)}export type ${modelName} = ${type || "unknown"};\n`;
		acc.push(...schemas);
		if (modelName !== type) acc.push({
			name: modelName,
			model,
			imports
		});
		return acc;
	}, []);
};

//#endregion
//#region src/generators/imports.ts
const generateImports = ({ imports = [], target, isRootKey: isRootKey$1, specsName, specKey: currentSpecKey, namingConvention = NamingConvention.CAMEL_CASE }) => {
	if (imports.length === 0) return "";
	return (0, lodash_uniqwith.default)(imports, (a, b) => a.name === b.name && a.default === b.default && a.specKey === b.specKey).sort().map(({ specKey, name, values, alias, isConstant }) => {
		const isSameSpecKey = currentSpecKey === specKey;
		const fileName = conventionName(name, namingConvention);
		if (specKey && !isSameSpecKey) {
			const path$3 = specKey === target ? "" : specsName[specKey];
			if (!isRootKey$1 && specKey) return `import ${!values && !isConstant ? "type " : ""}{ ${name}${alias ? ` as ${alias}` : ""} } from \'../${join(path$3, fileName)}\';`;
			return `import ${!values && !isConstant ? "type " : ""}{ ${name}${alias ? ` as ${alias}` : ""} } from \'./${join(path$3, fileName)}\';`;
		}
		return `import ${!values && !isConstant ? "type " : ""}{ ${name}${alias ? ` as ${alias}` : ""} } from \'./${fileName}\';`;
	}).join("\n");
};
const generateMutatorImports = ({ mutators, implementation, oneMore }) => {
	return (0, lodash_uniqwith.default)(mutators, (a, b) => a.name === b.name && a.default === b.default).reduce((acc, mutator) => {
		const path$3 = `${oneMore ? "../" : ""}${mutator.path}`;
		const importDefault = mutator.default ? mutator.name : `{ ${mutator.name} }`;
		acc += `import ${importDefault} from '${path$3}';`;
		acc += "\n";
		if (implementation && (mutator.hasErrorType || mutator.bodyTypeName)) {
			let errorImportName = "";
			const targetErrorImportName = mutator.default ? `ErrorType as ${mutator.errorTypeName}` : mutator.errorTypeName;
			if (mutator.hasErrorType && implementation.includes(mutator.errorTypeName) && !acc.includes(`{ ${targetErrorImportName} `)) errorImportName = targetErrorImportName;
			let bodyImportName = "";
			const targetBodyImportName = mutator.default ? `BodyType as ${mutator.bodyTypeName}` : mutator.bodyTypeName;
			if (mutator.bodyTypeName && implementation.includes(mutator.bodyTypeName) && !acc.includes(` ${targetBodyImportName} }`)) bodyImportName = targetBodyImportName;
			if (bodyImportName || errorImportName) {
				acc += `import type { ${errorImportName}${errorImportName && bodyImportName ? " , " : ""}${bodyImportName} } from '${path$3}';`;
				acc += "\n";
			}
		}
		return acc;
	}, "");
};
const generateDependency = ({ deps, isAllowSyntheticDefaultImports, dependency, specsName, key, onlyTypes }) => {
	const defaultDep = deps.find((e) => e.default && (isAllowSyntheticDefaultImports || !e.syntheticDefaultImport));
	const namespaceImportDep = defaultDep ? void 0 : deps.find((e) => !!e.namespaceImport || !isAllowSyntheticDefaultImports && e.syntheticDefaultImport);
	const depsString = (0, lodash_uniq.default)(deps.filter((e) => !e.default && !e.syntheticDefaultImport && !e.namespaceImport).map(({ name, alias }) => alias ? `${name} as ${alias}` : name)).toSorted().join(",\n  ");
	let importString = "";
	const namespaceImportString = namespaceImportDep ? `import * as ${namespaceImportDep.name} from '${dependency}';` : "";
	if (namespaceImportString) {
		if (deps.length === 1) return namespaceImportString;
		importString += `${namespaceImportString}\n`;
	}
	importString += `import ${onlyTypes ? "type " : ""}${defaultDep ? `${defaultDep.name}${depsString ? "," : ""}` : ""}${depsString ? `{\n  ${depsString}\n}` : ""} from '${dependency}${key !== "default" && specsName[key] ? `/${specsName[key]}` : ""}';`;
	return importString;
};
const addDependency = ({ implementation, exports: exports$1, dependency, specsName, hasSchemaDir, isAllowSyntheticDefaultImports }) => {
	const toAdds = exports$1.filter((e) => {
		const searchWords = [e.alias, e.name].filter((p) => p?.length).join("|");
		const pattern = new RegExp(`\\b(${searchWords})\\b`, "g");
		return implementation.match(pattern);
	});
	if (toAdds.length === 0) return;
	const groupedBySpecKey = toAdds.reduce((acc, dep) => {
		const key = hasSchemaDir && dep.specKey ? dep.specKey : "default";
		if (dep.values && (isAllowSyntheticDefaultImports || !dep.syntheticDefaultImport)) {
			acc[key] = {
				...acc[key],
				values: [...acc[key]?.values ?? [], dep]
			};
			return acc;
		}
		acc[key] = {
			...acc[key],
			types: [...acc[key]?.types ?? [], dep]
		};
		return acc;
	}, {});
	return Object.entries(groupedBySpecKey).map(([key, { values, types }]) => {
		let dep = "";
		if (values) dep += generateDependency({
			deps: values,
			isAllowSyntheticDefaultImports,
			dependency,
			specsName,
			key,
			onlyTypes: false
		});
		if (types) {
			let uniqueTypes = types;
			if (values) {
				uniqueTypes = types.filter((t) => !values.some((v) => v.name === t.name));
				dep += "\n";
			}
			dep += generateDependency({
				deps: uniqueTypes,
				isAllowSyntheticDefaultImports,
				dependency,
				specsName,
				key,
				onlyTypes: true
			});
		}
		return dep;
	}).join("\n") + "\n";
};
const getLibName = (code) => {
	const splitString = code.split(" from ");
	return splitString[splitString.length - 1].split(";")[0].trim();
};
const generateDependencyImports = (implementation, imports, specsName, hasSchemaDir, isAllowSyntheticDefaultImports) => {
	const dependencies = imports.map((dep) => addDependency({
		...dep,
		implementation,
		specsName,
		hasSchemaDir,
		isAllowSyntheticDefaultImports
	})).filter(Boolean).sort((a, b) => {
		const aLib = getLibName(a);
		const bLib = getLibName(b);
		if (aLib === bLib) return 0;
		if (aLib.startsWith("'.") && !bLib.startsWith("'.")) return 1;
		return aLib < bLib ? -1 : 1;
	}).join("\n");
	return dependencies ? dependencies + "\n" : "";
};
const generateVerbImports = ({ response, body, queryParams, props, headers, params }) => [
	...response.imports,
	...body.imports,
	...props.flatMap((prop) => prop.type === GetterPropType.NAMED_PATH_PARAMS ? [{ name: prop.schema.name }] : []),
	...queryParams ? [{ name: queryParams.schema.name }] : [],
	...headers ? [{ name: headers.schema.name }] : [],
	...params.flatMap(({ imports }) => imports)
];

//#endregion
//#region src/generators/models-inline.ts
const generateModelInline = (acc, model) => acc + `${model}\n`;
const generateModelsInline = (obj) => {
	return Object.values(obj).flat().reduce((acc, { model }) => generateModelInline(acc, model), "");
};

//#endregion
//#region src/generators/mutator.ts
const BODY_TYPE_NAME = "BodyType";
const getImport = (output, mutator) => {
	const outputFileInfo = getFileInfo(output);
	const mutatorFileInfo = getFileInfo(mutator.path);
	const { pathWithoutExtension } = getFileInfo(relativeSafe(outputFileInfo.dirname, mutatorFileInfo.path));
	return `${pathWithoutExtension}${mutator.extension || ""}`;
};
const generateMutator = async ({ output, mutator, name, workspace, tsconfig }) => {
	if (!mutator || !output) return;
	const isDefault = mutator.default;
	const importName = mutator.name ? mutator.name : `${name}Mutator`;
	const importPath = mutator.path;
	let rawFile = await fs_extra.default.readFile(importPath, "utf8");
	rawFile = removeComments(rawFile);
	const hasErrorType = rawFile.includes("export type ErrorType") || rawFile.includes("export interface ErrorType");
	const hasBodyType = rawFile.includes(`export type ${BODY_TYPE_NAME}`) || rawFile.includes(`export interface ${BODY_TYPE_NAME}`);
	const errorTypeName = mutator.default ? `${pascal(name)}ErrorType` : "ErrorType";
	const bodyTypeName = mutator.default ? `${pascal(name)}${BODY_TYPE_NAME}` : BODY_TYPE_NAME;
	const { file, cached } = await loadFile(importPath, {
		root: workspace,
		alias: mutator.alias,
		tsconfig
	});
	if (file) {
		const mutatorInfoName = isDefault ? "default" : mutator.name;
		const mutatorInfo = parseFile(file, mutatorInfoName, getEcmaVersion(tsconfig?.compilerOptions?.target));
		if (!mutatorInfo) throw new Error(chalk.default.red(`Your mutator file doesn't have the ${mutatorInfoName} exported function`));
		const path$3 = getImport(output, mutator);
		const isHook = mutator.name ? !!mutator.name.startsWith("use") && !mutatorInfo.numberOfParams : !mutatorInfo.numberOfParams;
		return {
			name: mutator.name || !isHook ? importName : `use${pascal(importName)}`,
			path: path$3,
			default: isDefault,
			hasErrorType,
			errorTypeName,
			hasSecondArg: isHook ? mutatorInfo.returnNumberOfParams > 1 : mutatorInfo.numberOfParams > 1,
			hasThirdArg: mutatorInfo.numberOfParams > 2,
			isHook,
			...hasBodyType ? { bodyTypeName } : {}
		};
	} else {
		const path$3 = getImport(output, mutator);
		if (!cached) createLogger().warn(chalk.default.yellow(`Failed to parse provided mutator function`));
		return {
			name: importName,
			path: path$3,
			default: isDefault,
			hasSecondArg: false,
			hasThirdArg: false,
			isHook: false,
			hasErrorType,
			errorTypeName,
			...hasBodyType ? { bodyTypeName } : {}
		};
	}
};
const getEcmaVersion = (target) => {
	if (!target) return;
	if (target.toLowerCase() === "esnext") return "latest";
	try {
		return Number(target.toLowerCase().replace("es", ""));
	} catch {
		return;
	}
};
const removeComments = (file) => {
	return file.replaceAll(/\/\/.*|\/\*[\s\S]*?\*\//g, "");
};
const parseFile = (file, name, ecmaVersion = 6) => {
	try {
		const ast = acorn.Parser.parse(file, { ecmaVersion });
		const node = ast?.body?.find((childNode) => {
			if (childNode.type === "ExpressionStatement") {
				if (childNode.expression.arguments?.[1]?.properties?.some((p) => p.key?.name === name)) return true;
				if (childNode.expression.left?.property?.name === name) return true;
				return childNode.expression.right?.properties?.some((p) => p.key.name === name);
			}
		});
		if (!node) return;
		if (node.expression.type === "AssignmentExpression") {
			if (node.expression.right.type === "FunctionExpression" || node.expression.right.type === "ArrowFunctionExpression") return { numberOfParams: node.expression.right.params.length };
			if (node.expression.right.name) return parseFunction(ast, node.expression.right.name);
			const property$1 = node.expression.right?.properties.find((p) => p.key.name === name);
			if (property$1.value.name) return parseFunction(ast, property$1.value.name);
			if (property$1.value.type === "FunctionExpression" || property$1.value.type === "ArrowFunctionExpression") return { numberOfParams: property$1.value.params.length };
			return;
		}
		const property = node.expression.arguments[1].properties.find((p) => p.key?.name === name);
		return parseFunction(ast, property.value.body.name);
	} catch {
		return;
	}
};
const parseFunction = (ast, name) => {
	const node = ast?.body?.find((childNode) => {
		if (childNode.type === "VariableDeclaration") return childNode.declarations.find((d) => d.id.name === name);
		if (childNode.type === "FunctionDeclaration" && childNode.id.name === name) return childNode;
	});
	if (!node) return;
	if (node.type === "FunctionDeclaration") {
		const returnStatement$1 = node.body?.body?.find((b) => b.type === "ReturnStatement");
		if (returnStatement$1?.argument?.params) return {
			numberOfParams: node.params.length,
			returnNumberOfParams: returnStatement$1.argument.params.length
		};
		else if (returnStatement$1?.argument?.type === "CallExpression" && returnStatement$1.argument.arguments?.[0]?.type === "ArrowFunctionExpression") {
			const arrowFn = returnStatement$1.argument.arguments[0];
			return {
				numberOfParams: node.params.length,
				returnNumberOfParams: arrowFn.params.length
			};
		}
		return { numberOfParams: node.params.length };
	}
	const declaration = node.declarations.find((d) => d.id.name === name);
	if (declaration.init.name) return parseFunction(ast, declaration.init.name);
	if (declaration.init.body.type === "ArrowFunctionExpression") return {
		numberOfParams: declaration.init.params.length,
		returnNumberOfParams: declaration.init.body.params.length
	};
	const returnStatement = declaration.init.body?.body?.find((b) => b.type === "ReturnStatement");
	if (returnStatement?.argument?.params) return {
		numberOfParams: declaration.init.params.length,
		returnNumberOfParams: returnStatement.argument.params.length
	};
	else if (returnStatement?.argument?.type === "CallExpression" && returnStatement.argument.arguments?.[0]?.type === "ArrowFunctionExpression") {
		const arrowFn = returnStatement.argument.arguments[0];
		return {
			numberOfParams: declaration.init.params.length,
			returnNumberOfParams: arrowFn.params.length
		};
	}
	return { numberOfParams: declaration.init.params.length };
};

//#endregion
//#region src/generators/options.ts
const generateBodyOptions = (body, isFormData, isFormUrlEncoded) => {
	if (isFormData && body.formData) return "\n      formData,";
	if (isFormUrlEncoded && body.formUrlEncoded) return "\n      formUrlEncoded,";
	if (body.implementation) return `\n      ${body.implementation},`;
	return "";
};
const generateAxiosOptions = ({ response, isExactOptionalPropertyTypes, queryParams, headers, requestOptions, hasSignal, isVue, isAngular, paramsSerializer, paramsSerializerOptions }) => {
	const isRequestOptions = requestOptions !== false;
	if (!queryParams && !headers && !response.isBlob && response.definition.success !== "string") {
		if (isRequestOptions) return "options";
		if (hasSignal) return isExactOptionalPropertyTypes ? "...(signal ? { signal } : {})" : "signal";
		return "";
	}
	let value = "";
	if (!isRequestOptions) {
		if (queryParams) value += "\n        params,";
		if (headers) value += "\n        headers,";
		if (hasSignal) value += isExactOptionalPropertyTypes ? "\n        ...(signal ? { signal } : {})," : "\n        signal,";
	}
	if (!isObject(requestOptions) || !requestOptions.hasOwnProperty("responseType")) {
		if (response.isBlob) value += `\n        responseType: 'blob',`;
		else if (response.contentTypes.at(0) === "text/plain") value += `\n        responseType: 'text',`;
	}
	if (isObject(requestOptions)) value += `\n ${stringify(requestOptions)?.slice(1, -1)}`;
	if (isRequestOptions) {
		value += "\n    ...options,";
		if (queryParams) if (isVue) value += "\n        params: {...unref(params), ...options?.params},";
		else if (isAngular && paramsSerializer) value += `\n        params: ${paramsSerializer.name}({...params, ...options?.params}),`;
		else value += "\n        params: {...params, ...options?.params},";
		if (headers) value += "\n        headers: {...headers, ...options?.headers},";
	}
	if (!isAngular && queryParams && (paramsSerializer || paramsSerializerOptions?.qs)) value += paramsSerializer ? `\n        paramsSerializer: ${paramsSerializer.name},` : `\n        paramsSerializer: (params) => qs.stringify(params, ${JSON.stringify(paramsSerializerOptions.qs)}),`;
	return value;
};
const generateOptions = ({ route, body, headers, queryParams, response, verb, requestOptions, isFormData, isFormUrlEncoded, isAngular, isExactOptionalPropertyTypes, hasSignal, isVue, paramsSerializer, paramsSerializerOptions }) => {
	const bodyOptions = getIsBodyVerb(verb) ? generateBodyOptions(body, isFormData, isFormUrlEncoded) : "";
	const axiosOptions = generateAxiosOptions({
		response,
		queryParams: queryParams?.schema,
		headers: headers?.schema,
		requestOptions,
		isExactOptionalPropertyTypes,
		hasSignal,
		isVue: isVue ?? false,
		isAngular: isAngular ?? false,
		paramsSerializer,
		paramsSerializerOptions
	});
	const options = axiosOptions ? `{${axiosOptions}}` : "";
	if (verb === Verbs.DELETE) {
		if (!bodyOptions) return `\n      \`${route}\`,${axiosOptions === "options" ? axiosOptions : options}\n    `;
		return `\n      \`${route}\`,{${isAngular ? "body" : "data"}:${bodyOptions} ${axiosOptions === "options" ? `...${axiosOptions}` : axiosOptions}}\n    `;
	}
	return `\n      \`${route}\`,${getIsBodyVerb(verb) ? bodyOptions || "undefined," : ""}${axiosOptions === "options" ? axiosOptions : options}\n    `;
};
const generateBodyMutatorConfig = (body, isFormData, isFormUrlEncoded) => {
	if (isFormData && body.formData) return ",\n       data: formData";
	if (isFormUrlEncoded && body.formUrlEncoded) return ",\n       data: formUrlEncoded";
	if (body.implementation) return `,\n      data: ${body.implementation}`;
	return "";
};
const generateQueryParamsAxiosConfig = (response, isVue, queryParams) => {
	if (!queryParams && !response.isBlob) return "";
	let value = "";
	if (queryParams) value += isVue ? ",\n        params: unref(params)" : ",\n        params";
	if (response.isBlob) value += `,\n        responseType: 'blob'`;
	return value;
};
const generateMutatorConfig = ({ route, body, headers, queryParams, response, verb, isFormData, isFormUrlEncoded, hasSignal, isExactOptionalPropertyTypes, isVue }) => {
	const bodyOptions = getIsBodyVerb(verb) ? generateBodyMutatorConfig(body, isFormData, isFormUrlEncoded) : "";
	const queryParamsOptions = generateQueryParamsAxiosConfig(response, isVue ?? false, queryParams);
	const headerOptions = body.contentType ? `,\n      headers: {'Content-Type': '${body.contentType}', ${headers ? "...headers" : ""}}` : headers ? ",\n      headers" : "";
	return `{url: \`${route}\`, method: '${verb.toUpperCase()}'${headerOptions}${bodyOptions}${queryParamsOptions}${hasSignal ? `, ${isExactOptionalPropertyTypes ? "...(signal ? { signal }: {})" : "signal"}` : ""}\n    }`;
};
const generateMutatorRequestOptions = (requestOptions, hasSecondArgument) => {
	if (!hasSecondArgument) return isObject(requestOptions) ? `{${stringify(requestOptions)?.slice(1, -1)}}` : "";
	if (isObject(requestOptions)) return `{${stringify(requestOptions)?.slice(1, -1)} ...options}`;
	return "options";
};
const generateFormDataAndUrlEncodedFunction = ({ body, formData, formUrlEncoded, isFormData, isFormUrlEncoded }) => {
	if (isFormData && body.formData) {
		if (formData) return `const formData = ${formData.name}(${body.implementation})`;
		return body.formData;
	}
	if (isFormUrlEncoded && body.formUrlEncoded) {
		if (formUrlEncoded) return `const formUrlEncoded = ${formUrlEncoded.name}(${body.implementation})`;
		return body.formUrlEncoded;
	}
	return "";
};

//#endregion
//#region src/generators/parameter-definition.ts
const generateParameterDefinition = (parameters = {}, context, suffix) => {
	return Object.entries(parameters).reduce((acc, [parameterName, parameter]) => {
		const modelName = sanitize(`${pascal(parameterName)}${suffix}`, {
			underscore: "_",
			whitespace: "_",
			dash: true,
			es5keyword: true,
			es5IdentifierName: true
		});
		const { schema, imports } = resolveRef(parameter, context);
		if (schema.in !== "query" && schema.in !== "header") return acc;
		if (!schema.schema || imports.length > 0) {
			acc.push({
				name: modelName,
				imports: imports.length > 0 ? [{
					name: imports[0].name,
					specKey: imports[0].specKey,
					schemaName: imports[0].schemaName
				}] : [],
				model: `export type ${modelName} = ${imports.length > 0 ? imports[0].name : "unknown"};\n`
			});
			return acc;
		}
		const resolvedObject = resolveObject({
			schema: schema.schema,
			propName: modelName,
			context
		});
		const model = `${jsDoc(parameter)}export type ${modelName} = ${resolvedObject.value || "unknown"};\n`;
		acc.push(...resolvedObject.schemas);
		if (modelName !== resolvedObject.value) acc.push({
			name: modelName,
			model,
			imports: resolvedObject.imports
		});
		return acc;
	}, []);
};

//#endregion
//#region src/generators/interface.ts
/**
* Generate the interface string
* An eslint comment is insert if the resulted object is empty
*
* @param name interface name
* @param schema
*/
const generateInterface = ({ name, schema, context, suffix }) => {
	const scalar = getScalar({
		item: schema,
		name,
		context
	});
	const isEmptyObject = scalar.value === "{}";
	let model = "";
	model += jsDoc(schema);
	if (isEmptyObject) model += "// eslint-disable-next-line @typescript-eslint/no-empty-interface\n";
	if (scalar.type === "object" && !context?.output.override?.useTypeOverInterfaces) if (scalar.type === "object" && schema.properties && Object.values(schema.properties).length > 0 && Object.values(schema.properties).every((item) => "const" in item)) {
		const mappedScalarValue = scalar.value.replaceAll(";", ",").replaceAll("?:", ":");
		model += `export const ${name}Value = ${mappedScalarValue} as const;\nexport type ${name} = typeof ${name}Value;\n`;
	} else {
		const blankInterfaceValue = scalar.value === "unknown" ? "{}" : scalar.value;
		model += `export interface ${name} ${blankInterfaceValue}\n`;
	}
	else model += `export type ${name} = ${scalar.value};\n`;
	const externalModulesImportsOnly = scalar.imports.filter((importName) => importName.alias ? importName.alias !== name : importName.name !== name);
	return [...scalar.schemas, {
		name,
		model,
		imports: externalModulesImportsOnly
	}];
};

//#endregion
//#region src/generators/schema-definition.ts
/**
* Extract all types from #/components/schemas
*
* @param schemas
*/
const generateSchemasDefinition = (schemas = {}, context, suffix, filters) => {
	if ((0, lodash_isempty.default)(schemas)) return [];
	const transformedSchemas = resolveDiscriminators(schemas, context);
	let generateSchemas = Object.entries(transformedSchemas);
	if (filters?.schemas) {
		const schemasFilters = filters.schemas;
		const mode = filters.mode || "include";
		generateSchemas = generateSchemas.filter(([schemaName]) => {
			const isMatch = schemasFilters.some((filter$1) => isString(filter$1) ? filter$1 === schemaName : filter$1.test(schemaName));
			return mode === "include" ? isMatch : !isMatch;
		});
	}
	return generateSchemas.reduce((acc, [name, schema]) => {
		const schemaName = sanitize(`${pascal(name)}${suffix}`, {
			underscore: "_",
			whitespace: "_",
			dash: true,
			es5keyword: true,
			es5IdentifierName: true
		});
		if (shouldCreateInterface(schema)) {
			acc.push(...generateInterface({
				name: schemaName,
				schema,
				context,
				suffix
			}));
			return acc;
		} else {
			const resolvedValue = resolveValue({
				schema,
				name: schemaName,
				context
			});
			let output = "";
			let imports = resolvedValue.imports;
			output += jsDoc(schema);
			if (resolvedValue.isEnum && !resolvedValue.isRef) output += getEnum(resolvedValue.value, schemaName, getEnumNames(resolvedValue.originalSchema), context.output.override.enumGenerationType, getEnumDescriptions(resolvedValue.originalSchema), context.output.override.namingConvention?.enum);
			else if (schemaName === resolvedValue.value && resolvedValue.isRef) {
				const { schema: referredSchema } = resolveRef(schema, context);
				if (!shouldCreateInterface(referredSchema)) {
					const imp = resolvedValue.imports.find((imp$1) => imp$1.name === schemaName);
					if (imp) {
						const alias = imp?.specKey ? `${pascal(getSpecName(imp.specKey, context.specKey))}${resolvedValue.value}` : `${resolvedValue.value}Bis`;
						output += `export type ${schemaName} = ${alias};\n`;
						imports = imports.map((imp$1) => imp$1.name === schemaName ? {
							...imp$1,
							alias
						} : imp$1);
					} else output += `export type ${schemaName} = ${resolvedValue.value};\n`;
				}
			} else {
				resolvedValue.schemas = resolvedValue.schemas.filter((schema$1) => {
					if (schema$1.name !== schemaName) return true;
					output += `${schema$1.model}\n`;
					imports = imports.concat(schema$1.imports);
					return false;
				});
				output += `export type ${schemaName} = ${resolvedValue.value};\n`;
			}
			acc.push(...resolvedValue.schemas, {
				name: schemaName,
				model: output,
				imports
			});
			return acc;
		}
	}, []);
};
function shouldCreateInterface(schema) {
	return (!schema.type || schema.type === "object") && !schema.allOf && !schema.oneOf && !schema.anyOf && !isReference(schema) && !schema.nullable && !schema.enum;
}

//#endregion
//#region src/generators/verbs-options.ts
const generateVerbOptions = async ({ verb, output, operation, route, pathRoute, verbParameters = [], context }) => {
	const { responses, requestBody, parameters: operationParameters, tags = [], deprecated, description, summary } = operation;
	const operationId = getOperationId(operation, route, verb);
	const overrideOperation = output.override.operations[operation.operationId];
	const overrideTag = Object.entries(output.override.tags).reduce((acc, [tag, options]) => tags.includes(tag) ? mergeDeep(acc, options) : acc, {});
	const override = mergeDeep(mergeDeep(output.override, overrideTag), overrideOperation);
	const overrideOperationName = overrideOperation?.operationName || output.override?.operationName;
	const operationName = overrideOperationName ? overrideOperationName(operation, route, verb) : sanitize(camel(operationId), { es5keyword: true });
	const response = getResponse({
		responses,
		operationName,
		context,
		contentType: override.contentType
	});
	const body = getBody({
		requestBody,
		operationName,
		context,
		contentType: override.contentType
	});
	const parameters = getParameters({
		parameters: [...verbParameters, ...operationParameters ?? []],
		context
	});
	const queryParams = getQueryParams({
		queryParams: parameters.query,
		operationName,
		context
	});
	const headers = output.headers ? await getQueryParams({
		queryParams: parameters.header,
		operationName,
		context,
		suffix: "headers"
	}) : void 0;
	const params = getParams({
		route,
		pathParams: parameters.path,
		operationId,
		context,
		output
	});
	const props = getProps({
		body,
		queryParams,
		params,
		headers,
		operationName,
		context
	});
	const mutator = await generateMutator({
		output: output.target,
		name: operationName,
		mutator: override?.mutator,
		workspace: context.workspace,
		tsconfig: context.output.tsconfig
	});
	const formData = !override.formData.disabled && body.formData ? await generateMutator({
		output: output.target,
		name: operationName,
		mutator: override.formData.mutator,
		workspace: context.workspace,
		tsconfig: context.output.tsconfig
	}) : void 0;
	const formUrlEncoded = isString(override?.formUrlEncoded) || isObject(override?.formUrlEncoded) ? await generateMutator({
		output: output.target,
		name: operationName,
		mutator: override.formUrlEncoded,
		workspace: context.workspace,
		tsconfig: context.output.tsconfig
	}) : void 0;
	const paramsSerializer = isString(override?.paramsSerializer) || isObject(override?.paramsSerializer) ? await generateMutator({
		output: output.target,
		name: "paramsSerializer",
		mutator: override.paramsSerializer,
		workspace: context.workspace,
		tsconfig: context.output.tsconfig
	}) : void 0;
	const fetchReviver = isString(override?.fetch.jsonReviver) || isObject(override?.fetch.jsonReviver) ? await generateMutator({
		output: output.target,
		name: "fetchReviver",
		mutator: override.fetch.jsonReviver,
		workspace: context.workspace,
		tsconfig: context.output.tsconfig
	}) : void 0;
	const doc = jsDoc({
		description,
		deprecated,
		summary
	});
	const verbOption = {
		verb,
		tags,
		route,
		pathRoute,
		summary: operation.summary,
		operationId,
		operationName,
		response,
		body,
		headers,
		queryParams,
		params,
		props,
		mutator,
		formData,
		formUrlEncoded,
		paramsSerializer,
		fetchReviver,
		override,
		doc,
		deprecated,
		originalOperation: operation
	};
	const transformer = await dynamicImport(override?.transformer, context.workspace);
	return transformer ? transformer(verbOption) : verbOption;
};
const generateVerbsOptions = ({ verbs, input, output, route, pathRoute, context }) => asyncReduce(_filteredVerbs(verbs, input.filters), async (acc, [verb, operation]) => {
	if (isVerb(verb)) {
		const verbOptions = await generateVerbOptions({
			verb,
			output,
			verbParameters: verbs.parameters,
			route,
			pathRoute,
			operation,
			context
		});
		acc.push(verbOptions);
	}
	return acc;
}, []);
const _filteredVerbs = (verbs, filters) => {
	if (filters?.tags === void 0) return Object.entries(verbs);
	const filterTags = filters.tags || [];
	const filterMode = filters.mode || "include";
	return Object.entries(verbs).filter(([_verb, operation]) => {
		const isMatch = (operation.tags || []).some((tag) => filterTags.some((filterTag) => filterTag instanceof RegExp ? filterTag.test(tag) : filterTag === tag));
		return filterMode === "exclude" ? !isMatch : isMatch;
	});
};

//#endregion
//#region src/writers/schemas.ts
const getSchema = ({ schema: { imports, model }, target, isRootKey: isRootKey$1, specsName, header, specKey, namingConvention = NamingConvention.CAMEL_CASE }) => {
	let file = header;
	file += generateImports({
		imports: imports.filter((imp) => !model.includes(`type ${imp.alias || imp.name} =`) && !model.includes(`interface ${imp.alias || imp.name} {`)),
		target,
		isRootKey: isRootKey$1,
		specsName,
		specKey,
		namingConvention
	});
	file += imports.length > 0 ? "\n\n" : "\n";
	file += model;
	return file;
};
const getPath = (path$3, name, fileExtension) => join(path$3, `/${name}${fileExtension}`);
const writeModelInline = (acc, model) => acc + `${model}\n`;
const writeModelsInline = (array) => array.reduce((acc, { model }) => writeModelInline(acc, model), "");
const writeSchema = async ({ path: path$3, schema, target, namingConvention, fileExtension, specKey, isRootKey: isRootKey$1, specsName, header }) => {
	const name = conventionName(schema.name, namingConvention);
	try {
		await fs_extra.default.outputFile(getPath(path$3, name, fileExtension), getSchema({
			schema,
			target,
			isRootKey: isRootKey$1,
			specsName,
			header,
			specKey,
			namingConvention
		}));
	} catch (error) {
		throw new Error(`Oups... 🍻. An Error occurred while writing schema ${name} => ${error}`);
	}
};
const writeSchemas = async ({ schemaPath, schemas, target, namingConvention, fileExtension, specKey, isRootKey: isRootKey$1, specsName, header, indexFiles }) => {
	await Promise.all(schemas.map((schema) => writeSchema({
		path: schemaPath,
		schema,
		target,
		namingConvention,
		fileExtension,
		specKey,
		isRootKey: isRootKey$1,
		specsName,
		header
	})));
	if (indexFiles) {
		const schemaFilePath = join(schemaPath, `/index${fileExtension}`);
		await fs_extra.default.ensureFile(schemaFilePath);
		const schemaNamesSet = /* @__PURE__ */ new Set();
		const duplicateNamesMap = /* @__PURE__ */ new Map();
		for (const schema of schemas) if (schemaNamesSet.has(schema.name)) duplicateNamesMap.set(schema.name, (duplicateNamesMap.get(schema.name) || 1) + 1);
		else schemaNamesSet.add(schema.name);
		if (duplicateNamesMap.size > 0) throw new Error("Duplicate schema names detected:\n" + [...duplicateNamesMap].map((duplicate) => `  ${duplicate[1]}x ${duplicate[0]}`).join("\n"));
		try {
			const stringData = (await fs_extra.default.readFile(schemaFilePath)).toString();
			const ext = fileExtension.endsWith(".ts") ? fileExtension.slice(0, -3) : fileExtension;
			const importStatements = schemas.filter((schema) => {
				const name = conventionName(schema.name, namingConvention);
				return !stringData.includes(`export * from './${name}${ext}'`) && !stringData.includes(`export * from "./${name}${ext}"`);
			}).map((schema) => `export * from './${conventionName(schema.name, namingConvention)}${ext}';`);
			const exports$1 = [...stringData.match(/export \* from(.*)('|")/g)?.map((s) => s + ";") ?? [], ...importStatements].sort().join("\n");
			const fileContent = `${header}\n${exports$1}`;
			await fs_extra.default.writeFile(schemaFilePath, fileContent);
		} catch (error) {
			throw new Error(`Oups... 🍻. An Error occurred while writing schema index file ${schemaFilePath} => ${error}`);
		}
	}
};

//#endregion
//#region src/writers/generate-imports-for-builder.ts
const generateImportsForBuilder = (output, imports, relativeSchemasPath) => {
	return output.schemas && !output.indexFiles ? (0, lodash_uniqby.default)(imports, "name").map((i) => {
		const name = conventionName(i.name, output.namingConvention);
		return {
			exports: [i],
			dependency: joinSafe(relativeSchemasPath, name)
		};
	}) : [{
		exports: imports,
		dependency: relativeSchemasPath
	}];
};

//#endregion
//#region src/writers/target.ts
const generateTarget = (builder, options) => {
	const operationNames = Object.values(builder.operations).map(({ operationName }) => operationName);
	const isAngularClient = options?.client === OutputClient.ANGULAR;
	const titles = builder.title({
		outputClient: options.client,
		title: pascal(builder.info.title),
		customTitleFunc: options.override.title,
		output: options
	});
	const target = Object.values(builder.operations).reduce((acc, operation, index, arr) => {
		acc.imports.push(...operation.imports);
		acc.importsMock.push(...operation.importsMock);
		acc.implementation += operation.implementation + "\n";
		acc.implementationMock.function += operation.implementationMock.function;
		acc.implementationMock.handler += operation.implementationMock.handler;
		const handlerNameSeparator = acc.implementationMock.handlerName.length > 0 ? ",\n  " : "  ";
		acc.implementationMock.handlerName += handlerNameSeparator + operation.implementationMock.handlerName + "()";
		if (operation.mutator) acc.mutators.push(operation.mutator);
		if (operation.formData) acc.formData.push(operation.formData);
		if (operation.formUrlEncoded) acc.formUrlEncoded.push(operation.formUrlEncoded);
		if (operation.paramsSerializer) acc.paramsSerializer.push(operation.paramsSerializer);
		if (operation.clientMutators) acc.clientMutators.push(...operation.clientMutators);
		if (operation.fetchReviver) acc.fetchReviver.push(operation.fetchReviver);
		if (index === arr.length - 1) {
			const isMutator = acc.mutators.some((mutator) => isAngularClient ? mutator.hasThirdArg : mutator.hasSecondArg);
			const typescriptVersion = options.packageJson?.dependencies?.typescript ?? options.packageJson?.devDependencies?.typescript ?? "4.4.0";
			const hasAwaitedType = compareVersions(typescriptVersion, "4.5.0");
			const header = builder.header({
				outputClient: options.client,
				isRequestOptions: options.override.requestOptions !== false,
				isMutator,
				isGlobalMutator: !!options.override.mutator,
				provideIn: options.override.angular.provideIn,
				hasAwaitedType,
				titles,
				output: options,
				verbOptions: builder.verbOptions,
				clientImplementation: acc.implementation
			});
			acc.implementation = header.implementation + acc.implementation;
			acc.implementationMock.handler = acc.implementationMock.handler + header.implementationMock + acc.implementationMock.handlerName;
			const footer = builder.footer({
				outputClient: options?.client,
				operationNames,
				hasMutator: acc.mutators.length > 0,
				hasAwaitedType,
				titles,
				output: options
			});
			acc.implementation += footer.implementation;
			acc.implementationMock.handler += footer.implementationMock;
		}
		return acc;
	}, {
		imports: [],
		implementation: "",
		implementationMock: {
			function: "",
			handler: "",
			handlerName: ""
		},
		importsMock: [],
		mutators: [],
		clientMutators: [],
		formData: [],
		formUrlEncoded: [],
		paramsSerializer: [],
		fetchReviver: []
	});
	return {
		...target,
		implementationMock: target.implementationMock.function + target.implementationMock.handler
	};
};

//#endregion
//#region src/writers/types.ts
const getOrvalGeneratedTypes = () => `
// https://stackoverflow.com/questions/49579094/typescript-conditional-types-filter-out-readonly-properties-pick-only-requir/49579497#49579497
type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <
T,
>() => T extends Y ? 1 : 2
? A
: B;

type WritableKeys<T> = {
[P in keyof T]-?: IfEquals<
  { [Q in P]: T[P] },
  { -readonly [Q in P]: T[P] },
  P
>;
}[keyof T];

type UnionToIntersection<U> =
  (U extends any ? (k: U)=>void : never) extends ((k: infer I)=>void) ? I : never;
type DistributeReadOnlyOverUnions<T> = T extends any ? NonReadonly<T> : never;

type Writable<T> = Pick<T, WritableKeys<T>>;
type NonReadonly<T> = [T] extends [UnionToIntersection<T>] ? {
  [P in keyof Writable<T>]: T[P] extends object
    ? NonReadonly<NonNullable<T[P]>>
    : T[P];
} : DistributeReadOnlyOverUnions<T>;
`;
const getTypedResponse = () => `
interface TypedResponse<T> extends Response {
  json(): Promise<T>;
}
`;

//#endregion
//#region src/writers/single-mode.ts
const writeSingleMode = async ({ builder, output, specsName, header, needSchema }) => {
	try {
		const { path: path$3, dirname: dirname$1 } = getFileInfo(output.target, {
			backupFilename: conventionName(builder.info.title, output.namingConvention),
			extension: output.fileExtension
		});
		const { imports, importsMock, implementation, implementationMock, mutators, clientMutators, formData, formUrlEncoded, paramsSerializer, fetchReviver } = generateTarget(builder, output);
		let data = header;
		const schemasPath = output.schemas ? relativeSafe(dirname$1, getFileInfo(output.schemas, { extension: output.fileExtension }).dirname) : void 0;
		const isAllowSyntheticDefaultImports = isSyntheticDefaultImportsAllow(output.tsconfig);
		const importsForBuilder = schemasPath ? generateImportsForBuilder(output, imports.filter((imp) => !importsMock.some((impMock) => imp.name === impMock.name)), schemasPath) : [];
		data += builder.imports({
			client: output.client,
			implementation,
			imports: importsForBuilder,
			specsName,
			hasSchemaDir: !!output.schemas,
			isAllowSyntheticDefaultImports,
			hasGlobalMutator: !!output.override.mutator,
			hasTagsMutator: Object.values(output.override.tags).some((tag) => !!tag.mutator),
			hasParamsSerializerOptions: !!output.override.paramsSerializerOptions,
			packageJson: output.packageJson,
			output
		});
		if (output.mock) {
			const importsMockForBuilder = schemasPath ? generateImportsForBuilder(output, importsMock, schemasPath) : [];
			data += builder.importsMock({
				implementation: implementationMock,
				imports: importsMockForBuilder,
				specsName,
				hasSchemaDir: !!output.schemas,
				isAllowSyntheticDefaultImports,
				options: isFunction(output.mock) ? void 0 : output.mock
			});
		}
		if (mutators) data += generateMutatorImports({
			mutators,
			implementation
		});
		if (clientMutators) data += generateMutatorImports({ mutators: clientMutators });
		if (formData) data += generateMutatorImports({ mutators: formData });
		if (formUrlEncoded) data += generateMutatorImports({ mutators: formUrlEncoded });
		if (paramsSerializer) data += generateMutatorImports({ mutators: paramsSerializer });
		if (fetchReviver) data += generateMutatorImports({ mutators: fetchReviver });
		if (implementation.includes("NonReadonly<")) {
			data += getOrvalGeneratedTypes();
			data += "\n";
		}
		if (implementation.includes("TypedResponse<")) {
			data += getTypedResponse();
			data += "\n";
		}
		if (!output.schemas && needSchema) data += generateModelsInline(builder.schemas);
		data += `${implementation.trim()}\n`;
		if (output.mock) {
			data += "\n\n";
			data += implementationMock;
		}
		await fs_extra.default.outputFile(path$3, data);
		return [path$3];
	} catch (error) {
		throw new Error(`Oups... 🍻. An Error occurred while writing file => ${error}`);
	}
};

//#endregion
//#region src/writers/split-mode.ts
const writeSplitMode = async ({ builder, output, specsName, header, needSchema }) => {
	try {
		const { filename, dirname: dirname$1, extension } = getFileInfo(output.target, {
			backupFilename: conventionName(builder.info.title, output.namingConvention),
			extension: output.fileExtension
		});
		const { imports, implementation, implementationMock, importsMock, mutators, clientMutators, formData, formUrlEncoded, paramsSerializer, fetchReviver } = generateTarget(builder, output);
		let implementationData = header;
		let mockData = header;
		const relativeSchemasPath = output.schemas ? relativeSafe(dirname$1, getFileInfo(output.schemas, { extension: output.fileExtension }).dirname) : "./" + filename + ".schemas";
		const isAllowSyntheticDefaultImports = isSyntheticDefaultImportsAllow(output.tsconfig);
		const importsForBuilder = generateImportsForBuilder(output, imports, relativeSchemasPath);
		implementationData += builder.imports({
			client: output.client,
			implementation,
			imports: importsForBuilder,
			specsName,
			hasSchemaDir: !!output.schemas,
			isAllowSyntheticDefaultImports,
			hasGlobalMutator: !!output.override.mutator,
			hasTagsMutator: Object.values(output.override.tags).some((tag) => !!tag.mutator),
			hasParamsSerializerOptions: !!output.override.paramsSerializerOptions,
			packageJson: output.packageJson,
			output
		});
		const importsMockForBuilder = generateImportsForBuilder(output, importsMock, relativeSchemasPath);
		mockData += builder.importsMock({
			implementation: implementationMock,
			imports: importsMockForBuilder,
			specsName,
			hasSchemaDir: !!output.schemas,
			isAllowSyntheticDefaultImports,
			options: isFunction(output.mock) ? void 0 : output.mock
		});
		const schemasPath = output.schemas ? void 0 : join(dirname$1, filename + ".schemas" + extension);
		if (schemasPath && needSchema) {
			const schemasData = header + generateModelsInline(builder.schemas);
			await fs_extra.default.outputFile(join(dirname$1, filename + ".schemas" + extension), schemasData);
		}
		if (mutators) implementationData += generateMutatorImports({
			mutators,
			implementation
		});
		if (clientMutators) implementationData += generateMutatorImports({ mutators: clientMutators });
		if (formData) implementationData += generateMutatorImports({ mutators: formData });
		if (formUrlEncoded) implementationData += generateMutatorImports({ mutators: formUrlEncoded });
		if (paramsSerializer) implementationData += generateMutatorImports({ mutators: paramsSerializer });
		if (fetchReviver) implementationData += generateMutatorImports({ mutators: fetchReviver });
		if (implementation.includes("NonReadonly<")) {
			implementationData += getOrvalGeneratedTypes();
			implementationData += "\n";
		}
		if (implementation.includes("TypedResponse<")) {
			implementationData += getTypedResponse();
			implementationData += "\n";
		}
		implementationData += `\n${implementation}`;
		mockData += `\n${implementationMock}`;
		const implementationFilename = filename + (OutputClient.ANGULAR === output.client ? ".service" : "") + extension;
		const implementationPath = join(dirname$1, implementationFilename);
		await fs_extra.default.outputFile(join(dirname$1, implementationFilename), implementationData);
		const mockPath = output.mock ? join(dirname$1, filename + "." + getMockFileExtensionByTypeName(output.mock) + extension) : void 0;
		if (mockPath) await fs_extra.default.outputFile(mockPath, mockData);
		return [
			implementationPath,
			...schemasPath ? [schemasPath] : [],
			...mockPath ? [mockPath] : []
		];
	} catch (error) {
		throw new Error(`Oups... 🍻. An Error occurred while splitting => ${error}`);
	}
};

//#endregion
//#region src/writers/target-tags.ts
const addDefaultTagIfEmpty = (operation) => ({
	...operation,
	tags: operation.tags.length > 0 ? operation.tags : ["default"]
});
const generateTargetTags = (currentAcc, operation) => {
	const tag = kebab(operation.tags[0]);
	const currentOperation = currentAcc[tag];
	if (!currentOperation) {
		currentAcc[tag] = {
			imports: operation.imports,
			importsMock: operation.importsMock,
			mutators: operation.mutator ? [operation.mutator] : [],
			clientMutators: operation.clientMutators ?? [],
			formData: operation.formData ? [operation.formData] : [],
			formUrlEncoded: operation.formUrlEncoded ? [operation.formUrlEncoded] : [],
			paramsSerializer: operation.paramsSerializer ? [operation.paramsSerializer] : [],
			fetchReviver: operation.fetchReviver ? [operation.fetchReviver] : [],
			implementation: operation.implementation,
			implementationMock: {
				function: operation.implementationMock.function,
				handler: operation.implementationMock.handler,
				handlerName: "  " + operation.implementationMock.handlerName + "()"
			}
		};
		return currentAcc;
	}
	currentAcc[tag] = {
		implementation: currentOperation.implementation + operation.implementation,
		imports: [...currentOperation.imports, ...operation.imports],
		importsMock: [...currentOperation.importsMock, ...operation.importsMock],
		implementationMock: {
			function: currentOperation.implementationMock.function + operation.implementationMock.function,
			handler: currentOperation.implementationMock.handler + operation.implementationMock.handler,
			handlerName: currentOperation.implementationMock.handlerName + ",\n  " + operation.implementationMock.handlerName + "()"
		},
		mutators: operation.mutator ? [...currentOperation.mutators ?? [], operation.mutator] : currentOperation.mutators,
		clientMutators: operation.clientMutators ? [...currentOperation.clientMutators ?? [], ...operation.clientMutators] : currentOperation.clientMutators,
		formData: operation.formData ? [...currentOperation.formData ?? [], operation.formData] : currentOperation.formData,
		formUrlEncoded: operation.formUrlEncoded ? [...currentOperation.formUrlEncoded ?? [], operation.formUrlEncoded] : currentOperation.formUrlEncoded,
		paramsSerializer: operation.paramsSerializer ? [...currentOperation.paramsSerializer ?? [], operation.paramsSerializer] : currentOperation.paramsSerializer,
		fetchReviver: operation.fetchReviver ? [...currentOperation.fetchReviver ?? [], operation.fetchReviver] : currentOperation.fetchReviver
	};
	return currentAcc;
};
const generateTargetForTags = (builder, options) => {
	const isAngularClient = options.client === OutputClient.ANGULAR;
	const allTargetTags = Object.values(builder.operations).map(addDefaultTagIfEmpty).reduce((acc, operation, index, arr) => {
		const targetTags = generateTargetTags(acc, operation);
		if (index === arr.length - 1) return Object.entries(targetTags).reduce((acc$1, [tag, target]) => {
			const isMutator = !!target.mutators?.some((mutator) => isAngularClient ? mutator.hasThirdArg : mutator.hasSecondArg);
			const operationNames = Object.values(builder.operations).filter(({ tags }) => tags.map(kebab).indexOf(kebab(tag)) === 0).map(({ operationName }) => operationName);
			const typescriptVersion = options.packageJson?.dependencies?.typescript ?? options.packageJson?.devDependencies?.typescript ?? "4.4.0";
			const hasAwaitedType = compareVersions(typescriptVersion, "4.5.0");
			const titles = builder.title({
				outputClient: options.client,
				title: pascal(tag),
				customTitleFunc: options.override.title,
				output: options
			});
			const footer = builder.footer({
				outputClient: options?.client,
				operationNames,
				hasMutator: !!target.mutators?.length,
				hasAwaitedType,
				titles,
				output: options
			});
			const header = builder.header({
				outputClient: options.client,
				isRequestOptions: options.override.requestOptions !== false,
				isMutator,
				isGlobalMutator: !!options.override.mutator,
				provideIn: options.override.angular.provideIn,
				hasAwaitedType,
				titles,
				output: options,
				verbOptions: builder.verbOptions,
				tag,
				clientImplementation: target.implementation
			});
			acc$1[tag] = {
				implementation: header.implementation + target.implementation + footer.implementation,
				implementationMock: {
					function: target.implementationMock.function,
					handler: target.implementationMock.handler + header.implementationMock + target.implementationMock.handlerName + footer.implementationMock,
					handlerName: target.implementationMock.handlerName
				},
				imports: target.imports,
				importsMock: target.importsMock,
				mutators: target.mutators,
				clientMutators: target.clientMutators,
				formData: target.formData,
				formUrlEncoded: target.formUrlEncoded,
				paramsSerializer: target.paramsSerializer,
				fetchReviver: target.fetchReviver
			};
			return acc$1;
		}, {});
		return targetTags;
	}, {});
	return Object.entries(allTargetTags).reduce((acc, [tag, target]) => {
		acc[tag] = {
			...target,
			implementationMock: target.implementationMock.function + target.implementationMock.handler
		};
		return acc;
	}, {});
};

//#endregion
//#region src/writers/split-tags-mode.ts
const writeSplitTagsMode = async ({ builder, output, specsName, header, needSchema }) => {
	const { filename, dirname: dirname$1, extension } = getFileInfo(output.target, {
		backupFilename: conventionName(builder.info.title, output.namingConvention),
		extension: output.fileExtension
	});
	const target = generateTargetForTags(builder, output);
	const isAllowSyntheticDefaultImports = isSyntheticDefaultImportsAllow(output.tsconfig);
	const indexFilePath = output.mock && !isFunction(output.mock) && output.mock.indexMockFiles ? join(dirname$1, "index." + getMockFileExtensionByTypeName(output.mock) + extension) : void 0;
	if (indexFilePath) await fs_extra.default.outputFile(indexFilePath, "");
	return (await Promise.all(Object.entries(target).map(async ([tag, target$1]) => {
		try {
			const { imports, implementation, implementationMock, importsMock, mutators, clientMutators, formData, fetchReviver, formUrlEncoded, paramsSerializer } = target$1;
			let implementationData = header;
			let mockData = header;
			const relativeSchemasPath = output.schemas ? "../" + relativeSafe(dirname$1, getFileInfo(output.schemas, { extension: output.fileExtension }).dirname) : "../" + filename + ".schemas";
			const importsForBuilder = generateImportsForBuilder(output, imports, relativeSchemasPath);
			implementationData += builder.imports({
				client: output.client,
				implementation,
				imports: importsForBuilder,
				specsName,
				hasSchemaDir: !!output.schemas,
				isAllowSyntheticDefaultImports,
				hasGlobalMutator: !!output.override.mutator,
				hasTagsMutator: Object.values(output.override.tags).some((tag$1) => !!tag$1.mutator),
				hasParamsSerializerOptions: !!output.override.paramsSerializerOptions,
				packageJson: output.packageJson,
				output
			});
			const importsMockForBuilder = generateImportsForBuilder(output, importsMock, relativeSchemasPath);
			mockData += builder.importsMock({
				implementation: implementationMock,
				imports: importsMockForBuilder,
				specsName,
				hasSchemaDir: !!output.schemas,
				isAllowSyntheticDefaultImports,
				options: isFunction(output.mock) ? void 0 : output.mock
			});
			const schemasPath = output.schemas ? void 0 : join(dirname$1, filename + ".schemas" + extension);
			if (schemasPath && needSchema) {
				const schemasData = header + generateModelsInline(builder.schemas);
				await fs_extra.default.outputFile(schemasPath, schemasData);
			}
			if (mutators) implementationData += generateMutatorImports({
				mutators,
				implementation,
				oneMore: true
			});
			if (clientMutators) implementationData += generateMutatorImports({
				mutators: clientMutators,
				oneMore: true
			});
			if (formData) implementationData += generateMutatorImports({
				mutators: formData,
				oneMore: true
			});
			if (formUrlEncoded) implementationData += generateMutatorImports({
				mutators: formUrlEncoded,
				oneMore: true
			});
			if (paramsSerializer) implementationData += generateMutatorImports({
				mutators: paramsSerializer,
				oneMore: true
			});
			if (fetchReviver) implementationData += generateMutatorImports({
				mutators: fetchReviver,
				oneMore: true
			});
			if (implementation.includes("NonReadonly<")) {
				implementationData += getOrvalGeneratedTypes();
				implementationData += "\n";
			}
			if (implementation.includes("TypedResponse<")) {
				implementationData += getTypedResponse();
				implementationData += "\n";
			}
			implementationData += `\n${implementation}`;
			mockData += `\n${implementationMock}`;
			const implementationFilename = tag + (OutputClient.ANGULAR === output.client ? ".service" : "") + extension;
			const implementationPath = join(dirname$1, tag, implementationFilename);
			await fs_extra.default.outputFile(implementationPath, implementationData);
			const mockPath = output.mock ? join(dirname$1, tag, tag + "." + getMockFileExtensionByTypeName(output.mock) + extension) : void 0;
			if (mockPath) {
				await fs_extra.default.outputFile(mockPath, mockData);
				if (indexFilePath) {
					const localMockPath = joinSafe("./", tag, tag + "." + getMockFileExtensionByTypeName(output.mock));
					fs_extra.default.appendFile(indexFilePath, `export { get${pascal(tag)}Mock } from '${localMockPath}'\n`);
				}
			}
			return [
				implementationPath,
				...schemasPath ? [schemasPath] : [],
				...mockPath ? [mockPath] : []
			];
		} catch (error) {
			throw new Error(`Oups... 🍻. An Error occurred while splitting tag ${tag} => ${error}`);
		}
	}))).flat();
};

//#endregion
//#region src/writers/tags-mode.ts
const writeTagsMode = async ({ builder, output, specsName, header, needSchema }) => {
	const { filename, dirname: dirname$1, extension } = getFileInfo(output.target, {
		backupFilename: conventionName(builder.info.title, output.namingConvention),
		extension: output.fileExtension
	});
	const target = generateTargetForTags(builder, output);
	const isAllowSyntheticDefaultImports = isSyntheticDefaultImportsAllow(output.tsconfig);
	return (await Promise.all(Object.entries(target).map(async ([tag, target$1]) => {
		try {
			const { imports, implementation, implementationMock, importsMock, mutators, clientMutators, formData, formUrlEncoded, fetchReviver, paramsSerializer } = target$1;
			let data = header;
			const schemasPathRelative = output.schemas ? relativeSafe(dirname$1, getFileInfo(output.schemas, { extension: output.fileExtension }).dirname) : "./" + filename + ".schemas";
			const importsForBuilder = generateImportsForBuilder(output, imports.filter((imp) => !importsMock.some((impMock) => imp.name === impMock.name)), schemasPathRelative);
			data += builder.imports({
				client: output.client,
				implementation,
				imports: importsForBuilder,
				specsName,
				hasSchemaDir: !!output.schemas,
				isAllowSyntheticDefaultImports,
				hasGlobalMutator: !!output.override.mutator,
				hasTagsMutator: Object.values(output.override.tags).some((tag$1) => !!tag$1.mutator),
				hasParamsSerializerOptions: !!output.override.paramsSerializerOptions,
				packageJson: output.packageJson,
				output
			});
			if (output.mock) {
				const importsMockForBuilder = generateImportsForBuilder(output, importsMock, schemasPathRelative);
				data += builder.importsMock({
					implementation: implementationMock,
					imports: importsMockForBuilder,
					specsName,
					hasSchemaDir: !!output.schemas,
					isAllowSyntheticDefaultImports,
					options: isFunction(output.mock) ? void 0 : output.mock
				});
			}
			const schemasPath = output.schemas ? void 0 : join(dirname$1, filename + ".schemas" + extension);
			if (schemasPath && needSchema) {
				const schemasData = header + generateModelsInline(builder.schemas);
				await fs_extra.default.outputFile(schemasPath, schemasData);
			}
			if (mutators) data += generateMutatorImports({
				mutators,
				implementation
			});
			if (clientMutators) data += generateMutatorImports({ mutators: clientMutators });
			if (formData) data += generateMutatorImports({ mutators: formData });
			if (formUrlEncoded) data += generateMutatorImports({ mutators: formUrlEncoded });
			if (paramsSerializer) data += generateMutatorImports({ mutators: paramsSerializer });
			if (fetchReviver) data += generateMutatorImports({ mutators: fetchReviver });
			data += "\n\n";
			if (implementation.includes("NonReadonly<")) {
				data += getOrvalGeneratedTypes();
				data += "\n";
			}
			if (implementation.includes("TypedResponse<")) {
				data += getTypedResponse();
				data += "\n";
			}
			data += implementation;
			if (output.mock) {
				data += "\n\n";
				data += implementationMock;
			}
			const implementationPath = join(dirname$1, `${kebab(tag)}${extension}`);
			await fs_extra.default.outputFile(implementationPath, data);
			return [implementationPath, ...schemasPath ? [schemasPath] : []];
		} catch (error) {
			throw new Error(`Oups... 🍻. An Error occurred while writing tag ${tag} => ${error}`);
		}
	}))).flat();
};

//#endregion
exports.BODY_TYPE_NAME = BODY_TYPE_NAME;
exports.EnumGeneration = EnumGeneration;
exports.ErrorWithTag = ErrorWithTag;
exports.FormDataArrayHandling = FormDataArrayHandling;
exports.GetterPropType = GetterPropType;
exports.LogLevels = LogLevels;
exports.NamingConvention = NamingConvention;
exports.OutputClient = OutputClient;
exports.OutputHttpClient = OutputHttpClient;
exports.OutputMockType = OutputMockType;
exports.OutputMode = OutputMode;
exports.PropertySortOrder = PropertySortOrder;
exports.RefComponentSuffix = RefComponentSuffix;
exports.SchemaType = SchemaType;
exports.TEMPLATE_TAG_REGEX = TEMPLATE_TAG_REGEX;
exports.URL_REGEX = URL_REGEX;
exports.VERBS_WITH_BODY = VERBS_WITH_BODY;
exports.Verbs = Verbs;
exports._filteredVerbs = _filteredVerbs;
exports.addDependency = addDependency;
exports.asyncReduce = asyncReduce;
exports.camel = camel;
exports.combineSchemas = combineSchemas;
exports.compareVersions = compareVersions;
exports.conventionName = conventionName;
exports.count = count;
exports.createDebugger = createDebugger;
exports.createLogger = createLogger;
exports.createSuccessMessage = createSuccessMessage;
exports.dynamicImport = dynamicImport;
exports.escape = escape;
exports.generalJSTypes = generalJSTypes;
exports.generalJSTypesWithArray = generalJSTypesWithArray;
exports.generateAxiosOptions = generateAxiosOptions;
exports.generateBodyMutatorConfig = generateBodyMutatorConfig;
exports.generateBodyOptions = generateBodyOptions;
exports.generateComponentDefinition = generateComponentDefinition;
exports.generateDependencyImports = generateDependencyImports;
exports.generateFormDataAndUrlEncodedFunction = generateFormDataAndUrlEncodedFunction;
exports.generateImports = generateImports;
exports.generateModelInline = generateModelInline;
exports.generateModelsInline = generateModelsInline;
exports.generateMutator = generateMutator;
exports.generateMutatorConfig = generateMutatorConfig;
exports.generateMutatorImports = generateMutatorImports;
exports.generateMutatorRequestOptions = generateMutatorRequestOptions;
exports.generateOptions = generateOptions;
exports.generateParameterDefinition = generateParameterDefinition;
exports.generateQueryParamsAxiosConfig = generateQueryParamsAxiosConfig;
exports.generateSchemasDefinition = generateSchemasDefinition;
exports.generateTarget = generateTarget;
exports.generateTargetForTags = generateTargetForTags;
exports.generateVerbImports = generateVerbImports;
exports.generateVerbsOptions = generateVerbsOptions;
exports.getArray = getArray;
exports.getBody = getBody;
exports.getEnum = getEnum;
exports.getEnumDescriptions = getEnumDescriptions;
exports.getEnumImplementation = getEnumImplementation;
exports.getEnumNames = getEnumNames;
exports.getExtension = getExtension;
exports.getFileInfo = getFileInfo;
exports.getFullRoute = getFullRoute;
exports.getIsBodyVerb = getIsBodyVerb;
exports.getKey = getKey;
exports.getMockFileExtensionByTypeName = getMockFileExtensionByTypeName;
exports.getNumberWord = getNumberWord;
exports.getObject = getObject;
exports.getOperationId = getOperationId;
exports.getOrvalGeneratedTypes = getOrvalGeneratedTypes;
exports.getParameters = getParameters;
exports.getParams = getParams;
exports.getParamsInPath = getParamsInPath;
exports.getProps = getProps;
exports.getQueryParams = getQueryParams;
exports.getRefInfo = getRefInfo;
exports.getResReqTypes = getResReqTypes;
exports.getResponse = getResponse;
exports.getRoute = getRoute;
exports.getRouteAsArray = getRouteAsArray;
exports.getScalar = getScalar;
exports.getTypedResponse = getTypedResponse;
exports.ibmOpenapiValidator = ibmOpenapiValidator;
exports.ibmOpenapiValidatorErrors = ibmOpenapiValidatorErrors;
exports.ibmOpenapiValidatorWarnings = ibmOpenapiValidatorWarnings;
exports.isBoolean = isBoolean;
exports.isDirectory = isDirectory;
exports.isFunction = isFunction;
exports.isModule = isModule;
exports.isNull = isNull;
exports.isNumber = isNumber;
exports.isNumeric = isNumeric;
exports.isObject = isObject;
exports.isReference = isReference;
exports.isRootKey = isRootKey;
exports.isSchema = isSchema;
exports.isString = isString;
exports.isSyntheticDefaultImportsAllow = isSyntheticDefaultImportsAllow;
exports.isUndefined = isUndefined;
exports.isUrl = isUrl;
exports.isVerb = isVerb;
exports.jsDoc = jsDoc;
exports.jsStringEscape = jsStringEscape;
exports.kebab = kebab;
exports.keyValuePairsToJsDoc = keyValuePairsToJsDoc;
exports.loadFile = loadFile;
exports.log = log;
exports.logError = logError;
exports.mergeDeep = mergeDeep;
exports.mismatchArgsMessage = mismatchArgsMessage;
exports.openApiConverter = openApiConverter;
exports.pascal = pascal;
exports.removeFilesAndEmptyFolders = removeFilesAndEmptyFolders;
exports.resolveDiscriminators = resolveDiscriminators;
exports.resolveExampleRefs = resolveExampleRefs;
exports.resolveObject = resolveObject;
exports.resolveRef = resolveRef;
exports.resolveValue = resolveValue;
exports.sanitize = sanitize;
exports.snake = snake;
exports.sortByPriority = sortByPriority;
exports.startMessage = startMessage;
exports.stringify = stringify;
exports.toObjectString = toObjectString;
Object.defineProperty(exports, 'upath', {
  enumerable: true,
  get: function () {
    return path_exports;
  }
});
exports.upper = upper;
exports.writeModelInline = writeModelInline;
exports.writeModelsInline = writeModelsInline;
exports.writeSchema = writeSchema;
exports.writeSchemas = writeSchemas;
exports.writeSingleMode = writeSingleMode;
exports.writeSplitMode = writeSplitMode;
exports.writeSplitTagsMode = writeSplitTagsMode;
exports.writeTagsMode = writeTagsMode;
//# sourceMappingURL=index.js.map