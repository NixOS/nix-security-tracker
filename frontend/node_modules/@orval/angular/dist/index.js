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
const ANGULAR_DEPENDENCIES = [
	{
		exports: [
			{
				name: "HttpClient",
				values: true
			},
			{ name: "HttpHeaders" },
			{ name: "HttpParams" },
			{ name: "HttpContext" },
			{
				name: "HttpResponse",
				alias: "AngularHttpResponse"
			},
			{ name: "HttpEvent" }
		],
		dependency: "@angular/common/http"
	},
	{
		exports: [{
			name: "Injectable",
			values: true
		}, {
			name: "inject",
			values: true
		}],
		dependency: "@angular/core"
	},
	{
		exports: [{
			name: "Observable",
			values: true
		}],
		dependency: "rxjs"
	},
	{
		exports: [{ name: "DeepNonNullable" }],
		dependency: "@orval/core"
	}
];
const returnTypesToWrite = /* @__PURE__ */ new Map();
const getAngularDependencies = () => ANGULAR_DEPENDENCIES;
const generateAngularTitle = (title) => {
	const sanTitle = (0, __orval_core.sanitize)(title);
	return `${(0, __orval_core.pascal)(sanTitle)}Service`;
};
const generateAngularHeader = ({ title, isRequestOptions, isMutator, isGlobalMutator, provideIn }) => `
${isRequestOptions && !isGlobalMutator ? `interface HttpClientOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  context?: HttpContext;
  params?:
        | HttpParams
        | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
  reportProgress?: boolean;
  withCredentials?: boolean;
  credentials?: RequestCredentials;
  keepalive?: boolean;
  priority?: RequestPriority;
  cache?: RequestCache;
  mode?: RequestMode;
  redirect?: RequestRedirect;
  referrer?: string;
  integrity?: string;
  transferCache?: {includeHeaders?: string[]} | boolean;
  timeout?: number;
}` : ""}

${isRequestOptions && isMutator ? `// eslint-disable-next-line
    type ThirdParameter<T extends (...args: any) => any> = T extends (
  config: any,
  httpClient: any,
  args: infer P,
) => any
  ? P
  : never;` : ""}

@Injectable(${provideIn ? `{ providedIn: '${(0, __orval_core.isBoolean)(provideIn) ? "root" : provideIn}' }` : ""})
export class ${title} {
  private readonly http = inject(HttpClient);
`;
const generateAngularFooter = ({ operationNames }) => {
	let footer = "};\n\n";
	for (const operationName of operationNames) if (returnTypesToWrite.has(operationName)) footer += returnTypesToWrite.get(operationName) + "\n";
	return footer;
};
const generateImplementation = ({ headers, queryParams, operationName, response, mutator, body, props, verb, override, formData, formUrlEncoded, paramsSerializer }, { route, context }) => {
	const isRequestOptions = override?.requestOptions !== false;
	const isFormData = !override?.formData.disabled;
	const isFormUrlEncoded = override?.formUrlEncoded !== false;
	const isExactOptionalPropertyTypes = !!context.output.tsconfig?.compilerOptions?.exactOptionalPropertyTypes;
	const bodyForm = (0, __orval_core.generateFormDataAndUrlEncodedFunction)({
		formData,
		formUrlEncoded,
		body,
		isFormData,
		isFormUrlEncoded
	});
	const dataType = response.definition.success || "unknown";
	returnTypesToWrite.set(operationName, `export type ${(0, __orval_core.pascal)(operationName)}ClientResult = NonNullable<${dataType}>`);
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
		const requestOptions = isRequestOptions ? (0, __orval_core.generateMutatorRequestOptions)(override?.requestOptions, mutator.hasThirdArg) : "";
		const propsImplementation = mutator.bodyTypeName && body.definition ? (0, __orval_core.toObjectString)(props, "implementation").replace(/* @__PURE__ */ new RegExp(`(\\w*):\\s?${body.definition}`), `$1: ${mutator.bodyTypeName}<${body.definition}>`) : (0, __orval_core.toObjectString)(props, "implementation");
		return ` ${operationName}<TData = ${dataType}>(\n    ${propsImplementation}\n ${isRequestOptions && mutator.hasThirdArg ? `options?: ThirdParameter<typeof ${mutator.name}>` : ""}) {${bodyForm}
      return ${mutator.name}<TData>(
      ${mutatorConfig},
      this.http,
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
		isAngular: true,
		isExactOptionalPropertyTypes,
		hasSignal: false
	});
	const propsDefinition = (0, __orval_core.toObjectString)(props, "definition");
	const isModelType = dataType !== "Blob" && dataType !== "string";
	let functionName = operationName;
	if (isModelType) functionName += `<TData = ${dataType}>`;
	return ` ${isRequestOptions ? `${functionName}(${propsDefinition} options?: HttpClientOptions & { observe?: 'body' }): Observable<${isModelType ? "TData" : dataType}>;
 ${functionName}(${propsDefinition} options?: HttpClientOptions & { observe: 'events' }): Observable<HttpEvent<${isModelType ? "TData" : dataType}>>;
 ${functionName}(${propsDefinition} options?: HttpClientOptions & { observe: 'response' }): Observable<AngularHttpResponse<${isModelType ? "TData" : dataType}>>;` : ""}
  ${functionName}(
    ${(0, __orval_core.toObjectString)(props, "implementation")} ${isRequestOptions ? `options?: HttpClientOptions & { observe?: any }` : ""}): Observable<any> {${bodyForm}
    return this.http.${verb}${isModelType ? "<TData>" : ""}(${options});
  }
`;
};
const generateAngular = (verbOptions, options) => {
	const imports = (0, __orval_core.generateVerbImports)(verbOptions);
	return {
		implementation: generateImplementation(verbOptions, options),
		imports
	};
};
const angularClientBuilder = {
	client: generateAngular,
	header: generateAngularHeader,
	dependencies: getAngularDependencies,
	footer: generateAngularFooter,
	title: generateAngularTitle
};
const builder = () => () => angularClientBuilder;
var src_default = builder;

//#endregion
exports.builder = builder;
exports.default = src_default;
exports.generateAngular = generateAngular;
exports.generateAngularFooter = generateAngularFooter;
exports.generateAngularHeader = generateAngularHeader;
exports.generateAngularTitle = generateAngularTitle;
exports.getAngularDependencies = getAngularDependencies;
//# sourceMappingURL=index.js.map