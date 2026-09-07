import { ClientBuilder, ClientExtraFilesBuilder, ClientFooterBuilder, ClientGeneratorsBuilder, ClientHeaderBuilder, GeneratorDependency } from "@orval/core";

//#region src/index.d.ts
declare const getHonoDependencies: () => GeneratorDependency[];
declare const getHonoHeader: ClientHeaderBuilder;
declare const getHonoFooter: ClientFooterBuilder;
declare const generateHono: ClientBuilder;
declare const generateExtraFiles: ClientExtraFilesBuilder;
declare const builder: () => () => ClientGeneratorsBuilder;
//#endregion
export { builder, builder as default, generateExtraFiles, generateHono, getHonoDependencies, getHonoFooter, getHonoHeader };
//# sourceMappingURL=index.d.ts.map