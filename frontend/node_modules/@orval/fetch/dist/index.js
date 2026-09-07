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
require("openapi3-ts/oas30");
require("openapi3-ts/oas31");

//#region src/index.ts
const generateRequestFunction = ({ queryParams, headers, operationName, response, mutator, body, props, verb, fetchReviver, formData, formUrlEncoded, override }, { route, context, pathRoute }) => {
	const isRequestOptions = override?.requestOptions !== false;
	const isFormData = override?.formData.disabled === false;
	const isFormUrlEncoded = override?.formUrlEncoded !== false;
	const getUrlFnName = (0, __orval_core.camel)(`get-${operationName}-url`);
	const getUrlFnProps = (0, __orval_core.toObjectString)(props.filter((prop) => prop.type === __orval_core.GetterPropType.PARAM || prop.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS || prop.type === __orval_core.GetterPropType.QUERY_PARAM), "implementation");
	const parameters = context.specs[context.specKey].paths[pathRoute]?.[verb]?.parameters || [];
	const explodeParameters = parameters.filter((parameter) => {
		const { schema } = (0, __orval_core.resolveRef)(parameter, context);
		const schemaObject = schema.schema;
		return schema.in === "query" && schemaObject.type === "array" && (schema.explode || override.fetch.explode);
	});
	const explodeParametersNames = explodeParameters.map((parameter) => {
		const { schema } = (0, __orval_core.resolveRef)(parameter, context);
		return schema.name;
	});
	const hasDateParams = context.output.override.useDates && parameters.some((p) => "schema" in p && p.schema && "format" in p.schema && p.schema.format === "date-time");
	const explodeArrayImplementation = explodeParameters.length > 0 ? `const explodeParameters = ${JSON.stringify(explodeParametersNames)};

    if (Array.isArray(value) && explodeParameters.includes(key)) {
      value.forEach((v) => {
        normalizedParams.append(key, v === null ? 'null' : ${hasDateParams ? "v instanceof Date ? v.toISOString() : " : ""}v.toString());
      });
      return;
    }
      ` : "";
	const isExplodeParametersOnly = explodeParameters.length === parameters.length;
	const getUrlFnImplementation = `export const ${getUrlFnName} = (${getUrlFnProps}) => {
${queryParams ? `  const normalizedParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    ${explodeArrayImplementation}
    ${!isExplodeParametersOnly ? `if (value !== undefined) {
      normalizedParams.append(key, value === null ? 'null' : ${hasDateParams ? "value instanceof Date ? value.toISOString() : " : ""}value.toString())
    }` : ""}
  });` : ""}

  ${queryParams ? `const stringifiedParams = normalizedParams.toString();` : ``}

  ${queryParams ? `return stringifiedParams.length > 0 ? \`${route}?\${stringifiedParams}\` : \`${route}\`` : `return \`${route}\``}
}\n`;
	const isContentTypeNdJson = (contentType) => contentType === "application/nd-json" || contentType === "application/x-ndjson";
	const isNdJson = response.contentTypes.some(isContentTypeNdJson);
	const responseTypeName = fetchResponseTypeName(override.fetch?.includeHttpResponseReturnType, isNdJson ? "Response" : response.definition.success, operationName);
	const allResponses = [...response.types.success, ...response.types.errors];
	if (allResponses.length === 0) allResponses.push({
		contentType: "",
		hasReadonlyProps: false,
		imports: [],
		isEnum: false,
		isRef: false,
		key: "default",
		schemas: [],
		type: "unknown",
		value: "unknown"
	});
	const nonDefaultStatuses = allResponses.filter((r) => r.key !== "default").map((r) => r.key);
	const responseDataTypes = allResponses.map((r) => allResponses.filter((r2) => r2.key === r.key).length > 1 ? {
		...r,
		suffix: (0, __orval_core.pascal)(r.contentType)
	} : r).map((r) => {
		const name = `${responseTypeName}${(0, __orval_core.pascal)(r.key)}${"suffix" in r ? r.suffix : ""}`;
		return {
			name,
			success: response.types.success.some((s) => s.key === r.key),
			value: `export type ${name} = {
  ${isContentTypeNdJson(r.contentType) ? `stream: TypedResponse<${r.value}>` : `data: ${r.value || "unknown"}`}
  status: ${r.key === "default" ? nonDefaultStatuses.length ? `Exclude<HTTPStatusCodes, ${nonDefaultStatuses.join(" | ")}>` : "number" : r.key}
}`
		};
	});
	const successName = `${responseTypeName}Success`;
	const errorName = `${responseTypeName}Error`;
	const hasSuccess = responseDataTypes.some((r) => r.success);
	const hasError = responseDataTypes.some((r) => !r.success);
	const responseTypeImplementation = override.fetch.includeHttpResponseReturnType ? `${responseDataTypes.map((r) => r.value).join("\n\n")}
    
