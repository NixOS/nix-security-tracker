Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_QueryClientProvider = require("./QueryClientProvider.cjs");
let _tanstack_query_core = require("@tanstack/query-core");
//#region src/usePrefetchInfiniteQuery.tsx
function usePrefetchInfiniteQuery(options, queryClient) {
	const client = require_QueryClientProvider.useQueryClient(queryClient);
	if (!client.getQueryState(options.queryKey)) client.infiniteQuery(options).catch(_tanstack_query_core.noop);
}
//#endregion
exports.usePrefetchInfiniteQuery = usePrefetchInfiniteQuery;

//# sourceMappingURL=usePrefetchInfiniteQuery.cjs.map