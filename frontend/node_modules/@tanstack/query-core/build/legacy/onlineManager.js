import { i as _classPrivateFieldInitSpec, n as _classPrivateFieldGet2, t as _classPrivateFieldSet2 } from "./classPrivateFieldSet2-CV7wyte-.js";
import { Subscribable } from "./subscribable.js";
//#region src/onlineManager.ts
var _online = /* @__PURE__ */ new WeakMap();
var _cleanup = /* @__PURE__ */ new WeakMap();
var _setup = /* @__PURE__ */ new WeakMap();
var OnlineManager = class extends Subscribable {
	constructor() {
		super();
		_classPrivateFieldInitSpec(this, _online, true);
		_classPrivateFieldInitSpec(this, _cleanup, void 0);
		_classPrivateFieldInitSpec(this, _setup, void 0);
		_classPrivateFieldSet2(_setup, this, (onOnline) => {
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
		if (!_classPrivateFieldGet2(_cleanup, this)) this.setEventListener(_classPrivateFieldGet2(_setup, this));
	}
	onUnsubscribe() {
		if (!this.hasListeners()) {
			var _classPrivateFieldGet2$1;
			(_classPrivateFieldGet2$1 = _classPrivateFieldGet2(_cleanup, this)) === null || _classPrivateFieldGet2$1 === void 0 || _classPrivateFieldGet2$1.call(this);
			_classPrivateFieldSet2(_cleanup, this, void 0);
		}
	}
	setEventListener(setup) {
		var _classPrivateFieldGet3;
		_classPrivateFieldSet2(_setup, this, setup);
		(_classPrivateFieldGet3 = _classPrivateFieldGet2(_cleanup, this)) === null || _classPrivateFieldGet3 === void 0 || _classPrivateFieldGet3.call(this);
		_classPrivateFieldSet2(_cleanup, this, setup(this.setOnline.bind(this)));
	}
	setOnline(online) {
		if (_classPrivateFieldGet2(_online, this) !== online) {
			_classPrivateFieldSet2(_online, this, online);
			this.listeners.forEach((listener) => {
				listener(online);
			});
		}
	}
	isOnline() {
		return _classPrivateFieldGet2(_online, this);
	}
};
const onlineManager = new OnlineManager();
//#endregion
export { OnlineManager, onlineManager };

//# sourceMappingURL=onlineManager.js.map