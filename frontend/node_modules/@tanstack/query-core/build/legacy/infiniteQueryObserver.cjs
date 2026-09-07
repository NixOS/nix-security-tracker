Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_infiniteQueryBehavior = require("./infiniteQueryBehavior.cjs");
const require_queryObserver = require("./queryObserver.cjs");
//#region src/infiniteQueryObserver.ts
var InfiniteQueryObserver = class extends require_queryObserver.QueryObserver {
	constructor(client, options) {
		super(client, options);
	}
	bindMethods() {
		super.bindMethods();
		this.fetchNextPage = this.fetchNextPage.bind(this);
		this.fetchPreviousPage = this.fetchPreviousPage.bind(this);
	}
	setOptions(options) {
		options._type = "infinite";
		super.setOptions(options);
	}
	getOptimisticResult(options) {
		options._type = "infinite";
		return super.getOptimisticResult(options);
	}
	fetchNextPage(options) {
		return this.fetch({
			...options,
			meta: { fetchMore: { direction: "forward" } }
		});
	}
	fetchPreviousPage(options) {
		return this.fetch({
			...options,
			meta: { fetchMore: { direction: "backward" } }
		});
	}
	createResult(query, options) {
		var _state$fetchMeta;
		const { state } = query;
		const parentResult = super.createResult(query, options);
		const { isFetching, isRefetching, isError, isRefetchError } = parentResult;
		const fetchDirection = (_state$fetchMeta = state.fetchMeta) === null || _state$fetchMeta === void 0 || (_state$fetchMeta = _state$fetchMeta.fetchMore) === null || _state$fetchMeta === void 0 ? void 0 : _state$fetchMeta.direction;
		const isFetchNextPageError = isError && fetchDirection === "forward";
		const isFetchingNextPage = isFetching && fetchDirection === "forward";
		const isFetchPreviousPageError = isError && fetchDirection === "backward";
		const isFetchingPreviousPage = isFetching && fetchDirection === "backward";
		return {
			...parentResult,
			fetchNextPage: this.fetchNextPage,
			fetchPreviousPage: this.fetchPreviousPage,
			hasNextPage: require_infiniteQueryBehavior.hasNextPage(options, state.data),
			hasPreviousPage: require_infiniteQueryBehavior.hasPreviousPage(options, state.data),
			isFetchNextPageError,
			isFetchingNextPage,
			isFetchPreviousPageError,
			isFetchingPreviousPage,
			isRefetchError: isRefetchError && !isFetchNextPageError && !isFetchPreviousPageError,
			isRefetching: isRefetching && !isFetchingNextPage && !isFetchingPreviousPage
		};
	}
};
//#endregion
exports.InfiniteQueryObserver = InfiniteQueryObserver;

//# sourceMappingURL=infiniteQueryObserver.cjs.map