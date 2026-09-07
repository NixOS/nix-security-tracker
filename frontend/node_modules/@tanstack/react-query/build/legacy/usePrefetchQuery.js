import { useQueryClient } from "./QueryClientProvider.js";
import { noop } from "@tanstack/query-core";
//#region src/usePrefetchQuery.tsx
function usePrefetchQuery(options, queryClient) {
	const client = useQueryClient(queryClient);
	if (!client.getQueryState(options.queryKey)) client.query(options).catch(noop);
}
//#endregion
export { usePrefetchQuery };

//# sourceMappingURL=usePrefetchQuery.js.map