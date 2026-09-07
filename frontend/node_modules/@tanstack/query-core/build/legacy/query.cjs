Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_classPrivateFieldSet2 = require("./classPrivateFieldSet2-Bo0ZyOIv.cjs");
const require_utils = require("./utils.cjs");
const require_notifyManager = require("./notifyManager.cjs");
const require_retryer = require("./retryer.cjs");
const require_removable = require("./removable.cjs");
const require_infiniteQueryBehavior = require("./infiniteQueryBehavior.cjs");
const require_classPrivateMethodInitSpec = require("./classPrivateMethodInitSpec-DVhcLejn.cjs");
//#region src/query.ts
var _queryType = /* @__PURE__ */ new WeakMap();
var _initialState = /* @__PURE__ */ new WeakMap();
var _revertState = /* @__PURE__ */ new WeakMap();
var _cache = /* @__PURE__ */ new WeakMap();
var _client = /* @__PURE__ */ new WeakMap();
var _retryer = /* @__PURE__ */ new WeakMap();
var _defaultOptions = /* @__PURE__ */ new WeakMap();
var _abortSignalConsumed = /* @__PURE__ */ new WeakMap();
var _Query_brand = /* @__PURE__ */ new WeakSet();
var Query = class extends require_removable.Removable {
	constructor(config) {
		super();
		require_classPrivateMethodInitSpec._classPrivateMethodInitSpec(this, _Query_brand);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _queryType, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _initialState, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _revertState, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _cache, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _client, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _retryer, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _defaultOptions, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _abortSignalConsumed, void 0);
		require_classPrivateFieldSet2._classPrivateFieldSet2(_abortSignalConsumed, this, false);
		require_classPrivateFieldSet2._classPrivateFieldSet2(_defaultOptions, this, config.defaultOptions);
		this.setOptions(config.options);
		this.observers = [];
		require_classPrivateFieldSet2._classPrivateFieldSet2(_client, this, config.client);
		require_classPrivateFieldSet2._classPrivateFieldSet2(_cache, this, require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this).getQueryCache());
		this.queryKey = config.queryKey;
		this.queryHash = config.queryHash;
		require_classPrivateFieldSet2._classPrivateFieldSet2(_initialState, this, getDefaultState(this.options));
		this.state = config.state ?? require_classPrivateFieldSet2._classPrivateFieldGet2(_initialState, this);
		this.scheduleGc();
	}
	get meta() {
		return this.options.meta;
	}
	get queryType() {
		return require_classPrivateFieldSet2._classPrivateFieldGet2(_queryType, this);
	}
	get promise() {
		var _classPrivateFieldGet2$1;
		return (_classPrivateFieldGet2$1 = require_classPrivateFieldSet2._classPrivateFieldGet2(_retryer, this)) === null || _classPrivateFieldGet2$1 === void 0 ? void 0 : _classPrivateFieldGet2$1.promise;
	}
	setOptions(options) {
		this.options = {
			...require_classPrivateFieldSet2._classPrivateFieldGet2(_defaultOptions, this),
			...options
		};
		if (options === null || options === void 0 ? void 0 : options._type) require_classPrivateFieldSet2._classPrivateFieldSet2(_queryType, this, options._type);
		this.updateGcTime(this.options.gcTime);
		if (this.state && this.state.data === void 0) {
			const defaultState = getDefaultState(this.options);
			if (defaultState.data !== void 0) {
				this.setState(successState(defaultState.data, defaultState.dataUpdatedAt));
				require_classPrivateFieldSet2._classPrivateFieldSet2(_initialState, this, defaultState);
			}
		}
	}
	optionalRemove() {
		if (!this.observers.length && this.state.fetchStatus === "idle") require_classPrivateFieldSet2._classPrivateFieldGet2(_cache, this).remove(this);
	}
	setData(newData, options) {
		const data = require_utils.replaceData(this.state.data, newData, this.options);
		require_classPrivateFieldSet2._assertClassBrand(_Query_brand, this, _dispatch).call(this, {
			data,
			type: "success",
			dataUpdatedAt: options === null || options === void 0 ? void 0 : options.updatedAt,
			manual: options === null || options === void 0 ? void 0 : options.manual
		});
		return data;
	}
	setState(state) {
		require_classPrivateFieldSet2._assertClassBrand(_Query_brand, this, _dispatch).call(this, {
			type: "setState",
			state
		});
	}
	cancel(options) {
		var _classPrivateFieldGet3, _classPrivateFieldGet4;
		const promise = (_classPrivateFieldGet3 = require_classPrivateFieldSet2._classPrivateFieldGet2(_retryer, this)) === null || _classPrivateFieldGet3 === void 0 ? void 0 : _classPrivateFieldGet3.promise;
		(_classPrivateFieldGet4 = require_classPrivateFieldSet2._classPrivateFieldGet2(_retryer, this)) === null || _classPrivateFieldGet4 === void 0 || _classPrivateFieldGet4.cancel(options);
		return promise ? promise.then(require_utils.noop).catch(require_utils.noop) : Promise.resolve();
	}
	destroy() {
		super.destroy();
		this.cancel({ silent: true });
	}
	get resetState() {
		return require_classPrivateFieldSet2._classPrivateFieldGet2(_initialState, this);
	}
	reset() {
		this.destroy();
		this.setState(this.resetState);
	}
	isActive() {
		return this.observers.some((observer) => require_utils.resolveQueryValue(observer.options.enabled, this) !== false);
	}
	isDisabled() {
		if (this.getObserversCount() > 0) return !this.isActive();
		return this.options.queryFn === require_utils.skipToken || !this.isFetched();
	}
	isFetched() {
		return this.state.dataUpdateCount + this.state.errorUpdateCount > 0;
	}
	isStatic() {
		if (this.getObserversCount() > 0) return this.observers.some((observer) => require_utils.resolveQueryValue(observer.options.staleTime, this) === "static");
		return false;
	}
	isStale() {
		if (this.getObserversCount() > 0) return this.observers.some((observer) => observer.getCurrentResult().isStale);
		return this.state.data === void 0 || this.state.isInvalidated;
	}
	isStaleByTime(staleTime = 0) {
		if (this.state.data === void 0) return true;
		if (staleTime === "static") return false;
		if (this.state.isInvalidated) return true;
		return !require_utils.timeUntilStale(this.state.dataUpdatedAt, staleTime);
	}
	onFocus() {
		var _classPrivateFieldGet5;
		const observer = this.observers.find((x) => x.shouldFetchOnWindowFocus());
		observer === null || observer === void 0 || observer.refetch({ cancelRefetch: false });
		(_classPrivateFieldGet5 = require_classPrivateFieldSet2._classPrivateFieldGet2(_retryer, this)) === null || _classPrivateFieldGet5 === void 0 || _classPrivateFieldGet5.continue();
	}
	onOnline() {
		var _classPrivateFieldGet6;
		const observer = this.observers.find((x) => x.shouldFetchOnReconnect());
		observer === null || observer === void 0 || observer.refetch({ cancelRefetch: false });
		(_classPrivateFieldGet6 = require_classPrivateFieldSet2._classPrivateFieldGet2(_retryer, this)) === null || _classPrivateFieldGet6 === void 0 || _classPrivateFieldGet6.continue();
	}
	addObserver(observer) {
		if (!this.observers.includes(observer)) {
			this.observers.push(observer);
			this.clearGcTimeout();
			require_classPrivateFieldSet2._classPrivateFieldGet2(_cache, this).notify({
				type: "observerAdded",
				query: this,
				observer
			});
		}
	}
	removeObserver(observer) {
		const index = this.observers.indexOf(observer);
		if (index !== -1) {
			this.observers.splice(index, 1);
			if (!this.observers.length) {
				if (require_classPrivateFieldSet2._classPrivateFieldGet2(_retryer, this)) {
					if (require_classPrivateFieldSet2._classPrivateFieldGet2(_abortSignalConsumed, this) || this.state.fetchStatus === "paused" && this.state.status === "pending") require_classPrivateFieldSet2._classPrivateFieldGet2(_retryer, this).cancel({ revert: true });
					else require_classPrivateFieldSet2._classPrivateFieldGet2(_retryer, this).cancelRetry();
				}
				this.scheduleGc();
			}
			require_classPrivateFieldSet2._classPrivateFieldGet2(_cache, this).notify({
				type: "observerRemoved",
				query: this,
				observer
			});
		}
	}
	getObserversCount() {
		return this.observers.length;
	}
	invalidate() {
		if (!this.state.isInvalidated) require_classPrivateFieldSet2._assertClassBrand(_Query_brand, this, _dispatch).call(this, { type: "invalidate" });
	}
	async fetch(options, fetchOptions) {
		var _classPrivateFieldGet7, _context$fetchOptions;
		if (this.state.fetchStatus !== "idle" && ((_classPrivateFieldGet7 = require_classPrivateFieldSet2._classPrivateFieldGet2(_retryer, this)) === null || _classPrivateFieldGet7 === void 0 ? void 0 : _classPrivateFieldGet7.status()) !== "rejected") {
			if (this.state.data !== void 0 && (fetchOptions === null || fetchOptions === void 0 ? void 0 : fetchOptions.cancelRefetch)) this.cancel({ silent: true });
			else if (require_classPrivateFieldSet2._classPrivateFieldGet2(_retryer, this)) {
				require_classPrivateFieldSet2._classPrivateFieldGet2(_retryer, this).continueRetry();
				return require_classPrivateFieldSet2._classPrivateFieldGet2(_retryer, this).promise;
			}
		}
		if (options) this.setOptions(options);
		if (!this.options.queryFn) {
			const observer = this.observers.find((x) => x.options.queryFn);
			if (observer) this.setOptions(observer.options);
		}
		if (process.env.NODE_ENV !== "production") {
			if (!Array.isArray(this.options.queryKey)) console.error(`As of v4, queryKey needs to be an Array. If you are using a string like 'repoData', please change it to an Array, e.g. ['repoData']`);
		}
		const abortController = new AbortController();
		const addSignalProperty = (object) => {
			Object.defineProperty(object, "signal", {
				enumerable: true,
				get: () => {
					require_classPrivateFieldSet2._classPrivateFieldSet2(_abortSignalConsumed, this, true);
					return abortController.signal;
				}
			});
		};
		const fetchFn = () => {
			const queryFn = require_utils.ensureQueryFn(this.options, fetchOptions);
			const createQueryFnContext = () => {
				const queryFnContext = {
					client: require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this),
					queryKey: this.queryKey,
					meta: this.meta
				};
				addSignalProperty(queryFnContext);
				return queryFnContext;
			};
			const queryFnContext = createQueryFnContext();
			require_classPrivateFieldSet2._classPrivateFieldSet2(_abortSignalConsumed, this, false);
			if (this.options.persister) return this.options.persister(queryFn, queryFnContext, this);
			return queryFn(queryFnContext);
		};
		const createFetchContext = () => {
			const context = {
				fetchOptions,
				options: this.options,
				queryKey: this.queryKey,
				client: require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this),
				state: this.state,
				fetchFn
			};
			addSignalProperty(context);
			return context;
		};
		const context = createFetchContext();
		const behavior = require_classPrivateFieldSet2._classPrivateFieldGet2(_queryType, this) === "infinite" ? require_infiniteQueryBehavior.infiniteQueryBehavior(this.options.pages) : this.options.behavior;
		behavior === null || behavior === void 0 || behavior.onFetch(context, this);
		require_classPrivateFieldSet2._classPrivateFieldSet2(_revertState, this, this.state);
		if (this.state.fetchStatus === "idle" || this.state.fetchMeta !== ((_context$fetchOptions = context.fetchOptions) === null || _context$fetchOptions === void 0 ? void 0 : _context$fetchOptions.meta)) {
			var _context$fetchOptions2;
			require_classPrivateFieldSet2._assertClassBrand(_Query_brand, this, _dispatch).call(this, {
				type: "fetch",
				meta: (_context$fetchOptions2 = context.fetchOptions) === null || _context$fetchOptions2 === void 0 ? void 0 : _context$fetchOptions2.meta
			});
		}
		const retryer = require_classPrivateFieldSet2._classPrivateFieldSet2(_retryer, this, require_retryer.createRetryer({
			initialPromise: fetchOptions === null || fetchOptions === void 0 ? void 0 : fetchOptions.initialPromise,
			fn: context.fetchFn,
			onCancel: (error) => {
				if (error instanceof require_retryer.CancelledError && error.revert) this.setState({
					...require_classPrivateFieldSet2._classPrivateFieldGet2(_revertState, this),
					fetchStatus: "idle"
				});
				abortController.abort();
			},
			onFail: (failureCount, error) => {
				require_classPrivateFieldSet2._assertClassBrand(_Query_brand, this, _dispatch).call(this, {
					type: "failed",
					failureCount,
					error
				});
			},
			onPause: () => {
				require_classPrivateFieldSet2._assertClassBrand(_Query_brand, this, _dispatch).call(this, { type: "pause" });
			},
			onContinue: () => {
				require_classPrivateFieldSet2._assertClassBrand(_Query_brand, this, _dispatch).call(this, { type: "continue" });
			},
			retry: context.options.retry,
			retryDelay: context.options.retryDelay,
			networkMode: context.options.networkMode,
			canRun: () => true
		}));
		try {
			var _classPrivateFieldGet8, _classPrivateFieldGet9, _classPrivateFieldGet10, _classPrivateFieldGet11;
			const data = await retryer.start();
			if (data === void 0) {
				if (process.env.NODE_ENV !== "production") console.error(`Query data cannot be undefined. Please make sure to return a value other than undefined from your query function. Affected query key: ${this.queryHash}`);
				throw new Error(`${this.queryHash} data is undefined`);
			}
			this.setData(data);
			(_classPrivateFieldGet8 = (_classPrivateFieldGet9 = require_classPrivateFieldSet2._classPrivateFieldGet2(_cache, this).config).onSuccess) === null || _classPrivateFieldGet8 === void 0 || _classPrivateFieldGet8.call(_classPrivateFieldGet9, data, this);
			(_classPrivateFieldGet10 = (_classPrivateFieldGet11 = require_classPrivateFieldSet2._classPrivateFieldGet2(_cache, this).config).onSettled) === null || _classPrivateFieldGet10 === void 0 || _classPrivateFieldGet10.call(_classPrivateFieldGet11, data, this.state.error, this);
			return data;
		} catch (error) {
			var _classPrivateFieldGet12, _classPrivateFieldGet13, _classPrivateFieldGet14, _classPrivateFieldGet15;
			if (error instanceof require_retryer.CancelledError) {
				if (error.silent) return require_classPrivateFieldSet2._classPrivateFieldGet2(_retryer, this).promise;
				else if (error.revert) {
					if (this.state.data === void 0) throw error;
					return this.state.data;
				}
			}
			require_classPrivateFieldSet2._assertClassBrand(_Query_brand, this, _dispatch).call(this, {
				type: "error",
				error
			});
			(_classPrivateFieldGet12 = (_classPrivateFieldGet13 = require_classPrivateFieldSet2._classPrivateFieldGet2(_cache, this).config).onError) === null || _classPrivateFieldGet12 === void 0 || _classPrivateFieldGet12.call(_classPrivateFieldGet13, error, this);
			(_classPrivateFieldGet14 = (_classPrivateFieldGet15 = require_classPrivateFieldSet2._classPrivateFieldGet2(_cache, this).config).onSettled) === null || _classPrivateFieldGet14 === void 0 || _classPrivateFieldGet14.call(_classPrivateFieldGet15, this.state.data, error, this);
			throw error;
		} finally {
			if (require_classPrivateFieldSet2._classPrivateFieldGet2(_retryer, this) === retryer) require_classPrivateFieldSet2._classPrivateFieldSet2(_retryer, this, void 0);
			this.scheduleGc();
		}
	}
};
function _dispatch(action) {
	const reducer = (state) => {
		switch (action.type) {
			case "failed": return {
				...state,
				fetchFailureCount: action.failureCount,
				fetchFailureReason: action.error
			};
			case "pause": return {
				...state,
				fetchStatus: "paused"
			};
			case "continue": return {
				...state,
				fetchStatus: "fetching"
			};
			case "fetch": return {
				...state,
				...fetchState(state.data, this.options),
				fetchMeta: action.meta ?? null
			};
			case "success":
				const newState = {
					...state,
					...successState(action.data, action.dataUpdatedAt),
					dataUpdateCount: state.dataUpdateCount + 1,
					...!action.manual && {
						fetchStatus: "idle",
						fetchFailureCount: 0,
						fetchFailureReason: null
					}
				};
				require_classPrivateFieldSet2._classPrivateFieldSet2(_revertState, this, action.manual ? newState : void 0);
				return newState;
			case "error":
				const error = action.error;
				return {
					...state,
					error,
					errorUpdateCount: state.errorUpdateCount + 1,
					errorUpdatedAt: Date.now(),
					fetchFailureCount: state.fetchFailureCount + 1,
					fetchFailureReason: error,
					fetchStatus: "idle",
					status: "error",
					isInvalidated: true
				};
			case "invalidate": return {
				...state,
				isInvalidated: true
			};
			case "setState": return {
				...state,
				...action.state
			};
		}
	};
	this.state = reducer(this.state);
	require_notifyManager.notifyManager.batch(() => {
		this.observers.slice().forEach((observer) => {
			observer.onQueryUpdate();
		});
		require_classPrivateFieldSet2._classPrivateFieldGet2(_cache, this).notify({
			query: this,
			type: "updated",
			action
		});
	});
}
function fetchState(data, options) {
	return {
		fetchFailureCount: 0,
		fetchFailureReason: null,
		fetchStatus: require_retryer.canFetch(options.networkMode) ? "fetching" : "paused",
		...data === void 0 && {
			error: null,
			status: "pending"
		}
	};
}
function successState(data, dataUpdatedAt) {
	return {
		data,
		dataUpdatedAt: dataUpdatedAt ?? Date.now(),
		error: null,
		isInvalidated: false,
		status: "success"
	};
}
function getDefaultState(options) {
	const data = typeof options.initialData === "function" ? options.initialData() : options.initialData;
	const hasData = data !== void 0;
	const initialDataUpdatedAt = hasData ? typeof options.initialDataUpdatedAt === "function" ? options.initialDataUpdatedAt() : options.initialDataUpdatedAt : 0;
	return {
		data,
		dataUpdateCount: 0,
		dataUpdatedAt: hasData ? initialDataUpdatedAt ?? Date.now() : 0,
		error: null,
		errorUpdateCount: 0,
		errorUpdatedAt: 0,
		fetchFailureCount: 0,
		fetchFailureReason: null,
		fetchMeta: null,
		isInvalidated: false,
		status: hasData ? "success" : "pending",
		fetchStatus: "idle"
	};
}
//#endregion
exports.Query = Query;
exports.fetchState = fetchState;

//# sourceMappingURL=query.cjs.map