${hasSuccess ? `export type ${successName} = (${responseDataTypes.filter((r) => r.success).map((r) => r.name).join(" | ")}) & {
  headers: Headers;
}` : ""};
${hasError ? `export type ${errorName} = (${responseDataTypes.filter((r) => !r.success).map((r) => r.name).join(" | ")}) & {
  headers: Headers;
}` : ""};

${override.fetch.forceSuccessResponse && hasSuccess ? "" : `export type ${responseTypeName} = (${hasError && hasSuccess ? `${successName} | ${errorName}` : hasSuccess ? successName : errorName})\n\n`}` : "";
	const getUrlFnProperties = props.filter((prop) => prop.type === __orval_core.GetterPropType.PARAM || prop.type === __orval_core.GetterPropType.QUERY_PARAM || prop.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS).map((param) => {
		if (param.type === __orval_core.GetterPropType.NAMED_PATH_PARAMS) return param.destructured;
		else return param.name;
	}).join(",");
	const args = `${(0, __orval_core.toObjectString)(props, "implementation")} ${isRequestOptions ? `options?: RequestInit` : ""}`;
	const returnType = override.fetch.forceSuccessResponse && hasSuccess ? `Promise<${successName}>` : `Promise<${responseTypeName}>`;
	const globalFetchOptions = (0, __orval_core.isObject)(override?.requestOptions) ? `${(0, __orval_core.stringify)(override?.requestOptions)?.slice(1, -1)?.trim()}` : "";
	const fetchMethodOption = `method: '${verb.toUpperCase()}'`;
	const headersToAdd = [
		...body.contentType && !["multipart/form-data"].includes(body.contentType) ? [`'Content-Type': '${body.contentType}'`] : [],
		...isNdJson && response.contentTypes.length === 1 ? [`Accept: ${response.contentTypes[0] === "application/x-ndjson" ? "'application/x-ndjson'" : "'application/nd-json'"}`] : [],
		...headers ? ["...headers"] : []
	];
	const fetchHeadersOption = headersToAdd.length ? `headers: { ${headersToAdd.join(",")}, ...options?.headers }` : "";
	const requestBodyParams = (0, __orval_core.generateBodyOptions)(body, isFormData, isFormUrlEncoded);
	const fetchBodyOption = requestBodyParams ? isFormData && body.formData || isFormUrlEncoded && body.formUrlEncoded || body.contentType === "text/plain" ? `body: ${requestBodyParams}` : `body: JSON.stringify(${requestBodyParams})` : "";
	const fetchFnOptions = `${getUrlFnName}(${getUrlFnProperties}),
  {${globalFetchOptions ? "\n" : ""}      ${globalFetchOptions}
    ${isRequestOptions ? "...options," : ""}
    ${fetchMethodOption}${fetchHeadersOption ? "," : ""}
    ${fetchHeadersOption}${fetchBodyOption ? "," : ""}
    ${fetchBodyOption}
  }
