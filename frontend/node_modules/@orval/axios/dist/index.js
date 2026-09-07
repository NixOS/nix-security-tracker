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

//#region src/index.ts
const AXIOS_DEPENDENCIES = [{
	exports: [
		{
			name: "axios",
			default: true,
			values: true,
			syntheticDefaultImport: true
		},
		{ name: "AxiosRequestConfig" },
		{ name: "AxiosResponse" }
	],
	dependency: "axios"
}];
const PARAMS_SERIALIZER_DEPENDENCIES = [{
	exports: [{
		name: "qs",
		default: true,
		values: true,
		syntheticDefaultImport: true
	}],
	dependency: "qs"
}];
const returnTypesToWrite = /* @__PURE__ */ new Map();
const getAxiosDependencies = (hasGlobalMutator, hasParamsSerializerOptions) => [...hasGlobalMutator ? [] : AXIOS_DEPENDENCIES, ...hasParamsSerializerOptions ? PARAMS_SERIALIZER_DEPENDENCIES : []];
const generateAxiosImplementation = ({ headers, queryParams, operationName, response, mutator, body, props, verb, override, formData, formUrlEncoded, paramsSerializer }, { route, context }) => {
	const isRequestOptions = override?.requestOptions !== false;
	const isFormData = !override?.formData.disabled;
	const isFormUrlEncoded = override?.formUrlEncoded !== false;
	const isExactOptionalPropertyTypes = !!context.output.tsconfig?.compilerOptions?.exactOptionalPropertyTypes;
	const isSyntheticDefaultImportsAllowed = (0, __orval_core.isSyntheticDefaultImportsAllow)(context.output.tsconfig);
	const bodyForm = (0, __orval_core.generateFormDataAndUrlEncodedFunction)({
		formData,
		formUrlEncoded,
		body,
		isFormData,
		isFormUrlEncoded
	});
	if (mutator) {
		const mutatorConfig = (0, __orval_core.generateMutatorConfig)({
			route,
			body,
			headers,
			queryParams,
			response,
			verb,
			isFormData,
			isFormUrlEncoded,
			hasSignal: false,
			isExactOptionalPropertyTypes
		});
		const requestOptions = isRequestOptions ? (0, __orval_core.generateMutatorRequestOptions)(override?.requestOptions, mutator.hasSecondArg) : "";
		returnTypesToWrite.set(operationName, (title) => `export type ${(0, __orval_core.pascal)(operationName)}Result = NonNullable<Awaited<ReturnType<${title ? `ReturnType<typeof ${title}>['${operationName}']` : `typeof ${operationName}`}>>>`);
		const propsImplementation = mutator.bodyTypeName && body.definition ? (0, __orval_core.toObjectString)(props, "implementation").replace(/* @__PURE__ */ new RegExp(`(\\w*):\\s?${body.definition}`), `$1: ${mutator.bodyTypeName}<${body.definition}>`) : (0, __orval_core.toObjectString)(props, "implementation");
		return `const ${operationName} = (\n    ${propsImplementation}\n ${isRequestOptions && mutator.hasSecondArg ? `options${context.output.optionsParamRequired ? "" : "?"}: SecondParameter<typeof ${mutator.name}<${response.definition.success || "unknown"}>>,` : ""}) => {${bodyForm}
      return ${mutator.name}<${response.definition.success || "unknown"}>(
      ${mutatorConfig},
      ${requestOptions});
    }
  `;
	}
	const options = (0, __orval_core.generateOptions)({
		route,
		body,
		headers,
		queryParams,
		response,
		verb,
		requestOptions: override?.requestOptions,
		isFormData,
		isFormUrlEncoded,
		paramsSerializer,
		paramsSerializerOptions: override?.paramsSerializerOptions,
		isExactOptionalPropertyTypes,
		hasSignal: false
	});
	returnTypesToWrite.set(operationName, () => `export type ${(0, __orval_core.pascal)(operationName)}Result = AxiosResponse<${response.definition.success || "unknown"}>`);
	return `const ${operationName} = <TData = AxiosResponse<${response.definition.success || "unknown"}>>(\n    ${(0, __orval_core.toObjectString)(props, "implementation")} ${isRequestOptions ? `options?: AxiosRequestConfig\n` : ""} ): Promise<TData> => {${bodyForm}
    return axios${isSyntheticDefaultImportsAllowed ? "" : ".default"}.${verb}(${options});
  }
`;
};
const generateAxiosTitle = (title) => {
	const sanTitle = (0, __orval_core.sanitize)(title);
	return `get${(0, __orval_core.pascal)(sanTitle)}`;
};
const generateAxiosHeader = ({ title, isRequestOptions, isMutator, noFunction }) => `
${isRequestOptions && isMutator ? `type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];\n\n` : ""}
  ${noFunction ? "" : `export const ${title} = () => {\n`}`;
const generateAxiosFooter = ({ operationNames, title, noFunction, hasMutator, hasAwaitedType }) => {
	let footer = "";
	if (!noFunction) footer += `return {${operationNames.join(",")}}};\n`;
	if (hasMutator && !hasAwaitedType) footer += `\ntype AwaitedInput<T> = PromiseLike<T> | T;\n
    type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
\n`;
	for (const operationName of operationNames) if (returnTypesToWrite.has(operationName)) {
		const func = returnTypesToWrite.get(operationName);
		footer += func(noFunction ? void 0 : title) + "\n";
	}
	return footer;
};
const generateAxios = (verbOptions, options) => {
	const imports = (0, __orval_core.generateVerbImports)(verbOptions);
	return {
		implementation: generateAxiosImplementation(verbOptions, options),
		imports
	};
};
const generateAxiosFunctions = async (verbOptions, options) => {
	const { implementation, imports } = generateAxios(verbOptions, options);
	return {
		implementation: "export " + implementation,
		imports
	};
};
const axiosClientBuilder = {
	client: generateAxios,
	header: generateAxiosHeader,
	dependencies: getAxiosDependencies,
	footer: generateAxiosFooter,
	title: generateAxiosTitle
};
const axiosFunctionsClientBuilder = {
	client: generateAxiosFunctions,
	header: (options) => generateAxiosHeader({
		...options,
		noFunction: true
	}),
	dependencies: getAxiosDependencies,
	footer: (options) => generateAxiosFooter({
		...options,
		noFunction: true
	}),
	title: generateAxiosTitle
};
const builders = {
	axios: axiosClientBuilder,
	"axios-functions": axiosFunctionsClientBuilder
};
const builder = ({ type = "axios-functions" } = {}) => () => builders[type];
var src_default = builder;

//#endregion
exports.builder = builder;
exports.default = src_default;
exports.generateAxios = generateAxios;
exports.generateAxiosFooter = generateAxiosFooter;
exports.generateAxiosFunctions = generateAxiosFunctions;
exports.generateAxiosHeader = generateAxiosHeader;
exports.generateAxiosTitle = generateAxiosTitle;
exports.getAxiosDependencies = getAxiosDependencies;
//# sourceMappingURL=index.js.map