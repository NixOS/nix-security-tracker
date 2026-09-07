import * as _orval_core0 from "@orval/core";
import { ClientBuilder, ClientDependenciesBuilder, ClientFooterBuilder, ClientGeneratorsBuilder, ClientHeaderBuilder, ClientTitleBuilder, GeneratorOptions, GeneratorVerbOptions } from "@orval/core";

//#region src/index.d.ts
declare const getAxiosDependencies: ClientDependenciesBuilder;
declare const generateAxiosTitle: ClientTitleBuilder;
declare const generateAxiosHeader: ClientHeaderBuilder;
declare const generateAxiosFooter: ClientFooterBuilder;
declare const generateAxios: (verbOptions: GeneratorVerbOptions, options: GeneratorOptions) => {
  implementation: string;
  imports: _orval_core0.GeneratorImport[];
};
declare const generateAxiosFunctions: ClientBuilder;
declare const builder: ({
  type
}?: {
  type?: "axios" | "axios-functions";
}) => () => ClientGeneratorsBuilder;
//#endregion
export { builder, builder as default, generateAxios, generateAxiosFooter, generateAxiosFunctions, generateAxiosHeader, generateAxiosTitle, getAxiosDependencies };
//# sourceMappingURL=index.d.ts.map