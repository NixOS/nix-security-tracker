import SwaggerParser from "@apidevtools/swagger-parser";
import { allLocales } from "@faker-js/faker";
import { JSONSchema6, JSONSchema7 } from "json-schema";
import { ComponentsObject, ExampleObject, InfoObject, OpenAPIObject, OperationObject, ParameterObject, PathItemObject, ReferenceObject, RequestBodyObject, ResponseObject, ResponsesObject, SchemaObject, SchemasObject } from "openapi3-ts/oas30";
import { ConvertInputOptions } from "swagger2openapi";
import { TypeDocOptions } from "typedoc";
import { ValueIteratee } from "lodash";
import { ServerObject } from "openapi3-ts/oas31";
import { CompareOperator } from "compare-versions";
import debug from "debug";

//#region rolldown:runtime
//#endregion
//#region src/types.d.ts
interface Options {
  output?: string | OutputOptions;
  input?: string | InputOptions;
  hooks?: Partial<HooksOptions>;
}
type OptionsFn = () => Options | Promise<Options>;
type OptionsExport = Options | Promise<Options> | OptionsFn;
type Config = Record<string, OptionsExport>;
type ConfigFn = () => Config | Promise<Config>;
type ConfigExternal = Config | Promise<Config> | ConfigFn;
type NormalizedConfig = Record<string, NormalizedOptions | undefined>;
interface NormalizedOptions {
  output: NormalizedOutputOptions;
  input: NormalizedInputOptions;
  hooks: NormalizedHookOptions;
}
type NormalizedOutputOptions = {
  workspace?: string;
  target?: string;
  schemas?: string;
  namingConvention: NamingConvention;
  fileExtension: string;
  mode: OutputMode;
  mock?: GlobalMockOptions | ClientMockBuilder;
  override: NormalizedOverrideOutput;
  client: OutputClient | OutputClientFunc;
  httpClient: OutputHttpClient;
  clean: boolean | string[];
  docs: boolean | OutputDocsOptions;
  prettier: boolean;
  biome: boolean;
  tsconfig?: Tsconfig;
  packageJson?: PackageJson;
  headers: boolean;
  indexFiles: boolean;
  baseUrl?: string | BaseUrlFromSpec | BaseUrlFromConstant;
  allParamsOptional: boolean;
  urlEncodeParameters: boolean;
  unionAddMissingProperties: boolean;
  optionsParamRequired: boolean;
  propertySortOrder: PropertySortOrder;
};
type NormalizedParamsSerializerOptions = {
  qs?: Record<string, any>;
};
type NormalizedOverrideOutput = {
  title?: (title: string) => string;
  transformer?: OutputTransformer;
  mutator?: NormalizedMutator;
  operations: Record<string, NormalizedOperationOptions>;
  tags: Record<string, NormalizedOperationOptions>;
  mock?: OverrideMockOptions;
  contentType?: OverrideOutputContentType;
  header: false | ((info: InfoObject) => string[] | string);
  formData: NormalizedFormDataType<NormalizedMutator>;
  formUrlEncoded: boolean | NormalizedMutator;
  paramsSerializer?: NormalizedMutator;
  paramsSerializerOptions?: NormalizedParamsSerializerOptions;
  namingConvention: {
    enum?: NamingConvention;
  };
  components: {
    schemas: {
      suffix: string;
      itemSuffix: string;
    };
    responses: {
      suffix: string;
    };
    parameters: {
      suffix: string;
    };
    requestBodies: {
      suffix: string;
    };
  };
  hono: NormalizedHonoOptions;
  query: NormalizedQueryOptions;
  angular: Required<AngularOptions>;
  swr: SwrOptions;
  zod: NormalizedZodOptions;
  fetch: NormalizedFetchOptions;
  operationName?: (operation: OperationObject, route: string, verb: Verbs) => string;
  requestOptions: Record<string, any> | boolean;
  useDates?: boolean;
  coerceTypes?: boolean;
  useTypeOverInterfaces?: boolean;
  useDeprecatedOperations?: boolean;
  useBigInt?: boolean;
  useNamedParameters?: boolean;
  enumGenerationType: EnumGeneration;
  suppressReadonlyModifier?: boolean;
  jsDoc: NormalizedJsDocOptions;
};
type NormalizedMutator = {
  path: string;
  name?: string;
  default: boolean;
  alias?: Record<string, string>;
  extension?: string;
};
type NormalizedOperationOptions = {
  transformer?: OutputTransformer;
  mutator?: NormalizedMutator;
  mock?: {
    data?: MockData;
    properties?: MockProperties;
  };
  contentType?: OverrideOutputContentType;
  query?: NormalizedQueryOptions;
  angular?: Required<AngularOptions>;
  swr?: SwrOptions;
  zod?: NormalizedZodOptions;
  operationName?: (operation: OperationObject, route: string, verb: Verbs) => string;
  fetch?: FetchOptions;
  formData?: NormalizedFormDataType<NormalizedMutator>;
  formUrlEncoded?: boolean | NormalizedMutator;
  paramsSerializer?: NormalizedMutator;
  requestOptions?: object | boolean;
};
type NormalizedInputOptions = {
  target: string | Record<string, unknown> | OpenAPIObject;
  validation: boolean | object;
  override: OverrideInput;
  converterOptions: Partial<ConvertInputOptions>;
  parserOptions: SwaggerParserOptions;
  filters?: InputFiltersOption;
};
type OutputClientFunc = (clients: GeneratorClients) => ClientGeneratorsBuilder;
type BaseUrlFromSpec = {
  getBaseUrlFromSpecification: true;
  variables?: Record<string, string>;
  index?: number;
  baseUrl?: never;
};
type BaseUrlFromConstant = {
  getBaseUrlFromSpecification: false;
  variables?: never;
  index?: never;
  baseUrl: string;
};
declare const PropertySortOrder: {
  readonly ALPHABETICAL: "Alphabetical";
  readonly SPECIFICATION: "Specification";
};
type PropertySortOrder = (typeof PropertySortOrder)[keyof typeof PropertySortOrder];
declare const NamingConvention: {
  readonly CAMEL_CASE: "camelCase";
  readonly PASCAL_CASE: "PascalCase";
  readonly SNAKE_CASE: "snake_case";
  readonly KEBAB_CASE: "kebab-case";
};
type NamingConvention = (typeof NamingConvention)[keyof typeof NamingConvention];
declare const EnumGeneration: {
  readonly CONST: "const";
  readonly ENUM: "enum";
  readonly UNION: "union";
};
type EnumGeneration = (typeof EnumGeneration)[keyof typeof EnumGeneration];
type OutputOptions = {
  workspace?: string;
  target?: string;
  schemas?: string;
  namingConvention?: NamingConvention;
  fileExtension?: string;
  mode?: OutputMode;
  mock?: boolean | GlobalMockOptions | ClientMockBuilder;
  override?: OverrideOutput;
  client?: OutputClient | OutputClientFunc;
  httpClient?: OutputHttpClient;
  clean?: boolean | string[];
  docs?: boolean | OutputDocsOptions;
  prettier?: boolean;
  biome?: boolean;
  tsconfig?: string | Tsconfig;
  packageJson?: string;
  headers?: boolean;
  indexFiles?: boolean;
  baseUrl?: string | BaseUrlFromSpec | BaseUrlFromConstant;
  allParamsOptional?: boolean;
  urlEncodeParameters?: boolean;
  unionAddMissingProperties?: boolean;
  optionsParamRequired?: boolean;
  propertySortOrder?: PropertySortOrder;
};
type SwaggerParserOptions = Omit<SwaggerParser.Options, 'validate'> & {
  validate?: boolean;
};
type InputFiltersOption = {
  mode?: 'include' | 'exclude';
  tags?: (string | RegExp)[];
  schemas?: (string | RegExp)[];
};
type InputOptions = {
  target: string | Record<string, unknown> | OpenAPIObject;
  validation?: boolean | object;
  override?: OverrideInput;
  converterOptions?: Partial<ConvertInputOptions>;
  parserOptions?: SwaggerParserOptions;
  filters?: InputFiltersOption;
};
declare const OutputClient: {
  readonly ANGULAR: "angular";
  readonly AXIOS: "axios";
  readonly AXIOS_FUNCTIONS: "axios-functions";
  readonly REACT_QUERY: "react-query";
  readonly SVELTE_QUERY: "svelte-query";
  readonly VUE_QUERY: "vue-query";
  readonly SWR: "swr";
  readonly ZOD: "zod";
  readonly HONO: "hono";
  readonly FETCH: "fetch";
  readonly MCP: "mcp";
};
type OutputClient = (typeof OutputClient)[keyof typeof OutputClient];
declare const OutputHttpClient: {
  readonly AXIOS: "axios";
  readonly FETCH: "fetch";
};
type OutputHttpClient = (typeof OutputHttpClient)[keyof typeof OutputHttpClient];
declare const OutputMode: {
  readonly SINGLE: "single";
  readonly SPLIT: "split";
  readonly TAGS: "tags";
  readonly TAGS_SPLIT: "tags-split";
};
type OutputMode = (typeof OutputMode)[keyof typeof OutputMode];
type OutputDocsOptions = {
  configPath?: string;
} & Partial<TypeDocOptions>;
declare const OutputMockType: {
  readonly MSW: "msw";
};
type OutputMockType = (typeof OutputMockType)[keyof typeof OutputMockType];
type GlobalMockOptions = {
  type: OutputMockType;
  useExamples?: boolean;
  generateEachHttpStatus?: boolean;
  delay?: false | number | (() => number);
  delayFunctionLazyExecute?: boolean;
  baseUrl?: string;
  locale?: keyof typeof allLocales;
  indexMockFiles?: boolean;
};
type OverrideMockOptions = Partial<GlobalMockOptions> & {
  arrayMin?: number;
  arrayMax?: number;
  stringMin?: number;
  stringMax?: number;
  numberMin?: number;
  numberMax?: number;
  required?: boolean;
  properties?: MockProperties;
  format?: Record<string, unknown>;
  fractionDigits?: number;
};
type MockOptions = Omit<OverrideMockOptions, 'properties'> & {
  properties?: Record<string, unknown>;
  operations?: Record<string, {
    properties: Record<string, unknown>;
  }>;
  tags?: Record<string, {
    properties: Record<string, unknown>;
  }>;
};
type MockPropertiesObject = Record<string, unknown>;
type MockPropertiesObjectFn = (specs: OpenAPIObject) => MockPropertiesObject;
type MockProperties = MockPropertiesObject | MockPropertiesObjectFn;
type MockDataObject = Record<string, unknown>;
type MockDataObjectFn = (specs: OpenAPIObject) => MockDataObject;
type MockDataArray = unknown[];
type MockDataArrayFn = (specs: OpenAPIObject) => MockDataArray;
type MockData = MockDataObject | MockDataObjectFn | MockDataArray | MockDataArrayFn;
type OutputTransformerFn = (verb: GeneratorVerbOptions) => GeneratorVerbOptions;
type OutputTransformer = string | OutputTransformerFn;
type MutatorObject = {
  path: string;
  name?: string;
  default?: boolean;
  alias?: Record<string, string>;
  extension?: string;
};
type Mutator = string | MutatorObject;
type ParamsSerializerOptions = {
  qs?: Record<string, any>;
};
declare const FormDataArrayHandling: {
  readonly SERIALIZE: "serialize";
  readonly EXPLODE: "explode";
  readonly SERIALIZE_WITH_BRACKETS: "serialize-with-brackets";
};
type FormDataArrayHandling = (typeof FormDataArrayHandling)[keyof typeof FormDataArrayHandling];
type NormalizedFormDataType<TMutator> = {
  disabled: true;
  mutator?: never;
  arrayHandling: FormDataArrayHandling;
} | {
  disabled: false;
  mutator?: TMutator;
  arrayHandling: FormDataArrayHandling;
};
type FormDataType<TMutator> = {
  mutator: TMutator;
  arrayHandling?: FormDataArrayHandling;
} | {
  mutator?: TMutator;
  arrayHandling: FormDataArrayHandling;
};
type OverrideOutput = {
  title?: (title: string) => string;
  transformer?: OutputTransformer;
  mutator?: Mutator;
  operations?: Record<string, OperationOptions>;
  tags?: Record<string, OperationOptions>;
  mock?: OverrideMockOptions;
  contentType?: OverrideOutputContentType;
  header?: boolean | ((info: InfoObject) => string[] | string);
  formData?: boolean | Mutator | FormDataType<Mutator>;
  formUrlEncoded?: boolean | Mutator;
  paramsSerializer?: Mutator;
  paramsSerializerOptions?: ParamsSerializerOptions;
  namingConvention?: {
    enum?: NamingConvention;
  };
  components?: {
    schemas?: {
      suffix?: string;
      itemSuffix?: string;
    };
    responses?: {
      suffix?: string;
    };
    parameters?: {
      suffix?: string;
    };
    requestBodies?: {
      suffix?: string;
    };
  };
  hono?: HonoOptions;
  query?: QueryOptions;
  swr?: SwrOptions;
  angular?: AngularOptions;
  zod?: ZodOptions;
  operationName?: (operation: OperationObject, route: string, verb: Verbs) => string;
  fetch?: FetchOptions;
  requestOptions?: Record<string, any> | boolean;
  useDates?: boolean;
  useTypeOverInterfaces?: boolean;
  useDeprecatedOperations?: boolean;
  useBigInt?: boolean;
  useNamedParameters?: boolean;
  /**
   * @deprecated use 'enumGenerationType="enum"' instead
   */
  useNativeEnums?: boolean;
  enumGenerationType?: EnumGeneration;
  suppressReadonlyModifier?: boolean;
  jsDoc?: JsDocOptions;
};
type JsDocOptions = {
  filter?: (schema: Record<string, any>) => {
    key: string;
    value: string;
  }[];
};
type NormalizedJsDocOptions = {
  filter?: (schema: Record<string, any>) => {
    key: string;
    value: string;
  }[];
};
type OverrideOutputContentType = {
  include?: string[];
  exclude?: string[];
};
type NormalizedHonoOptions = {
  handlers?: string;
  compositeRoute: string;
  validator: boolean | 'hono';
  validatorOutputPath: string;
};
type ZodDateTimeOptions = {
  offset?: boolean;
  local?: boolean;
  precision?: number;
};
type ZodTimeOptions = {
  precision?: -1 | 0 | 1 | 2 | 3;
};
type ZodOptions = {
  strict?: {
    param?: boolean;
    query?: boolean;
    header?: boolean;
    body?: boolean;
    response?: boolean;
  };
  generate?: {
    param?: boolean;
    query?: boolean;
    header?: boolean;
    body?: boolean;
    response?: boolean;
  };
  coerce?: {
    param?: boolean | ZodCoerceType[];
    query?: boolean | ZodCoerceType[];
    header?: boolean | ZodCoerceType[];
    body?: boolean | ZodCoerceType[];
    response?: boolean | ZodCoerceType[];
  };
  preprocess?: {
    param?: Mutator;
    query?: Mutator;
    header?: Mutator;
    body?: Mutator;
    response?: Mutator;
  };
  dateTimeOptions?: ZodDateTimeOptions;
  timeOptions?: ZodTimeOptions;
  generateEachHttpStatus?: boolean;
};
type ZodCoerceType = 'string' | 'number' | 'boolean' | 'bigint' | 'date';
type NormalizedZodOptions = {
  strict: {
    param: boolean;
    query: boolean;
    header: boolean;
    body: boolean;
    response: boolean;
  };
  generate: {
    param: boolean;
    query: boolean;
    header: boolean;
    body: boolean;
    response: boolean;
  };
  coerce: {
    param: boolean | ZodCoerceType[];
    query: boolean | ZodCoerceType[];
    header: boolean | ZodCoerceType[];
    body: boolean | ZodCoerceType[];
    response: boolean | ZodCoerceType[];
  };
  preprocess: {
    param?: NormalizedMutator;
    query?: NormalizedMutator;
    header?: NormalizedMutator;
    body?: NormalizedMutator;
    response?: NormalizedMutator;
  };
  generateEachHttpStatus: boolean;
  dateTimeOptions: ZodDateTimeOptions;
  timeOptions: ZodTimeOptions;
};
type HonoOptions = {
  handlers?: string;
  compositeRoute?: string;
  validator?: boolean | 'hono';
  validatorOutputPath?: string;
};
type NormalizedQueryOptions = {
  useQuery?: boolean;
  useSuspenseQuery?: boolean;
  useMutation?: boolean;
  useInfinite?: boolean;
  useSuspenseInfiniteQuery?: boolean;
  useInfiniteQueryParam?: string;
  usePrefetch?: boolean;
  useInvalidate?: boolean;
  options?: any;
  queryKey?: NormalizedMutator;
  queryOptions?: NormalizedMutator;
  mutationOptions?: NormalizedMutator;
  shouldExportMutatorHooks?: boolean;
  shouldExportHttpClient?: boolean;
  shouldExportQueryKey?: boolean;
  shouldSplitQueryKey?: boolean;
  useOperationIdAsQueryKey?: boolean;
  signal?: boolean;
  version?: 3 | 4 | 5;
};
type QueryOptions = {
  useQuery?: boolean;
  useSuspenseQuery?: boolean;
  useMutation?: boolean;
  useInfinite?: boolean;
  useSuspenseInfiniteQuery?: boolean;
  useInfiniteQueryParam?: string;
  usePrefetch?: boolean;
  useInvalidate?: boolean;
  options?: any;
  queryKey?: Mutator;
  queryOptions?: Mutator;
  mutationOptions?: Mutator;
  shouldExportMutatorHooks?: boolean;
  shouldExportHttpClient?: boolean;
  shouldExportQueryKey?: boolean;
  shouldSplitQueryKey?: boolean;
  useOperationIdAsQueryKey?: boolean;
  signal?: boolean;
  version?: 3 | 4 | 5;
};
type AngularOptions = {
  provideIn?: 'root' | 'any' | boolean;
};
type SwrOptions = {
  useInfinite?: boolean;
  useSWRMutationForGet?: boolean;
  swrOptions?: any;
  swrMutationOptions?: any;
  swrInfiniteOptions?: any;
};
type NormalizedFetchOptions = {
  includeHttpResponseReturnType: boolean;
  forceSuccessResponse: boolean;
  explode: boolean;
  jsonReviver?: Mutator;
};
type FetchOptions = {
  includeHttpResponseReturnType?: boolean;
  forceSuccessResponse?: boolean;
  explode?: boolean;
  jsonReviver?: Mutator;
};
type InputTransformerFn = (spec: OpenAPIObject) => OpenAPIObject;
type InputTransformer = string | InputTransformerFn;
type OverrideInput = {
  transformer?: InputTransformer;
};
type OperationOptions = {
  transformer?: OutputTransformer;
  mutator?: Mutator;
  mock?: {
    data?: MockData;
    properties?: MockProperties;
  };
  query?: QueryOptions;
  angular?: Required<AngularOptions>;
  swr?: SwrOptions;
  zod?: ZodOptions;
  operationName?: (operation: OperationObject, route: string, verb: Verbs) => string;
  fetch?: FetchOptions;
  formData?: boolean | Mutator | FormDataType<Mutator>;
  formUrlEncoded?: boolean | Mutator;
  paramsSerializer?: Mutator;
  requestOptions?: object | boolean;
};
type Hook = 'afterAllFilesWrite';
type HookFunction = (...args: any[]) => void | Promise<void>;
interface HookOption {
  command: string | HookFunction;
  injectGeneratedDirsAndFiles?: boolean;
}
type HookCommand = string | HookFunction | HookOption | (string | HookFunction | HookOption)[];
type NormalizedHookCommand = HookCommand[];
type HooksOptions<T$1 = HookCommand | NormalizedHookCommand> = Partial<Record<Hook, T$1>>;
type NormalizedHookOptions = HooksOptions<NormalizedHookCommand>;
type Verbs = 'post' | 'put' | 'get' | 'patch' | 'delete' | 'head';
declare const Verbs: {
  POST: Verbs;
  PUT: Verbs;
  GET: Verbs;
  PATCH: Verbs;
  DELETE: Verbs;
  HEAD: Verbs;
};
type ImportOpenApi = {
  data: JSONSchema6 | JSONSchema7 | Record<string, unknown | OpenAPIObject>;
  input: NormalizedInputOptions;
  output: NormalizedOutputOptions;
  target: string;
  workspace: string;
};
interface ContextSpecs {
  specKey: string;
  target: string;
  workspace: string;
  specs: Record<string, OpenAPIObject>;
  parents?: string[];
  output: NormalizedOutputOptions;
}
interface GlobalOptions {
  projectName?: string;
  watch?: boolean | string | (string | boolean)[];
  clean?: boolean | string[];
  prettier?: boolean;
  biome?: boolean;
  mock?: boolean | GlobalMockOptions;
  client?: OutputClient;
  httpClient?: OutputHttpClient;
  mode?: OutputMode;
  tsconfig?: string | Tsconfig;
  packageJson?: string;
  input?: string;
  output?: string;
}
interface Tsconfig {
  baseUrl?: string;
  compilerOptions?: {
    esModuleInterop?: boolean;
    allowSyntheticDefaultImports?: boolean;
    exactOptionalPropertyTypes?: boolean;
    paths?: Record<string, string[]>;
    target?: TsConfigTarget;
  };
}
type TsConfigTarget = 'es3' | 'es5' | 'es6' | 'es2015' | 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'es2021' | 'es2022' | 'esnext';
interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}
type GeneratorSchema = {
  name: string;
  model: string;
  imports: GeneratorImport[];
};
type GeneratorImport = {
  name: string;
  schemaName?: string;
  isConstant?: boolean;
  alias?: string;
  specKey?: string;
  default?: boolean;
  values?: boolean;
  syntheticDefaultImport?: boolean;
  namespaceImport?: boolean;
};
type GeneratorDependency = {
  exports: GeneratorImport[];
  dependency: string;
};
type GeneratorApiResponse = {
  operations: GeneratorOperations;
  schemas: GeneratorSchema[];
};
type GeneratorOperations = Record<string, GeneratorOperation>;
type GeneratorTarget = {
  imports: GeneratorImport[];
  implementation: string;
  implementationMock: string;
  importsMock: GeneratorImport[];
  mutators?: GeneratorMutator[];
  clientMutators?: GeneratorMutator[];
  formData?: GeneratorMutator[];
  formUrlEncoded?: GeneratorMutator[];
  paramsSerializer?: GeneratorMutator[];
  fetchReviver?: GeneratorMutator[];
};
type GeneratorTargetFull = {
  imports: GeneratorImport[];
  implementation: string;
  implementationMock: {
    function: string;
    handler: string;
    handlerName: string;
  };
  importsMock: GeneratorImport[];
  mutators?: GeneratorMutator[];
  clientMutators?: GeneratorMutator[];
  formData?: GeneratorMutator[];
  formUrlEncoded?: GeneratorMutator[];
  paramsSerializer?: GeneratorMutator[];
  fetchReviver?: GeneratorMutator[];
};
type GeneratorOperation = {
  imports: GeneratorImport[];
  implementation: string;
  implementationMock: {
    function: string;
    handler: string;
    handlerName: string;
  };
  importsMock: GeneratorImport[];
  tags: string[];
  mutator?: GeneratorMutator;
  clientMutators?: GeneratorMutator[];
  formData?: GeneratorMutator;
  formUrlEncoded?: GeneratorMutator;
  paramsSerializer?: GeneratorMutator;
  fetchReviver?: GeneratorMutator;
  operationName: string;
  types?: {
    result: (title?: string) => string;
  };
};
type GeneratorVerbOptions = {
  verb: Verbs;
  route: string;
  pathRoute: string;
  summary?: string;
  doc: string;
  tags: string[];
  operationId: string;
  operationName: string;
  response: GetterResponse;
  body: GetterBody;
  headers?: GetterQueryParam;
  queryParams?: GetterQueryParam;
  params: GetterParams;
  props: GetterProps;
  mutator?: GeneratorMutator;
  formData?: GeneratorMutator;
  formUrlEncoded?: GeneratorMutator;
  paramsSerializer?: GeneratorMutator;
  fetchReviver?: GeneratorMutator;
  override: NormalizedOverrideOutput;
  deprecated?: boolean;
  originalOperation: OperationObject;
};
type GeneratorVerbsOptions = GeneratorVerbOptions[];
type GeneratorOptions = {
  route: string;
  pathRoute: string;
  override: NormalizedOverrideOutput;
  context: ContextSpecs;
  mock?: GlobalMockOptions | ClientMockBuilder;
  output: string;
};
type GeneratorClient = {
  implementation: string;
  imports: GeneratorImport[];
  mutators?: GeneratorMutator[];
};
type GeneratorMutatorParsingInfo = {
  numberOfParams: number;
  returnNumberOfParams?: number;
};
type GeneratorMutator = {
  name: string;
  path: string;
  default: boolean;
  hasErrorType: boolean;
  errorTypeName: string;
  hasSecondArg: boolean;
  hasThirdArg: boolean;
  isHook: boolean;
  bodyTypeName?: string;
};
type ClientBuilder = (verbOptions: GeneratorVerbOptions, options: GeneratorOptions, outputClient: OutputClient | OutputClientFunc, output?: NormalizedOutputOptions) => GeneratorClient | Promise<GeneratorClient>;
type ClientFileBuilder = {
  path: string;
  content: string;
};
type ClientExtraFilesBuilder = (verbOptions: Record<string, GeneratorVerbOptions>, output: NormalizedOutputOptions, context: ContextSpecs) => Promise<ClientFileBuilder[]>;
type ClientHeaderBuilder = (params: {
  title: string;
  isRequestOptions: boolean;
  isMutator: boolean;
  noFunction?: boolean;
  isGlobalMutator: boolean;
  provideIn: boolean | 'root' | 'any';
  hasAwaitedType: boolean;
  output: NormalizedOutputOptions;
  verbOptions: Record<string, GeneratorVerbOptions>;
  tag?: string;
  clientImplementation: string;
}) => string;
type ClientFooterBuilder = (params: {
  noFunction?: boolean | undefined;
  operationNames: string[];
  title?: string;
  hasAwaitedType: boolean;
  hasMutator: boolean;
}) => string;
type ClientTitleBuilder = (title: string) => string;
type ClientDependenciesBuilder = (hasGlobalMutator: boolean, hasParamsSerializerOptions: boolean, packageJson?: PackageJson, httpClient?: OutputHttpClient, hasTagsMutator?: boolean, override?: NormalizedOverrideOutput) => GeneratorDependency[];
type ClientMockGeneratorImplementation = {
  function: string;
  handlerName: string;
  handler: string;
};
type ClientMockGeneratorBuilder = {
  imports: GeneratorImport[];
  implementation: ClientMockGeneratorImplementation;
};
type ClientMockBuilder = (verbOptions: GeneratorVerbOptions, generatorOptions: GeneratorOptions) => ClientMockGeneratorBuilder;
interface ClientGeneratorsBuilder {
  client: ClientBuilder;
  header?: ClientHeaderBuilder;
  dependencies?: ClientDependenciesBuilder;
  footer?: ClientFooterBuilder;
  title?: ClientTitleBuilder;
  extraFiles?: ClientExtraFilesBuilder;
}
type GeneratorClients = Record<OutputClient, ClientGeneratorsBuilder>;
type GetterResponse = {
  imports: GeneratorImport[];
  definition: {
    success: string;
    errors: string;
  };
  isBlob: boolean;
  types: {
    success: ResReqTypesValue[];
    errors: ResReqTypesValue[];
  };
  contentTypes: string[];
  schemas: GeneratorSchema[];
  originalSchema?: ResponsesObject;
};
type GetterBody = {
  originalSchema: ReferenceObject | RequestBodyObject;
  imports: GeneratorImport[];
  definition: string;
  implementation: string;
  schemas: GeneratorSchema[];
  formData?: string;
  formUrlEncoded?: string;
  contentType: string;
  isOptional: boolean;
};
type GetterParameters = {
  query: {
    parameter: ParameterObject;
    imports: GeneratorImport[];
  }[];
  path: {
    parameter: ParameterObject;
    imports: GeneratorImport[];
  }[];
  header: {
    parameter: ParameterObject;
    imports: GeneratorImport[];
  }[];
};
type GetterParam = {
  name: string;
  definition: string;
  implementation: string;
  default: boolean;
  required: boolean;
  imports: GeneratorImport[];
};
type GetterParams = GetterParam[];
type GetterQueryParam = {
  schema: GeneratorSchema;
  deps: GeneratorSchema[];
  isOptional: boolean;
  originalSchema?: SchemaObject;
};
type GetterPropType = 'param' | 'body' | 'queryParam' | 'header' | 'namedPathParams';
declare const GetterPropType: {
  readonly PARAM: "param";
  readonly NAMED_PATH_PARAMS: "namedPathParams";
  readonly BODY: "body";
  readonly QUERY_PARAM: "queryParam";
  readonly HEADER: "header";
};
type GetterPropBase = {
  name: string;
  definition: string;
  implementation: string;
  default: boolean;
  required: boolean;
};
type GetterProp = GetterPropBase & ({
  type: 'namedPathParams';
  destructured: string;
  schema: GeneratorSchema;
} | {
  type: Exclude<GetterPropType, 'namedPathParams'>;
});
type GetterProps = GetterProp[];
type SchemaType = 'integer' | 'number' | 'string' | 'boolean' | 'object' | 'null' | 'array' | 'enum' | 'unknown';
declare const SchemaType: {
  integer: string;
  number: string;
  string: string;
  boolean: string;
  object: string;
  null: string;
  array: string;
  enum: string;
  unknown: string;
};
type ScalarValue = {
  value: string;
  isEnum: boolean;
  hasReadonlyProps: boolean;
  type: SchemaType;
  imports: GeneratorImport[];
  schemas: GeneratorSchema[];
  isRef: boolean;
  example?: any;
  examples?: Record<string, any>;
};
type ResolverValue = ScalarValue & {
  originalSchema: SchemaObject;
};
type ResReqTypesValue = ScalarValue & {
  formData?: string;
  formUrlEncoded?: string;
  isRef?: boolean;
  hasReadonlyProps?: boolean;
  key: string;
  contentType: string;
  originalSchema?: SchemaObject;
};
type WriteSpecsBuilder = {
  operations: GeneratorOperations;
  schemas: Record<string, GeneratorSchema[]>;
  verbOptions: Record<string, GeneratorVerbOptions>;
  title: GeneratorClientTitle;
  header: GeneratorClientHeader;
  footer: GeneratorClientFooter;
  imports: GeneratorClientImports;
  importsMock: GenerateMockImports;
  extraFiles: ClientFileBuilder[];
  info: InfoObject;
  target: string;
};
type WriteModeProps = {
  builder: WriteSpecsBuilder;
  output: NormalizedOutputOptions;
  workspace: string;
  specsName: Record<string, string>;
  header: string;
  needSchema: boolean;
};
type GeneratorApiOperations = {
  verbOptions: Record<string, GeneratorVerbOptions>;
  operations: GeneratorOperations;
  schemas: GeneratorSchema[];
};
type GeneratorClientExtra = {
  implementation: string;
  implementationMock: string;
};
type GeneratorClientTitle = (data: {
  outputClient?: OutputClient | OutputClientFunc;
  title: string;
  customTitleFunc?: (title: string) => string;
  output: NormalizedOutputOptions;
}) => GeneratorClientExtra;
type GeneratorClientHeader = (data: {
  outputClient?: OutputClient | OutputClientFunc;
  isRequestOptions: boolean;
  isMutator: boolean;
  isGlobalMutator: boolean;
  provideIn: boolean | 'root' | 'any';
  hasAwaitedType: boolean;
  titles: GeneratorClientExtra;
  output: NormalizedOutputOptions;
  verbOptions: Record<string, GeneratorVerbOptions>;
  tag?: string;
  clientImplementation: string;
}) => GeneratorClientExtra;
type GeneratorClientFooter = (data: {
  outputClient: OutputClient | OutputClientFunc;
  operationNames: string[];
  hasMutator: boolean;
  hasAwaitedType: boolean;
  titles: GeneratorClientExtra;
  output: NormalizedOutputOptions;
}) => GeneratorClientExtra;
type GeneratorClientImports = (data: {
  client: OutputClient | OutputClientFunc;
  implementation: string;
  imports: {
    exports: GeneratorImport[];
    dependency: string;
  }[];
  specsName: Record<string, string>;
  hasSchemaDir: boolean;
  isAllowSyntheticDefaultImports: boolean;
  hasGlobalMutator: boolean;
  hasTagsMutator: boolean;
  hasParamsSerializerOptions: boolean;
  packageJson?: PackageJson;
  output: NormalizedOutputOptions;
}) => string;
type GenerateMockImports = (data: {
  implementation: string;
  imports: {
    exports: GeneratorImport[];
    dependency: string;
  }[];
  specsName: Record<string, string>;
  hasSchemaDir: boolean;
  isAllowSyntheticDefaultImports: boolean;
  options?: GlobalMockOptions;
}) => string;
type GeneratorApiBuilder = GeneratorApiOperations & {
  title: GeneratorClientTitle;
  header: GeneratorClientHeader;
  footer: GeneratorClientFooter;
  imports: GeneratorClientImports;
  importsMock: GenerateMockImports;
  extraFiles: ClientFileBuilder[];
};
interface SchemaWithConst extends SchemaObject {
  const: string;
}
declare class ErrorWithTag extends Error {
  tag: string;
  constructor(message: string, tag: string, options?: ErrorOptions);
}
//#endregion
//#region src/constants.d.ts
declare const generalJSTypes: string[];
declare const generalJSTypesWithArray: string[];
declare const VERBS_WITH_BODY: Verbs[];
declare const URL_REGEX: RegExp;
declare const TEMPLATE_TAG_REGEX: RegExp;
//#endregion
//#region src/generators/component-definition.d.ts
declare const generateComponentDefinition: (responses: ComponentsObject["responses"] | ComponentsObject["requestBodies"], context: ContextSpecs, suffix: string) => GeneratorSchema[];
//#endregion
//#region src/generators/imports.d.ts
declare const generateImports: ({
  imports,
  target,
  isRootKey,
  specsName,
  specKey: currentSpecKey,
  namingConvention
}: {
  imports: GeneratorImport[];
  target: string;
  isRootKey: boolean;
  specsName: Record<string, string>;
  specKey: string;
  namingConvention?: NamingConvention;
}) => string;
declare const generateMutatorImports: ({
  mutators,
  implementation,
  oneMore
}: {
  mutators: GeneratorMutator[];
  implementation?: string;
  oneMore?: boolean;
}) => string;
declare const addDependency: ({
  implementation,
  exports,
  dependency,
  specsName,
  hasSchemaDir,
  isAllowSyntheticDefaultImports
}: {
  implementation: string;
  exports: GeneratorImport[];
  dependency: string;
  specsName: Record<string, string>;
  hasSchemaDir: boolean;
  isAllowSyntheticDefaultImports: boolean;
}) => string | undefined;
declare const generateDependencyImports: (implementation: string, imports: {
  exports: GeneratorImport[];
  dependency: string;
}[], specsName: Record<string, string>, hasSchemaDir: boolean, isAllowSyntheticDefaultImports: boolean) => string;
declare const generateVerbImports: ({
  response,
  body,
  queryParams,
  props,
  headers,
  params
}: GeneratorVerbOptions) => GeneratorImport[];
//#endregion
//#region src/generators/models-inline.d.ts
declare const generateModelInline: (acc: string, model: string) => string;
declare const generateModelsInline: (obj: Record<string, GeneratorSchema[]>) => string;
//#endregion
//#region src/generators/mutator.d.ts
declare const BODY_TYPE_NAME = "BodyType";
declare const generateMutator: ({
  output,
  mutator,
  name,
  workspace,
  tsconfig
}: {
  output?: string;
  mutator?: NormalizedMutator;
  name: string;
  workspace: string;
  tsconfig?: Tsconfig;
}) => Promise<GeneratorMutator | undefined>;
//#endregion
//#region src/generators/options.d.ts
declare const generateBodyOptions: (body: GetterBody, isFormData: boolean, isFormUrlEncoded: boolean) => string;
declare const generateAxiosOptions: ({
  response,
  isExactOptionalPropertyTypes,
  queryParams,
  headers,
  requestOptions,
  hasSignal,
  isVue,
  isAngular,
  paramsSerializer,
  paramsSerializerOptions
}: {
  response: GetterResponse;
  isExactOptionalPropertyTypes: boolean;
  queryParams?: GeneratorSchema;
  headers?: GeneratorSchema;
  requestOptions?: object | boolean;
  hasSignal: boolean;
  isVue: boolean;
  isAngular: boolean;
  paramsSerializer?: GeneratorMutator;
  paramsSerializerOptions?: ParamsSerializerOptions;
}) => string;
declare const generateOptions: ({
  route,
  body,
  headers,
  queryParams,
  response,
  verb,
  requestOptions,
  isFormData,
  isFormUrlEncoded,
  isAngular,
  isExactOptionalPropertyTypes,
  hasSignal,
  isVue,
  paramsSerializer,
  paramsSerializerOptions
}: {
  route: string;
  body: GetterBody;
  headers?: GetterQueryParam;
  queryParams?: GetterQueryParam;
  response: GetterResponse;
  verb: Verbs;
  requestOptions?: object | boolean;
  isFormData: boolean;
  isFormUrlEncoded: boolean;
  isAngular?: boolean;
  isExactOptionalPropertyTypes: boolean;
  hasSignal: boolean;
  isVue?: boolean;
  paramsSerializer?: GeneratorMutator;
  paramsSerializerOptions?: ParamsSerializerOptions;
}) => string;
declare const generateBodyMutatorConfig: (body: GetterBody, isFormData: boolean, isFormUrlEncoded: boolean) => string;
declare const generateQueryParamsAxiosConfig: (response: GetterResponse, isVue: boolean, queryParams?: GetterQueryParam) => string;
declare const generateMutatorConfig: ({
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
  isVue
}: {
  route: string;
  body: GetterBody;
  headers?: GetterQueryParam;
  queryParams?: GetterQueryParam;
  response: GetterResponse;
  verb: Verbs;
  isFormData: boolean;
  isFormUrlEncoded: boolean;
  hasSignal: boolean;
  isExactOptionalPropertyTypes: boolean;
  isVue?: boolean;
}) => string;
declare const generateMutatorRequestOptions: (requestOptions: boolean | object | undefined, hasSecondArgument: boolean) => string;
declare const generateFormDataAndUrlEncodedFunction: ({
  body,
  formData,
  formUrlEncoded,
  isFormData,
  isFormUrlEncoded
}: {
  body: GetterBody;
  formData?: GeneratorMutator;
  formUrlEncoded?: GeneratorMutator;
  isFormData: boolean;
  isFormUrlEncoded: boolean;
}) => string;
//#endregion
//#region src/generators/parameter-definition.d.ts
declare const generateParameterDefinition: (parameters: ComponentsObject["parameters"], context: ContextSpecs, suffix: string) => GeneratorSchema[];
//#endregion
//#region src/generators/schema-definition.d.ts
/**
 * Extract all types from #/components/schemas
 *
 * @param schemas
 */
