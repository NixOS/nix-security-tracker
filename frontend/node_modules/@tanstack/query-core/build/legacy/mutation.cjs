Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_classPrivateFieldSet2 = require("./classPrivateFieldSet2-Bo0ZyOIv.cjs");
const require_notifyManager = require("./notifyManager.cjs");
const require_retryer = require("./retryer.cjs");
const require_removable = require("./removable.cjs");
const require_classPrivateMethodInitSpec = require("./classPrivateMethodInitSpec-DVhcLejn.cjs");
//#region src/mutation.ts
var _client = /* @__PURE__ */ new WeakMap();
var _observers = /* @__PURE__ */ new WeakMap();
var _mutationCache = /* @__PURE__ */ new WeakMap();
var _retryer = /* @__PURE__ */ new WeakMap();
var _Mutation_brand = /* @__PURE__ */ new WeakSet();
var Mutation = class extends require_removable.Removable {
	constructor(config) {
		super();
		require_classPrivateMethodInitSpec._classPrivateMethodInitSpec(this, _Mutation_brand);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _client, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _observers, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _mutationCache, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _retryer, void 0);
		require_classPrivateFieldSet2._classPrivateFieldSet2(_client, this, config.client);
		this.mutationId = config.mutationId;
		require_classPrivateFieldSet2._classPrivateFieldSet2(_mutationCache, this, config.mutationCache);
		require_classPrivateFieldSet2._classPrivateFieldSet2(_observers, this, []);
		this.state = config.state || getDefaultState();
		this.setOptions(config.options);
		this.scheduleGc();
	}
	setOptions(options) {
		this.options = options;
		this.updateGcTime(this.options.gcTime);
	}
	get meta() {
		return this.options.meta;
	}
	addObserver(observer) {
		if (!require_classPrivateFieldSet2._classPrivateFieldGet2(_observers, this).includes(observer)) {
			require_classPrivateFieldSet2._classPrivateFieldGet2(_observers, this).push(observer);
			this.clearGcTimeout();
			require_classPrivateFieldSet2._classPrivateFieldGet2(_mutationCache, this).notify({
				type: "observerAdded",
				mutation: this,
				observer
			});
		}
	}
	removeObserver(observer) {
		require_classPrivateFieldSet2._classPrivateFieldSet2(_observers, this, require_classPrivateFieldSet2._classPrivateFieldGet2(_observers, this).filter((x) => x !== observer));
		this.scheduleGc();
		require_classPrivateFieldSet2._classPrivateFieldGet2(_mutationCache, this).notify({
			type: "observerRemoved",
			mutation: this,
			observer
		});
	}
	optionalRemove() {
		if (!require_classPrivateFieldSet2._classPrivateFieldGet2(_observers, this).length) {
			if (this.state.status === "pending") this.scheduleGc();
			else require_classPrivateFieldSet2._classPrivateFieldGet2(_mutationCache, this).remove(this);
		}
	}
	continue() {
		var _classPrivateFieldGet2$1;
		return ((_classPrivateFieldGet2$1 = require_classPrivateFieldSet2._classPrivateFieldGet2(_retryer, this)) === null || _classPrivateFieldGet2$1 === void 0 ? void 0 : _classPrivateFieldGet2$1.continue()) ?? (this.state.status === "pending" ? this.execute(this.state.variables) : Promise.resolve());
	}
	async execute(variables) {
		const onContinue = () => {
			require_classPrivateFieldSet2._assertClassBrand(_Mutation_brand, this, _dispatch).call(this, { type: "continue" });
		};
		const mutationFnContext = {
			client: require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this),
			meta: this.options.meta,
			mutationKey: this.options.mutationKey
		};
		const retryer = require_classPrivateFieldSet2._classPrivateFieldSet2(_retryer, this, require_retryer.createRetryer({
			fn: () => {
				if (!this.options.mutationFn) return Promise.reject(/* @__PURE__ */ new Error("No mutationFn found"));
				return this.options.mutationFn(variables, mutationFnContext);
			},
			onFail: (failureCount, error) => {
				require_classPrivateFieldSet2._assertClassBrand(_Mutation_brand, this, _dispatch).call(this, {
					type: "failed",
					failureCount,
					error
				});
			},
			onPause: () => {
				require_classPrivateFieldSet2._assertClassBrand(_Mutation_brand, this, _dispatch).call(this, { type: "pause" });
			},
			onContinue,
			retry: this.options.retry ?? 0,
			retryDelay: this.options.retryDelay,
			networkMode: this.options.networkMode,
			canRun: () => require_classPrivateFieldSet2._classPrivateFieldGet2(_mutationCache, this).canRun(this)
		}));
		const restored = this.state.status === "pending";
		const isPaused = !retryer.canStart();
		try {
			var _classPrivateFieldGet3, _classPrivateFieldGet4, _this$options$onSucce, _this$options2, _classPrivateFieldGet5, _classPrivateFieldGet6, _this$options$onSettl, _this$options3;
			if (restored) onContinue();
			else {
				var _this$options$onMutat, _this$options;
				require_classPrivateFieldSet2._assertClassBrand(_Mutation_brand, this, _dispatch).call(this, {
					type: "pending",
					variables,
					isPaused
				});
				if (require_classPrivateFieldSet2._classPrivateFieldGet2(_mutationCache, this).config.onMutate) await require_classPrivateFieldSet2._classPrivateFieldGet2(_mutationCache, this).config.onMutate(variables, this, mutationFnContext);
				const context = await ((_this$options$onMutat = (_this$options = this.options).onMutate) === null || _this$options$onMutat === void 0 ? void 0 : _this$options$onMutat.call(_this$options, variables, mutationFnContext));
				if (context !== this.state.context) require_classPrivateFieldSet2._assertClassBrand(_Mutation_brand, this, _dispatch).call(this, {
					type: "pending",
					context,
					variables,
					isPaused
				});
			}
			const data = await retryer.start();
			await ((_classPrivateFieldGet3 = (_classPrivateFieldGet4 = require_classPrivateFieldSet2._classPrivateFieldGet2(_mutationCache, this).config).onSuccess) === null || _classPrivateFieldGet3 === void 0 ? void 0 : _classPrivateFieldGet3.call(_classPrivateFieldGet4, data, variables, this.state.context, this, mutationFnContext));
			await ((_this$options$onSucce = (_this$options2 = this.options).onSuccess) === null || _this$options$onSucce === void 0 ? void 0 : _this$options$onSucce.call(_this$options2, data, variables, this.state.context, mutationFnContext));
			await ((_classPrivateFieldGet5 = (_classPrivateFieldGet6 = require_classPrivateFieldSet2._classPrivateFieldGet2(_mutationCache, this).config).onSettled) === null || _classPrivateFieldGet5 === void 0 ? void 0 : _classPrivateFieldGet5.call(_classPrivateFieldGet6, data, null, this.state.variables, this.state.context, this, mutationFnContext));
			await ((_this$options$onSettl = (_this$options3 = this.options).onSettled) === null || _this$options$onSettl === void 0 ? void 0 : _this$options$onSettl.call(_this$options3, data, null, variables, this.state.context, mutationFnContext));
			require_classPrivateFieldSet2._assertClassBrand(_Mutation_brand, this, _dispatch).call(this, {
				type: "success",
				data
			});
			return data;
		} catch (error) {
			try {
				var _classPrivateFieldGet7, _classPrivateFieldGet8;
				await ((_classPrivateFieldGet7 = (_classPrivateFieldGet8 = require_classPrivateFieldSet2._classPrivateFieldGet2(_mutationCache, this).config).onError) === null || _classPrivateFieldGet7 === void 0 ? void 0 : _classPrivateFieldGet7.call(_classPrivateFieldGet8, error, variables, this.state.context, this, mutationFnContext));
			} catch (e) {
				Promise.reject(e);
			}
			try {
				var _this$options$onError, _this$options4;
				await ((_this$options$onError = (_this$options4 = this.options).onError) === null || _this$options$onError === void 0 ? void 0 : _this$options$onError.call(_this$options4, error, variables, this.state.context, mutationFnContext));
			} catch (e) {
				Promise.reject(e);
			}
			try {
				var _classPrivateFieldGet9, _classPrivateFieldGet10;
				await ((_classPrivateFieldGet9 = (_classPrivateFieldGet10 = require_classPrivateFieldSet2._classPrivateFieldGet2(_mutationCache, this).config).onSettled) === null || _classPrivateFieldGet9 === void 0 ? void 0 : _classPrivateFieldGet9.call(_classPrivateFieldGet10, void 0, error, this.state.variables, this.state.context, this, mutationFnContext));
			} catch (e) {
				Promise.reject(e);
			}
			try {
				var _this$options$onSettl2, _this$options5;
				await ((_this$options$onSettl2 = (_this$options5 = this.options).onSettled) === null || _this$options$onSettl2 === void 0 ? void 0 : _this$options$onSettl2.call(_this$options5, void 0, error, variables, this.state.context, mutationFnContext));
			} catch (e) {
				Promise.reject(e);
			}
			require_classPrivateFieldSet2._assertClassBrand(_Mutation_brand, this, _dispatch).call(this, {
				type: "error",
				error
			});
			throw error;
		} finally {
			if (require_classPrivateFieldSet2._classPrivateFieldGet2(_retryer, this) === retryer) require_classPrivateFieldSet2._classPrivateFieldSet2(_retryer, this, void 0);
			require_classPrivateFieldSet2._classPrivateFieldGet2(_mutationCache, this).runNext(this);
		}
	}
};
function _dispatch(action) {
	const reducer = (state) => {
		switch (action.type) {
			case "failed": return {
				...state,
				failureCount: action.failureCount,
				failureReason: action.error
			};
			case "pause": return {
				...state,
				isPaused: true
			};
			case "continue": return {
				...state,
				isPaused: false
			};
			case "pending": return {
				...state,
				context: action.context,
				data: void 0,
				failureCount: 0,
				failureReason: null,
				error: null,
				isPaused: action.isPaused,
				status: "pending",
				variables: action.variables,
				submittedAt: Date.now()
			};
			case "success": return {
				...state,
				data: action.data,
				failureCount: 0,
				failureReason: null,
				error: null,
				status: "success",
				isPaused: false
			};
			case "error": return {
				...state,
				data: void 0,
				error: action.error,
				failureCount: state.failureCount + 1,
				failureReason: action.error,
				isPaused: false,
				status: "error"
			};
		}
	};
	this.state = reducer(this.state);
	require_notifyManager.notifyManager.batch(() => {
		require_classPrivateFieldSet2._classPrivateFieldGet2(_observers, this).forEach((observer) => {
			observer.onMutationUpdate(action);
		});
		require_classPrivateFieldSet2._classPrivateFieldGet2(_mutationCache, this).notify({
			mutation: this,
			type: "updated",
			action
		});
	});
}
function getDefaultState() {
	return {
		context: void 0,
		data: void 0,
		error: null,
		failureCount: 0,
		failureReason: null,
		isPaused: false,
		status: "idle",
		variables: void 0,
		submittedAt: 0
	};
}
//#endregion
exports.Mutation = Mutation;
exports.getDefaultState = getDefaultState;

//# sourceMappingURL=mutation.cjs.map