import { useQueryClient } from "./QueryClientProvider.js";
import { noop } from "@tanstack/query-core";
//#region src/usePrefetchInfiniteQuery.tsx
function usePrefetchInfiniteQuery(options, queryClient) {
	const client = useQueryClient(queryClient);
	if (!client.getQueryState(options.queryKey)) client.infiniteQuery(options).catch(noop);
}
//#endregion
export { usePrefetchInfiniteQuery };

//# sourceMappingURL=usePrefetchInfiniteQuery.js.map