declare const generateSchemasDefinition: (schemas: SchemasObject | undefined, context: ContextSpecs, suffix: string, filters?: InputFiltersOption) => GeneratorSchema[];
//#endregion
//#region src/generators/verbs-options.d.ts
declare const generateVerbsOptions: ({
  verbs,
  input,
  output,
  route,
  pathRoute,
  context
}: {
  verbs: PathItemObject;
  input: NormalizedInputOptions;
  output: NormalizedOutputOptions;
  route: string;
  pathRoute: string;
  context: ContextSpecs;
}) => Promise<GeneratorVerbsOptions>;
declare const _filteredVerbs: (verbs: PathItemObject, filters: NormalizedInputOptions["filters"]) => [string, any][];
//#endregion
//#region src/getters/array.d.ts
/**
 * Return the output type from an array
 *
 * @param item item with type === "array"
 */
declare const getArray: ({
  schema,
  name,
  context
}: {
  schema: SchemaObject;
  name?: string;
  context: ContextSpecs;
}) => ScalarValue;
//#endregion
//#region src/getters/body.d.ts
declare const getBody: ({
  requestBody,
  operationName,
  context,
  contentType
}: {
  requestBody: ReferenceObject | RequestBodyObject;
  operationName: string;
  context: ContextSpecs;
  contentType?: OverrideOutputContentType;
}) => GetterBody;
//#endregion
//#region src/getters/combine.d.ts
type Separator = 'allOf' | 'anyOf' | 'oneOf';
declare const combineSchemas: ({
  name,
  schema,
  separator,
  context,
  nullable
}: {
  name?: string;
  schema: SchemaObject;
  separator: Separator;
  context: ContextSpecs;
  nullable: string;
}) => ScalarValue;
//#endregion
//#region src/getters/discriminators.d.ts
declare const resolveDiscriminators: (schemas: SchemasObject, context: ContextSpecs) => SchemasObject;
//#endregion
//#region src/getters/enum.d.ts
declare function getEnumNames(schemaObject: SchemaObject | undefined): string[] | undefined;
declare function getEnumDescriptions(schemaObject: SchemaObject | undefined): string[] | undefined;
declare const getEnum: (value: string, enumName: string, names: string[] | undefined, enumGenerationType: EnumGeneration, descriptions?: string[], enumNamingConvention?: NamingConvention) => string;
declare const getEnumImplementation: (value: string, names?: string[], descriptions?: string[], enumNamingConvention?: NamingConvention) => string;
//#endregion
//#region src/getters/keys.d.ts
declare const getKey: (key: string) => string;
//#endregion
//#region src/getters/object.d.ts
/**
 * Return the output type from an object
 *
 * @param item item with type === "object"
 */
