"use client";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_suspense = require("./suspense.cjs");
const require_useBaseQuery = require("./useBaseQuery.cjs");
let _tanstack_query_core = require("@tanstack/query-core");
//#region src/useSuspenseQuery.ts
function useSuspenseQuery(options, queryClient) {
	if (process.env.NODE_ENV !== "production") {
		if (options.queryFn === _tanstack_query_core.skipToken) console.error("skipToken is not allowed for useSuspenseQuery");
	}
	return require_useBaseQuery.useBaseQuery({
		...options,
		enabled: true,
		suspense: true,
		throwOnError: require_suspense.defaultThrowOnError,
		placeholderData: void 0
	}, _tanstack_query_core.QueryObserver, queryClient);
}
//#endregion
exports.useSuspenseQuery = useSuspenseQuery;

//# sourceMappingURL=useSuspenseQuery.cjs.map