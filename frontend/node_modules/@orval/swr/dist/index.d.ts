import { ClientBuilder, ClientDependenciesBuilder, ClientGeneratorsBuilder, ClientHeaderBuilder } from "@orval/core";

//#region src/index.d.ts
declare const getSwrDependencies: ClientDependenciesBuilder;
declare const generateSwrHeader: ClientHeaderBuilder;
declare const generateSwr: ClientBuilder;
declare const builder: () => () => ClientGeneratorsBuilder;
//#endregion
export { builder, builder as default, generateSwr, generateSwrHeader, getSwrDependencies };
//# sourceMappingURL=index.d.ts.map