declare const getObject: ({
  item,
  name,
  context,
  nullable
}: {
  item: SchemaObject;
  name?: string;
  context: ContextSpecs;
  nullable: string;
}) => ScalarValue;
//#endregion
//#region src/getters/operation.d.ts
declare const getOperationId: (operation: OperationObject, route: string, verb: Verbs) => string;
//#endregion
//#region src/getters/parameters.d.ts
declare const getParameters: ({
  parameters,
  context
}: {
  parameters: (ReferenceObject | ParameterObject)[];
  context: ContextSpecs;
}) => GetterParameters;
//#endregion
//#region src/getters/params.d.ts
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
declare const getParamsInPath: (path: string) => string[];
declare const getParams: ({
  route,
  pathParams,
  operationId,
  context,
  output
}: {
  route: string;
  pathParams?: GetterParameters["query"];
  operationId: string;
  context: ContextSpecs;
  output: NormalizedOutputOptions;
}) => GetterParams;
//#endregion
//#region src/getters/props.d.ts
declare const getProps: ({
  body,
  queryParams,
  params,
  operationName,
  headers,
  context
}: {
  body: GetterBody;
  queryParams?: GetterQueryParam;
  params: GetterParams;
  operationName: string;
  headers?: GetterQueryParam;
  context: ContextSpecs;
}) => GetterProps;
//#endregion
//#region src/getters/query-params.d.ts
declare const getQueryParams: ({
  queryParams,
  operationName,
  context,
  suffix
}: {
  queryParams: GetterParameters["query"];
  operationName: string;
  context: ContextSpecs;
  suffix?: string;
}) => GetterQueryParam | undefined;
//#endregion
//#region src/getters/ref.d.ts
type RefComponent = 'schemas' | 'responses' | 'parameters' | 'requestBodies';
declare const RefComponent: {
  schemas: RefComponent;
  responses: RefComponent;
  parameters: RefComponent;
  requestBodies: RefComponent;
};
declare const RefComponentSuffix: Record<RefComponent, string>;
interface RefInfo {
  name: string;
  originalName: string;
  refPaths?: string[];
  specKey?: string;
}
/**
 * Return the output type from the $ref
 *
 * @param $ref
 */
