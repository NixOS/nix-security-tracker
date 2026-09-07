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
let lodash_omitby = require("lodash.omitby");
lodash_omitby = __toESM(lodash_omitby);
let __orval_fetch = require("@orval/fetch");
__orval_fetch = __toESM(__orval_fetch);
let chalk = require("chalk");
chalk = __toESM(chalk);

//#region src/utils.ts
const normalizeQueryOptions = (queryOptions = {}, outputWorkspace) => {
	return {
		...queryOptions.usePrefetch ? { usePrefetch: true } : {},
		...queryOptions.useInvalidate ? { useInvalidate: true } : {},
		...queryOptions.useQuery ? { useQuery: true } : {},
		...queryOptions.useInfinite ? { useInfinite: true } : {},
		...queryOptions.useInfiniteQueryParam ? { useInfiniteQueryParam: queryOptions.useInfiniteQueryParam } : {},
		...queryOptions.options ? { options: queryOptions.options } : {},
		...queryOptions?.queryKey ? { queryKey: normalizeMutator(outputWorkspace, queryOptions?.queryKey) } : {},
		...queryOptions?.queryOptions ? { queryOptions: normalizeMutator(outputWorkspace, queryOptions?.queryOptions) } : {},
		...queryOptions?.mutationOptions ? { mutationOptions: normalizeMutator(outputWorkspace, queryOptions?.mutationOptions) } : {},
		...queryOptions.signal ? { signal: true } : {},
		...queryOptions.shouldExportMutatorHooks ? { shouldExportMutatorHooks: true } : {},
		...queryOptions.shouldExportQueryKey ? { shouldExportQueryKey: true } : {},
		...queryOptions.shouldExportHttpClient ? { shouldExportHttpClient: true } : {},
		...queryOptions.shouldSplitQueryKey ? { shouldSplitQueryKey: true } : {},
		...queryOptions.useOperationIdAsQueryKey ? { useOperationIdAsQueryKey: true } : {}
	};
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
function vueWrapTypeWithMaybeRef(props) {
	return props.map((prop) => {
		const [paramName, paramType] = prop.implementation.split(":");
		if (!paramType) return prop;
		const name = prop.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS ? prop.name : paramName;
		const [type, defaultValue] = paramType.split("=");
		return {
			...prop,
			implementation: `${name}: MaybeRef<${type.trim()}>${defaultValue ? ` = ${defaultValue}` : ""}`
		};
	});
}
const vueUnRefParams = (props) => {
	return props.map((prop) => {
		if (prop.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS) return `const ${prop.destructured} = unref(${prop.name});`;
		return `${prop.name} = unref(${prop.name});`;
	}).join("\n");
};
const wrapRouteParameters = (route, prepend, append) => route.replaceAll(__orval_core.TEMPLATE_TAG_REGEX, `\${${prepend}$1${append}}`);
const makeRouteSafe = (route) => wrapRouteParameters(route, "encodeURIComponent(String(", "))");
const isVue = (client) => __orval_core.OutputClient.VUE_QUERY === client;
const getHasSignal = ({ overrideQuerySignal = false, verb }) => overrideQuerySignal && (!(0, __orval_core.getIsBodyVerb)(verb) || verb === __orval_core.Verbs.POST);

//#endregion
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
const generateQueryRequestFunction = (verbOptions, options, isVue$1) => {
	return options.context.output.httpClient === __orval_core.OutputHttpClient.AXIOS ? generateAxiosRequestFunction(verbOptions, options, isVue$1) : (0, __orval_fetch.generateRequestFunction)(verbOptions, options);
};
const generateAxiosRequestFunction = ({ headers, queryParams, operationName, response, mutator, body, props: _props, verb, formData, formUrlEncoded, override, paramsSerializer }, { route: _route, context }, isVue$1) => {
	let props = _props;
	let route = _route;
	if (isVue$1) props = vueWrapTypeWithMaybeRef(_props);
	if (context.output?.urlEncodeParameters) route = makeRouteSafe(route);
	const isRequestOptions = override.requestOptions !== false;
	const isFormData = !override.formData.disabled;
	const isFormUrlEncoded = override.formUrlEncoded !== false;
	const hasSignal = getHasSignal({
		overrideQuerySignal: override.query.signal,
		verb
	});
	const isExactOptionalPropertyTypes = !!context.output.tsconfig?.compilerOptions?.exactOptionalPropertyTypes;
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
			hasSignal,
			isExactOptionalPropertyTypes,
			isVue: isVue$1
		});
		const bodyDefinition = body.definition.replace("[]", String.raw`\[\]`);
		const propsImplementation = mutator?.bodyTypeName && body.definition ? (0, __orval_core.toObjectString)(props, "implementation").replace(/* @__PURE__ */ new RegExp(`(\\w*):\\s?${bodyDefinition}`), `$1: ${mutator.bodyTypeName}<${body.definition}>`) : (0, __orval_core.toObjectString)(props, "implementation");
		const requestOptions = isRequestOptions ? (0, __orval_core.generateMutatorRequestOptions)(override.requestOptions, mutator.hasSecondArg) : "";
		if (mutator.isHook) {
			const ret = `${override.query.shouldExportMutatorHooks ? "export " : ""}const use${(0, __orval_core.pascal)(operationName)}Hook = () => {
        const ${operationName} = ${mutator.name}<${response.definition.success || "unknown"}>();

        return useCallback((\n    ${propsImplementation}\n ${isRequestOptions && mutator.hasSecondArg ? `options${context.output.optionsParamRequired ? "" : "?"}: SecondParameter<ReturnType<typeof ${mutator.name}>>,` : ""}${hasSignal ? "signal?: AbortSignal\n" : ""}) => {${bodyForm}
        return ${operationName}(
          ${mutatorConfig},
          ${requestOptions});
        }, [${operationName}])
      }
    `;
			const vueRet = `${override.query.shouldExportMutatorHooks ? "export " : ""}const use${(0, __orval_core.pascal)(operationName)}Hook = () => {
        const ${operationName} = ${mutator.name}<${response.definition.success || "unknown"}>();

        return (\n    ${propsImplementation}\n ${isRequestOptions && mutator.hasSecondArg ? `options${context.output.optionsParamRequired ? "" : "?"}: SecondParameter<ReturnType<typeof ${mutator.name}>>,` : ""}${hasSignal ? "signal?: AbortSignal\n" : ""}) => {${bodyForm}
        return ${operationName}(
          ${mutatorConfig},
          ${requestOptions});
        }
      }
    `;
			return isVue$1 ? vueRet : ret;
		}
		return `${override.query.shouldExportHttpClient ? "export " : ""}const ${operationName} = (\n    ${propsImplementation}\n ${isRequestOptions && mutator.hasSecondArg ? `options${context.output.optionsParamRequired ? "" : "?"}: SecondParameter<typeof ${mutator.name}>,` : ""}${hasSignal ? "signal?: AbortSignal\n" : ""}) => {
      ${isVue$1 ? vueUnRefParams(props) : ""}
      ${bodyForm}
      return ${mutator.name}<${response.definition.success || "unknown"}>(
      ${mutatorConfig},
      ${requestOptions});
    }
  `;
	}
	const isSyntheticDefaultImportsAllowed = (0, __orval_core.isSyntheticDefaultImportsAllow)(context.output.tsconfig);
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
		hasSignal,
		isVue: isVue$1
	});
	const optionsArgs = generateRequestOptionsArguments({
		isRequestOptions,
		hasSignal
	});
	const queryProps = (0, __orval_core.toObjectString)(props, "implementation");
	return `${override.query.shouldExportHttpClient ? "export " : ""}const ${operationName} = (\n    ${queryProps} ${optionsArgs} ): Promise<AxiosResponse<${response.definition.success || "unknown"}>> => {
    ${isVue$1 ? vueUnRefParams(props) : ""}
    ${bodyForm}
    return axios${isSyntheticDefaultImportsAllowed ? "" : ".default"}.${verb}(${options});
  }
`;
};
const generateRequestOptionsArguments = ({ isRequestOptions, hasSignal }) => {
	if (isRequestOptions) return "options?: AxiosRequestConfig\n";
	return hasSignal ? "signal?: AbortSignal\n" : "";
};
const getQueryArgumentsRequestType = (httpClient, mutator) => {
	if (!mutator) return httpClient === __orval_core.OutputHttpClient.AXIOS ? `axios?: AxiosRequestConfig` : "fetch?: RequestInit";
	if (mutator.hasSecondArg && !mutator.isHook) return `request?: SecondParameter<typeof ${mutator.name}>`;
	if (mutator.hasSecondArg && mutator.isHook) return `request?: SecondParameter<ReturnType<typeof ${mutator.name}>>`;
	return "";
};
const getQueryOptions = ({ isRequestOptions, mutator, isExactOptionalPropertyTypes, hasSignal, httpClient }) => {
	if (!mutator && isRequestOptions) {
		const options = httpClient === __orval_core.OutputHttpClient.AXIOS ? "axiosOptions" : "fetchOptions";
		if (!hasSignal) return options;
		return `{ ${isExactOptionalPropertyTypes ? "...(signal ? { signal } : {})" : "signal"}, ...${options} }`;
	}
	if (mutator?.hasSecondArg && isRequestOptions) {
		if (!hasSignal) return "requestOptions";
		return httpClient === __orval_core.OutputHttpClient.AXIOS ? "requestOptions, signal" : "{ signal, ...requestOptions }";
	}
	if (hasSignal) return "signal";
	return "";
};
const getHookOptions = ({ isRequestOptions, httpClient, mutator }) => {
	if (!isRequestOptions) return "";
	let value = "const {query: queryOptions";
	if (!mutator) {
		const options = httpClient === __orval_core.OutputHttpClient.AXIOS ? ", axios: axiosOptions" : ", fetch: fetchOptions";
		value += options;
	}
	if (mutator?.hasSecondArg) value += ", request: requestOptions";
	value += "} = options ?? {};";
	return value;
};
const dedupeUnionTypes = (types) => {
	if (!types) return types;
	return [...new Set(types.split("|").map((t) => t.trim()).filter(Boolean))].join(" | ");
};
const getQueryErrorType = (operationName, response, httpClient, mutator) => {
	const errorsType = dedupeUnionTypes(response.definition.errors || "unknown");
	if (mutator) return mutator.hasErrorType ? `${mutator.default ? (0, __orval_core.pascal)(operationName) : ""}ErrorType<${errorsType}>` : errorsType;
	else return httpClient === __orval_core.OutputHttpClient.AXIOS ? `AxiosError<${errorsType}>` : errorsType;
};
const getHooksOptionImplementation = (isRequestOptions, httpClient, operationName, mutator) => {
	const options = httpClient === __orval_core.OutputHttpClient.AXIOS ? ", axios: axiosOptions" : ", fetch: fetchOptions";
	return isRequestOptions ? `const mutationKey = ['${operationName}'];
const {mutation: mutationOptions${mutator ? mutator?.hasSecondArg ? ", request: requestOptions" : "" : options}} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }${mutator?.hasSecondArg ? ", request: undefined" : ""}${mutator ? "" : httpClient === __orval_core.OutputHttpClient.AXIOS ? ", axios: undefined" : ", fetch: undefined"}};` : "";
};
const getMutationRequestArgs = (isRequestOptions, httpClient, mutator) => {
	const options = httpClient === __orval_core.OutputHttpClient.AXIOS ? "axiosOptions" : "fetchOptions";
	return isRequestOptions ? mutator ? mutator?.hasSecondArg ? "requestOptions" : "" : options : "";
};
const getHttpFunctionQueryProps = (isVue$1, httpClient, queryProperties) => {
	if (isVue$1 && httpClient === __orval_core.OutputHttpClient.FETCH && queryProperties) return queryProperties.split(",").map((prop) => `unref(${prop})`).join(",");
	return queryProperties;
};
const getQueryHeader = (params) => {
	return params.output.httpClient === __orval_core.OutputHttpClient.FETCH ? (0, __orval_fetch.generateFetchHeader)(params) : "";
};

