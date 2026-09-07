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
let node_fs = require("node:fs");
node_fs = __toESM(node_fs);
let node_path = require("node:path");
node_path = __toESM(node_path);
let node_process = require("node:process");
node_process = __toESM(node_process);
let jiti = require("jiti");
jiti = __toESM(jiti);
let __apidevtools_swagger_parser = require("@apidevtools/swagger-parser");
__apidevtools_swagger_parser = __toESM(__apidevtools_swagger_parser);
let chalk = require("chalk");
chalk = __toESM(chalk);
let fs_extra = require("fs-extra");
fs_extra = __toESM(fs_extra);
let js_yaml = require("js-yaml");
js_yaml = __toESM(js_yaml);
let __orval_mock = require("@orval/mock");
__orval_mock = __toESM(__orval_mock);
let __orval_angular = require("@orval/angular");
__orval_angular = __toESM(__orval_angular);
let __orval_axios = require("@orval/axios");
__orval_axios = __toESM(__orval_axios);
let __orval_fetch = require("@orval/fetch");
__orval_fetch = __toESM(__orval_fetch);
let __orval_hono = require("@orval/hono");
__orval_hono = __toESM(__orval_hono);
let __orval_mcp = require("@orval/mcp");
__orval_mcp = __toESM(__orval_mcp);
let __orval_query = require("@orval/query");
__orval_query = __toESM(__orval_query);
let __orval_swr = require("@orval/swr");
__orval_swr = __toESM(__orval_swr);
let __orval_zod = require("@orval/zod");
__orval_zod = __toESM(__orval_zod);
let node_https = require("node:https");
node_https = __toESM(node_https);
let enquirer = require("enquirer");
enquirer = __toESM(enquirer);
let find_up = require("find-up");
find_up = __toESM(find_up);
let tsconfck = require("tsconfck");
tsconfck = __toESM(tsconfck);
let execa = require("execa");
execa = __toESM(execa);
let lodash_uniq = require("lodash.uniq");
lodash_uniq = __toESM(lodash_uniq);
let string_argv = require("string-argv");
string_argv = __toESM(string_argv);

//#region src/client.ts
const DEFAULT_CLIENT = __orval_core.OutputClient.AXIOS;
const getGeneratorClient = (outputClient, output) => {
	const GENERATOR_CLIENT = {
		axios: (0, __orval_axios.default)({ type: "axios" })(),
		"axios-functions": (0, __orval_axios.default)({ type: "axios-functions" })(),
		angular: (0, __orval_angular.default)()(),
		"react-query": (0, __orval_query.default)({
			output,
			type: "react-query"
		})(),
		"svelte-query": (0, __orval_query.default)({
			output,
			type: "svelte-query"
		})(),
		"vue-query": (0, __orval_query.default)({
			output,
			type: "vue-query"
		})(),
		swr: (0, __orval_swr.default)()(),
		zod: (0, __orval_zod.default)()(),
		hono: (0, __orval_hono.default)()(),
		fetch: (0, __orval_fetch.default)()(),
		mcp: (0, __orval_mcp.default)()()
	};
	const generator = (0, __orval_core.isFunction)(outputClient) ? outputClient(GENERATOR_CLIENT) : GENERATOR_CLIENT[outputClient];
	if (!generator) throw new Error(`Oups... 🍻. Client not found: ${outputClient}`);
	return generator;
};
const generateClientImports = ({ client = DEFAULT_CLIENT, implementation, imports, specsName, hasSchemaDir, isAllowSyntheticDefaultImports, hasGlobalMutator, hasTagsMutator, hasParamsSerializerOptions, packageJson, output }) => {
	const { dependencies: dependencies$1 } = getGeneratorClient(client, output);
	return (0, __orval_core.generateDependencyImports)(implementation, dependencies$1 ? [...dependencies$1(hasGlobalMutator, hasParamsSerializerOptions, packageJson, output.httpClient, hasTagsMutator, output.override), ...imports] : imports, specsName, hasSchemaDir, isAllowSyntheticDefaultImports);
};
const generateClientHeader = ({ outputClient = DEFAULT_CLIENT, isRequestOptions, isGlobalMutator, isMutator, provideIn, hasAwaitedType, titles, output, verbOptions, tag, clientImplementation }) => {
	const { header } = getGeneratorClient(outputClient, output);
	return {
		implementation: header ? header({
			title: titles.implementation,
			isRequestOptions,
			isGlobalMutator,
			isMutator,
			provideIn,
			hasAwaitedType,
			output,
			verbOptions,
			tag,
			clientImplementation
		}) : "",
		implementationMock: `export const ${titles.implementationMock} = () => [\n`
	};
};
const generateClientFooter = ({ outputClient = DEFAULT_CLIENT, operationNames, hasMutator, hasAwaitedType, titles, output }) => {
	const { footer } = getGeneratorClient(outputClient, output);
	if (!footer) return {
		implementation: "",
		implementationMock: `\n]\n`
	};
	let implementation;
	try {
		if ((0, __orval_core.isFunction)(outputClient)) {
			implementation = footer(operationNames);
			console.warn("[WARN] Passing an array of strings for operations names to the footer function is deprecated and will be removed in a future major release. Please pass them in an object instead: { operationNames: string[] }.");
		} else implementation = footer({
			operationNames,
			title: titles.implementation,
			hasMutator,
			hasAwaitedType
		});
	} catch {
		implementation = footer({
			operationNames,
			title: titles.implementation,
			hasMutator,
			hasAwaitedType
		});
	}
	return {
		implementation,
		implementationMock: `]\n`
	};
};
const generateClientTitle = ({ outputClient = DEFAULT_CLIENT, title, customTitleFunc, output }) => {
	const { title: generatorTitle } = getGeneratorClient(outputClient, output);
	if (!generatorTitle) return {
		implementation: "",
		implementationMock: `get${(0, __orval_core.pascal)(title)}Mock`
	};
	if (customTitleFunc) {
		const customTitle = customTitleFunc(title);
		return {
			implementation: generatorTitle(customTitle),
			implementationMock: `get${(0, __orval_core.pascal)(customTitle)}Mock`
		};
	}
	return {
		implementation: generatorTitle(title),
		implementationMock: `get${(0, __orval_core.pascal)(title)}Mock`
	};
};
const generateMock = (verbOption, options) => {
	if (!options.mock) return {
		implementation: {
			function: "",
			handler: "",
			handlerName: ""
		},
		imports: []
	};
	if ((0, __orval_core.isFunction)(options.mock)) return options.mock(verbOption, options);
	return __orval_mock.generateMock(verbOption, options);
};
const generateOperations = (outputClient = DEFAULT_CLIENT, verbsOptions, options, output) => {
	return (0, __orval_core.asyncReduce)(verbsOptions, async (acc, verbOption) => {
		const { client: generatorClient } = getGeneratorClient(outputClient, output);
		const client = await generatorClient(verbOption, options, outputClient);
		if (!client.implementation) return acc;
		const generatedMock = generateMock(verbOption, options);
		acc[verbOption.operationId] = {
			implementation: verbOption.doc + client.implementation,
			imports: client.imports,
			implementationMock: generatedMock.implementation,
			importsMock: generatedMock.imports,
			tags: verbOption.tags,
			mutator: verbOption.mutator,
			clientMutators: client.mutators,
			formData: verbOption.formData,
			formUrlEncoded: verbOption.formUrlEncoded,
			paramsSerializer: verbOption.paramsSerializer,
			operationName: verbOption.operationName,
			fetchReviver: verbOption.fetchReviver
		};
		return acc;
	}, {});
};
const generateExtraFiles = (outputClient = DEFAULT_CLIENT, verbsOptions, output, context) => {
	const { extraFiles: generateExtraFiles$1 } = getGeneratorClient(outputClient, output);
	if (!generateExtraFiles$1) return Promise.resolve([]);
	return generateExtraFiles$1(verbsOptions, output, context);
};

