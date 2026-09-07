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
let __orval_fetch = require("@orval/fetch");
__orval_fetch = __toESM(__orval_fetch);
let __orval_zod = require("@orval/zod");
__orval_zod = __toESM(__orval_zod);
require("openapi3-ts/oas30");

//#region src/index.ts
const getHeader = (option, info) => {
	if (!option) return "";
	const header = option(info);
	return Array.isArray(header) ? (0, __orval_core.jsDoc)({ description: header }) : header;
};
const getMcpHeader = ({ verbOptions, output, clientImplementation }) => {
	const targetInfo = (0, __orval_core.getFileInfo)(output.target);
	const schemaInfo = (0, __orval_core.getFileInfo)(output.schemas);
	const relativeSchemaImportPath = output.schemas ? __orval_core.upath.relativeSafe(targetInfo.dirname, schemaInfo.dirname) : "./" + targetInfo.filename + ".schemas";
	const importSchemasImplementation = `import {\n  ${Object.values(verbOptions).flatMap((verbOption) => {
		const imports = [];
		const pascalOperationName = (0, __orval_core.pascal)(verbOption.operationName);
		if (verbOption.queryParams) imports.push(`${pascalOperationName}Params`);
		if (verbOption.body.definition) imports.push(`${pascalOperationName}Body`);
		return imports;
	}).reduce((acc, name) => {
		if (!acc.find((i) => i === name)) acc.push(name);
		return acc;
	}, []).join(",\n  ")}\n} from '${relativeSchemaImportPath}';
`;
	const importFetchClientImplementation = `import {\n  ${Object.values(verbOptions).flatMap((verbOption) => verbOption.operationName).reduce((acc, name) => {
		if (!acc.find((i) => i === name)) acc.push(name);
		return acc;
	}, []).join(",\n  ")}\n} from './http-client';
  `;
	return [importSchemasImplementation, importFetchClientImplementation].join("\n") + "\n";
};
const generateMcp = async (verbOptions, options) => {
	const handlerArgsTypes = [];
	const pathParamsType = verbOptions.params.map((param) => {
		const paramName = param.name.split(": ")[0];
		const paramType = param.implementation.split(": ")[1];
		return `    ${paramName}: ${paramType}`;
	}).join(",\n");
	if (pathParamsType) handlerArgsTypes.push(`  pathParams: {\n${pathParamsType}\n  };`);
	if (verbOptions.queryParams) handlerArgsTypes.push(`  queryParams: ${verbOptions.queryParams.schema.name};`);
	if (verbOptions.body.definition) handlerArgsTypes.push(`  bodyParams: ${verbOptions.body.definition};`);
	const handlerArgsName = `${verbOptions.operationName}Args`;
	const handlerArgsImplementation = handlerArgsTypes.length > 0 ? `
export type ${handlerArgsName} = {
${handlerArgsTypes.join("\n")}
}
` : "";
	const fetchParams = [];
	if (verbOptions.params.length > 0) {
		const pathParamsArgs = verbOptions.params.map((param) => {
			return `args.pathParams.${param.name.split(": ")[0]}`;
		}).join(", ");
		fetchParams.push(pathParamsArgs);
	}
	if (verbOptions.body.definition) fetchParams.push(`args.bodyParams`);
	if (verbOptions.queryParams) fetchParams.push(`args.queryParams`);
	const handlerImplementation = `
export const ${`${verbOptions.operationName}Handler`} = async (${handlerArgsTypes.length > 0 ? `args: ${handlerArgsName}` : ""}) => {
  const res = await ${verbOptions.operationName}(${fetchParams.join(", ")});

  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(res),
      },
    ],
  };
};`;
	const handlersImplementation = [handlerArgsImplementation, handlerImplementation].join("");
	return {
		implementation: handlersImplementation ? `${handlersImplementation}\n` : "",
		imports: []
	};
};
const generateServer = async (verbOptions, output, context) => {
	const info = context.specs[context.specKey].info;
	const { extension, dirname } = (0, __orval_core.getFileInfo)(output.target);
	const serverPath = __orval_core.upath.join(dirname, `server${extension}`);
	const header = getHeader(output.override.header, info);
	const toolImplementations = Object.values(verbOptions).map((verbOption) => {
		const inputSchemaTypes = [];
		if (verbOption.params.length > 0) inputSchemaTypes.push(`  pathParams: ${verbOption.operationName}Params`);
		if (verbOption.queryParams) inputSchemaTypes.push(`  queryParams: ${verbOption.operationName}QueryParams`);
		if (verbOption.body.definition) inputSchemaTypes.push(`  bodyParams: ${verbOption.operationName}Body`);
		const inputSchemaImplementation = inputSchemaTypes.length > 0 ? `  {
  ${inputSchemaTypes.join(",\n  ")}
  },` : "";
		return `
server.tool(
  '${(0, __orval_core.jsStringEscape)(verbOption.operationName)}',
  '${(0, __orval_core.jsStringEscape)(verbOption.summary)}',${inputSchemaImplementation ? `\n${inputSchemaImplementation}` : ""}
  ${(0, __orval_core.jsStringEscape)(verbOption.operationName)}Handler
);`;
	}).join("\n");
	const importToolSchemasImplementation = `import {\n${Object.values(verbOptions).flatMap((verbOption) => {
		const imports = [];
		if (verbOption.headers) imports.push(`  ${verbOption.operationName}Header`);
		if (verbOption.params.length > 0) imports.push(`  ${verbOption.operationName}Params`);
		if (verbOption.queryParams) imports.push(`  ${verbOption.operationName}QueryParams`);
		if (verbOption.body.definition) imports.push(`  ${verbOption.operationName}Body`);
		return imports;
	}).join(",\n")}\n} from './tool-schemas.zod';`;
	const importHandlersImplementation = `import {\n${Object.values(verbOptions).filter((verbOption) => toolImplementations.includes(`${verbOption.operationName}Handler`)).map((verbOption) => `  ${verbOption.operationName}Handler`).join(`,\n`)}\n} from './handlers';`;
	const importDependenciesImplementation = `import {
  McpServer
} from '@modelcontextprotocol/sdk/server/mcp.js';
  
import {
  StdioServerTransport
} from '@modelcontextprotocol/sdk/server/stdio.js';  
`;
	const newMcpServerImplementation = `
const server = new McpServer({
  name: '${(0, __orval_core.camel)(info.title)}Server',
  version: '1.0.0',
});
`;
	return [{
		content: [
			header,
			importDependenciesImplementation,
			importHandlersImplementation,
			importToolSchemasImplementation,
			newMcpServerImplementation,
			toolImplementations,
			`
const transport = new StdioServerTransport();

server.connect(transport).then(() => {
  console.error('MCP server running on stdio');
}).catch(console.error);
`
		].join("\n"),
		path: serverPath
	}];
};
const generateZodFiles = async (verbOptions, output, context) => {
	const { extension, dirname, filename } = (0, __orval_core.getFileInfo)(output.target);
	const header = getHeader(output.override.header, context.specs[context.specKey].info);
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
	const zodPath = __orval_core.upath.join(dirname, `tool-schemas.zod${extension}`);
	content += zods.map((zod) => zod.implementation).join("\n");
	return [{
		content,
		path: zodPath
	}];
};
const generateHttpClinetFiles = async (verbOptions, output, context) => {
	const { extension, dirname, filename } = (0, __orval_core.getFileInfo)(output.target);
	const header = getHeader(output.override.header, context.specs[context.specKey].info);
	const clients = await Promise.all(Object.values(verbOptions).map((verbOption) => {
		const options = {
			route: (0, __orval_core.getFullRoute)(verbOption.route, context.specs[context.specKey].servers, output.baseUrl),
			pathRoute: verbOption.pathRoute,
			override: output.override,
			context,
			mock: output.mock,
			output: output.target
		};
		return (0, __orval_fetch.generateClient)(verbOption, options, output.client, output);
	}));
	const clientImplementation = clients.map((client) => client.implementation).join("\n");
	const relativeSchemasPath = output.schemas ? __orval_core.upath.relativeSafe(dirname, (0, __orval_core.getFileInfo)(output.schemas).dirname) : "./" + filename + ".schemas";
	const importImplementation = `import { ${clients.flatMap((client) => client.imports).reduce((acc, imp) => {
		if (!acc.find((i) => i === imp.name)) acc.push(imp.name);
		return acc;
	}, []).join(",\n")} } from '${relativeSchemasPath}';`;
	const fetchHeader = (0, __orval_fetch.generateFetchHeader)({
		title: "",
		isRequestOptions: false,
		isMutator: false,
		noFunction: false,
		isGlobalMutator: false,
		provideIn: false,
		hasAwaitedType: false,
		output,
		verbOptions,
		clientImplementation
	});
	const content = [
		header,
		importImplementation,
		fetchHeader,
		clientImplementation
	].join("\n");
	const outputPath = __orval_core.upath.join(dirname, `http-client${extension}`);
	return [{
		content,
		path: outputPath
	}];
};
const generateExtraFiles = async (verbOptions, output, context) => {
	const [server, zods, httpClients] = await Promise.all([
		generateServer(verbOptions, output, context),
		generateZodFiles(verbOptions, output, context),
		generateHttpClinetFiles(verbOptions, output, context)
	]);
	return [
		...server,
		...zods,
		...httpClients
	];
};
const mcpClientBuilder = {
	client: generateMcp,
	header: getMcpHeader,
	extraFiles: generateExtraFiles
};
const builder = () => () => mcpClientBuilder;
var src_default = builder;

//#endregion
exports.builder = builder;
exports.default = src_default;
exports.generateExtraFiles = generateExtraFiles;
exports.generateMcp = generateMcp;
exports.generateServer = generateServer;
exports.getMcpHeader = getMcpHeader;
//# sourceMappingURL=index.js.map