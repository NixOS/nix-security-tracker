Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_QueryClientProvider = require("./QueryClientProvider.cjs");
let _tanstack_query_core = require("@tanstack/query-core");
//#region src/usePrefetchQuery.tsx
function usePrefetchQuery(options, queryClient) {
	const client = require_QueryClientProvider.useQueryClient(queryClient);
	if (!client.getQueryState(options.queryKey)) client.query(options).catch(_tanstack_query_core.noop);
}
//#endregion
exports.usePrefetchQuery = usePrefetchQuery;

//# sourceMappingURL=usePrefetchQuery.cjs.map