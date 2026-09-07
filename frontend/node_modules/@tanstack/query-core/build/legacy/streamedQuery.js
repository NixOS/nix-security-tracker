import { addConsumeAwareSignal, addToEnd } from "./utils.js";
//#region src/streamedQuery.ts
/**
* This is a helper function to create a query function that streams data from an AsyncIterable.
* Data will be an Array of all the chunks received.
* The query will be in a 'pending' state until the first chunk of data is received, but will go to 'success' after that.
* The query will stay in fetchStatus 'fetching' until the stream ends.
* @param queryFn - The function that returns an AsyncIterable to stream data from.
* @param refetchMode - Defines how re-fetches are handled.
* Defaults to `'reset'`, erases all data and puts the query back into `pending` state.
* Set to `'append'` to append new data to the existing data.
* Set to `'replace'` to write all data to the cache once the stream ends.
* @param reducer - A function to reduce the streamed chunks into the final data.
* Defaults to a function that appends chunks to the end of the array.
* @param initialValue - Initial value to be used while the first chunk is being fetched, and returned if the stream yields no values.
*/
function streamedQuery({ streamFn, refetchMode = "reset", reducer = (items, chunk) => addToEnd(items, chunk), initialValue = [] }) {
	return async (context) => {
		const query = context.client.getQueryCache().find({
			queryKey: context.queryKey,
			exact: true
		});
		const isRefetch = !!query && query.isFetched();
		if (isRefetch && refetchMode === "reset") query.setState({
			...query.resetState,
			fetchStatus: "fetching"
		});
		let result = initialValue;
		let cancelled = false;
		const stream = await streamFn(addConsumeAwareSignal({
			client: context.client,
			meta: context.meta,
			queryKey: context.queryKey,
			pageParam: context.pageParam,
			direction: context.direction
		}, () => context.signal, () => cancelled = true));
		const isReplaceRefetch = isRefetch && refetchMode === "replace";
		for await (const chunk of stream) {
			if (cancelled) break;
			if (isReplaceRefetch) result = reducer(result, chunk);
			else context.client.setQueryData(context.queryKey, (prev) => reducer(prev === void 0 ? initialValue : prev, chunk));
		}
		if (isReplaceRefetch && !cancelled) context.client.setQueryData(context.queryKey, result);
		return context.client.getQueryData(context.queryKey) ?? initialValue;
	};
}
//#endregion
export { streamedQuery };

//# sourceMappingURL=streamedQuery.js.map