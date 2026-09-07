import { ClientBuilder, ClientExtraFilesBuilder, ClientGeneratorsBuilder, ClientHeaderBuilder, ContextSpecs, GeneratorVerbOptions, NormalizedOutputOptions } from "@orval/core";

//#region src/index.d.ts
declare const getMcpHeader: ClientHeaderBuilder;
declare const generateMcp: ClientBuilder;
declare const generateServer: (verbOptions: Record<string, GeneratorVerbOptions>, output: NormalizedOutputOptions, context: ContextSpecs) => Promise<{
  content: string;
  path: string;
}[]>;
declare const generateExtraFiles: ClientExtraFilesBuilder;
declare const builder: () => () => ClientGeneratorsBuilder;
//#endregion
export { builder, builder as default, generateExtraFiles, generateMcp, generateServer, getMcpHeader };
//# sourceMappingURL=index.d.ts.map