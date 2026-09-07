import { i as _classPrivateFieldInitSpec, n as _classPrivateFieldGet2, t as _classPrivateFieldSet2 } from "./classPrivateFieldSet2-CV7wyte-.js";
import { Subscribable } from "./subscribable.js";
//#region src/focusManager.ts
var _focused = /* @__PURE__ */ new WeakMap();
var _cleanup = /* @__PURE__ */ new WeakMap();
var _setup = /* @__PURE__ */ new WeakMap();
var FocusManager = class extends Subscribable {
	constructor() {
		super();
		_classPrivateFieldInitSpec(this, _focused, void 0);
		_classPrivateFieldInitSpec(this, _cleanup, void 0);
		_classPrivateFieldInitSpec(this, _setup, void 0);
		_classPrivateFieldSet2(_setup, this, (onFocus) => {
			if (typeof window !== "undefined" && window.addEventListener) {
				const listener = () => onFocus();
				window.addEventListener("visibilitychange", listener, false);
				return () => {
					window.removeEventListener("visibilitychange", listener);
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
		_classPrivateFieldSet2(_cleanup, this, setup((focused) => {
			if (typeof focused === "boolean") this.setFocused(focused);
			else this.onFocus();
		}));
	}
	setFocused(focused) {
		if (_classPrivateFieldGet2(_focused, this) !== focused) {
			_classPrivateFieldSet2(_focused, this, focused);
			this.onFocus();
		}
	}
	onFocus() {
		const isFocused = this.isFocused();
		this.listeners.forEach((listener) => {
			listener(isFocused);
		});
	}
	isFocused() {
		var _globalThis$document;
		if (typeof _classPrivateFieldGet2(_focused, this) === "boolean") return _classPrivateFieldGet2(_focused, this);
		return ((_globalThis$document = globalThis.document) === null || _globalThis$document === void 0 ? void 0 : _globalThis$document.visibilityState) !== "hidden";
	}
};
const focusManager = new FocusManager();
//#endregion
export { FocusManager, focusManager };

//# sourceMappingURL=focusManager.js.map