//#endregion
//#region src/index.ts
const REACT_DEPENDENCIES = [{
	exports: [{
		name: "useCallback",
		values: true
	}],
	dependency: "react"
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
const SVELTE_QUERY_DEPENDENCIES_V3 = [{
	exports: [
		{
			name: "useQuery",
			values: true
		},
		{
			name: "useInfiniteQuery",
			values: true
		},
		{
			name: "useMutation",
			values: true
		},
		{ name: "UseQueryOptions" },
		{ name: "UseInfiniteQueryOptions" },
		{ name: "UseMutationOptions" },
		{ name: "QueryFunction" },
		{ name: "MutationFunction" },
		{ name: "UseQueryStoreResult" },
		{ name: "UseInfiniteQueryStoreResult" },
		{ name: "QueryKey" },
		{ name: "CreateMutationResult" },
		{ name: "InvalidateOptions" }
	],
	dependency: "@sveltestack/svelte-query"
}];
const SVELTE_QUERY_DEPENDENCIES = [{
	exports: [
		{
			name: "createQuery",
			values: true
		},
		{
			name: "createInfiniteQuery",
			values: true
		},
		{
			name: "createMutation",
			values: true
		},
		{ name: "CreateQueryOptions" },
		{ name: "CreateInfiniteQueryOptions" },
		{ name: "CreateMutationOptions" },
		{ name: "QueryFunction" },
		{ name: "MutationFunction" },
		{ name: "CreateQueryResult" },
		{ name: "CreateInfiniteQueryResult" },
		{ name: "QueryKey" },
		{ name: "InfiniteData" },
		{ name: "CreateMutationResult" },
		{ name: "DataTag" },
		{ name: "QueryClient" },
		{ name: "InvalidateOptions" }
	],
	dependency: "@tanstack/svelte-query"
}];
const isSvelteQueryV3 = (packageJson) => {
	const hasSvelteQuery = packageJson?.dependencies?.["@sveltestack/svelte-query"] ?? packageJson?.devDependencies?.["@sveltestack/svelte-query"] ?? packageJson?.peerDependencies?.["@sveltestack/svelte-query"];
	const hasSvelteQueryV4 = packageJson?.dependencies?.["@tanstack/svelte-query"] ?? packageJson?.devDependencies?.["@tanstack/svelte-query"] ?? packageJson?.peerDependencies?.["@tanstack/svelte-query"];
	return !!hasSvelteQuery && !hasSvelteQueryV4;
};
const isSvelteQueryV6 = (packageJson) => {
	return isQueryV6(packageJson, "svelte-query");
};
const getSvelteQueryDependencies = (hasGlobalMutator, hasParamsSerializerOptions, packageJson, httpClient) => {
	const hasSvelteQueryV3 = isSvelteQueryV3(packageJson);
	return [
		...!hasGlobalMutator && httpClient === __orval_core.OutputHttpClient.AXIOS ? AXIOS_DEPENDENCIES : [],
		...hasParamsSerializerOptions ? PARAMS_SERIALIZER_DEPENDENCIES : [],
		...hasSvelteQueryV3 ? SVELTE_QUERY_DEPENDENCIES_V3 : SVELTE_QUERY_DEPENDENCIES
	];
};
const REACT_QUERY_DEPENDENCIES_V3 = [{
	exports: [
		{
			name: "useQuery",
			values: true
		},
		{
			name: "useInfiniteQuery",
			values: true
		},
		{
			name: "useMutation",
			values: true
		},
		{
			name: "useQueryClient",
			values: true
		},
		{ name: "UseQueryOptions" },
		{ name: "UseInfiniteQueryOptions" },
		{ name: "UseMutationOptions" },
		{ name: "QueryFunction" },
		{ name: "MutationFunction" },
		{ name: "UseQueryResult" },
		{ name: "UseInfiniteQueryResult" },
		{ name: "QueryKey" },
		{ name: "QueryClient" },
		{ name: "UseMutationResult" },
		{ name: "InvalidateOptions" }
	],
	dependency: "react-query"
}];
const REACT_QUERY_DEPENDENCIES = [{
	exports: [
		{
			name: "useQuery",
			values: true
		},
		{
			name: "useSuspenseQuery",
			values: true
		},
		{
			name: "useInfiniteQuery",
			values: true
		},
		{
			name: "useSuspenseInfiniteQuery",
			values: true
		},
		{
			name: "useMutation",
			values: true
		},
		{
			name: "useQueryClient",
			values: true
		},
		{ name: "UseQueryOptions" },
		{ name: "DefinedInitialDataOptions" },
		{ name: "UndefinedInitialDataOptions" },
		{ name: "UseSuspenseQueryOptions" },
		{ name: "UseInfiniteQueryOptions" },
		{ name: "UseSuspenseInfiniteQueryOptions" },
		{ name: "UseMutationOptions" },
		{ name: "QueryFunction" },
		{ name: "MutationFunction" },
		{ name: "UseQueryResult" },
		{ name: "DefinedUseQueryResult" },
		{ name: "UseSuspenseQueryResult" },
		{ name: "UseInfiniteQueryResult" },
		{ name: "DefinedUseInfiniteQueryResult" },
		{ name: "UseSuspenseInfiniteQueryResult" },
		{ name: "QueryKey" },
		{ name: "QueryClient" },
		{ name: "InfiniteData" },
		{ name: "UseMutationResult" },
		{ name: "DataTag" },
		{ name: "InvalidateOptions" }
	],
	dependency: "@tanstack/react-query"
}];
const getReactQueryDependencies = (hasGlobalMutator, hasParamsSerializerOptions, packageJson, httpClient, hasTagsMutator, override) => {
	const hasReactQuery = packageJson?.dependencies?.["react-query"] ?? packageJson?.devDependencies?.["react-query"] ?? packageJson?.peerDependencies?.["react-query"];
	const hasReactQueryV4 = packageJson?.dependencies?.["@tanstack/react-query"] ?? packageJson?.devDependencies?.["@tanstack/react-query"] ?? packageJson?.peerDependencies?.["@tanstack/react-query"];
	const useReactQueryV3 = override?.query.version === void 0 ? hasReactQuery && !hasReactQueryV4 : override?.query.version <= 3;
	return [
		...hasGlobalMutator || hasTagsMutator ? REACT_DEPENDENCIES : [],
		...!hasGlobalMutator && httpClient === __orval_core.OutputHttpClient.AXIOS ? AXIOS_DEPENDENCIES : [],
		...hasParamsSerializerOptions ? PARAMS_SERIALIZER_DEPENDENCIES : [],
		...useReactQueryV3 ? REACT_QUERY_DEPENDENCIES_V3 : REACT_QUERY_DEPENDENCIES
	];
};
const VUE_QUERY_DEPENDENCIES_V3 = [
	{
		exports: [
			{
				name: "useQuery",
				values: true
			},
			{
				name: "useInfiniteQuery",
				values: true
			},
			{
				name: "useMutation",
				values: true
			}
		],
		dependency: "vue-query"
	},
	{
		exports: [
			{ name: "UseQueryOptions" },
			{ name: "UseInfiniteQueryOptions" },
			{ name: "UseMutationOptions" },
			{ name: "QueryFunction" },
			{ name: "MutationFunction" },
			{ name: "UseQueryResult" },
			{ name: "UseInfiniteQueryResult" },
			{ name: "QueryKey" },
			{ name: "UseMutationReturnType" },
			{ name: "InvalidateOptions" }
		],
		dependency: "vue-query/types"
	},
	{
		exports: [{
			name: "unref",
			values: true
		}, {
			name: "computed",
			values: true
		}],
		dependency: "vue"
	},
	{
		exports: [{ name: "UseQueryReturnType" }],
		dependency: "vue-query/lib/vue/useBaseQuery"
	}
];
const VUE_QUERY_DEPENDENCIES = [{
	exports: [
		{
			name: "useQuery",
			values: true
		},
		{
			name: "useInfiniteQuery",
			values: true
		},
		{
			name: "useMutation",
			values: true
		},
		{ name: "UseQueryOptions" },
		{ name: "UseInfiniteQueryOptions" },
		{ name: "UseMutationOptions" },
		{ name: "QueryFunction" },
		{ name: "MutationFunction" },
		{ name: "QueryKey" },
		{ name: "UseQueryReturnType" },
		{ name: "UseInfiniteQueryReturnType" },
		{ name: "InfiniteData" },
		{ name: "UseMutationReturnType" },
		{ name: "DataTag" },
		{ name: "QueryClient" },
		{ name: "InvalidateOptions" }
	],
	dependency: "@tanstack/vue-query"
}, {
	exports: [
		{
			name: "unref",
			values: true
		},
		{ name: "MaybeRef" },
		{
			name: "computed",
			values: true
		}
	],
	dependency: "vue"
}];
const isVueQueryV3 = (packageJson) => {
	const hasVueQuery = packageJson?.dependencies?.["vue-query"] ?? packageJson?.devDependencies?.["vue-query"] ?? packageJson?.peerDependencies?.["vue-query"];
	const hasVueQueryV4 = packageJson?.dependencies?.["@tanstack/vue-query"] ?? packageJson?.devDependencies?.["@tanstack/vue-query"] ?? packageJson?.peerDependencies?.["@tanstack/vue-query"];
	return !!hasVueQuery && !hasVueQueryV4;
};
const getVueQueryDependencies = (hasGlobalMutator, hasParamsSerializerOptions, packageJson, httpClient) => {
	const hasVueQueryV3 = isVueQueryV3(packageJson);
	return [
		...!hasGlobalMutator && httpClient === __orval_core.OutputHttpClient.AXIOS ? AXIOS_DEPENDENCIES : [],
		...hasParamsSerializerOptions ? PARAMS_SERIALIZER_DEPENDENCIES : [],
		...hasVueQueryV3 ? VUE_QUERY_DEPENDENCIES_V3 : VUE_QUERY_DEPENDENCIES
	];
};
const isQueryV5 = (packageJson, queryClient) => {
	const version = getPackageByQueryClient(packageJson, queryClient);
	if (!version) return false;
	const withoutRc = version.split("-")[0];
	return (0, __orval_core.compareVersions)(withoutRc, "5.0.0");
};
const isQueryV6 = (packageJson, queryClient) => {
	const version = getPackageByQueryClient(packageJson, queryClient);
	if (!version) return false;
	const withoutRc = version.split("-")[0];
	return (0, __orval_core.compareVersions)(withoutRc, "6.0.0");
};
const isQueryV5WithDataTagError = (packageJson, queryClient) => {
	const version = getPackageByQueryClient(packageJson, queryClient);
	if (!version) return false;
	const withoutRc = version.split("-")[0];
	return (0, __orval_core.compareVersions)(withoutRc, "5.62.0");
};
const isQueryV5WithInfiniteQueryOptionsError = (packageJson, queryClient) => {
	const version = getPackageByQueryClient(packageJson, queryClient);
	if (!version) return false;
	const withoutRc = version.split("-")[0];
	return (0, __orval_core.compareVersions)(withoutRc, "5.80.0");
};
const getPackageByQueryClient = (packageJson, queryClient) => {
	switch (queryClient) {
		case "react-query": return packageJson?.dependencies?.["@tanstack/react-query"] ?? packageJson?.devDependencies?.["@tanstack/react-query"] ?? packageJson?.peerDependencies?.["@tanstack/react-query"];
		case "svelte-query": return packageJson?.dependencies?.["@tanstack/svelte-query"] ?? packageJson?.devDependencies?.["@tanstack/svelte-query"] ?? packageJson?.peerDependencies?.["@tanstack/svelte-query"];
		case "vue-query": return packageJson?.dependencies?.["@tanstack/vue-query"] ?? packageJson?.devDependencies?.["@tanstack/vue-query"] ?? packageJson?.peerDependencies?.["@tanstack/vue-query"];
	}
};
const QueryType = {
	INFINITE: "infiniteQuery",
	QUERY: "query",
	SUSPENSE_QUERY: "suspenseQuery",
	SUSPENSE_INFINITE: "suspenseInfiniteQuery"
};
const INFINITE_QUERY_PROPERTIES = new Set(["getNextPageParam", "getPreviousPageParam"]);
const generateQueryOptions = ({ params, options, type, outputClient }) => {
	if (options === false) return "";
	const queryConfig = (0, __orval_core.isObject)(options) ? ` ${(0, __orval_core.stringify)((0, lodash_omitby.default)(options, (_, key) => (type !== QueryType.INFINITE || type !== QueryType.SUSPENSE_INFINITE) && INFINITE_QUERY_PROPERTIES.has(key)))?.slice(1, -1)}` : "";
	if (params.length === 0 || isSuspenseQuery(type)) {
		if (options) return `${queryConfig} ...queryOptions`;
		return "...queryOptions";
	}
	return `${!(0, __orval_core.isObject)(options) || !options.hasOwnProperty("enabled") ? isVue(outputClient) ? `enabled: computed(() => !!(${params.map(({ name }) => `unref(${name})`).join(" && ")})),` : `enabled: !!(${params.map(({ name }) => name).join(" && ")}),` : ""}${queryConfig} ...queryOptions`;
};
const isSuspenseQuery = (type) => {
	return [QueryType.SUSPENSE_INFINITE, QueryType.SUSPENSE_QUERY].includes(type);
};
const getQueryOptionsDefinition = ({ operationName, mutator, definitions, type, hasSvelteQueryV4, hasQueryV5, hasQueryV5WithInfiniteQueryOptionsError, queryParams, queryParam, isReturnType, initialData }) => {
	const isMutatorHook = mutator?.isHook;
	const prefix = hasSvelteQueryV4 ? "Create" : "Use";
	const partialOptions = !isReturnType && hasQueryV5;
	if (type) {
		const funcReturnType = `Awaited<ReturnType<${isMutatorHook ? `ReturnType<typeof use${(0, __orval_core.pascal)(operationName)}Hook>` : `typeof ${operationName}`}>>`;
		const optionTypeInitialDataPostfix = initialData && !isSuspenseQuery(type) ? ` & Pick<
        ${(0, __orval_core.pascal)(initialData)}InitialDataOptions<
          ${funcReturnType},
          TError,
          ${funcReturnType}${hasQueryV5 && (type === QueryType.INFINITE || type === QueryType.SUSPENSE_INFINITE) && queryParam && queryParams ? `, QueryKey` : ""}
        > , 'initialData'
      >` : "";
		const optionType = `${prefix}${(0, __orval_core.pascal)(type)}Options<${funcReturnType}, TError, TData${hasQueryV5 && (type === QueryType.INFINITE || type === QueryType.SUSPENSE_INFINITE) && queryParam && queryParams ? hasQueryV5WithInfiniteQueryOptionsError ? `, QueryKey, ${queryParams?.schema.name}['${queryParam}']` : `, ${funcReturnType}, QueryKey, ${queryParams?.schema.name}['${queryParam}']` : ""}>`;
		return `${partialOptions ? "Partial<" : ""}${optionType}${partialOptions ? ">" : ""}${optionTypeInitialDataPostfix}`;
	}
	return `${prefix}MutationOptions<Awaited<ReturnType<${isMutatorHook ? `ReturnType<typeof use${(0, __orval_core.pascal)(operationName)}Hook>` : `typeof ${operationName}`}>>, TError,${definitions ? `{${definitions}}` : "void"}, TContext>`;
};
const generateQueryArguments = ({ operationName, definitions, mutator, isRequestOptions, type, hasSvelteQueryV4, hasQueryV5, hasQueryV5WithInfiniteQueryOptionsError, queryParams, queryParam, initialData, httpClient }) => {
	const definition = getQueryOptionsDefinition({
		operationName,
		mutator,
		definitions,
		type,
		hasSvelteQueryV4,
		hasQueryV5,
		hasQueryV5WithInfiniteQueryOptionsError,
		queryParams,
		queryParam,
		isReturnType: false,
		initialData
	});
	if (!isRequestOptions) return `${type ? "queryOptions" : "mutationOptions"}${initialData === "defined" ? "" : "?"}: ${definition}`;
	const requestType = getQueryArgumentsRequestType(httpClient, mutator);
	const isQueryRequired = initialData === "defined";
	return `options${isQueryRequired ? "" : "?"}: { ${type ? "query" : "mutation"}${isQueryRequired ? "" : "?"}:${definition}, ${requestType}}\n`;
};
const generateQueryReturnType = ({ outputClient, type, isMutatorHook, operationName, hasVueQueryV4, hasSvelteQueryV4, hasQueryV5, hasQueryV5WithDataTagError, isInitialDataDefined }) => {
	switch (outputClient) {
		case __orval_core.OutputClient.SVELTE_QUERY:
			if (!hasSvelteQueryV4) return `Use${(0, __orval_core.pascal)(type)}StoreResult<Awaited<ReturnType<${isMutatorHook ? `ReturnType<typeof use${(0, __orval_core.pascal)(operationName)}Hook>` : `typeof ${operationName}`}>>, TError, TData, QueryKey> & { queryKey: QueryKey} }`;
			return `Create${(0, __orval_core.pascal)(type)}Result<TData, TError> & { queryKey: ${hasQueryV5 ? `DataTag<QueryKey, TData${hasQueryV5WithDataTagError ? ", TError" : ""}>` : "QueryKey"} }`;
		case __orval_core.OutputClient.VUE_QUERY:
			if (!hasVueQueryV4) return ` UseQueryReturnType<TData, TError, Use${(0, __orval_core.pascal)(type)}Result<TData, TError>> & { queryKey: QueryKey} }`;
			if (type !== QueryType.INFINITE && type !== QueryType.SUSPENSE_INFINITE) return `UseQueryReturnType<TData, TError> & { queryKey: ${hasQueryV5 ? `DataTag<QueryKey, TData${hasQueryV5WithDataTagError ? ", TError" : ""}>` : "QueryKey"} }`;
			return `UseInfiniteQueryReturnType<TData, TError> & { queryKey: ${hasQueryV5 ? `DataTag<QueryKey, TData${hasQueryV5WithDataTagError ? ", TError" : ""}>` : "QueryKey"} }`;
		case __orval_core.OutputClient.REACT_QUERY:
		default: return ` ${isInitialDataDefined && !isSuspenseQuery(type) ? "Defined" : ""}Use${(0, __orval_core.pascal)(type)}Result<TData, TError> & { queryKey: ${hasQueryV5 ? `DataTag<QueryKey, TData${hasQueryV5WithDataTagError ? ", TError" : ""}>` : "QueryKey"} }`;
	}
};
const generateMutatorReturnType = ({ outputClient, dataType, variableType }) => {
	if (outputClient === __orval_core.OutputClient.REACT_QUERY) return `: UseMutationResult<
        Awaited<ReturnType<${dataType}>>,
        TError,
        ${variableType},
        TContext
      >`;
	if (outputClient === __orval_core.OutputClient.SVELTE_QUERY) return `: CreateMutationResult<
        Awaited<ReturnType<${dataType}>>,
        TError,
        ${variableType},
        TContext
      >`;
	if (outputClient === __orval_core.OutputClient.VUE_QUERY) return `: UseMutationReturnType<
        Awaited<ReturnType<${dataType}>>,
        TError,
        ${variableType},
        TContext
      >`;
	return "";
};
const getQueryFnArguments = ({ hasQueryParam, hasSignal }) => {
	if (!hasQueryParam && !hasSignal) return "";
	if (hasQueryParam) {
		if (hasSignal) return "{ signal, pageParam }";
		return "{ pageParam }";
	}
	return "{ signal }";
};
const generatePrefetch = ({ usePrefetch, type, useQuery, useInfinite, operationName, mutator, doc, queryProps, dataType, errorType, queryArguments, queryOptionsVarName, queryOptionsFnName, queryProperties, isRequestOptions, hasSvelteQueryV6 }) => {
	if (!(usePrefetch && (type === QueryType.QUERY || type === QueryType.INFINITE || type === QueryType.SUSPENSE_QUERY && !useQuery || type === QueryType.SUSPENSE_INFINITE && !useInfinite))) return "";
	const prefetchType = type === QueryType.QUERY || type === QueryType.SUSPENSE_QUERY ? "query" : "infinite-query";
	const prefetchFnName = (0, __orval_core.camel)(`prefetch-${prefetchType}`);
	if (mutator?.isHook) {
		const prefetchVarName = (0, __orval_core.camel)(`use-prefetch-${operationName}-${prefetchType}`);
		return `${doc}export const ${prefetchVarName} = <TData = Awaited<ReturnType<${dataType}>>, TError = ${errorType}>(${queryProps} ${queryArguments}) => {
  const queryClient = useQueryClient();
  const ${queryOptionsVarName} = ${queryOptionsFnName}(${queryProperties}${queryProperties ? "," : ""}${isRequestOptions ? "options" : "queryOptions"})
  return useCallback(async (): Promise<QueryClient> => {
    await queryClient.${prefetchFnName}(${queryOptionsVarName})
    return queryClient;
  },[queryClient, ${queryOptionsVarName}]);
};\n`;
	} else {
		const prefetchVarName = (0, __orval_core.camel)(`prefetch-${operationName}-${prefetchType}`);
		return `${doc}export const ${prefetchVarName} = async <TData = Awaited<ReturnType<${dataType}>>, TError = ${errorType}>(\n queryClient: QueryClient, ${queryProps} ${queryArguments}\n  ): Promise<QueryClient> => {

  const ${queryOptionsVarName} = ${queryOptionsFnName}(${queryProperties}${queryProperties ? "," : ""}${isRequestOptions ? "options" : "queryOptions"})

  await queryClient.${prefetchFnName}(${hasSvelteQueryV6 ? `() => ({ ...${queryOptionsVarName} })` : queryOptionsVarName});

  return queryClient;
}\n`;
	}
};
const generateQueryImplementation = ({ queryOption: { name, queryParam, options, type, queryKeyFnName }, operationName, queryProperties, queryKeyProperties, queryParams, params, props, mutator, queryOptionsMutator, queryKeyMutator, isRequestOptions, response, outputClient, httpClient, isExactOptionalPropertyTypes, hasSignal, route, hasVueQueryV4, hasSvelteQueryV4, hasSvelteQueryV6, hasQueryV5, hasQueryV5WithDataTagError, hasQueryV5WithInfiniteQueryOptionsError, doc, usePrefetch, useQuery, useInfinite, useInvalidate }) => {
	const queryPropDefinitions = (0, __orval_core.toObjectString)(props, "definition");
	const definedInitialDataQueryPropsDefinitions = (0, __orval_core.toObjectString)(props.map((prop) => {
		const regex = /* @__PURE__ */ new RegExp(`^${prop.name}\\s*\\?:`);
		if (!regex.test(prop.definition)) return prop;
		const definitionWithUndefined = prop.definition.replace(regex, `${prop.name}: undefined | `);
		return {
			...prop,
			definition: definitionWithUndefined
		};
	}), "definition");
	const queryProps = (0, __orval_core.toObjectString)(props, "implementation");
	const hasInfiniteQueryParam = queryParam && queryParams?.schema.name;
	const httpFunctionProps = queryParam ? props.map((param) => {
		if (param.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS && !isVue(outputClient)) return param.destructured;
		return param.name === "params" ? `{...${isVue(outputClient) ? `unref(params)` : "params"}, '${queryParam}': pageParam || ${isVue(outputClient) ? `unref(params)?.['${queryParam}']` : `params?.['${queryParam}']`}}` : param.name;
	}).join(",") : getHttpFunctionQueryProps(isVue(outputClient), httpClient, queryProperties);
	const definedInitialDataReturnType = generateQueryReturnType({
		outputClient,
		type,
		isMutatorHook: mutator?.isHook,
		operationName,
		hasVueQueryV4,
		hasSvelteQueryV4,
		hasQueryV5,
		hasQueryV5WithDataTagError,
		isInitialDataDefined: true
	});
	const returnType = generateQueryReturnType({
		outputClient,
		type,
		isMutatorHook: mutator?.isHook,
		operationName,
		hasVueQueryV4,
		hasSvelteQueryV4,
		hasQueryV5,
		hasQueryV5WithDataTagError
	});
	const errorType = getQueryErrorType(operationName, response, httpClient, mutator);
	const dataType = mutator?.isHook ? `ReturnType<typeof use${(0, __orval_core.pascal)(operationName)}Hook>` : `typeof ${operationName}`;
	const definedInitialDataQueryArguments = generateQueryArguments({
		operationName,
		mutator,
		definitions: "",
		isRequestOptions,
		type,
		hasSvelteQueryV4,
		hasQueryV5,
		hasQueryV5WithInfiniteQueryOptionsError,
		queryParams,
		queryParam,
		initialData: "defined",
		httpClient
	});
	const undefinedInitialDataQueryArguments = generateQueryArguments({
		operationName,
		definitions: "",
		mutator,
		isRequestOptions,
		type,
		hasSvelteQueryV4,
		hasQueryV5,
		hasQueryV5WithInfiniteQueryOptionsError,
		queryParams,
		queryParam,
		initialData: "undefined",
		httpClient
	});
	const queryArguments = generateQueryArguments({
		operationName,
		definitions: "",
		mutator,
		isRequestOptions,
		type,
		hasSvelteQueryV4,
		hasQueryV5,
		hasQueryV5WithInfiniteQueryOptionsError,
		queryParams,
		queryParam,
		httpClient
	});
	const queryOptions = getQueryOptions({
		isRequestOptions,
		isExactOptionalPropertyTypes,
		mutator,
		hasSignal,
		httpClient
	});
	const hookOptions = getHookOptions({
		isRequestOptions,
		httpClient,
		mutator
	});
	const queryFnArguments = getQueryFnArguments({
		hasQueryParam: !!queryParam && props.some(({ type: type$1 }) => type$1 === "queryParam"),
		hasSignal
	});
	const queryOptionFnReturnType = getQueryOptionsDefinition({
		operationName,
		mutator,
		definitions: "",
		type,
		hasSvelteQueryV4,
		hasQueryV5,
		hasQueryV5WithInfiniteQueryOptionsError,
		queryParams,
		queryParam,
		isReturnType: true
	});
	const queryOptionsImp = generateQueryOptions({
		params,
		options,
		type,
		outputClient
	});
	const queryOptionsFnName = (0, __orval_core.camel)(queryKeyMutator || queryOptionsMutator || mutator?.isHook ? `use-${name}-queryOptions` : `get-${name}-queryOptions`);
	const queryOptionsVarName = isRequestOptions ? "queryOptions" : "options";
	const queryResultVarName = props.some((prop) => prop.name === "query") ? "_query" : "query";
	const infiniteParam = queryParams && queryParam ? `, ${queryParams?.schema.name}['${queryParam}']` : "";
	const TData = hasQueryV5 && (type === QueryType.INFINITE || type === QueryType.SUSPENSE_INFINITE) ? `InfiniteData<Awaited<ReturnType<${dataType}>>${infiniteParam}>` : `Awaited<ReturnType<${dataType}>>`;
	const queryOptionsFn = `export const ${queryOptionsFnName} = <TData = ${TData}, TError = ${errorType}>(${queryProps} ${queryArguments}) => {

${hookOptions}

  const queryKey =  ${queryKeyMutator ? `${queryKeyMutator.name}({ ${queryProperties} }${queryKeyMutator.hasSecondArg ? `, { url: \`${route}\`, queryOptions }` : ""});` : `${hasVueQueryV4 ? "" : "queryOptions?.queryKey ?? "}${queryKeyFnName}(${queryKeyProperties});`}

  ${mutator?.isHook ? `const ${operationName} =  use${(0, __orval_core.pascal)(operationName)}Hook();` : ""}

    const queryFn: QueryFunction<Awaited<ReturnType<${mutator?.isHook ? `ReturnType<typeof use${(0, __orval_core.pascal)(operationName)}Hook>` : `typeof ${operationName}`}>>${hasQueryV5 && hasInfiniteQueryParam ? `, QueryKey, ${queryParams?.schema.name}['${queryParam}']` : ""}> = (${queryFnArguments}) => ${operationName}(${httpFunctionProps}${httpFunctionProps ? ", " : ""}${queryOptions});

      ${isVue(outputClient) ? vueUnRefParams(props.filter((prop) => prop.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS)) : ""}

      ${queryOptionsMutator ? `const customOptions = ${queryOptionsMutator.name}({...queryOptions, queryKey, queryFn}${queryOptionsMutator.hasSecondArg ? `, { ${queryProperties} }` : ""}${queryOptionsMutator.hasThirdArg ? `, { url: \`${route}\` }` : ""});` : ""}

   return  ${queryOptionsMutator ? "customOptions" : `{ queryKey, queryFn, ${queryOptionsImp}}`} as ${queryOptionFnReturnType} ${isVue(outputClient) ? "" : `& { queryKey: ${hasQueryV5 ? `DataTag<QueryKey, TData${hasQueryV5WithDataTagError ? ", TError" : ""}>` : "QueryKey"} }`}
}`;
	const operationPrefix = hasSvelteQueryV4 ? "create" : "use";
	const optionalQueryClientArgument = hasQueryV5 ? ", queryClient?: QueryClient" : "";
	const queryHookName = (0, __orval_core.camel)(`${operationPrefix}-${name}`);
	const overrideTypes = `
export function ${queryHookName}<TData = ${TData}, TError = ${errorType}>(\n ${definedInitialDataQueryPropsDefinitions} ${definedInitialDataQueryArguments} ${optionalQueryClientArgument}\n  ): ${definedInitialDataReturnType}
export function ${queryHookName}<TData = ${TData}, TError = ${errorType}>(\n ${queryPropDefinitions} ${undefinedInitialDataQueryArguments} ${optionalQueryClientArgument}\n  ): ${returnType}
export function ${queryHookName}<TData = ${TData}, TError = ${errorType}>(\n ${queryPropDefinitions} ${queryArguments} ${optionalQueryClientArgument}\n  ): ${returnType}`;
	const prefetch = generatePrefetch({
		usePrefetch,
		type,
		useQuery,
		useInfinite,
		operationName,
		mutator,
		queryProps,
		dataType,
		errorType,
		hasSvelteQueryV6,
		queryArguments,
		queryOptionsVarName,
		queryOptionsFnName,
		queryProperties,
		isRequestOptions,
		doc
	});
	const shouldGenerateInvalidate = useInvalidate && (type === QueryType.QUERY || type === QueryType.INFINITE || type === QueryType.SUSPENSE_QUERY && !useQuery || type === QueryType.SUSPENSE_INFINITE && !useInfinite);
	const invalidateFnName = (0, __orval_core.camel)(`invalidate-${operationName}`);
	return `
${queryOptionsFn}

export type ${(0, __orval_core.pascal)(name)}QueryResult = NonNullable<Awaited<ReturnType<${dataType}>>>
export type ${(0, __orval_core.pascal)(name)}QueryError = ${errorType}

${hasQueryV5 && __orval_core.OutputClient.REACT_QUERY === outputClient ? overrideTypes : ""}
${doc}
export function ${queryHookName}<TData = ${TData}, TError = ${errorType}>(\n ${queryProps} ${queryArguments} ${optionalQueryClientArgument} \n ): ${returnType} {

  const ${queryOptionsVarName} = ${queryOptionsFnName}(${queryProperties}${queryProperties ? "," : ""}${isRequestOptions ? "options" : "queryOptions"})

  const ${queryResultVarName} = ${(0, __orval_core.camel)(`${operationPrefix}-${type}`)}(${hasSvelteQueryV6 ? `() => ({ ...${queryOptionsVarName}${optionalQueryClientArgument ? ", queryClient" : ""} })` : `${queryOptionsVarName}${optionalQueryClientArgument ? ", queryClient" : ""}`}) as ${returnType};

  ${queryResultVarName}.queryKey = ${isVue(outputClient) ? `unref(${queryOptionsVarName})` : queryOptionsVarName}.queryKey ${isVue(outputClient) ? `as ${hasQueryV5 ? `DataTag<QueryKey, TData${hasQueryV5WithDataTagError ? ", TError" : ""}>` : "QueryKey"}` : ""};

  return ${queryResultVarName};
}\n
${prefetch}
${shouldGenerateInvalidate ? `${doc}export const ${invalidateFnName} = async (\n queryClient: QueryClient, ${queryProps} options?: InvalidateOptions\n  ): Promise<QueryClient> => {

  await queryClient.invalidateQueries({ queryKey: ${queryKeyFnName}(${queryKeyProperties}) }, options);

  return queryClient;
}\n` : ""}
`;
};
const generateQueryHook = async ({ queryParams, operationName, body, props: _props, verb, params, override, mutator, response, operationId, summary, deprecated }, { route, override: { operations = {} }, context, output }, outputClient) => {
	let props = _props;
	if (isVue(outputClient)) props = vueWrapTypeWithMaybeRef(_props);
	const query = override?.query;
	const isRequestOptions = override?.requestOptions !== false;
	const operationQueryOptions = operations[operationId]?.query;
	const isExactOptionalPropertyTypes = !!context.output.tsconfig?.compilerOptions?.exactOptionalPropertyTypes;
	const queryVersion = override.query.version ?? query?.version;
	const hasVueQueryV4 = __orval_core.OutputClient.VUE_QUERY === outputClient && (!isVueQueryV3(context.output.packageJson) || queryVersion === 4);
	const hasSvelteQueryV4 = __orval_core.OutputClient.SVELTE_QUERY === outputClient && (!isSvelteQueryV3(context.output.packageJson) || queryVersion === 4);
	const hasSvelteQueryV6 = __orval_core.OutputClient.SVELTE_QUERY === outputClient && isSvelteQueryV6(context.output.packageJson);
	const hasQueryV5 = queryVersion === 5 || isQueryV5(context.output.packageJson, outputClient);
	const hasQueryV5WithDataTagError = queryVersion === 5 || isQueryV5WithDataTagError(context.output.packageJson, outputClient);
	const hasQueryV5WithInfiniteQueryOptionsError = queryVersion === 5 || isQueryV5WithInfiniteQueryOptionsError(context.output.packageJson, outputClient);
	const httpClient = context.output.httpClient;
	const doc = (0, __orval_core.jsDoc)({
		summary,
		deprecated
	});
	let implementation = "";
	let mutators;
	const hasOperationQueryOption = !!(operationQueryOptions && (operationQueryOptions.useQuery || operationQueryOptions.useSuspenseQuery || operationQueryOptions.useInfinite || operationQueryOptions.useSuspenseInfiniteQuery));
	let isQuery = __orval_core.Verbs.GET === verb && (override.query.useQuery || override.query.useSuspenseQuery || override.query.useInfinite || override.query.useSuspenseInfiniteQuery) || hasOperationQueryOption;
	let isMutation = override.query.useMutation && verb !== __orval_core.Verbs.GET;
	if (operationQueryOptions?.useMutation !== void 0) isMutation = operationQueryOptions.useMutation;
	if (verb !== __orval_core.Verbs.GET && isQuery) isMutation = false;
	if (verb === __orval_core.Verbs.GET && isMutation) isQuery = false;
	if (isQuery) {
		const queryKeyMutator = query.queryKey ? await (0, __orval_core.generateMutator)({
			output,
			mutator: query.queryKey,
			name: `${operationName}QueryKey`,
			workspace: context.workspace,
			tsconfig: context.output.tsconfig
		}) : void 0;
		const queryOptionsMutator = query.queryOptions ? await (0, __orval_core.generateMutator)({
			output,
			mutator: query.queryOptions,
			name: `${operationName}QueryOptions`,
			workspace: context.workspace,
			tsconfig: context.output.tsconfig
		}) : void 0;
		const queryProperties = props.map((param) => {
			if (param.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS && !isVue(outputClient)) return param.destructured;
			return param.type === __orval_core.GetterPropType.BODY ? body.implementation : param.name;
		}).join(",");
		const queryKeyProperties = props.filter((prop) => prop.type !== __orval_core.GetterPropType.HEADER).map((param) => {
			if (param.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS && !isVue(outputClient)) return param.destructured;
			return param.type === __orval_core.GetterPropType.BODY ? body.implementation : param.name;
		}).join(",");
		const queries = [
			...query?.useInfinite || operationQueryOptions?.useInfinite ? [{
				name: (0, __orval_core.camel)(`${operationName}-infinite`),
				options: query?.options,
				type: QueryType.INFINITE,
				queryParam: query?.useInfiniteQueryParam,
				queryKeyFnName: (0, __orval_core.camel)(`get-${operationName}-infinite-query-key`)
			}] : [],
			...query?.useQuery || operationQueryOptions?.useQuery ? [{
				name: operationName,
				options: query?.options,
				type: QueryType.QUERY,
				queryKeyFnName: (0, __orval_core.camel)(`get-${operationName}-query-key`)
			}] : [],
			...query?.useSuspenseQuery || operationQueryOptions?.useSuspenseQuery ? [{
				name: (0, __orval_core.camel)(`${operationName}-suspense`),
				options: query?.options,
				type: QueryType.SUSPENSE_QUERY,
				queryKeyFnName: (0, __orval_core.camel)(`get-${operationName}-query-key`)
			}] : [],
			...query?.useSuspenseInfiniteQuery || operationQueryOptions?.useSuspenseInfiniteQuery ? [{
				name: (0, __orval_core.camel)(`${operationName}-suspense-infinite`),
				options: query?.options,
				type: QueryType.SUSPENSE_INFINITE,
				queryParam: query?.useInfiniteQueryParam,
				queryKeyFnName: (0, __orval_core.camel)(`get-${operationName}-infinite-query-key`)
			}] : []
		];
		const makeParamsOptional = (params$1) => {
			if (!params$1) return "";
			return params$1.replaceAll(/(\w+)(\?)?:\s*([^=,}]*?)\s*(=\s*[^,}]*)?([,}]|$)/g, (match, paramName, optionalMarker, type, defaultValue, suffix) => {
				if (defaultValue) return `${paramName}: ${type.trim()}${defaultValue}${suffix}`;
				return `${paramName}?: ${type.trim()}${suffix}`;
			});
		};
		const uniqueQueryOptionsByKeys = queries.filter((obj, index, self) => index === self.findIndex((t) => t.queryKeyFnName === obj.queryKeyFnName));
		implementation += `
${!queryKeyMutator ? uniqueQueryOptionsByKeys.reduce((acc, queryOption) => {
			const queryKeyProps = makeParamsOptional((0, __orval_core.toObjectString)(props.filter((prop) => prop.type !== __orval_core.GetterPropType.HEADER), "implementation"));
			const routeString = isVue(outputClient) || override.query.shouldSplitQueryKey ? (0, __orval_core.getRouteAsArray)(route) : `\`${route}\``;
			const queryKeyIdentifier = override.query.useOperationIdAsQueryKey ? `"${operationName}"` : routeString;
			const queryKeyFn = `
${override.query.shouldExportQueryKey ? "export " : ""}const ${queryOption.queryKeyFnName} = (${queryKeyProps}) => {
    return [
    ${[
				queryOption.type === QueryType.INFINITE || queryOption.type === QueryType.SUSPENSE_INFINITE ? `'infinite'` : "",
				queryKeyIdentifier,
				queryParams ? "...(params ? [params]: [])" : "",
				body.implementation
			].filter((x) => !!x).join(", ")}
    ] as const;
    }
`;
			return acc + queryKeyFn;
		}, "") : ""}`;
		implementation += `
    ${queries.reduce((acc, queryOption) => {
			return acc + generateQueryImplementation({
				queryOption,
				operationName,
				queryProperties,
				queryKeyProperties,
				params,
				props,
				mutator,
				isRequestOptions,
				queryParams,
				response,
				outputClient,
				httpClient,
				isExactOptionalPropertyTypes,
				hasSignal: getHasSignal({
					overrideQuerySignal: override.query.signal,
					verb
				}),
				queryOptionsMutator,
				queryKeyMutator,
				route,
				hasVueQueryV4,
				hasSvelteQueryV4,
				hasSvelteQueryV6,
				hasQueryV5,
				hasQueryV5WithDataTagError,
				hasQueryV5WithInfiniteQueryOptionsError,
				doc,
				usePrefetch: query.usePrefetch,
				useQuery: query.useQuery,
				useInfinite: query.useInfinite,
				useInvalidate: query.useInvalidate
			});
		}, "")}