`;
	const reviver = fetchReviver ? `, ${fetchReviver.name}` : "";
	const throwOnErrorImplementation = `if (!${isNdJson ? "stream" : "res"}.ok) {
    ${isNdJson ? "const body = [204, 205, 304].includes(stream.status) ? null : await stream.text();" : ""}
    const err: globalThis.Error & {info?: ${hasError ? `${errorName}${override.fetch.includeHttpResponseReturnType ? "['data']" : ""}` : "any"}, status?: number} = new globalThis.Error();
    const data ${hasError ? `: ${errorName}${override.fetch.includeHttpResponseReturnType ? `['data']` : ""}` : ""} = body ? JSON.parse(body${reviver}) : {}
    err.info = data;
    err.status = ${isNdJson ? "stream" : "res"}.status;
    throw err;
  }`;
	const fetchResponseImplementation = isNdJson ? `  const stream = await fetch(${fetchFnOptions});
  ${override.fetch.forceSuccessResponse ? throwOnErrorImplementation : ""}
  ${override.fetch.includeHttpResponseReturnType ? `return { status: stream.status, stream, headers: stream.headers } as ${override.fetch.forceSuccessResponse && hasSuccess ? successName : responseTypeName}` : `return stream`}
  ` : `const res = await fetch(${fetchFnOptions})

  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  ${override.fetch.forceSuccessResponse ? throwOnErrorImplementation : ""}
  const data: ${override.fetch.forceSuccessResponse && hasSuccess ? successName : responseTypeName}${override.fetch.includeHttpResponseReturnType ? `['data']` : ""} = body ? JSON.parse(body${reviver}) : {}
  ${override.fetch.includeHttpResponseReturnType ? `return { data, status: res.status, headers: res.headers } as ${override.fetch.forceSuccessResponse && hasSuccess ? successName : responseTypeName}` : "return data"}
`;
	const customFetchResponseImplementation = `return ${mutator?.name}<${override.fetch.forceSuccessResponse && hasSuccess ? successName : responseTypeName}>(${fetchFnOptions});`;
	const bodyForm = (0, __orval_core.generateFormDataAndUrlEncodedFunction)({
		formData,
		formUrlEncoded,
		body,
		isFormData,
		isFormUrlEncoded
	});
	const fetchImplementationBody = mutator ? customFetchResponseImplementation : fetchResponseImplementation;
	const fetchImplementation = `export const ${operationName} = async (${args}): ${returnType} => {
  ${bodyForm ? `  ${bodyForm}` : ""}
  ${fetchImplementationBody}}
`;
	return `${responseTypeImplementation}${getUrlFnImplementation}\n${fetchImplementation}\n`;
};
const fetchResponseTypeName = (includeHttpResponseReturnType, definitionSuccessResponse, operationName) => {
	return includeHttpResponseReturnType ? `${operationName}Response` : definitionSuccessResponse;
};
const generateClient = (verbOptions, options) => {
	const imports = (0, __orval_core.generateVerbImports)(verbOptions);
	return {
		implementation: `${generateRequestFunction(verbOptions, options)}\n`,
		imports
	};
};
const getHTTPStatusCodes = () => `
export type HTTPStatusCode1xx = 100 | 101 | 102 | 103;
export type HTTPStatusCode2xx = 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207;
export type HTTPStatusCode3xx = 300 | 301 | 302 | 303 | 304 | 305 | 307 | 308;
export type HTTPStatusCode4xx = 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 419 | 420 | 421 | 422 | 423 | 424 | 426 | 428 | 429 | 431 | 451;
export type HTTPStatusCode5xx = 500 | 501 | 502 | 503 | 504 | 505 | 507 | 511;
export type HTTPStatusCodes = HTTPStatusCode1xx | HTTPStatusCode2xx | HTTPStatusCode3xx | HTTPStatusCode4xx | HTTPStatusCode5xx;

`;
const generateFetchHeader = ({ clientImplementation }) => {
	return clientImplementation.includes("<HTTPStatusCodes,") ? getHTTPStatusCodes() : "";
};
const fetchClientBuilder = {
	client: generateClient,
	header: generateFetchHeader,
	dependencies: () => []
};
const builder = () => () => fetchClientBuilder;
var src_default = builder;

//#endregion
exports.builder = builder;
exports.default = src_default;
exports.fetchResponseTypeName = fetchResponseTypeName;
exports.generateClient = generateClient;
exports.generateFetchHeader = generateFetchHeader;
exports.generateRequestFunction = generateRequestFunction;
//# sourceMappingURL=index.js.map