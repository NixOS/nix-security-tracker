import { ClientBuilder, ClientGeneratorsBuilder, ClientHeaderBuilder, GeneratorOptions, GeneratorVerbOptions } from "@orval/core";

//#region src/index.d.ts
declare const generateRequestFunction: ({
  queryParams,
  headers,
  operationName,
  response,
  mutator,
  body,
  props,
  verb,
  fetchReviver,
  formData,
  formUrlEncoded,
  override
}: GeneratorVerbOptions, {
  route,
  context,
  pathRoute
}: GeneratorOptions) => string;
declare const fetchResponseTypeName: (includeHttpResponseReturnType: boolean | undefined, definitionSuccessResponse: string, operationName: string) => string;
declare const generateClient: ClientBuilder;
declare const generateFetchHeader: ClientHeaderBuilder;
declare const builder: () => () => ClientGeneratorsBuilder;
//#endregion
export { builder, builder as default, fetchResponseTypeName, generateClient, generateFetchHeader, generateRequestFunction };
//# sourceMappingURL=index.d.ts.map