//#endregion
//#region src/api.ts
const getApiBuilder = async ({ input, output, context }) => {
	const api = await (0, __orval_core.asyncReduce)(Object.entries(context.specs[context.specKey].paths ?? {}), async (acc, [pathRoute, verbs]) => {
		const route = (0, __orval_core.getRoute)(pathRoute);
		let resolvedVerbs = verbs;
		let resolvedContext = context;
		if ((0, __orval_core.isReference)(verbs)) {
			const { schema, imports } = (0, __orval_core.resolveRef)(verbs, context);
			resolvedVerbs = schema;
			resolvedContext = {
				...context,
				...imports.length > 0 ? { specKey: imports[0].specKey } : {}
			};
		}
		let verbsOptions = await (0, __orval_core.generateVerbsOptions)({
			verbs: resolvedVerbs,
			input,
			output,
			route,
			pathRoute,
			context: resolvedContext
		});
		if (output.override.useDeprecatedOperations === false) verbsOptions = verbsOptions.filter((verb) => {
			return !verb.deprecated;
		});
		const schemas = verbsOptions.reduce((acc$1, { queryParams, headers, body, response, props }) => {
			if (props) acc$1.push(...props.flatMap((param) => param.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS ? param.schema : []));
			if (queryParams) acc$1.push(queryParams.schema, ...queryParams.deps);
			if (headers) acc$1.push(headers.schema, ...headers.deps);
			acc$1.push(...body.schemas, ...response.schemas);
			return acc$1;
		}, []);
		const fullRoute = (0, __orval_core.getFullRoute)(route, verbs.servers ?? context.specs[context.specKey].servers, output.baseUrl);
		if (!output.target) throw new Error("Output does not have a target");
		const pathOperations = await generateOperations(output.client, verbsOptions, {
			route: fullRoute,
			pathRoute,
			override: output.override,
			context: resolvedContext,
			mock: output.mock,
			output: output.target
		}, output);
		for (const verbOption of verbsOptions) acc.verbOptions[verbOption.operationId] = verbOption;
		acc.schemas.push(...schemas);
		acc.operations = {
			...acc.operations,
			...pathOperations
		};
		return acc;
	}, {
		operations: {},
		verbOptions: {},
		schemas: []
	});
	const extraFiles = await generateExtraFiles(output.client, api.verbOptions, output, context);
	return {
		operations: api.operations,
		schemas: api.schemas,
		verbOptions: api.verbOptions,
		title: generateClientTitle,
		header: generateClientHeader,
		footer: generateClientFooter,
		imports: generateClientImports,
		importsMock: __orval_mock.generateMockImports,
		extraFiles
	};
};

//#endregion
//#region src/import-open-api.ts
const importOpenApi = async ({ data, input, output, target, workspace }) => {
	const specs = await generateInputSpecs({
		specs: data,
		input,
		workspace
	});
	const schemas = getApiSchemas({
		input,
		output,
		target,
		workspace,
		specs
	});
	const api = await getApiBuilder({
		input,
		output,
		context: {
			specKey: target,
			target,
			workspace,
			specs,
			output
		}
	});
	return {
		...api,
		schemas: {
			...schemas,
			[target]: [...schemas[target] ?? [], ...api.schemas]
		},
		target,
		info: specs[target].info
	};
};
const generateInputSpecs = async ({ specs, input, workspace }) => {
	const transformerFn = input.override?.transformer ? await (0, __orval_core.dynamicImport)(input.override.transformer, workspace) : void 0;
	return (0, __orval_core.asyncReduce)(Object.entries(specs), async (acc, [specKey, value]) => {
		const schema = await (0, __orval_core.openApiConverter)(value, input.converterOptions, specKey);
		const transfomedSchema = transformerFn ? transformerFn(schema) : schema;
		if (input.validation) await (0, __orval_core.ibmOpenapiValidator)(transfomedSchema, input.validation);
		acc[specKey] = transfomedSchema;
		return acc;
	}, {});
};
const getApiSchemas = ({ input, output, target, workspace, specs }) => {
	return Object.entries(specs).reduce((acc, [specKey, spec]) => {
		const context = {
			specKey,
			target,
			workspace,
			specs,
			output
		};
		const parsedSchemas = spec.openapi ? spec.components?.schemas : getAllSchemas(spec, specKey);
		const schemaDefinition = (0, __orval_core.generateSchemasDefinition)(parsedSchemas, context, output.override.components.schemas.suffix, input.filters);
		const responseDefinition = (0, __orval_core.generateComponentDefinition)(spec.components?.responses, context, output.override.components.responses.suffix);
		const bodyDefinition = (0, __orval_core.generateComponentDefinition)(spec.components?.requestBodies, context, output.override.components.requestBodies.suffix);
		const parameters = (0, __orval_core.generateParameterDefinition)(spec.components?.parameters, context, output.override.components.parameters.suffix);
		const schemas = [
			...schemaDefinition,
			...responseDefinition,
			...bodyDefinition,
			...parameters
		];
		if (schemas.length === 0) return acc;
		acc[specKey] = schemas;
		return acc;
	}, {});
};
const getAllSchemas = (spec, specKey) => {
	const keysToOmit = new Set([
		"openapi",
		"info",
		"servers",
		"paths",
		"components",
		"security",
		"tags",
		"externalDocs"
	]);
	const cleanedSpec = Object.fromEntries(Object.entries(spec).filter(([key]) => !keysToOmit.has(key)));
	if (specKey && (0, __orval_core.isSchema)(cleanedSpec)) {
		const name$1 = __orval_core.upath.getSchemaFileName(specKey);
		const additionalKeysToOmit = new Set([
			"type",
			"properties",
			"allOf",
			"oneOf",
			"anyOf",
			"items"
		]);
		return {
			[name$1]: cleanedSpec,
			...getAllSchemas(Object.fromEntries(Object.entries(cleanedSpec).filter(([key]) => !additionalKeysToOmit.has(key))))
		};
	}
	return {
		...Object.entries(cleanedSpec).reduce((acc, [key, value]) => {
			if (!(0, __orval_core.isObject)(value)) return acc;
			if (!(0, __orval_core.isSchema)(value) && !(0, __orval_core.isReference)(value)) return {
				...acc,
				...getAllSchemas(value)
			};
			acc[key] = value;
			return acc;
		}, {}),
		...spec?.components?.schemas
	};
};

//#endregion
//#region src/import-specs.ts
const resolveSpecs = async (path$1, { validate,...options }, _isUrl, isOnlySchema) => {
	try {
		if (validate) try {
			await __apidevtools_swagger_parser.default.validate(path$1, options);
		} catch (error) {
			if (error instanceof Error && error.name === "ParserError") throw error;
			if (!isOnlySchema) (0, __orval_core.log)(`⚠️  ${chalk.default.yellow(error)}`);
		}
		const data = (await __apidevtools_swagger_parser.default.resolve(path$1, options)).values();
		if (_isUrl) return data;
		return Object.fromEntries(Object.entries(data).sort().map(([key, value]) => [(0, __orval_core.isUrl)(key) ? key : __orval_core.upath.resolve(key), value]));
	} catch {
		const file = await fs_extra.default.readFile(path$1, "utf8");
		return { [path$1]: js_yaml.default.load(file) };
	}
};
const importSpecs = async (workspace, options) => {
	const { input, output } = options;
	if (!(0, __orval_core.isString)(input.target)) return importOpenApi({
		data: { [workspace]: input.target },
		input,
		output,
		target: workspace,
		workspace
	});
	const isPathUrl = (0, __orval_core.isUrl)(input.target);
	const data = await resolveSpecs(input.target, input.parserOptions, isPathUrl, !output.target);
	return importOpenApi({
		data,
		input,
		output,
		target: input.target,
		workspace
	});
};

