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

//#region src/client.ts
const AXIOS_DEPENDENCIES = [{
	exports: [
		{
			name: "axios",
			default: true,
			values: true,
			syntheticDefaultImport: true
		},
		{ name: "AxiosRequestConfig" },
		{ name: "AxiosResponse" },
		{ name: "AxiosError" }
	],
	dependency: "axios"
}];
const generateSwrRequestFunction = (verbOptions, options) => {
	return options.context.output.httpClient === __orval_core.OutputHttpClient.AXIOS ? generateAxiosRequestFunction(verbOptions, options) : (0, __orval_fetch.generateRequestFunction)(verbOptions, options);
};
const generateAxiosRequestFunction = ({ headers, queryParams, operationName, response, mutator, body, props, verb, formData, formUrlEncoded, override, paramsSerializer }, { route, context }) => {
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
		const propsImplementation = mutator?.bodyTypeName && body.definition ? (0, __orval_core.toObjectString)(props, "implementation").replace(/* @__PURE__ */ new RegExp(`(\\w*):\\s?${body.definition}`), `$1: ${mutator.bodyTypeName}<${body.definition}>`) : (0, __orval_core.toObjectString)(props, "implementation");
		const requestOptions = isRequestOptions ? (0, __orval_core.generateMutatorRequestOptions)(override?.requestOptions, mutator.hasSecondArg) : "";
		return `export const ${operationName} = (\n    ${propsImplementation}\n ${isRequestOptions && mutator.hasSecondArg ? `options${context.output.optionsParamRequired ? "" : "?"}: SecondParameter<typeof ${mutator.name}>` : ""}) => {${bodyForm}
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
	return `export const ${operationName} = (\n    ${(0, __orval_core.toObjectString)(props, "implementation")} ${isRequestOptions ? `options?: AxiosRequestConfig\n` : ""} ): Promise<AxiosResponse<${response.definition.success || "unknown"}>> => {${bodyForm}
    return axios${isSyntheticDefaultImportsAllowed ? "" : ".default"}.${verb}(${options});
  }
`;
};
const getSwrRequestOptions = (httpClient, mutator) => {
	if (!mutator) return httpClient === __orval_core.OutputHttpClient.AXIOS ? "axios?: AxiosRequestConfig" : "fetch?: RequestInit";
	else if (mutator?.hasSecondArg) return `request?: SecondParameter<typeof ${mutator.name}>`;
	else return "";
};
const dedupeUnionTypes = (types) => {
	if (!types) return types;
	return [...new Set(types.split("|").map((t) => t.trim()).filter(Boolean))].join(" | ");
};
const getSwrErrorType = (response, httpClient, mutator) => {
	const errorsType = dedupeUnionTypes(response.definition.errors || "unknown");
	if (mutator) return mutator.hasErrorType ? `ErrorType<${errorsType}>` : errorsType;
	else return `${httpClient === __orval_core.OutputHttpClient.AXIOS ? "AxiosError" : "Promise"}<${errorsType}>`;
};
const getSwrRequestSecondArg = (httpClient, mutator) => {
	if (!mutator) return httpClient === __orval_core.OutputHttpClient.AXIOS ? "axios: axiosOptions" : "fetch: fetchOptions";
	else if (mutator?.hasSecondArg) return "request: requestOptions";
	else return "";
};
const getHttpRequestSecondArg = (httpClient, mutator) => {
	if (!mutator) return httpClient === __orval_core.OutputHttpClient.AXIOS ? `axiosOptions` : `fetchOptions`;
	else if (mutator?.hasSecondArg) return "requestOptions";
	else return "";
};
const getSwrMutationFetcherOptionType = (httpClient, mutator) => {
	if (!mutator) return httpClient === __orval_core.OutputHttpClient.AXIOS ? "AxiosRequestConfig" : "RequestInit";
	else if (mutator.hasSecondArg) return `SecondParameter<typeof ${mutator.name}>`;
	else return "";
};
const getSwrMutationFetcherType = (response, httpClient, includeHttpResponseReturnType, operationName, mutator) => {
	if (httpClient === __orval_core.OutputHttpClient.FETCH) return `Promise<${(0, __orval_fetch.fetchResponseTypeName)(includeHttpResponseReturnType, response.definition.success, operationName)}>`;
	else if (mutator) return `Promise<${response.definition.success || "unknown"}>`;
	else return `Promise<AxiosResponse<${response.definition.success || "unknown"}>>`;
};
const getSwrHeader = (params) => {
	return params.output.httpClient === __orval_core.OutputHttpClient.FETCH ? (0, __orval_fetch.generateFetchHeader)(params) : "";
};

//#endregion
//#region src/index.ts
const PARAMS_SERIALIZER_DEPENDENCIES = [{
	exports: [{
		name: "qs",
		default: true,
		values: true,
		syntheticDefaultImport: true
	}],
	dependency: "qs"
}];
const SWR_DEPENDENCIES = [{
	exports: [
		{
			name: "useSwr",
			values: true,
			default: true
		},
		{ name: "SWRConfiguration" },
		{ name: "Key" },
		{ name: "Arguments" }
	],
	dependency: "swr"
}];
const SWR_INFINITE_DEPENDENCIES = [{
	exports: [
		{
			name: "useSWRInfinite",
			values: true,
			default: true
		},
		{ name: "SWRInfiniteConfiguration" },
		{ name: "SWRInfiniteKeyLoader" }
	],
	dependency: "swr/infinite"
}];
const SWR_MUTATION_DEPENDENCIES = [{
	exports: [
		{
			name: "useSWRMutation",
			values: true,
			default: true
		},
		{ name: "SWRMutationConfiguration" },
		{ name: "SWRMutationKey" }
	],
	dependency: "swr/mutation"
}];
const getSwrDependencies = (hasGlobalMutator, hasParamsSerializerOptions, _packageJson, httpClient) => [
	...!hasGlobalMutator && httpClient === __orval_core.OutputHttpClient.AXIOS ? AXIOS_DEPENDENCIES : [],
	...hasParamsSerializerOptions ? PARAMS_SERIALIZER_DEPENDENCIES : [],
	...SWR_DEPENDENCIES,
	...SWR_INFINITE_DEPENDENCIES,
	...SWR_MUTATION_DEPENDENCIES
];
const generateSwrArguments = ({ operationName, mutator, isRequestOptions, isInfinite, httpClient }) => {
	const definition = `${isInfinite ? "SWRInfiniteConfiguration" : "SWRConfiguration"}<Awaited<ReturnType<typeof ${operationName}>>, TError> & ${isInfinite ? "{ swrKeyLoader?: SWRInfiniteKeyLoader, enabled?: boolean }" : "{ swrKey?: Key, enabled?: boolean }"}`;
	if (!isRequestOptions) return `swrOptions?: ${definition}`;
	return `options?: { swr?:${definition}, ${getSwrRequestOptions(httpClient, mutator)} }\n`;
};
const generateSwrMutationArguments = ({ operationName, isRequestOptions, mutator, swrBodyType, httpClient }) => {
	const definition = `SWRMutationConfiguration<Awaited<ReturnType<typeof ${operationName}>>, TError, Key, ${swrBodyType}, Awaited<ReturnType<typeof ${operationName}>>> & { swrKey?: string }`;
	if (!isRequestOptions) return `swrOptions?: ${definition}`;
	return `options?: { swr?:${definition}, ${getSwrRequestOptions(httpClient, mutator)}}\n`;
};
const generateSwrImplementation = ({ operationName, swrKeyFnName, swrKeyLoaderFnName, swrProperties, swrKeyProperties, params, mutator, isRequestOptions, response, swrOptions, props, doc, httpClient, pathOnlyParams, headerOnlyParams, hasQueryParams, queryParamType }) => {
	const swrProps = (0, __orval_core.toObjectString)(props, "implementation");
	const queryResultVarName = props.some((prop) => prop.name === "query") ? "_query" : "query";
	const httpFunctionProps = swrProperties;
	const enabledImplementation = `const isEnabled = swrOptions?.enabled !== false${params.length ? ` && !!(${params.map(({ name }) => name).join(" && ")})` : ""}`;
	const swrKeyImplementation = `const swrKey = swrOptions?.swrKey ?? (() => isEnabled ? ${swrKeyFnName}(${swrKeyProperties}) : null);`;
	const swrKeyLoaderImplementation = `const swrKeyLoader = swrOptions?.swrKeyLoader ?? (isEnabled ? ${swrKeyLoaderFnName}(${swrKeyProperties}) : () => null);`;
	const errorType = getSwrErrorType(response, httpClient, mutator);
	const swrRequestSecondArg = getSwrRequestSecondArg(httpClient, mutator);
	const httpRequestSecondArg = getHttpRequestSecondArg(httpClient, mutator);
	const useSWRInfiniteImplementation = swrOptions.useInfinite ? `
export type ${(0, __orval_core.pascal)(operationName)}InfiniteQueryResult = NonNullable<Awaited<ReturnType<typeof ${operationName}>>>
export type ${(0, __orval_core.pascal)(operationName)}InfiniteError = ${errorType}

${doc}export const ${(0, __orval_core.camel)(`use-${operationName}-infinite`)} = <TError = ${errorType}>(
  ${swrProps} ${generateSwrArguments({
		operationName,
		mutator,
		isRequestOptions,
		isInfinite: true,
		httpClient
	})}) => {
  ${isRequestOptions ? `const {swr: swrOptions${swrRequestSecondArg ? `, ${swrRequestSecondArg}` : ""}} = options ?? {}` : ""}

  ${enabledImplementation}
  ${swrKeyLoaderImplementation}
  const swrFn = ${hasQueryParams ? `([_url, pageParams]: [string, ${queryParamType} & { page: number }]) => ${operationName}(${pathOnlyParams}${pathOnlyParams ? ", " : ""}pageParams${headerOnlyParams ? ", " + headerOnlyParams : ""}${httpRequestSecondArg ? ", " + httpRequestSecondArg : ""})` : `([_url]: [string]) => ${operationName}(${pathOnlyParams}${headerOnlyParams ? (pathOnlyParams ? ", " : "") + headerOnlyParams : ""}${httpRequestSecondArg ? (pathOnlyParams || headerOnlyParams ? ", " : "") + httpRequestSecondArg : ""})`}

  const ${queryResultVarName} = useSWRInfinite<Awaited<ReturnType<typeof swrFn>>, TError>(swrKeyLoader, swrFn, ${swrOptions.swrInfiniteOptions ? `{
    ${(0, __orval_core.stringify)(swrOptions.swrInfiniteOptions)?.slice(1, -1)}
    ...swrOptions
  }` : "swrOptions"})

  return {
    swrKeyLoader,
    ...${queryResultVarName}
  }
}\n` : "";
	const useSwrImplementation = `
export type ${(0, __orval_core.pascal)(operationName)}QueryResult = NonNullable<Awaited<ReturnType<typeof ${operationName}>>>
export type ${(0, __orval_core.pascal)(operationName)}QueryError = ${errorType}

${doc}export const ${(0, __orval_core.camel)(`use-${operationName}`)} = <TError = ${errorType}>(
  ${swrProps} ${generateSwrArguments({
		operationName,
		mutator,
		isRequestOptions,
		isInfinite: false,
		httpClient
	})}) => {
  ${isRequestOptions ? `const {swr: swrOptions${swrRequestSecondArg ? `, ${swrRequestSecondArg}` : ""}} = options ?? {}` : ""}

  ${enabledImplementation}
  ${swrKeyImplementation}
  const swrFn = () => ${operationName}(${httpFunctionProps}${httpFunctionProps && httpRequestSecondArg ? ", " : ""}${httpRequestSecondArg})

  const ${queryResultVarName} = useSwr<Awaited<ReturnType<typeof swrFn>>, TError>(swrKey, swrFn, ${swrOptions.swrOptions ? `{
    ${(0, __orval_core.stringify)(swrOptions.swrOptions)?.slice(1, -1)}
    ...swrOptions
  }` : "swrOptions"})

  return {
    swrKey,
    ...${queryResultVarName}
  }
}\n`;
	return useSWRInfiniteImplementation + useSwrImplementation;
};
const generateSwrMutationImplementation = ({ isRequestOptions, operationName, swrKeyFnName, swrMutationFetcherName, swrKeyProperties, swrMutationFetcherProperties, swrProps, props, response, mutator, swrOptions, doc, swrBodyType, httpClient, verb }) => {
	const queryResultVarName = props.some((prop) => prop.name === "query") ? "_query" : "query";
	const swrKeyImplementation = `const swrKey = swrOptions?.swrKey ?? ${swrKeyFnName}(${swrKeyProperties});`;
	const errorType = getSwrErrorType(response, httpClient, mutator);
	const swrRequestSecondArg = getSwrRequestSecondArg(httpClient, mutator);
	const httpRequestSecondArg = getHttpRequestSecondArg(httpClient, mutator);
	return `
export type ${(0, __orval_core.pascal)(operationName)}MutationResult = NonNullable<Awaited<ReturnType<typeof ${operationName}>>>
export type ${(0, __orval_core.pascal)(operationName)}MutationError = ${errorType}

${doc}export const ${(0, __orval_core.camel)(`use-${operationName}${verb === __orval_core.Verbs.GET ? "-mutation" : ""}`)} = <TError = ${errorType}>(
  ${swrProps} ${generateSwrMutationArguments({
		operationName,
		isRequestOptions,
		mutator,
		swrBodyType,
		httpClient
	})}) => {

  ${isRequestOptions ? `const {swr: swrOptions${swrRequestSecondArg ? `, ${swrRequestSecondArg}` : ""}} = options ?? {}` : ""}

  ${swrKeyImplementation}
  const swrFn = ${swrMutationFetcherName}(${swrMutationFetcherProperties}${swrMutationFetcherProperties && httpRequestSecondArg ? ", " : ""}${httpRequestSecondArg});

  const ${queryResultVarName} = useSWRMutation(swrKey, swrFn, ${swrOptions.swrMutationOptions ? `{
    ${(0, __orval_core.stringify)(swrOptions.swrMutationOptions)?.slice(1, -1)}
    ...swrOptions
  }` : "swrOptions"})

  return {
    swrKey,
    ...${queryResultVarName}
  }
}\n`;
};
const generateSwrHook = ({ queryParams, operationName, body, props, verb, params, override, mutator, response, summary, deprecated }, { route, context }) => {
	const isRequestOptions = override?.requestOptions !== false;
	const httpClient = context.output.httpClient;
	const doc = (0, __orval_core.jsDoc)({
		summary,
		deprecated
	});
	const queryKeyProps = (0, __orval_core.toObjectString)(props.filter((prop) => prop.type === __orval_core.GetterPropType.PARAM || prop.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS || prop.type === __orval_core.GetterPropType.QUERY_PARAM), "implementation");
	const swrProps = (0, __orval_core.toObjectString)(props.filter((prop) => prop.type === __orval_core.GetterPropType.PARAM || prop.type === __orval_core.GetterPropType.QUERY_PARAM || prop.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS || prop.type === __orval_core.GetterPropType.HEADER), "implementation");
	const swrMutationFetcherProperties = props.filter((prop) => prop.type === __orval_core.GetterPropType.PARAM || prop.type === __orval_core.GetterPropType.QUERY_PARAM || prop.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS || prop.type === __orval_core.GetterPropType.HEADER).map((param) => {
		if (param.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS) return param.destructured;
		else return param.name;
	}).join(",");
	const swrKeyProperties = props.filter((prop) => prop.type === __orval_core.GetterPropType.PARAM || prop.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS || prop.type === __orval_core.GetterPropType.QUERY_PARAM).map((prop) => {
		if (prop.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS) return prop.destructured;
		else return prop.name;
	}).join(",");
	const swrMutationFetcherName = (0, __orval_core.camel)(`get-${operationName}-mutation-fetcher`);
	if (verb === __orval_core.Verbs.GET) {
		const swrKeyProperties$1 = props.filter((prop) => prop.type !== __orval_core.GetterPropType.HEADER).map((param) => {
			if (param.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS) return param.destructured;
			return param.type === __orval_core.GetterPropType.BODY ? body.implementation : param.name;
		}).join(",");
		const swrProperties = props.map((param) => {
			if (param.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS) return param.destructured;
			return param.type === __orval_core.GetterPropType.BODY ? body.implementation : param.name;
		}).join(",");
		const pathOnlyParams = props.filter((prop) => prop.type === __orval_core.GetterPropType.PARAM || prop.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS).map((param) => {
			return param.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS ? param.destructured : param.name;
		}).join(",");
		const headerOnlyParams = props.filter((prop) => prop.type === __orval_core.GetterPropType.HEADER).map((param) => param.name).join(",");
		const hasQueryParams = props.some((prop) => prop.type === __orval_core.GetterPropType.QUERY_PARAM);
		const queryParamType = props.find((prop) => prop.type === __orval_core.GetterPropType.QUERY_PARAM)?.definition.split(": ")[1] || "never";
		const queryKeyProps$1 = (0, __orval_core.toObjectString)(props.filter((prop) => prop.type !== __orval_core.GetterPropType.HEADER), "implementation");
		const swrKeyFnName = (0, __orval_core.camel)(`get-${operationName}-key`);
		const swrKeyFn = `
export const ${swrKeyFnName} = (${queryKeyProps$1}) => [\`${route}\`${queryParams ? ", ...(params ? [params]: [])" : ""}] as const;
`;
		const swrKeyLoaderFnName = (0, __orval_core.camel)(`get-${operationName}-infinite-key-loader`);
		const swrKeyLoader = override.swr.useInfinite ? `export const ${swrKeyLoaderFnName} = (${queryKeyProps$1}) => {
  return (page: number, previousPageData?: Awaited<ReturnType<typeof ${operationName}>>) => {
    if (previousPageData && !previousPageData.data) return null

    return [\`${route}\`${queryParams ? ", ...(params ? [{...params,page}]: [{page}])" : ""}${body.implementation ? `, ${body.implementation}` : ""}] as const;
  }
}\n` : "";
		const swrImplementation = generateSwrImplementation({
			operationName,
			swrKeyFnName,
			swrKeyLoaderFnName,
			swrProperties,
			swrKeyProperties: swrKeyProperties$1,
			params,
			props,
			mutator,
			isRequestOptions,
			response,
			swrOptions: override.swr,
			doc,
			httpClient,
			pathOnlyParams,
			headerOnlyParams,
			hasQueryParams,
			queryParamType
		});
		if (!override.swr.useSWRMutationForGet) return swrKeyFn + swrKeyLoader + swrImplementation;
		const httpFnPropertiesForGetWithoutHeaders = props.filter((prop) => prop.type !== __orval_core.GetterPropType.HEADER).map((prop) => {
			if (prop.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS) return prop.destructured;
			else return prop.name;
		}).join(", ");
		const headerParamsForGet = props.filter((prop) => prop.type === __orval_core.GetterPropType.HEADER).map((param) => param.name).join(", ");
		const httpFnPropertiesForGet = [httpFnPropertiesForGetWithoutHeaders, headerParamsForGet].filter(Boolean).join(", ");
		const swrMutationFetcherType = getSwrMutationFetcherType(response, httpClient, override.fetch?.includeHttpResponseReturnType, operationName, mutator);
		const swrMutationFetcherOptionType = getSwrMutationFetcherOptionType(httpClient, mutator);
		const swrMutationFetcherOptions = isRequestOptions && swrMutationFetcherOptionType ? `options${context.output.optionsParamRequired ? "" : "?"}: ${swrMutationFetcherOptionType}` : "";
		const swrMutationFetcherFn = `
export const ${swrMutationFetcherName} = (${queryKeyProps$1} ${swrMutationFetcherOptions}) => {
  return (_: Key, __: { arg?: never }): ${swrMutationFetcherType} => {
    return ${operationName}(${httpFnPropertiesForGet}${swrMutationFetcherOptions.length ? (httpFnPropertiesForGet.length ? ", " : "") + "options" : ""});
  }
}
`;
		const swrMutationImplementation = generateSwrMutationImplementation({
			operationName,
			swrKeyFnName,
			swrMutationFetcherName,
			swrKeyProperties: swrKeyProperties$1,
			swrMutationFetcherProperties,
			swrProps,
			props,
			isRequestOptions,
			response,
			mutator,
			swrOptions: override.swr,
			doc,
			swrBodyType: "never",
			httpClient,
			verb: __orval_core.Verbs.GET
		});
		return swrKeyFn + swrKeyLoader + swrImplementation + swrMutationFetcherFn + swrMutationImplementation;
	} else {
		const httpFnPropertiesWithoutHeaders = props.filter((prop) => prop.type !== __orval_core.GetterPropType.HEADER).map((prop) => {
			if (prop.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS) return prop.destructured;
			else if (prop.type === __orval_core.GetterPropType.BODY) return `arg`;
			else return prop.name;
		}).join(", ");
		const headerParams = props.filter((prop) => prop.type === __orval_core.GetterPropType.HEADER).map((param) => param.name).join(", ");
		const httpFnProperties = [httpFnPropertiesWithoutHeaders, headerParams].filter(Boolean).join(", ");
		const swrKeyFnName = (0, __orval_core.camel)(`get-${operationName}-mutation-key`);
		const swrMutationKeyFn = `export const ${swrKeyFnName} = (${queryKeyProps}) => [\`${route}\`${queryParams ? ", ...(params ? [params]: [])" : ""}] as const;
`;
		getSwrMutationFetcherType(response, httpClient, override.fetch?.includeHttpResponseReturnType, operationName, mutator);
		const swrMutationFetcherOptionType = getSwrMutationFetcherOptionType(httpClient, mutator);
		const swrMutationFetcherOptions = isRequestOptions && swrMutationFetcherOptionType ? `options${context.output.optionsParamRequired ? "" : "?"}: ${swrMutationFetcherOptionType}` : "";
		const swrMutationFetcherArg = props.some((prop) => prop.type === __orval_core.GetterPropType.BODY) ? "{ arg }" : "__";
		const swrBodyType = props.find((prop) => prop.type === __orval_core.GetterPropType.BODY)?.implementation.split(": ")[1] ?? "Arguments";
		const swrMutationFetcherFn = `
export const ${swrMutationFetcherName} = (${swrProps} ${swrMutationFetcherOptions}) => {
  return (_: Key, ${swrMutationFetcherArg}: { arg: ${swrBodyType} }) => {
    return ${operationName}(${httpFnProperties}${swrMutationFetcherOptions.length ? (httpFnProperties.length ? ", " : "") + "options" : ""});
  }
}\n`;
		const swrImplementation = generateSwrMutationImplementation({
			operationName,
			swrKeyFnName,
			swrMutationFetcherName,
			swrKeyProperties,
			swrMutationFetcherProperties,
			swrProps,
			props,
			isRequestOptions,
			response,
			mutator,
			swrOptions: override.swr,
			doc,
			swrBodyType,
			httpClient: context.output.httpClient
		});
		return swrMutationFetcherFn + swrMutationKeyFn + swrImplementation;
	}
};
const generateSwrHeader = (params) => `
  ${!params.hasAwaitedType ? `type AwaitedInput<T> = PromiseLike<T> | T;\n
      type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;\n\n` : ""}
  ${params.isRequestOptions && params.isMutator ? `type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];\n\n` : ""}
  ${getSwrHeader(params)}
`;
const generateSwr = (verbOptions, options) => {
	const imports = (0, __orval_core.generateVerbImports)(verbOptions);
	const functionImplementation = generateSwrRequestFunction(verbOptions, options);
	const hookImplementation = generateSwrHook(verbOptions, options);
	return {
		implementation: `${functionImplementation}\n\n${hookImplementation}`,
		imports
	};
};
const swrClientBuilder = {
	client: generateSwr,
	header: generateSwrHeader,
	dependencies: getSwrDependencies
};
const builder = () => () => swrClientBuilder;
var src_default = builder;

//#endregion
exports.builder = builder;
exports.default = src_default;
exports.generateSwr = generateSwr;
exports.generateSwrHeader = generateSwrHeader;
exports.getSwrDependencies = getSwrDependencies;
//# sourceMappingURL=index.js.map