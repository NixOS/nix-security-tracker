import { ClientBuilder, ClientDependenciesBuilder, ClientHeaderBuilder, NormalizedOutputOptions, QueryOptions } from "@orval/core";

//#region src/index.d.ts
declare const getSvelteQueryDependencies: ClientDependenciesBuilder;
declare const getReactQueryDependencies: ClientDependenciesBuilder;
declare const getVueQueryDependencies: ClientDependenciesBuilder;
declare const generateQueryHeader: ClientHeaderBuilder;
declare const generateQuery: ClientBuilder;
declare const builder: ({
  type,
  options: queryOptions,
  output
}?: {
  type?: "react-query" | "vue-query" | "svelte-query";
  options?: QueryOptions;
  output?: NormalizedOutputOptions;
}) => () => {
  client: ClientBuilder;
  header: ClientHeaderBuilder;
  dependencies: ClientDependenciesBuilder;
};
//#endregion
export { builder, builder as default, generateQuery, generateQueryHeader, getReactQueryDependencies, getSvelteQueryDependencies, getVueQueryDependencies };
//# sourceMappingURL=index.d.ts.map