//#endregion
//#region package.json
var name = "orval";
var description = "A swagger client generator for typescript";
var version = "7.21.0";
var license = "MIT";
var files = ["dist", "!dist/**/*.d.ts.map"];
var bin = "./dist/bin/orval.js";
var type = "commonjs";
var exports$1 = { ".": {
	"types": "./dist/index.d.ts",
	"default": "./dist/index.js"
} };
var engines = { "node": ">=22.18.0" };
var keywords = [
	"rest",
	"client",
	"swagger",
	"open-api",
	"fetch",
	"data fetching",
	"code-generation",
	"angular",
	"react",
	"react-query",
	"svelte",
	"svelte-query",
	"vue",
	"vue-query",
	"msw",
	"mock",
	"axios",
	"vue-query",
	"vue",
	"swr",
	"zod",
	"hono"
];
var author = {
	"name": "Victor Bury",
	"email": "victor@anymaniax.com"
};
var repository = {
	"type": "git",
	"url": "git+https://github.com/orval-labs/orval.git"
};
var scripts = {
	"build": "tsdown --config-loader unconfig",
	"dev": "tsdown --config-loader unconfig --watch src --onSuccess 'yarn generate-api'",
	"lint": "eslint .",
	"generate-api": "orval --config ../../samples/react-query/basic/orval.config.ts",
	"test": "tsc --noEmit && vitest",
	"clean": "rimraf .turbo dist",
	"nuke": "rimraf .turbo dist node_modules"
};
var devDependencies = {
	"@types/fs-extra": "^11.0.4",
	"@types/js-yaml": "^4.0.9",
	"@types/lodash.uniq": "^4.5.9",
	"eslint": "^9.38.0",
	"openapi-types": "^12.1.3",
	"rimraf": "^6.0.1",
	"tsdown": "^0.15.8",
	"typescript": "^5.9.3",
	"vitest": "^3.2.4"
};
var dependencies = {
	"@apidevtools/swagger-parser": "^12.1.0",
	"@commander-js/extra-typings": "^14.0.0",
	"@orval/angular": "workspace:*",
	"@orval/axios": "workspace:*",
	"@orval/core": "workspace:*",
	"@orval/fetch": "workspace:*",
	"@orval/hono": "workspace:*",
	"@orval/mcp": "workspace:*",
	"@orval/mock": "workspace:*",
	"@orval/query": "workspace:*",
	"@orval/swr": "workspace:*",
	"@orval/zod": "workspace:*",
	"chalk": "^4.1.2",
	"chokidar": "^4.0.3",
	"commander": "^14.0.1",
	"enquirer": "^2.4.1",
	"execa": "^5.1.1",
	"find-up": "5.0.0",
	"fs-extra": "^11.3.2",
	"jiti": "^2.6.1",
	"js-yaml": "4.1.1",
	"lodash.uniq": "^4.5.0",
	"openapi3-ts": "4.5.0",
	"string-argv": "^0.3.2",
	"tsconfck": "^2.1.2",
	"typedoc": "^0.28.14",
	"typedoc-plugin-coverage": "^4.0.2",
	"typedoc-plugin-markdown": "^4.9.0"
};
var package_default = {
	name,
	description,
	version,
	license,
	files,
	bin,
	type,
	exports: exports$1,
	engines,
	keywords,
	author,
	repository,
	scripts,
	devDependencies,
	dependencies
};

//#endregion
//#region src/utils/request.ts
const request = (urlOptions, data) => {
	return new Promise((resolve, reject) => {
		const req = node_https.default.request(urlOptions, (res) => {
			let body = "";
			res.on("data", (chunk) => body += chunk.toString());
			res.on("error", reject);
			res.on("end", () => {
				const response = {
					status: res.statusCode,
					headers: res.headers,
					body: JSON.parse(body)
				};
				if (res.statusCode && res.statusCode >= 200 && res.statusCode <= 299) resolve(response);
				else reject(response);
			});
		});
		req.on("error", reject);
		if (data) req.write(data, "binary");
		req.end();
	});
};

//#endregion
//#region src/utils/github.ts
const getGithubSpecReq = ({ accessToken, repo, owner, branch, path: path$1 }) => {
	const payload = JSON.stringify({ query: `query {
      repository(name: "${repo}", owner: "${owner}") {
        object(expression: "${branch}:${path$1}") {
          ... on Blob {
            text
          }
        }
      }
    }` });
	return [{
		method: "POST",
		hostname: "api.github.com",
		path: "/graphql",
		headers: {
			"content-type": "application/json",
			"user-agent": "orval-importer",
			authorization: `bearer ${accessToken}`,
			"Content-Length": payload.length
		}
	}, payload];
};
let githubToken = null;
const getGithubAcessToken = async (githubTokenPath) => {
	if (githubToken) return githubToken;
	if (await fs_extra.default.pathExists(githubTokenPath)) return fs_extra.default.readFile(githubTokenPath, "utf8");
	else {
		const answers = await (0, enquirer.prompt)([{
			type: "input",
			name: "githubToken",
			message: "Please provide a GitHub token with `repo` rules checked (https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/)"
		}, {
			type: "confirm",
			name: "saveToken",
			message: "Would you like to store your token for the next time? (stored in your node_modules)"
		}]);
		githubToken = answers.githubToken;
		if (answers.saveToken) await fs_extra.default.outputFile(githubTokenPath, answers.githubToken);
		return answers.githubToken;
	}
};
const getGithubOpenApi = async (url) => {
	const githubTokenPath = __orval_core.upath.join(__dirname, ".githubToken");
	const accessToken = await getGithubAcessToken(githubTokenPath);
	const [info] = url.split("github.com/").slice(-1);
	const [owner, repo, , branch, ...paths] = info.split("/");
	const path$1 = paths.join("/");
	try {
		const { body } = await request(...getGithubSpecReq({
			accessToken,
			repo,
			owner,
			branch,
			path: path$1
		}));
		if (body.errors?.length) {
			if (body.errors?.some((error) => error?.type === "NOT_FOUND")) {
				if ((await (0, enquirer.prompt)([{
					type: "confirm",
					name: "removeToken",
					message: "Your token doesn't have the correct permissions, should we remove it?"
				}])).removeToken) await fs_extra.default.unlink(githubTokenPath);
			}
		}
		return body.data?.repository?.object.text;
	} catch (error) {
		if (!error.body) throw new Error(`Oups... 🍻. ${error}`);
		if (error.body.message === "Bad credentials") {
			if ((await (0, enquirer.prompt)([{
				type: "confirm",
				name: "removeToken",
				message: "Your token doesn't have the correct permissions, should we remove it?"
			}])).removeToken) await fs_extra.default.unlink(githubTokenPath);
		}
		throw new Error(error.body.message || `Oups... 🍻. ${error}`);
	}
};
const githubResolver = {
	order: 199,
	canRead(file) {
		return file.url.includes("github.com");
	},
	read(file) {
		return getGithubOpenApi(file.url);
	}
};

