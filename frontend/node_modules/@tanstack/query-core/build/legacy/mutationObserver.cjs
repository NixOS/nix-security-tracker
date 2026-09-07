Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_classPrivateFieldSet2 = require("./classPrivateFieldSet2-Bo0ZyOIv.cjs");
const require_utils = require("./utils.cjs");
const require_subscribable = require("./subscribable.cjs");
const require_notifyManager = require("./notifyManager.cjs");
const require_classPrivateMethodInitSpec = require("./classPrivateMethodInitSpec-DVhcLejn.cjs");
const require_mutation = require("./mutation.cjs");
//#region src/mutationObserver.ts
var _client = /* @__PURE__ */ new WeakMap();
var _currentResult = /* @__PURE__ */ new WeakMap();
var _currentMutation = /* @__PURE__ */ new WeakMap();
var _mutateOptions = /* @__PURE__ */ new WeakMap();
var _MutationObserver_brand = /* @__PURE__ */ new WeakSet();
var MutationObserver = class extends require_subscribable.Subscribable {
	constructor(client, options) {
		super();
		require_classPrivateMethodInitSpec._classPrivateMethodInitSpec(this, _MutationObserver_brand);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _client, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _currentResult, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _currentMutation, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _mutateOptions, void 0);
		require_classPrivateFieldSet2._classPrivateFieldSet2(_client, this, client);
		this.setOptions(options);
		this.bindMethods();
		require_classPrivateFieldSet2._assertClassBrand(_MutationObserver_brand, this, _updateResult).call(this);
	}
	bindMethods() {
		this.mutate = this.mutate.bind(this);
		this.reset = this.reset.bind(this);
	}
	setOptions(options) {
		var _classPrivateFieldGet2$1;
		const prevOptions = this.options;
		this.options = require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this).defaultMutationOptions(options);
		if (!require_utils.shallowEqualObjects(this.options, prevOptions)) require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this).getMutationCache().notify({
			type: "observerOptionsUpdated",
			mutation: require_classPrivateFieldSet2._classPrivateFieldGet2(_currentMutation, this),
			observer: this
		});
		if ((prevOptions === null || prevOptions === void 0 ? void 0 : prevOptions.mutationKey) && this.options.mutationKey && require_utils.hashKey(prevOptions.mutationKey) !== require_utils.hashKey(this.options.mutationKey)) this.reset();
		else if (((_classPrivateFieldGet2$1 = require_classPrivateFieldSet2._classPrivateFieldGet2(_currentMutation, this)) === null || _classPrivateFieldGet2$1 === void 0 ? void 0 : _classPrivateFieldGet2$1.state.status) === "pending") require_classPrivateFieldSet2._classPrivateFieldGet2(_currentMutation, this).setOptions(this.options);
	}
	onSubscribe() {
		if (this.listeners.size === 1 && require_classPrivateFieldSet2._classPrivateFieldGet2(_currentMutation, this)) {
			require_classPrivateFieldSet2._classPrivateFieldGet2(_currentMutation, this).addObserver(this);
			require_classPrivateFieldSet2._assertClassBrand(_MutationObserver_brand, this, _updateResult).call(this);
		}
	}
	onUnsubscribe() {
		if (!this.hasListeners()) {
			var _classPrivateFieldGet3;
			(_classPrivateFieldGet3 = require_classPrivateFieldSet2._classPrivateFieldGet2(_currentMutation, this)) === null || _classPrivateFieldGet3 === void 0 || _classPrivateFieldGet3.removeObserver(this);
		}
	}
	onMutationUpdate(action) {
		require_classPrivateFieldSet2._assertClassBrand(_MutationObserver_brand, this, _updateResult).call(this);
		require_classPrivateFieldSet2._assertClassBrand(_MutationObserver_brand, this, _notify).call(this, action);
	}
	getCurrentResult() {
		return require_classPrivateFieldSet2._classPrivateFieldGet2(_currentResult, this);
	}
	reset() {
		var _classPrivateFieldGet4;
		(_classPrivateFieldGet4 = require_classPrivateFieldSet2._classPrivateFieldGet2(_currentMutation, this)) === null || _classPrivateFieldGet4 === void 0 || _classPrivateFieldGet4.removeObserver(this);
		require_classPrivateFieldSet2._classPrivateFieldSet2(_currentMutation, this, void 0);
		require_classPrivateFieldSet2._assertClassBrand(_MutationObserver_brand, this, _updateResult).call(this);
		require_classPrivateFieldSet2._assertClassBrand(_MutationObserver_brand, this, _notify).call(this);
	}
	mutate(variables, options) {
		var _classPrivateFieldGet5;
		require_classPrivateFieldSet2._classPrivateFieldSet2(_mutateOptions, this, options);
		(_classPrivateFieldGet5 = require_classPrivateFieldSet2._classPrivateFieldGet2(_currentMutation, this)) === null || _classPrivateFieldGet5 === void 0 || _classPrivateFieldGet5.removeObserver(this);
		require_classPrivateFieldSet2._classPrivateFieldSet2(_currentMutation, this, require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this).getMutationCache().build(require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this), this.options));
		require_classPrivateFieldSet2._classPrivateFieldGet2(_currentMutation, this).addObserver(this);
		return require_classPrivateFieldSet2._classPrivateFieldGet2(_currentMutation, this).execute(variables);
	}
};
function _updateResult() {
	var _classPrivateFieldGet6;
	const state = ((_classPrivateFieldGet6 = require_classPrivateFieldSet2._classPrivateFieldGet2(_currentMutation, this)) === null || _classPrivateFieldGet6 === void 0 ? void 0 : _classPrivateFieldGet6.state) ?? require_mutation.getDefaultState();
	require_classPrivateFieldSet2._classPrivateFieldSet2(_currentResult, this, {
		...state,
		isPending: state.status === "pending",
		isSuccess: state.status === "success",
		isError: state.status === "error",
		isIdle: state.status === "idle",
		mutate: this.mutate,
		reset: this.reset
	});
}
function _notify(action) {
	require_notifyManager.notifyManager.batch(() => {
		if (require_classPrivateFieldSet2._classPrivateFieldGet2(_mutateOptions, this) && this.hasListeners()) {
			const variables = require_classPrivateFieldSet2._classPrivateFieldGet2(_currentResult, this).variables;
			const onMutateResult = require_classPrivateFieldSet2._classPrivateFieldGet2(_currentResult, this).context;
			const context = {
				client: require_classPrivateFieldSet2._classPrivateFieldGet2(_client, this),
				meta: this.options.meta,
				mutationKey: this.options.mutationKey
			};
			if ((action === null || action === void 0 ? void 0 : action.type) === "success") {
				try {
					var _classPrivateFieldGet7, _classPrivateFieldGet8;
					(_classPrivateFieldGet7 = (_classPrivateFieldGet8 = require_classPrivateFieldSet2._classPrivateFieldGet2(_mutateOptions, this)).onSuccess) === null || _classPrivateFieldGet7 === void 0 || _classPrivateFieldGet7.call(_classPrivateFieldGet8, action.data, variables, onMutateResult, context);
				} catch (e) {
					Promise.reject(e);
				}
				try {
					var _classPrivateFieldGet9, _classPrivateFieldGet10;
					(_classPrivateFieldGet9 = (_classPrivateFieldGet10 = require_classPrivateFieldSet2._classPrivateFieldGet2(_mutateOptions, this)).onSettled) === null || _classPrivateFieldGet9 === void 0 || _classPrivateFieldGet9.call(_classPrivateFieldGet10, action.data, null, variables, onMutateResult, context);
				} catch (e) {
					Promise.reject(e);
				}
			} else if ((action === null || action === void 0 ? void 0 : action.type) === "error") {
				try {
					var _classPrivateFieldGet11, _classPrivateFieldGet12;
					(_classPrivateFieldGet11 = (_classPrivateFieldGet12 = require_classPrivateFieldSet2._classPrivateFieldGet2(_mutateOptions, this)).onError) === null || _classPrivateFieldGet11 === void 0 || _classPrivateFieldGet11.call(_classPrivateFieldGet12, action.error, variables, onMutateResult, context);
				} catch (e) {
					Promise.reject(e);
				}
				try {
					var _classPrivateFieldGet13, _classPrivateFieldGet14;
					(_classPrivateFieldGet13 = (_classPrivateFieldGet14 = require_classPrivateFieldSet2._classPrivateFieldGet2(_mutateOptions, this)).onSettled) === null || _classPrivateFieldGet13 === void 0 || _classPrivateFieldGet13.call(_classPrivateFieldGet14, void 0, action.error, variables, onMutateResult, context);
				} catch (e) {
					Promise.reject(e);
				}
			}
		}
		this.listeners.forEach((listener) => {
			listener(require_classPrivateFieldSet2._classPrivateFieldGet2(_currentResult, this));
		});
	});
}
//#endregion
exports.MutationObserver = MutationObserver;

//# sourceMappingURL=mutationObserver.cjs.map