declare const getRefInfo: ($ref: ReferenceObject["$ref"], context: ContextSpecs) => RefInfo;
//#endregion
//#region src/getters/res-req-types.d.ts
declare const getResReqTypes: (responsesOrRequests: [string, ResponseObject | ReferenceObject | RequestBodyObject][], name: string, context: ContextSpecs, defaultType?: string, uniqueKey?: ValueIteratee<ResReqTypesValue>) => ResReqTypesValue[];
//#endregion
//#region src/getters/response.d.ts
declare const getResponse: ({
  responses,
  operationName,
  context,
  contentType
}: {
  responses: ResponsesObject;
  operationName: string;
  context: ContextSpecs;
  contentType?: OverrideOutputContentType;
}) => GetterResponse;
//#endregion
//#region src/getters/route.d.ts
declare const getRoute: (route: string) => string;
declare const getFullRoute: (route: string, servers: ServerObject[] | undefined, baseUrl: string | BaseUrlFromConstant | BaseUrlFromSpec | undefined) => string;
declare const getRouteAsArray: (route: string) => string;
//#endregion
//#region src/getters/scalar.d.ts
/**
 * Return the typescript equivalent of open-api data type
 *
 * @param item
 * @ref https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.1.md#data-types
 */
declare const getScalar: ({
  item,
  name,
  context
}: {
  item: SchemaObject;
  name?: string;
  context: ContextSpecs;
}) => ScalarValue;
//#endregion
//#region src/resolvers/object.d.ts
declare const resolveObject: ({
  schema,
  propName,
  combined,
  context
}: {
  schema: SchemaObject | ReferenceObject;
  propName?: string;
  combined?: boolean;
  context: ContextSpecs;
}) => ResolverValue;
//#endregion
//#region src/resolvers/ref.d.ts
type ComponentObject = SchemaObject | ResponseObject | ParameterObject | RequestBodyObject | ReferenceObject;
declare const resolveRef: <Schema extends ComponentObject = ComponentObject>(schema: ComponentObject, context: ContextSpecs, imports?: GeneratorImport[]) => {
  schema: Schema;
  imports: GeneratorImport[];
};
type Example = ExampleObject | ReferenceObject;
type Examples = Example[] | Record<string, Example> | undefined;
declare const resolveExampleRefs: (examples: Examples, context: ContextSpecs) => Examples;
//#endregion
//#region src/resolvers/value.d.ts
declare const resolveValue: ({
  schema,
  name,
  context
}: {
  schema: SchemaObject | ReferenceObject;
  name?: string;
  context: ContextSpecs;
}) => ResolverValue;
//#endregion
//#region src/utils/assertion.d.ts
/**
 * Discriminator helper for `ReferenceObject`
 *
 * @param property
 */