//#endregion
//#region src/utils/package-json.ts
const loadPackageJson = async (packageJson, workspace = process.cwd()) => {
	if (!packageJson) {
		const pkgPath = await (0, find_up.default)(["package.json"], { cwd: workspace });
		if (pkgPath) {
			const pkg = await (0, __orval_core.dynamicImport)(pkgPath, workspace);
			if (isPackageJson(pkg)) return await maybeReplaceCatalog(pkg, workspace);
			else throw new Error("Invalid package.json file");
		}
		return;
	}
	const normalizedPath = normalizePath(packageJson, workspace);
	if (fs_extra.default.existsSync(normalizedPath)) {
		const pkg = await (0, __orval_core.dynamicImport)(normalizedPath);
		if (isPackageJson(pkg)) return await maybeReplaceCatalog(pkg, workspace);
		else throw new Error(`Invalid package.json file: ${normalizedPath}`);
	}
};
const isPackageJson = (obj) => typeof obj === "object" && obj !== null;
const maybeReplaceCatalog = async (pkg, workspace) => {
	if (![
		...Object.entries(pkg.dependencies ?? {}),
		...Object.entries(pkg.devDependencies ?? {}),
		...Object.entries(pkg.peerDependencies ?? {})
	].some(([, value]) => (0, __orval_core.isString)(value) && value.startsWith("catalog:"))) return pkg;
	const filePath = await (0, find_up.default)("pnpm-workspace.yaml", { cwd: workspace });
	if (!filePath) {
		(0, __orval_core.log)(`⚠️  ${chalk.default.yellow("package.json contains pnpm catalog: in dependencies, but no pnpm-workspace.yaml was found.")}`);
		return pkg;
	}
	const file = await fs_extra.default.readFile(filePath, "utf8");
	const pnpmWorkspaceFile = js_yaml.default.load(file);
	performSubstitution(pkg.dependencies, pnpmWorkspaceFile);
	performSubstitution(pkg.devDependencies, pnpmWorkspaceFile);
	performSubstitution(pkg.peerDependencies, pnpmWorkspaceFile);
	return pkg;
};
const performSubstitution = (dependencies$1, pnpmWorkspaceFile) => {
	if (!dependencies$1) return;
	for (const [packageName, version$1] of Object.entries(dependencies$1)) if (version$1 === "catalog:" || version$1 === "catalog:default") {
		if (!pnpmWorkspaceFile.catalog) {
			(0, __orval_core.log)(`⚠️  ${chalk.default.yellow(`when reading from pnpm-workspace.yaml, catalog: substitution for the package '${packageName}' failed as there were no default catalog.`)}`);
			continue;
		}
		const sub = pnpmWorkspaceFile.catalog[packageName];
		if (!sub) {
			(0, __orval_core.log)(`⚠️  ${chalk.default.yellow(`when reading from pnpm-workspace.yaml, catalog: substitution for the package '${packageName}' failed as there were no matching package in the default catalog.`)}`);
			continue;
		}
		dependencies$1[packageName] = sub;
	} else if (version$1.startsWith("catalog:")) {
		const catalogName = version$1.slice(8);
		const catalog = pnpmWorkspaceFile.catalogs?.[catalogName];
		if (!catalog) {
			(0, __orval_core.log)(`⚠️  ${chalk.default.yellow(`when reading from pnpm-workspace.yaml, '${version$1}' substitution for the package '${packageName}' failed as there were no matching catalog named '${catalogName}'. (available named catalogs are: ${Object.keys(pnpmWorkspaceFile.catalogs ?? {}).join(", ")})`)}`);
			continue;
		}
		const sub = catalog[packageName];
		if (!sub) {
			(0, __orval_core.log)(`⚠️  ${chalk.default.yellow(`when reading from pnpm-workspace.yaml, '${version$1}' substitution for the package '${packageName}' failed as there were no package in the catalog named '${catalogName}'. (packages in the catalog are: ${Object.keys(catalog).join(", ")})`)}`);
			continue;
		}
		dependencies$1[packageName] = sub;
	}
};

//#endregion
//#region src/utils/tsconfig.ts
const loadTsconfig = async (tsconfig, workspace = process.cwd()) => {
	if ((0, __orval_core.isUndefined)(tsconfig)) {
		const configPath = await (0, find_up.default)(["tsconfig.json", "jsconfig.json"], { cwd: workspace });
		if (configPath) return (await (0, tsconfck.parse)(configPath)).tsconfig;
		return;
	}
	if ((0, __orval_core.isString)(tsconfig)) {
		const normalizedPath = normalizePath(tsconfig, workspace);
		if (fs_extra.default.existsSync(normalizedPath)) {
			const config = await (0, tsconfck.parse)(normalizedPath);
			return config.referenced?.find(({ tsconfigFile }) => tsconfigFile === normalizedPath)?.tsconfig || config.tsconfig;
		}
		return;
	}
	if ((0, __orval_core.isObject)(tsconfig)) return tsconfig;
};

//#endregion
//#region src/utils/http-resolver.ts
const httpResolver = { safeUrlResolver: false };

