Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const require_classPrivateFieldSet2 = require("./classPrivateFieldSet2-Bo0ZyOIv.cjs");
const require_subscribable = require("./subscribable.cjs");
//#region src/onlineManager.ts
var _online = /* @__PURE__ */ new WeakMap();
var _cleanup = /* @__PURE__ */ new WeakMap();
var _setup = /* @__PURE__ */ new WeakMap();
var OnlineManager = class extends require_subscribable.Subscribable {
	constructor() {
		super();
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _online, true);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _cleanup, void 0);
		require_classPrivateFieldSet2._classPrivateFieldInitSpec(this, _setup, void 0);
		require_classPrivateFieldSet2._classPrivateFieldSet2(_setup, this, (onOnline) => {
			if (typeof window !== "undefined" && window.addEventListener) {
				const onlineListener = () => onOnline(true);
				const offlineListener = () => onOnline(false);
				window.addEventListener("online", onlineListener, false);
				window.addEventListener("offline", offlineListener, false);
				return () => {
					window.removeEventListener("online", onlineListener);
					window.removeEventListener("offline", offlineListener);
				};
			}
		});
	}
	onSubscribe() {
		if (!require_classPrivateFieldSet2._classPrivateFieldGet2(_cleanup, this)) this.setEventListener(require_classPrivateFieldSet2._classPrivateFieldGet2(_setup, this));
	}
	onUnsubscribe() {
		if (!this.hasListeners()) {
			var _classPrivateFieldGet2$1;
			(_classPrivateFieldGet2$1 = require_classPrivateFieldSet2._classPrivateFieldGet2(_cleanup, this)) === null || _classPrivateFieldGet2$1 === void 0 || _classPrivateFieldGet2$1.call(this);
			require_classPrivateFieldSet2._classPrivateFieldSet2(_cleanup, this, void 0);
		}
	}
	setEventListener(setup) {
		var _classPrivateFieldGet3;
		require_classPrivateFieldSet2._classPrivateFieldSet2(_setup, this, setup);
		(_classPrivateFieldGet3 = require_classPrivateFieldSet2._classPrivateFieldGet2(_cleanup, this)) === null || _classPrivateFieldGet3 === void 0 || _classPrivateFieldGet3.call(this);
		require_classPrivateFieldSet2._classPrivateFieldSet2(_cleanup, this, setup(this.setOnline.bind(this)));
	}
	setOnline(online) {
		if (require_classPrivateFieldSet2._classPrivateFieldGet2(_online, this) !== online) {
			require_classPrivateFieldSet2._classPrivateFieldSet2(_online, this, online);
			this.listeners.forEach((listener) => {
				listener(online);
			});
		}
	}
	isOnline() {
		return require_classPrivateFieldSet2._classPrivateFieldGet2(_online, this);
	}
};
const onlineManager = new OnlineManager();
//#endregion
exports.OnlineManager = OnlineManager;
exports.onlineManager = onlineManager;

//# sourceMappingURL=onlineManager.cjs.map