declare const isReference: (property: any) => property is ReferenceObject;
declare const isDirectory: (path: string) => boolean;
declare function isObject(x: any): x is Record<string, unknown>;
declare function isModule(x: any): x is Record<string, unknown>;
declare function isString(x: any): x is string;
declare function isNumber(x: any): x is number;
declare function isNumeric(x: any): x is number;
declare function isBoolean(x: any): x is boolean;
declare function isFunction(x: any): x is Function;
declare function isUndefined(x: any): x is undefined;
declare function isNull(x: any): x is null;
declare function isSchema(x: any): x is SchemaObject;
declare const isVerb: (verb: string) => verb is Verbs;
declare const isRootKey$1: (specKey: string, target: string) => boolean;
declare const isUrl: (str: string) => boolean;
//#endregion
//#region src/utils/async-reduce.d.ts
declare function asyncReduce<IterationItem, AccValue>(array: IterationItem[], reducer: (accumulate: AccValue, current: IterationItem) => AccValue | Promise<AccValue>, initValue: AccValue): Promise<AccValue>;
//#endregion
//#region src/utils/case.d.ts
declare const pascal: (s: string) => string;
declare const camel: (s: string) => string;
declare const snake: (s: string) => string;
declare const kebab: (s: string) => string;
declare const upper: (s: string, fillWith: string, isDeapostrophe?: boolean) => string;
declare const conventionName: (name: string, convention: NamingConvention) => string;
//#endregion
//#region src/utils/compare-version.d.ts
declare const compareVersions: (firstVersion: string, secondVersions: string, operator?: CompareOperator) => boolean;
//#endregion
//#region src/utils/debug.d.ts
interface DebuggerOptions {
  onlyWhenFocused?: boolean | string;
}
declare function createDebugger(ns: string, options?: DebuggerOptions): debug.Debugger['log'];
//#endregion
//#region src/utils/deep-non-nullable.d.ts
type DeepNonNullable<T$1> = T$1 extends Function ? T$1 : T$1 extends readonly (infer U)[] ? DeepNonNullable<NonNullable<U>>[] : T$1 extends object ? { [K in keyof T$1]: DeepNonNullable<NonNullable<T$1[K]>> } : NonNullable<T$1>;
//#endregion
//#region src/utils/doc.d.ts
declare function jsDoc(schema: {
  description?: string[] | string;
  deprecated?: boolean;
  summary?: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
  minItems?: number;
  maxItems?: number;
  nullable?: boolean;
  pattern?: string;
}, tryOneLine?: boolean, context?: ContextSpecs): string;
declare function keyValuePairsToJsDoc(keyValues: {
  key: string;
  value: string;
}[]): string;
//#endregion
//#region src/utils/dynamic-import.d.ts
declare const dynamicImport: <T>(toImport: T | string, from?: string, takeDefault?: boolean) => Promise<T>;
//#endregion
//#region src/utils/extension.d.ts
declare const getExtension: (path: string) => "yaml" | "json";
//#endregion
//#region src/utils/file.d.ts
declare const getFileInfo: (target?: string, {
  backupFilename,
  extension
}?: {
  backupFilename?: string;
  extension?: string;
}) => {
  path: string;
  pathWithoutExtension: string;
  extension: string;
  isDirectory: boolean;
  dirname: string;
  filename: string;
};
declare function loadFile(filePath?: string, options?: {
  root?: string;
  defaultFileName?: string;
  alias?: Record<string, string>;
  tsconfig?: Tsconfig;
}): Promise<{
  path: string;
  file?: string;
  error?: unknown;
  cached?: boolean;
}>;
declare function removeFilesAndEmptyFolders(patterns: string[], dir: string): Promise<void>;
//#endregion
//#region src/utils/file-extensions.d.ts
declare const getMockFileExtensionByTypeName: (mock: GlobalMockOptions | ClientMockBuilder) => string;
//#endregion
//#region src/utils/is-body-verb.d.ts
declare const getIsBodyVerb: (verb: Verbs) => boolean;
//#endregion
//#region src/utils/logger.d.ts
declare const log: (message?: any, ...optionalParams: any[]) => void;
declare const startMessage: ({
  name,
  version,
  description
}: {
  name: string;
  version: string;
  description: string;
}) => string;
declare const logError: (err: unknown, tag?: string) => void;
declare const mismatchArgsMessage: (mismatchArgs: string[]) => void;
declare const createSuccessMessage: (backend?: string) => void;
declare const ibmOpenapiValidatorWarnings: (warnings: {
  path: string[];
  message: string;
}[]) => void;
declare const ibmOpenapiValidatorErrors: (errors: {
  path: string[];
  message: string;
}[]) => void;
type LogType = 'error' | 'warn' | 'info';
type LogLevel = LogType | 'silent';
interface Logger {
  info(msg: string, options?: LogOptions): void;
  warn(msg: string, options?: LogOptions): void;
  warnOnce(msg: string, options?: LogOptions): void;
  error(msg: string, options?: LogOptions): void;
  clearScreen(type: LogType): void;
  hasWarned: boolean;
}
interface LogOptions {
  clear?: boolean;
  timestamp?: boolean;
}
declare const LogLevels: Record<LogLevel, number>;
interface LoggerOptions {
  prefix?: string;
  allowClearScreen?: boolean;
}
declare function createLogger(level?: LogLevel, options?: LoggerOptions): Logger;
//#endregion
//#region src/utils/merge-deep.d.ts
declare function mergeDeep<T$1 extends Record<string, any>, U$1 extends Record<string, any>>(source: T$1, target: U$1): T$1 & U$1;
//#endregion
//#region src/utils/occurrence.d.ts
declare const count: (str: string | undefined, key: string) => number;
//#endregion
//#region src/utils/open-api-converter.d.ts
declare const openApiConverter: (schema: any, options: Partial<ConvertInputOptions> | undefined, specKey: string) => Promise<OpenAPIObject>;
declare namespace path_d_exports {
  export { basename, dirname, extname, getSchemaFileName, getSpecName, isAbsolute, join, joinSafe, normalizeSafe, relativeSafe, resolve, separator$1 as separator };
}
declare const join: (...paths: string[]) => string, resolve: (...paths: string[]) => string, extname: (path: string) => string, dirname: (path: string) => string, basename: (path: string, suffix?: string) => string, isAbsolute: (path: string) => boolean;
/**
 * Behaves exactly like `path.relative(from, to)`, but keeps the first meaningful "./"
 */