//#endregion
//#region src/utils/options.ts
/**
* Type helper to make it easier to use orval.config.ts
* accepts a direct {@link ConfigExternal} object.
*/
function defineConfig(options) {
	return options;
}
const createFormData = (workspace, formData) => {
	const defaultArrayHandling = __orval_core.FormDataArrayHandling.SERIALIZE;
	if (formData === void 0) return {
		disabled: false,
		arrayHandling: defaultArrayHandling
	};
	if ((0, __orval_core.isBoolean)(formData)) return {
		disabled: !formData,
		arrayHandling: defaultArrayHandling
	};
	if ((0, __orval_core.isString)(formData)) return {
		disabled: false,
		mutator: normalizeMutator(workspace, formData),
		arrayHandling: defaultArrayHandling
	};
	if ("mutator" in formData || "arrayHandling" in formData) return {
		disabled: false,
		mutator: normalizeMutator(workspace, formData.mutator),
		arrayHandling: formData.arrayHandling ?? defaultArrayHandling
	};
	return {
		disabled: false,
		mutator: normalizeMutator(workspace, formData),
		arrayHandling: defaultArrayHandling
	};
};
const normalizeOptions = async (optionsExport, workspace = process.cwd(), globalOptions = {}) => {
	const options = await ((0, __orval_core.isFunction)(optionsExport) ? optionsExport() : optionsExport);
	if (!options.input) throw new Error(chalk.default.red(`Config require an input`));
	if (!options.output) throw new Error(chalk.default.red(`Config require an output`));
	const inputOptions = (0, __orval_core.isString)(options.input) ? { target: options.input } : options.input;
	const outputOptions = (0, __orval_core.isString)(options.output) ? { target: options.output } : options.output;
	const outputWorkspace = normalizePath(outputOptions.workspace || "", workspace);
	const { clean, prettier, client, httpClient, mode, biome } = globalOptions;
	const tsconfig = await loadTsconfig(outputOptions.tsconfig || globalOptions.tsconfig, workspace);
	const packageJson = await loadPackageJson(outputOptions.packageJson || globalOptions.packageJson, workspace);
	const mockOption = outputOptions.mock ?? globalOptions.mock;
	let mock;
	if (typeof mockOption === "boolean" && mockOption) mock = __orval_mock.DEFAULT_MOCK_OPTIONS;
	else if ((0, __orval_core.isFunction)(mockOption)) mock = mockOption;
	else if (mockOption) mock = {
		...__orval_mock.DEFAULT_MOCK_OPTIONS,
		...mockOption
	};
	else mock = void 0;
	const defaultFileExtension = ".ts";
	const globalQueryOptions = {
		useQuery: true,
		useMutation: true,
		signal: true,
		shouldExportMutatorHooks: true,
		shouldExportHttpClient: true,
		shouldExportQueryKey: true,
		shouldSplitQueryKey: false,
		...normalizeQueryOptions(outputOptions.override?.query, workspace)
	};
	const normalizedOptions = {
		input: {
			target: globalOptions.input ? normalizePathOrUrl(globalOptions.input, process.cwd()) : normalizePathOrUrl(inputOptions.target, workspace),
			validation: inputOptions.validation || false,
			override: { transformer: normalizePath(inputOptions.override?.transformer, workspace) },
			converterOptions: inputOptions.converterOptions ?? {},
			parserOptions: (0, __orval_core.mergeDeep)(parserDefaultOptions, inputOptions.parserOptions ?? {}),
			filters: inputOptions.filters
		},
		output: {
			target: globalOptions.output ? normalizePath(globalOptions.output, process.cwd()) : normalizePath(outputOptions.target, outputWorkspace),
			schemas: normalizePath(outputOptions.schemas, outputWorkspace),
			namingConvention: outputOptions.namingConvention || __orval_core.NamingConvention.CAMEL_CASE,
			fileExtension: outputOptions.fileExtension || defaultFileExtension,
			workspace: outputOptions.workspace ? outputWorkspace : void 0,
			client: outputOptions.client ?? client ?? __orval_core.OutputClient.AXIOS_FUNCTIONS,
			httpClient: outputOptions.httpClient ?? httpClient ?? __orval_core.OutputHttpClient.AXIOS,
			mode: normalizeOutputMode(outputOptions.mode ?? mode),
			mock,
			clean: outputOptions.clean ?? clean ?? false,
			docs: outputOptions.docs ?? false,
			prettier: outputOptions.prettier ?? prettier ?? false,
			biome: outputOptions.biome ?? biome ?? false,
			tsconfig,
			packageJson,
			headers: outputOptions.headers ?? false,
			indexFiles: outputOptions.indexFiles ?? true,
			baseUrl: outputOptions.baseUrl,
			unionAddMissingProperties: outputOptions.unionAddMissingProperties ?? false,
			override: {
				...outputOptions.override,
				mock: {
					arrayMin: outputOptions.override?.mock?.arrayMin ?? 1,
					arrayMax: outputOptions.override?.mock?.arrayMax ?? 10,
					stringMin: outputOptions.override?.mock?.stringMin ?? 10,
					stringMax: outputOptions.override?.mock?.stringMax ?? 20,
					fractionDigits: outputOptions.override?.mock?.fractionDigits ?? 2,
					...outputOptions.override?.mock
				},
				operations: normalizeOperationsAndTags(outputOptions.override?.operations ?? {}, outputWorkspace, { query: globalQueryOptions }),
				tags: normalizeOperationsAndTags(outputOptions.override?.tags ?? {}, outputWorkspace, { query: globalQueryOptions }),
				mutator: normalizeMutator(outputWorkspace, outputOptions.override?.mutator),
				formData: createFormData(outputWorkspace, outputOptions.override?.formData),
				formUrlEncoded: ((0, __orval_core.isBoolean)(outputOptions.override?.formUrlEncoded) ? outputOptions.override?.formUrlEncoded : normalizeMutator(outputWorkspace, outputOptions.override?.formUrlEncoded)) ?? true,
				paramsSerializer: normalizeMutator(outputWorkspace, outputOptions.override?.paramsSerializer),
				header: outputOptions.override?.header === false ? false : (0, __orval_core.isFunction)(outputOptions.override?.header) ? outputOptions.override?.header : getDefaultFilesHeader,
				requestOptions: outputOptions.override?.requestOptions ?? true,
				namingConvention: outputOptions.override?.namingConvention ?? {},
				components: {
					schemas: {
						suffix: __orval_core.RefComponentSuffix.schemas,
						itemSuffix: outputOptions.override?.components?.schemas?.itemSuffix ?? "Item",
						...outputOptions.override?.components?.schemas
					},
					responses: {
						suffix: __orval_core.RefComponentSuffix.responses,
						...outputOptions.override?.components?.responses
					},
					parameters: {
						suffix: __orval_core.RefComponentSuffix.parameters,
						...outputOptions.override?.components?.parameters
					},
					requestBodies: {
						suffix: __orval_core.RefComponentSuffix.requestBodies,
						...outputOptions.override?.components?.requestBodies
					}
				},
				hono: normalizeHonoOptions(outputOptions.override?.hono, workspace),
				jsDoc: normalizeJSDocOptions(outputOptions.override?.jsDoc),
				query: globalQueryOptions,
				zod: {
					strict: {
						param: outputOptions.override?.zod?.strict?.param ?? false,
						query: outputOptions.override?.zod?.strict?.query ?? false,
						header: outputOptions.override?.zod?.strict?.header ?? false,
						body: outputOptions.override?.zod?.strict?.body ?? false,
						response: outputOptions.override?.zod?.strict?.response ?? false
					},
					generate: {
						param: outputOptions.override?.zod?.generate?.param ?? true,
						query: outputOptions.override?.zod?.generate?.query ?? true,
						header: outputOptions.override?.zod?.generate?.header ?? true,
						body: outputOptions.override?.zod?.generate?.body ?? true,
						response: outputOptions.override?.zod?.generate?.response ?? true
					},
					coerce: {
						param: outputOptions.override?.zod?.coerce?.param ?? false,
						query: outputOptions.override?.zod?.coerce?.query ?? false,
						header: outputOptions.override?.zod?.coerce?.header ?? false,
						body: outputOptions.override?.zod?.coerce?.body ?? false,
						response: outputOptions.override?.zod?.coerce?.response ?? false
					},
					preprocess: {
						...outputOptions.override?.zod?.preprocess?.param ? { param: normalizeMutator(workspace, outputOptions.override.zod.preprocess.param) } : {},
						...outputOptions.override?.zod?.preprocess?.query ? { query: normalizeMutator(workspace, outputOptions.override.zod.preprocess.query) } : {},
						...outputOptions.override?.zod?.preprocess?.header ? { header: normalizeMutator(workspace, outputOptions.override.zod.preprocess.header) } : {},
						...outputOptions.override?.zod?.preprocess?.body ? { body: normalizeMutator(workspace, outputOptions.override.zod.preprocess.body) } : {},
						...outputOptions.override?.zod?.preprocess?.response ? { response: normalizeMutator(workspace, outputOptions.override.zod.preprocess.response) } : {}
					},
					generateEachHttpStatus: outputOptions.override?.zod?.generateEachHttpStatus ?? false,
					dateTimeOptions: outputOptions.override?.zod?.dateTimeOptions ?? {},
					timeOptions: outputOptions.override?.zod?.timeOptions ?? {}
				},
				swr: { ...outputOptions.override?.swr },
				angular: { provideIn: outputOptions.override?.angular?.provideIn ?? "root" },
				fetch: {
					includeHttpResponseReturnType: outputOptions.override?.fetch?.includeHttpResponseReturnType ?? true,
					forceSuccessResponse: outputOptions.override?.fetch?.forceSuccessResponse ?? false,
					explode: outputOptions.override?.fetch?.explode ?? true,
					...outputOptions.override?.fetch
				},
				useDates: outputOptions.override?.useDates || false,
				useDeprecatedOperations: outputOptions.override?.useDeprecatedOperations ?? true,
				enumGenerationType: outputOptions.override?.useNativeEnums ?? false ? "enum" : outputOptions.override?.enumGenerationType ?? "const",
				suppressReadonlyModifier: outputOptions.override?.suppressReadonlyModifier || false
			},
			allParamsOptional: outputOptions.allParamsOptional ?? false,
			urlEncodeParameters: outputOptions.urlEncodeParameters ?? false,
			optionsParamRequired: outputOptions.optionsParamRequired ?? false,
			propertySortOrder: outputOptions.propertySortOrder ?? __orval_core.PropertySortOrder.SPECIFICATION
		},
		hooks: options.hooks ? normalizeHooks(options.hooks) : {}
	};
	if (!normalizedOptions.input.target) throw new Error(chalk.default.red(`Config require an input target`));
	if (!normalizedOptions.output.target && !normalizedOptions.output.schemas) throw new Error(chalk.default.red(`Config require an output target or schemas`));
	return normalizedOptions;
};
const parserDefaultOptions = {
	validate: true,
	resolve: {
		github: githubResolver,
		http: httpResolver
	}
};
const normalizeMutator = (workspace, mutator) => {
	if ((0, __orval_core.isObject)(mutator)) {
		if (!mutator.path) throw new Error(chalk.default.red(`Mutator need a path`));
		return {
			...mutator,
			path: __orval_core.upath.resolve(workspace, mutator.path),
			default: (mutator.default || !mutator.name) ?? false
		};
	}
	if ((0, __orval_core.isString)(mutator)) return {
		path: __orval_core.upath.resolve(workspace, mutator),
		default: true
	};
	return mutator;
};
const normalizePathOrUrl = (path$1, workspace) => {
	if ((0, __orval_core.isString)(path$1) && !(0, __orval_core.isUrl)(path$1)) return normalizePath(path$1, workspace);
	return path$1;
};
const normalizePath = (path$1, workspace) => {
	if (!(0, __orval_core.isString)(path$1)) return path$1;
	return __orval_core.upath.resolve(workspace, path$1);
};
const normalizeOperationsAndTags = (operationsOrTags, workspace, global) => {
	return Object.fromEntries(Object.entries(operationsOrTags).map(([key, { transformer, mutator, formData, formUrlEncoded, paramsSerializer, query: query$1, zod: zod$1,...rest }]) => {
		return [key, {
			...rest,
			...query$1 ? { query: normalizeQueryOptions(query$1, workspace, global.query) } : {},
			...zod$1 ? { zod: {
				strict: {
					param: zod$1.strict?.param ?? false,
					query: zod$1.strict?.query ?? false,
					header: zod$1.strict?.header ?? false,
					body: zod$1.strict?.body ?? false,
					response: zod$1.strict?.response ?? false
				},
				generate: {
					param: zod$1.generate?.param ?? true,
					query: zod$1.generate?.query ?? true,
					header: zod$1.generate?.header ?? true,
					body: zod$1.generate?.body ?? true,
					response: zod$1.generate?.response ?? true
				},
				coerce: {
					param: zod$1.coerce?.param ?? false,
					query: zod$1.coerce?.query ?? false,
					header: zod$1.coerce?.header ?? false,
					body: zod$1.coerce?.body ?? false,
					response: zod$1.coerce?.response ?? false
				},
				preprocess: {
					...zod$1.preprocess?.param ? { param: normalizeMutator(workspace, zod$1.preprocess.param) } : {},
					...zod$1.preprocess?.query ? { query: normalizeMutator(workspace, zod$1.preprocess.query) } : {},
					...zod$1.preprocess?.header ? { header: normalizeMutator(workspace, zod$1.preprocess.header) } : {},
					...zod$1.preprocess?.body ? { body: normalizeMutator(workspace, zod$1.preprocess.body) } : {},
					...zod$1.preprocess?.response ? { response: normalizeMutator(workspace, zod$1.preprocess.response) } : {}
				},
				generateEachHttpStatus: zod$1?.generateEachHttpStatus ?? false,
				dateTimeOptions: zod$1?.dateTimeOptions ?? {},
				timeOptions: zod$1?.timeOptions ?? {}
			} } : {},
			...transformer ? { transformer: normalizePath(transformer, workspace) } : {},
			...mutator ? { mutator: normalizeMutator(workspace, mutator) } : {},
			...createFormData(workspace, formData),
			...formUrlEncoded ? { formUrlEncoded: (0, __orval_core.isBoolean)(formUrlEncoded) ? formUrlEncoded : normalizeMutator(workspace, formUrlEncoded) } : {},
			...paramsSerializer ? { paramsSerializer: normalizeMutator(workspace, paramsSerializer) } : {}
		}];
	}));
};
const normalizeOutputMode = (mode) => {
	if (!mode) return __orval_core.OutputMode.SINGLE;
	if (!Object.values(__orval_core.OutputMode).includes(mode)) {
		(0, __orval_core.createLogger)().warn(chalk.default.yellow(`Unknown the provided mode => ${mode}`));
		return __orval_core.OutputMode.SINGLE;
	}
	return mode;
};
const normalizeHooks = (hooks) => {
	return Object.keys(hooks).reduce((acc, key) => {
		if ((0, __orval_core.isString)(hooks[key])) return {
			...acc,
			[key]: [hooks[key]]
		};
		else if (Array.isArray(hooks[key])) return {
			...acc,
			[key]: hooks[key]
		};
		else if ((0, __orval_core.isFunction)(hooks[key])) return {
			...acc,
			[key]: [hooks[key]]
		};
		else if ((0, __orval_core.isObject)(hooks[key])) return {
			...acc,
			[key]: [hooks[key]]
		};
		return acc;
	}, {});
};
const normalizeHonoOptions = (hono$1 = {}, workspace) => {
	return {
		...hono$1.handlers ? { handlers: __orval_core.upath.resolve(workspace, hono$1.handlers) } : {},
		compositeRoute: hono$1.compositeRoute ?? "",
		validator: hono$1.validator ?? true,
		validatorOutputPath: hono$1.validatorOutputPath ? __orval_core.upath.resolve(workspace, hono$1.validatorOutputPath) : ""
	};
};
const normalizeJSDocOptions = (jsdoc = {}) => {
	return { ...jsdoc };
};
const normalizeQueryOptions = (queryOptions = {}, outputWorkspace, globalOptions = {}) => {
	if (queryOptions.options) console.warn("[WARN] Using query options is deprecated and will be removed in a future major release. Please use queryOptions or mutationOptions instead.");
	return {
		...(0, __orval_core.isUndefined)(queryOptions.usePrefetch) ? {} : { usePrefetch: queryOptions.usePrefetch },
		...(0, __orval_core.isUndefined)(queryOptions.useInvalidate) ? {} : { useInvalidate: queryOptions.useInvalidate },
		...(0, __orval_core.isUndefined)(queryOptions.useQuery) ? {} : { useQuery: queryOptions.useQuery },
		...(0, __orval_core.isUndefined)(queryOptions.useSuspenseQuery) ? {} : { useSuspenseQuery: queryOptions.useSuspenseQuery },
		...(0, __orval_core.isUndefined)(queryOptions.useMutation) ? {} : { useMutation: queryOptions.useMutation },
		...(0, __orval_core.isUndefined)(queryOptions.useInfinite) ? {} : { useInfinite: queryOptions.useInfinite },
		...(0, __orval_core.isUndefined)(queryOptions.useSuspenseInfiniteQuery) ? {} : { useSuspenseInfiniteQuery: queryOptions.useSuspenseInfiniteQuery },
		...queryOptions.useInfiniteQueryParam ? { useInfiniteQueryParam: queryOptions.useInfiniteQueryParam } : {},
		...queryOptions.options ? { options: queryOptions.options } : {},
		...globalOptions.queryKey ? { queryKey: globalOptions.queryKey } : {},
		...queryOptions?.queryKey ? { queryKey: normalizeMutator(outputWorkspace, queryOptions?.queryKey) } : {},
		...globalOptions.queryOptions ? { queryOptions: globalOptions.queryOptions } : {},
		...queryOptions?.queryOptions ? { queryOptions: normalizeMutator(outputWorkspace, queryOptions?.queryOptions) } : {},
		...globalOptions.mutationOptions ? { mutationOptions: globalOptions.mutationOptions } : {},
		...queryOptions?.mutationOptions ? { mutationOptions: normalizeMutator(outputWorkspace, queryOptions?.mutationOptions) } : {},
		...(0, __orval_core.isUndefined)(globalOptions.shouldExportQueryKey) ? {} : { shouldExportQueryKey: globalOptions.shouldExportQueryKey },
		...(0, __orval_core.isUndefined)(queryOptions.shouldExportQueryKey) ? {} : { shouldExportQueryKey: queryOptions.shouldExportQueryKey },
		...(0, __orval_core.isUndefined)(globalOptions.shouldExportHttpClient) ? {} : { shouldExportHttpClient: globalOptions.shouldExportHttpClient },
		...(0, __orval_core.isUndefined)(queryOptions.shouldExportHttpClient) ? {} : { shouldExportHttpClient: queryOptions.shouldExportHttpClient },
		...(0, __orval_core.isUndefined)(globalOptions.shouldExportMutatorHooks) ? {} : { shouldExportMutatorHooks: globalOptions.shouldExportMutatorHooks },
		...(0, __orval_core.isUndefined)(queryOptions.shouldExportMutatorHooks) ? {} : { shouldExportMutatorHooks: queryOptions.shouldExportMutatorHooks },
		...(0, __orval_core.isUndefined)(globalOptions.shouldSplitQueryKey) ? {} : { shouldSplitQueryKey: globalOptions.shouldSplitQueryKey },
		...(0, __orval_core.isUndefined)(queryOptions.shouldSplitQueryKey) ? {} : { shouldSplitQueryKey: queryOptions.shouldSplitQueryKey },
		...(0, __orval_core.isUndefined)(globalOptions.signal) ? {} : { signal: globalOptions.signal },
		...(0, __orval_core.isUndefined)(globalOptions.useOperationIdAsQueryKey) ? {} : { useOperationIdAsQueryKey: globalOptions.useOperationIdAsQueryKey },
		...(0, __orval_core.isUndefined)(queryOptions.useOperationIdAsQueryKey) ? {} : { useOperationIdAsQueryKey: queryOptions.useOperationIdAsQueryKey },
		...(0, __orval_core.isUndefined)(globalOptions.signal) ? {} : { signal: globalOptions.signal },
		...(0, __orval_core.isUndefined)(queryOptions.signal) ? {} : { signal: queryOptions.signal },
		...(0, __orval_core.isUndefined)(globalOptions.version) ? {} : { version: globalOptions.version },
		...(0, __orval_core.isUndefined)(queryOptions.version) ? {} : { version: queryOptions.version }
	};
};
const getDefaultFilesHeader = ({ title, description: description$1, version: version$1 } = {}) => [
	`Generated by ${package_default.name} v${package_default.version} 🍺`,
	`Do not edit manually.`,
	...title ? [title] : [],
	...description$1 ? [description$1] : [],
	...version$1 ? [`OpenAPI spec version: ${version$1}`] : []
];

