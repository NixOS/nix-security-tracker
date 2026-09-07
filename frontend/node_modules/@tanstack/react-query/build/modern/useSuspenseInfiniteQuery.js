"use client";
import { defaultThrowOnError } from "./suspense.js";
import { useBaseQuery } from "./useBaseQuery.js";
import { InfiniteQueryObserver, skipToken } from "@tanstack/query-core";
//#region src/useSuspenseInfiniteQuery.ts
function useSuspenseInfiniteQuery(options, queryClient) {
	if (process.env.NODE_ENV !== "production") {
		if (options.queryFn === skipToken) console.error("skipToken is not allowed for useSuspenseInfiniteQuery");
	}
	return useBaseQuery({
		...options,
		enabled: true,
		suspense: true,
		throwOnError: defaultThrowOnError,
		placeholderData: void 0
	}, InfiniteQueryObserver, queryClient);
}
//#endregion
export { useSuspenseInfiniteQuery };

//# sourceMappingURL=useSuspenseInfiniteQuery.js.map