declare const relativeSafe: (from: string, to: string) => string;
declare const getSpecName: (specKey: string, target: string) => string;
declare const getSchemaFileName: (path: string) => string;
declare const separator$1 = "/";
declare const normalizeSafe: (value: string) => string;
declare const joinSafe: (...values: string[]) => string;
//#endregion
//#region src/utils/sort.d.ts
declare const sortByPriority: <T>(arr: (T & {
  default?: boolean;
  required?: boolean;
})[]) => (T & {
  default?: boolean;
  required?: boolean;
})[];
//#endregion
//#region src/utils/string.d.ts
declare const stringify: (data?: string | any[] | Record<string, any>) => string | undefined;
declare const sanitize: (value: string, options?: {
  whitespace?: string | true;
  underscore?: string | true;
  dot?: string | true;
  dash?: string | true;
  es5keyword?: boolean;
  es5IdentifierName?: boolean;
  special?: boolean;
}) => string;
declare const toObjectString: <T>(props: T[], path?: keyof T) => string;
declare const getNumberWord: (num: number) => string;
declare const escape: (str: string | null, char?: string) => string | undefined;
/**
 * Escape all characters not included in SingleStringCharacters and
 * DoubleStringCharacters on
 * http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.4
 *
 * Based on https://github.com/joliss/js-string-escape/blob/master/index.js
 *
 * @param input String to escape
 */