//#endregion
//#region src/utils/watcher.ts
const startWatcher = async (watchOptions, watchFn, defaultTarget = ".") => {
	if (!watchOptions) return;
	const { watch } = await import("chokidar");
	const ignored = ["**/{.git,node_modules}/**"];
	const watchPaths = typeof watchOptions === "boolean" ? defaultTarget : Array.isArray(watchOptions) ? watchOptions.filter((path$1) => typeof path$1 === "string") : watchOptions;
	(0, __orval_core.log)(`Watching for changes in ${Array.isArray(watchPaths) ? watchPaths.map((v) => "\"" + v + "\"").join(" | ") : "\"" + watchPaths + "\""}`);
	watch(watchPaths, {
		ignorePermissionErrors: true,
		ignored
	}).on("all", async (type$1, file) => {
		(0, __orval_core.log)(`Change detected: ${type$1} ${file}`);
		try {
			await watchFn();
		} catch (error) {
			(0, __orval_core.logError)(error);
		}
	});
};

//#endregion
//#region src/utils/execute-hook.ts
const executeHook = async (name$1, commands = [], args = []) => {
	(0, __orval_core.log)(chalk.default.white(`Running ${name$1} hook...`));
	for (const command of commands) try {
		if ((0, __orval_core.isString)(command)) await executeCommand(command, args);
		else if ((0, __orval_core.isFunction)(command)) await command(args);
		else if ((0, __orval_core.isObject)(command)) await executeObjectCommand(command, args);
	} catch (error) {
		(0, __orval_core.logError)(error, `Failed to run ${name$1} hook`);
	}
};
async function executeCommand(command, args) {
	const [cmd, ..._args] = [...(0, string_argv.parseArgsStringToArgv)(command), ...args];
	await (0, execa.default)(cmd, _args);
}
async function executeObjectCommand(command, args) {
	if (command.injectGeneratedDirsAndFiles === false) args = [];
	if ((0, __orval_core.isString)(command.command)) await executeCommand(command.command, args);
	else if ((0, __orval_core.isFunction)(command.command)) await command.command();
}