`;
		mutators = queryOptionsMutator || queryKeyMutator ? [...queryOptionsMutator ? [queryOptionsMutator] : [], ...queryKeyMutator ? [queryKeyMutator] : []] : void 0;
	}
	if (isMutation) {
		const mutationOptionsMutator = query.mutationOptions ? await (0, __orval_core.generateMutator)({
			output,
			mutator: query.mutationOptions,
			name: `${operationName}MutationOptions`,
			workspace: context.workspace,
			tsconfig: context.output.tsconfig
		}) : void 0;
		const definitions = props.map(({ definition, type }) => type === __orval_core.GetterPropType.BODY ? mutator?.bodyTypeName ? `data: ${mutator.bodyTypeName}<${body.definition}>` : `data: ${body.definition}` : definition).join(";");
		const properties = props.map(({ name, type }) => type === __orval_core.GetterPropType.BODY ? "data" : name).join(",");
		const errorType = getQueryErrorType(operationName, response, httpClient, mutator);
		const dataType = mutator?.isHook ? `ReturnType<typeof use${(0, __orval_core.pascal)(operationName)}Hook>` : `typeof ${operationName}`;
		const mutationOptionFnReturnType = getQueryOptionsDefinition({
			operationName,
			mutator,
			definitions,
			hasSvelteQueryV4,
			hasQueryV5,
			hasQueryV5WithInfiniteQueryOptionsError,
			isReturnType: true
		});
		const mutationArguments = generateQueryArguments({
			operationName,
			definitions,
			mutator,
			isRequestOptions,
			hasSvelteQueryV4,
			hasQueryV5,
			hasQueryV5WithInfiniteQueryOptionsError,
			httpClient
		});
		const mutationOptionsFnName = (0, __orval_core.camel)(mutationOptionsMutator || mutator?.isHook ? `use-${operationName}-mutationOptions` : `get-${operationName}-mutationOptions`);
		const mutationOptionsVarName = isRequestOptions ? "mutationOptions" : "options";
		const hooksOptionImplementation = getHooksOptionImplementation(isRequestOptions, httpClient, (0, __orval_core.camel)(operationName), mutator);
		const mutationOptionsFn = `export const ${mutationOptionsFnName} = <TError = ${errorType},
    TContext = unknown>(${mutationArguments}): ${mutationOptionFnReturnType} => {

${hooksOptionImplementation}

      ${mutator?.isHook ? `const ${operationName} =  use${(0, __orval_core.pascal)(operationName)}Hook()` : ""}


      const mutationFn: MutationFunction<Awaited<ReturnType<${dataType}>>, ${definitions ? `{${definitions}}` : "void"}> = (${properties ? "props" : ""}) => {
          ${properties ? `const {${properties}} = props ?? {};` : ""}

          return  ${operationName}(${properties}${properties ? "," : ""}${getMutationRequestArgs(isRequestOptions, httpClient, mutator)})
        }

        ${mutationOptionsMutator ? `const customOptions = ${mutationOptionsMutator.name}({...mutationOptions, mutationFn}${mutationOptionsMutator.hasSecondArg ? `, { url: \`${route.replaceAll("/${", "/{")}\` }` : ""}${mutationOptionsMutator.hasThirdArg ? `, { operationId: '${operationId}', operationName: '${operationName}' }` : ""});` : ""}


  return  ${mutationOptionsMutator ? "customOptions" : "{ mutationFn, ...mutationOptions }"}}`;
		const operationPrefix = hasSvelteQueryV4 ? "create" : "use";
		const optionalQueryClientArgument = hasQueryV5 ? ", queryClient?: QueryClient" : "";
		implementation += `
${mutationOptionsFn}

    export type ${(0, __orval_core.pascal)(operationName)}MutationResult = NonNullable<Awaited<ReturnType<${dataType}>>>
    ${body.definition ? `export type ${(0, __orval_core.pascal)(operationName)}MutationBody = ${mutator?.bodyTypeName ? `${mutator.bodyTypeName}<${body.definition}>` : body.definition}` : ""}
    export type ${(0, __orval_core.pascal)(operationName)}MutationError = ${errorType}

    ${doc}export const ${(0, __orval_core.camel)(`${operationPrefix}-${operationName}`)} = <TError = ${errorType},
    TContext = unknown>(${mutationArguments} ${optionalQueryClientArgument})${generateMutatorReturnType({
			outputClient,
			dataType,
			variableType: definitions ? `{${definitions}}` : "void"
		})} => {

      const ${mutationOptionsVarName} = ${mutationOptionsFnName}(${isRequestOptions ? "options" : "mutationOptions"});

      return ${operationPrefix}Mutation(${hasSvelteQueryV6 ? `() => ({ ...${mutationOptionsVarName}${optionalQueryClientArgument ? ", queryClient" : ""} })` : `${mutationOptionsVarName}${optionalQueryClientArgument ? ", queryClient" : ""}`});
    }
    `;
		mutators = mutationOptionsMutator ? [...mutators ?? [], mutationOptionsMutator] : mutators;
	}
	return {
		implementation,
		mutators
	};
};
const generateQueryHeader = (params) => {
	return `${params.hasAwaitedType ? "" : `type AwaitedInput<T> = PromiseLike<T> | T;\n
      type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;\n\n`}
${params.isRequestOptions && params.isMutator ? `type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];\n\n` : ""}
${getQueryHeader(params)}
`;
};
const generateQuery = async (verbOptions, options, outputClient) => {
	const imports = (0, __orval_core.generateVerbImports)(verbOptions);
	const functionImplementation = generateQueryRequestFunction(verbOptions, options, isVue(outputClient));
	const { implementation: hookImplementation, mutators } = await generateQueryHook(verbOptions, options, outputClient);
	return {
		implementation: `${functionImplementation}\n\n${hookImplementation}`,
		imports,
		mutators
	};
};
const dependenciesBuilder = {
	"react-query": getReactQueryDependencies,
	"vue-query": getVueQueryDependencies,
	"svelte-query": getSvelteQueryDependencies
};
const builder = ({ type = "react-query", options: queryOptions, output } = {}) => () => {
	const client = (verbOptions, options, outputClient) => {
		if (options.override.useNamedParameters && (type === "vue-query" || outputClient === "vue-query")) throw new Error(`vue-query client does not support named parameters, and had broken reactivity previously, please set useNamedParameters to false; See for context: https://github.com/orval-labs/orval/pull/931#issuecomment-1752355686`);
		if (queryOptions) {
			const normalizedQueryOptions = normalizeQueryOptions(queryOptions, options.context.workspace);
			verbOptions.override.query = (0, __orval_core.mergeDeep)(normalizedQueryOptions, verbOptions.override.query);
			options.override.query = (0, __orval_core.mergeDeep)(normalizedQueryOptions, verbOptions.override.query);
		}
		return generateQuery(verbOptions, options, outputClient, output);
	};
	return {
		client,
		header: generateQueryHeader,
		dependencies: dependenciesBuilder[type]
	};
};
var src_default = builder;

//#endregion
exports.builder = builder;
exports.default = src_default;
exports.generateQuery = generateQuery;
exports.generateQueryHeader = generateQueryHeader;
exports.getReactQueryDependencies = getReactQueryDependencies;
exports.getSvelteQueryDependencies = getSvelteQueryDependencies;
exports.getVueQueryDependencies = getVueQueryDependencies;
//# sourceMappingURL=index.js.map