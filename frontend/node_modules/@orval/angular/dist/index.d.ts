import { ClientBuilder, ClientDependenciesBuilder, ClientFooterBuilder, ClientGeneratorsBuilder, ClientHeaderBuilder, ClientTitleBuilder } from "@orval/core";

//#region src/index.d.ts
declare const getAngularDependencies: ClientDependenciesBuilder;
declare const generateAngularTitle: ClientTitleBuilder;
declare const generateAngularHeader: ClientHeaderBuilder;
declare const generateAngularFooter: ClientFooterBuilder;
declare const generateAngular: ClientBuilder;
declare const builder: () => () => ClientGeneratorsBuilder;
//#endregion
export { builder, builder as default, generateAngular, generateAngularFooter, generateAngularHeader, generateAngularTitle, getAngularDependencies };
//# sourceMappingURL=index.d.ts.map