//#endregion
//#region src/write-specs.ts
const getHeader = (option, info) => {
	if (!option) return "";
	const header = option(info);
	return Array.isArray(header) ? (0, __orval_core.jsDoc)({ description: header }) : header;
};
const writeSpecs = async (builder, workspace, options, projectName) => {
	const { info = {
		title: "",
		version: 0
	}, schemas, target } = builder;
	const { output } = options;
	const projectTitle = projectName || info.title;
	const specsName = Object.keys(schemas).reduce((acc, specKey) => {
		acc[specKey] = __orval_core.upath.getSpecName(specKey, target).slice(1).split("/").join("-");
		return acc;
	}, {});
	const header = getHeader(output.override.header, info);
	if (output.schemas) {
		const rootSchemaPath = output.schemas;
		const fileExtension = [
			"tags",
			"tags-split",
			"split"
		].includes(output.mode) ? ".ts" : output.fileExtension ?? ".ts";
		await Promise.all(Object.entries(schemas).map(([specKey, schemas$1]) => {
			const schemaPath = (0, __orval_core.isRootKey)(specKey, target) ? rootSchemaPath : __orval_core.upath.join(rootSchemaPath, specsName[specKey]);
			return (0, __orval_core.writeSchemas)({
				schemaPath,
				schemas: schemas$1,
				target,
				namingConvention: output.namingConvention,
				fileExtension,
				specsName,
				specKey,
				isRootKey: (0, __orval_core.isRootKey)(specKey, target),
				header,
				indexFiles: output.indexFiles
			});
		}));
	}
	let implementationPaths = [];
	if (output.target) implementationPaths = await getWriteMode(output.mode)({
		builder,
		workspace,
		output,
		specsName,
		header,
		needSchema: !output.schemas && output.client !== "zod"
	});
	if (output.workspace) {
		const workspacePath = output.workspace;
		const imports = implementationPaths.filter((path$1) => !output.mock || !path$1.endsWith(`.${(0, __orval_core.getMockFileExtensionByTypeName)(output.mock)}.ts`)).map((path$1) => __orval_core.upath.relativeSafe(workspacePath, (0, __orval_core.getFileInfo)(path$1).pathWithoutExtension));
		if (output.schemas) imports.push(__orval_core.upath.relativeSafe(workspacePath, (0, __orval_core.getFileInfo)(output.schemas).dirname));
		if (output.indexFiles) {
			const indexFile = __orval_core.upath.join(workspacePath, "/index.ts");
			if (await fs_extra.default.pathExists(indexFile)) {
				const data = await fs_extra.default.readFile(indexFile, "utf8");
				const importsNotDeclared = imports.filter((imp) => !data.includes(imp));
				await fs_extra.default.appendFile(indexFile, (0, lodash_uniq.default)(importsNotDeclared).map((imp) => `export * from '${imp}';\n`).join(""));
			} else await fs_extra.default.outputFile(indexFile, (0, lodash_uniq.default)(imports).map((imp) => `export * from '${imp}';`).join("\n") + "\n");
			implementationPaths = [indexFile, ...implementationPaths];
		}
	}
	if (builder.extraFiles.length > 0) {
		await Promise.all(builder.extraFiles.map(async (file) => fs_extra.default.outputFile(file.path, file.content)));
		implementationPaths = [...implementationPaths, ...builder.extraFiles.map((file) => file.path)];
	}
	const paths = [...output.schemas ? [(0, __orval_core.getFileInfo)(output.schemas).dirname] : [], ...implementationPaths];
	if (options.hooks.afterAllFilesWrite) await executeHook("afterAllFilesWrite", options.hooks.afterAllFilesWrite, paths);
	if (output.prettier) try {
		await (0, execa.default)("prettier", ["--write", ...paths]);
	} catch {
		(0, __orval_core.log)(chalk.default.yellow(`⚠️  ${projectTitle ? `${projectTitle} - ` : ""}Globally installed prettier not found`));
	}
	if (output.biome) try {
		await (0, execa.default)("biome", [
			"check",
			"--write",
			...paths
		]);
	} catch (error) {
		const errorExeca = error;
		const message = errorExeca.exitCode === 1 ? errorExeca.stdout + errorExeca.stderr : `⚠️  ${projectTitle ? `${projectTitle} - ` : ""}biome not found`;
		(0, __orval_core.log)(chalk.default.yellow(message));
	}
	if (output.docs) try {
		let config = {};
		let configPath = null;
		if (typeof output.docs === "object") {
			({configPath = null, ...config} = output.docs);
			if (configPath) config.options = configPath;
		}
		const getTypedocApplication = async () => {
			const { Application } = await import("typedoc");
			return Application;
		};
		const app = await (await getTypedocApplication()).bootstrapWithPlugins({
			entryPoints: paths,
			theme: "markdown",
			...config,
			plugin: ["typedoc-plugin-markdown", ...config.plugin ?? []]
		});
		if (!app.options.isSet("readme")) app.options.setValue("readme", "none");
		if (!app.options.isSet("logLevel")) app.options.setValue("logLevel", "None");
		const project = await app.convert();
		if (project) await app.generateDocs(project, app.options.getValue("out"));
		else throw new Error("TypeDoc not initialized");
	} catch (error) {
		const message = error instanceof Error ? error.message : `⚠️  ${projectTitle ? `${projectTitle} - ` : ""}Unable to generate docs`;
		(0, __orval_core.log)(chalk.default.yellow(message));
	}
	(0, __orval_core.createSuccessMessage)(projectTitle);
};
const getWriteMode = (mode) => {
	switch (mode) {
		case __orval_core.OutputMode.SPLIT: return __orval_core.writeSplitMode;
		case __orval_core.OutputMode.TAGS: return __orval_core.writeTagsMode;
		case __orval_core.OutputMode.TAGS_SPLIT: return __orval_core.writeSplitTagsMode;
		case __orval_core.OutputMode.SINGLE:
		default: return __orval_core.writeSingleMode;
	}
};