declare const jsStringEscape: (input: string) => string;
//#endregion
//#region src/utils/tsconfig.d.ts
declare const isSyntheticDefaultImportsAllow: (config?: Tsconfig) => boolean;
//#endregion
//#region src/utils/validator.d.ts
/**
 * Validate the spec with ibm-openapi-validator (with a custom pretty logger).
 * More information: https://github.com/IBM/openapi-validator/#configuration
 * @param specs openAPI spec
 */
declare const ibmOpenapiValidator: (specs: OpenAPIObject, validation: boolean | object) => Promise<void>;
//#endregion
//#region src/writers/schemas.d.ts
declare const writeModelInline: (acc: string, model: string) => string;
declare const writeModelsInline: (array: GeneratorSchema[]) => string;
declare const writeSchema: ({
  path,
  schema,
  target,
  namingConvention,
  fileExtension,
  specKey,
  isRootKey,
  specsName,
  header
}: {
  path: string;
  schema: GeneratorSchema;
  target: string;
  namingConvention: NamingConvention;
  fileExtension: string;
  specKey: string;
  isRootKey: boolean;
  specsName: Record<string, string>;
  header: string;
}) => Promise<void>;
declare const writeSchemas: ({
  schemaPath,
  schemas,
  target,
  namingConvention,
  fileExtension,
  specKey,
  isRootKey,
  specsName,
  header,
  indexFiles
}: {
  schemaPath: string;
  schemas: GeneratorSchema[];
  target: string;
  namingConvention: NamingConvention;
  fileExtension: string;
  specKey: string;
  isRootKey: boolean;
  specsName: Record<string, string>;
  header: string;
  indexFiles: boolean;
}) => Promise<void>;
//#endregion
//#region src/writers/single-mode.d.ts
declare const writeSingleMode: ({
  builder,
  output,
  specsName,
  header,
  needSchema
}: WriteModeProps) => Promise<string[]>;
//#endregion
//#region src/writers/split-mode.d.ts
declare const writeSplitMode: ({
  builder,
  output,
  specsName,
  header,
  needSchema
}: WriteModeProps) => Promise<string[]>;
//#endregion
//#region src/writers/split-tags-mode.d.ts
declare const writeSplitTagsMode: ({
  builder,
  output,
  specsName,
  header,
  needSchema
}: WriteModeProps) => Promise<string[]>;
//#endregion
//#region src/writers/tags-mode.d.ts
declare const writeTagsMode: ({
  builder,
  output,
  specsName,
  header,
  needSchema
}: WriteModeProps) => Promise<string[]>;
//#endregion
//#region src/writers/target.d.ts
declare const generateTarget: (builder: WriteSpecsBuilder, options: NormalizedOutputOptions) => GeneratorTarget;
//#endregion
//#region src/writers/target-tags.d.ts
declare const generateTargetForTags: (builder: WriteSpecsBuilder, options: NormalizedOutputOptions) => Record<string, GeneratorTarget>;
//#endregion
//#region src/writers/types.d.ts
declare const getOrvalGeneratedTypes: () => string;
declare const getTypedResponse: () => string;
//#endregion
export { AngularOptions, BODY_TYPE_NAME, BaseUrlFromConstant, BaseUrlFromSpec, ClientBuilder, ClientDependenciesBuilder, ClientExtraFilesBuilder, ClientFileBuilder, ClientFooterBuilder, ClientGeneratorsBuilder, ClientHeaderBuilder, ClientMockBuilder, ClientMockGeneratorBuilder, ClientMockGeneratorImplementation, ClientTitleBuilder, Config, ConfigExternal, ConfigFn, ContextSpecs, DeepNonNullable, EnumGeneration, ErrorWithTag, FetchOptions, FormDataArrayHandling, FormDataType, GenerateMockImports, GeneratorApiBuilder, GeneratorApiOperations, GeneratorApiResponse, GeneratorClient, GeneratorClientExtra, GeneratorClientFooter, GeneratorClientHeader, GeneratorClientImports, GeneratorClientTitle, GeneratorClients, GeneratorDependency, GeneratorImport, GeneratorMutator, GeneratorMutatorParsingInfo, GeneratorOperation, GeneratorOperations, GeneratorOptions, GeneratorSchema, GeneratorTarget, GeneratorTargetFull, GeneratorVerbOptions, GeneratorVerbsOptions, GetterBody, GetterParam, GetterParameters, GetterParams, GetterProp, GetterPropType, GetterProps, GetterQueryParam, GetterResponse, GlobalMockOptions, GlobalOptions, HonoOptions, Hook, HookCommand, HookFunction, HookOption, HooksOptions, ImportOpenApi, InputFiltersOption, InputOptions, InputTransformerFn, JsDocOptions, LogLevel, LogLevels, LogOptions, LogType, Logger, LoggerOptions, MockData, MockDataArray, MockDataArrayFn, MockDataObject, MockDataObjectFn, MockOptions, MockProperties, MockPropertiesObject, MockPropertiesObjectFn, Mutator, MutatorObject, NamingConvention, NormalizedConfig, NormalizedFetchOptions, NormalizedFormDataType, NormalizedHonoOptions, NormalizedHookCommand, NormalizedHookOptions, NormalizedInputOptions, NormalizedJsDocOptions, NormalizedMutator, NormalizedOperationOptions, NormalizedOptions, NormalizedOutputOptions, NormalizedOverrideOutput, NormalizedParamsSerializerOptions, NormalizedQueryOptions, NormalizedZodOptions, OperationOptions, Options, OptionsExport, OptionsFn, OutputClient, OutputClientFunc, OutputDocsOptions, OutputHttpClient, OutputMockType, OutputMode, OutputOptions, OverrideInput, OverrideMockOptions, OverrideOutput, OverrideOutputContentType, PackageJson, ParamsSerializerOptions, PropertySortOrder, QueryOptions, RefComponentSuffix, RefInfo, ResReqTypesValue, ResolverValue, ScalarValue, SchemaType, SchemaWithConst, SwaggerParserOptions, SwrOptions, TEMPLATE_TAG_REGEX, TsConfigTarget, Tsconfig, URL_REGEX, VERBS_WITH_BODY, Verbs, WriteModeProps, WriteSpecsBuilder, ZodCoerceType, ZodDateTimeOptions, ZodOptions, ZodTimeOptions, _filteredVerbs, addDependency, asyncReduce, camel, combineSchemas, compareVersions, conventionName, count, createDebugger, createLogger, createSuccessMessage, dynamicImport, escape, generalJSTypes, generalJSTypesWithArray, generateAxiosOptions, generateBodyMutatorConfig, generateBodyOptions, generateComponentDefinition, generateDependencyImports, generateFormDataAndUrlEncodedFunction, generateImports, generateModelInline, generateModelsInline, generateMutator, generateMutatorConfig, generateMutatorImports, generateMutatorRequestOptions, generateOptions, generateParameterDefinition, generateQueryParamsAxiosConfig, generateSchemasDefinition, generateTarget, generateTargetForTags, generateVerbImports, generateVerbsOptions, getArray, getBody, getEnum, getEnumDescriptions, getEnumImplementation, getEnumNames, getExtension, getFileInfo, getFullRoute, getIsBodyVerb, getKey, getMockFileExtensionByTypeName, getNumberWord, getObject, getOperationId, getOrvalGeneratedTypes, getParameters, getParams, getParamsInPath, getProps, getQueryParams, getRefInfo, getResReqTypes, getResponse, getRoute, getRouteAsArray, getScalar, getTypedResponse, ibmOpenapiValidator, ibmOpenapiValidatorErrors, ibmOpenapiValidatorWarnings, isBoolean, isDirectory, isFunction, isModule, isNull, isNumber, isNumeric, isObject, isReference, isRootKey$1 as isRootKey, isSchema, isString, isSyntheticDefaultImportsAllow, isUndefined, isUrl, isVerb, jsDoc, jsStringEscape, kebab, keyValuePairsToJsDoc, loadFile, log, logError, mergeDeep, mismatchArgsMessage, openApiConverter, pascal, removeFilesAndEmptyFolders, resolveDiscriminators, resolveExampleRefs, resolveObject, resolveRef, resolveValue, sanitize, snake, sortByPriority, startMessage, stringify, toObjectString, path_d_exports as upath, upper, writeModelInline, writeModelsInline, writeSchema, writeSchemas, writeSingleMode, writeSplitMode, writeSplitTagsMode, writeTagsMode };
//# sourceMappingURL=index.d.ts.map