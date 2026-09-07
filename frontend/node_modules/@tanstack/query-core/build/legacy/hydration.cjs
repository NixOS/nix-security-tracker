Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_utils = require("./utils.cjs");
//#region src/hydration.ts
function tryResolveSync(promise) {
	var _thenResult$catch;
	let data;
	const thenResult = promise.then((result) => {
		data = result;
		return result;
	}, require_utils.noop);
	thenResult === null || thenResult === void 0 || (_thenResult$catch = thenResult.catch) === null || _thenResult$catch === void 0 || _thenResult$catch.call(thenResult, require_utils.noop);
	if (data !== void 0) return { data };
}
function dehydrateMutation(mutation) {
	return {
		mutationKey: mutation.options.mutationKey,
		state: mutation.state,
		...mutation.options.scope && { scope: mutation.options.scope },
		...mutation.meta && { meta: mutation.meta }
	};
}
function dehydratePromise(query, serializeData, shouldRedactErrors) {
	var _query$promise;
	const promise = (_query$promise = query.promise) === null || _query$promise === void 0 ? void 0 : _query$promise.then(serializeData).catch((error) => {
		if ((shouldRedactErrors === null || shouldRedactErrors === void 0 ? void 0 : shouldRedactErrors(error)) === false) return Promise.reject(error);
		if (process.env.NODE_ENV !== "production") console.error(`A query that was dehydrated as pending ended up rejecting. [${query.queryHash}]: ${error}; The error will be redacted in production builds`);
		return Promise.reject(/* @__PURE__ */ new Error("redacted"));
	});
	promise === null || promise === void 0 || promise.catch(require_utils.noop);
	return promise;
}
function dehydrateQuery(query, serializeData, shouldRedactErrors) {
	return {
		dehydratedAt: Date.now(),
		state: {
			...query.state,
			...query.state.data !== void 0 && { data: serializeData ? serializeData(query.state.data) : query.state.data }
		},
		queryKey: query.queryKey,
		queryHash: query.queryHash,
		...query.state.status === "pending" && { promise: dehydratePromise(query, serializeData, shouldRedactErrors) },
		...query.meta && { meta: query.meta },
		...query.queryType && { queryType: query.queryType }
	};
}
function defaultShouldDehydrateMutation(mutation) {
	return mutation.state.isPaused;
}
function defaultShouldDehydrateQuery(query) {
	return query.state.status === "success";
}
function dehydrate(client, options = {}) {
	var _client$getDefaultOpt, _client$getDefaultOpt2, _client$getDefaultOpt3, _client$getDefaultOpt4;
	const filterMutation = options.shouldDehydrateMutation ?? ((_client$getDefaultOpt = client.getDefaultOptions().dehydrate) === null || _client$getDefaultOpt === void 0 ? void 0 : _client$getDefaultOpt.shouldDehydrateMutation) ?? defaultShouldDehydrateMutation;
	const mutations = client.getMutationCache().getAll().flatMap((mutation) => filterMutation(mutation) ? [dehydrateMutation(mutation)] : []);
	const filterQuery = options.shouldDehydrateQuery ?? ((_client$getDefaultOpt2 = client.getDefaultOptions().dehydrate) === null || _client$getDefaultOpt2 === void 0 ? void 0 : _client$getDefaultOpt2.shouldDehydrateQuery) ?? defaultShouldDehydrateQuery;
	const shouldRedactErrors = options.shouldRedactErrors ?? ((_client$getDefaultOpt3 = client.getDefaultOptions().dehydrate) === null || _client$getDefaultOpt3 === void 0 ? void 0 : _client$getDefaultOpt3.shouldRedactErrors);
	const serializeData = options.serializeData ?? ((_client$getDefaultOpt4 = client.getDefaultOptions().dehydrate) === null || _client$getDefaultOpt4 === void 0 ? void 0 : _client$getDefaultOpt4.serializeData);
	return {
		mutations,
		queries: client.getQueryCache().getAll().flatMap((query) => filterQuery(query) ? [dehydrateQuery(query, serializeData, shouldRedactErrors)] : [])
	};
}
function hydrate(client, dehydratedState, options) {
	var _options$defaultOptio, _client$getDefaultOpt5, _dehydratedState$muta, _dehydratedState$quer;
	const mutationCache = client.getMutationCache();
	const queryCache = client.getQueryCache();
	const deserializeData = (options === null || options === void 0 || (_options$defaultOptio = options.defaultOptions) === null || _options$defaultOptio === void 0 ? void 0 : _options$defaultOptio.deserializeData) ?? ((_client$getDefaultOpt5 = client.getDefaultOptions().hydrate) === null || _client$getDefaultOpt5 === void 0 ? void 0 : _client$getDefaultOpt5.deserializeData);
	(_dehydratedState$muta = dehydratedState.mutations) === null || _dehydratedState$muta === void 0 || _dehydratedState$muta.forEach(({ state, ...mutationOptions }) => {
		var _client$getDefaultOpt6, _options$defaultOptio2;
		mutationCache.build(client, {
			...(_client$getDefaultOpt6 = client.getDefaultOptions().hydrate) === null || _client$getDefaultOpt6 === void 0 ? void 0 : _client$getDefaultOpt6.mutations,
			...options === null || options === void 0 || (_options$defaultOptio2 = options.defaultOptions) === null || _options$defaultOptio2 === void 0 ? void 0 : _options$defaultOptio2.mutations,
			...mutationOptions
		}, state);
	});
	(_dehydratedState$quer = dehydratedState.queries) === null || _dehydratedState$quer === void 0 || _dehydratedState$quer.forEach(({ queryKey, state, queryHash, meta, promise, dehydratedAt, queryType }) => {
		const syncData = promise ? tryResolveSync(promise) : void 0;
		const rawData = state.data === void 0 ? syncData === null || syncData === void 0 ? void 0 : syncData.data : state.data;
		const data = rawData === void 0 ? rawData : deserializeData ? deserializeData(rawData) : rawData;
		let query = queryCache.get(queryHash);
		const existingQueryIsPending = (query === null || query === void 0 ? void 0 : query.state.status) === "pending";
		const existingQueryIsFetching = (query === null || query === void 0 ? void 0 : query.state.fetchStatus) === "fetching";
		if (query) {
			const hasNewerSyncData = syncData && dehydratedAt !== void 0 && dehydratedAt > query.state.dataUpdatedAt;
			if (state.dataUpdatedAt > query.state.dataUpdatedAt || hasNewerSyncData) {
				const { fetchStatus: _ignored, ...serializedState } = state;
				query.setState({
					...serializedState,
					data,
					...state.status === "pending" && data !== void 0 && {
						status: "success",
						dataUpdatedAt: dehydratedAt ?? Date.now(),
						...!existingQueryIsFetching && { fetchStatus: "idle" }
					}
				});
			}
		} else {
			var _client$getDefaultOpt7, _options$defaultOptio3;
			query = queryCache.build(client, {
				...(_client$getDefaultOpt7 = client.getDefaultOptions().hydrate) === null || _client$getDefaultOpt7 === void 0 ? void 0 : _client$getDefaultOpt7.queries,
				...options === null || options === void 0 || (_options$defaultOptio3 = options.defaultOptions) === null || _options$defaultOptio3 === void 0 ? void 0 : _options$defaultOptio3.queries,
				queryKey,
				queryHash,
				meta,
				_type: queryType
			}, {
				...state,
				data,
				fetchStatus: "idle",
				status: state.status === "pending" && data !== void 0 ? "success" : state.status,
				...state.status === "pending" && data !== void 0 && { dataUpdatedAt: dehydratedAt ?? Date.now() }
			});
		}
		if (promise && !syncData && !existingQueryIsPending && !existingQueryIsFetching && (dehydratedAt === void 0 || dehydratedAt > query.state.dataUpdatedAt)) query.fetch(void 0, { initialPromise: Promise.resolve(promise).then(deserializeData) }).catch(require_utils.noop);
	});
}
//#endregion
exports.defaultShouldDehydrateMutation = defaultShouldDehydrateMutation;
exports.defaultShouldDehydrateQuery = defaultShouldDehydrateQuery;
exports.dehydrate = dehydrate;
exports.dehydrateQuery = dehydrateQuery;
exports.hydrate = hydrate;

//# sourceMappingURL=hydration.cjs.map