//#endregion
//#region src/generate.ts
const generateSpec = async (workspace, options, projectName) => {
	if (options.output.clean) {
		const extraPatterns = Array.isArray(options.output.clean) ? options.output.clean : [];
		if (options.output.target) await (0, __orval_core.removeFilesAndEmptyFolders)([
			"**/*",
			"!**/*.d.ts",
			...extraPatterns
		], (0, __orval_core.getFileInfo)(options.output.target).dirname);
		if (options.output.schemas) await (0, __orval_core.removeFilesAndEmptyFolders)([
			"**/*",
			"!**/*.d.ts",
			...extraPatterns
		], (0, __orval_core.getFileInfo)(options.output.schemas).dirname);
		(0, __orval_core.log)(`${projectName ? `${projectName}: ` : ""}Cleaning output folder`);
	}
	const writeSpecBuilder = await importSpecs(workspace, options);
	await writeSpecs(writeSpecBuilder, workspace, options, projectName);
};
const generateSpecs = async (config, workspace, projectName) => {
	if (projectName) {
		const options = config[projectName];
		if (options) try {
			await generateSpec(workspace, options, projectName);
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : "unknown error";
			throw new __orval_core.ErrorWithTag(errorMsg, projectName, { cause: error });
		}
		else throw new Error("Project not found");
		return;
	}
	let hasErrors;
	for (const [projectName$1, options] of Object.entries(config)) {
		if (!options) {
			hasErrors = true;
			(0, __orval_core.logError)("No options found", projectName$1);
			continue;
		}
		try {
			await generateSpec(workspace, options, projectName$1);
		} catch (error) {
			hasErrors = true;
			(0, __orval_core.logError)(error, projectName$1);
		}
	}
	if (hasErrors) throw new Error("One or more project failed, see above for details");
};
function findConfigFile(configFilePath) {
	if (configFilePath) {
		const absolutePath = node_path.default.isAbsolute(configFilePath) ? configFilePath : node_path.default.resolve(node_process.default.cwd(), configFilePath);
		if (!node_fs.default.existsSync(absolutePath)) throw new Error(`Config file ${configFilePath} does not exist`);
		return absolutePath;
	}
	const root = node_process.default.cwd();
	for (const ext of [
		".ts",
		".js",
		".mjs",
		".cjs"
	]) {
		const fullPath = node_path.default.resolve(root, `orval.config${ext}`);
		if (node_fs.default.existsSync(fullPath)) return fullPath;
	}
	throw new Error(`No config file found in ${root}`);
}
async function loadConfigFile(configFilePath) {
	const module$1 = await (0, jiti.createJiti)(require("url").pathToFileURL(__filename).href, { interopDefault: true }).import(configFilePath, { default: true });
	if (module$1 === void 0) throw new Error(`${configFilePath} doesn't have a default export`);
	return await Promise.resolve(module$1);
}
const generateConfig = async (configFile, options) => {
	const configFilePath = findConfigFile(configFile);
	let configExternal;
	try {
		configExternal = await loadConfigFile(configFilePath);
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : "unknown error";
		throw new Error(`failed to load from ${configFilePath} => ${errorMsg}`);
	}
	const workspace = node_path.default.dirname(configFilePath);
	const config = await ((0, __orval_core.isFunction)(configExternal) ? configExternal() : configExternal);
	const normalizedConfig = await (0, __orval_core.asyncReduce)(Object.entries(config), async (acc, [key, value]) => {
		acc[key] = await normalizeOptions(value, workspace, options);
		return acc;
	}, {});
	const fileToWatch = Object.entries(normalizedConfig).filter(([project]) => options?.projectName === void 0 || project === options.projectName).map(([, options$1]) => options$1?.input.target).filter((target) => (0, __orval_core.isString)(target));
	await (options?.watch && fileToWatch.length > 0 ? startWatcher(options.watch, () => generateSpecs(normalizedConfig, workspace, options.projectName), fileToWatch) : generateSpecs(normalizedConfig, workspace, options?.projectName));
};

//#endregion
Object.defineProperty(exports, '__toESM', {
  enumerable: true,
  get: function () {
    return __toESM;
  }
});
Object.defineProperty(exports, 'defineConfig', {
  enumerable: true,
  get: function () {
    return defineConfig;
  }
});
Object.defineProperty(exports, 'generateConfig', {
  enumerable: true,
  get: function () {
    return generateConfig;
  }
});
Object.defineProperty(exports, 'generateSpec', {
  enumerable: true,
  get: function () {
    return generateSpec;
  }
});
Object.defineProperty(exports, 'normalizeOptions', {
  enumerable: true,
  get: function () {
    return normalizeOptions;
  }
});
Object.defineProperty(exports, 'package_default', {
  enumerable: true,
  get: function () {
    return package_default;
  }
});
Object.defineProperty(exports, 'startWatcher', {
  enumerable: true,
  get: function () {
    return startWatcher;
  }
});
//# sourceMappingURL=generate-C06u8D0b.js.map