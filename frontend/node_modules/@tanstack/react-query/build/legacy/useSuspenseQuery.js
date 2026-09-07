"use client";
import { defaultThrowOnError } from "./suspense.js";
import { useBaseQuery } from "./useBaseQuery.js";
import { QueryObserver, skipToken } from "@tanstack/query-core";
//#region src/useSuspenseQuery.ts
function useSuspenseQuery(options, queryClient) {
	if (process.env.NODE_ENV !== "production") {
		if (options.queryFn === skipToken) console.error("skipToken is not allowed for useSuspenseQuery");
	}
	return useBaseQuery({
		...options,
		enabled: true,
		suspense: true,
		throwOnError: defaultThrowOnError,
		placeholderData: void 0
	}, QueryObserver, queryClient);
}
//#endregion
export { useSuspenseQuery };

//# sourceMappingURL=useSuspenseQuery.js.map