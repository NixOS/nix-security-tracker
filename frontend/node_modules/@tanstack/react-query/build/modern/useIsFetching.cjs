"use client";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_rolldown_runtime = require("./rolldown-runtime-VH7oDXx4.cjs");
const require_QueryClientProvider = require("./QueryClientProvider.cjs");
let react = require("react");
react = require_rolldown_runtime.__toESM(react, 1);
let _tanstack_query_core = require("@tanstack/query-core");
//#region src/useIsFetching.ts
function useIsFetching(filters, queryClient) {
	const client = require_QueryClientProvider.useQueryClient(queryClient);
	const queryCache = client.getQueryCache();
	return react.useSyncExternalStore(react.useCallback((onStoreChange) => queryCache.subscribe(_tanstack_query_core.notifyManager.batchCalls(onStoreChange)), [queryCache]), () => client.isFetching(filters), () => client.isFetching(filters));
}
//#endregion
exports.useIsFetching = useIsFetching;

//# sourceMappingURL=useIsFetching.cjs.map