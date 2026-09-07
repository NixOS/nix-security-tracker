"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/press.ts
var press_exports = {};
__export(press_exports, {
  trackPress: () => trackPress
});
module.exports = __toCommonJS(press_exports);
var import_event = require("./event.js");
var import_node = require("./node.js");
var import_shared = require("./shared.js");
function trackPress(options) {
  const {
    pointerNode,
    keyboardNode = pointerNode,
    onPress,
    onPressStart,
    onPressEnd,
    isValidKey = (e) => e.key === "Enter"
  } = options;
  if (!pointerNode) return import_shared.noop;
  const win = (0, import_node.getWindow)(pointerNode);
  let removeStartListeners = import_shared.noop;
  let removeEndListeners = import_shared.noop;
  let removeAccessibleListeners = import_shared.noop;
  const getInfo = (event) => ({
    point: (0, import_event.getEventPoint)(event),
    event
  });
  function startPress(event) {
    onPressStart?.(getInfo(event));
  }
  function cancelPress(event) {
    onPressEnd?.(getInfo(event));
  }
  const startPointerPress = (startEvent) => {
    removeEndListeners();
    const endPointerPress = (endEvent) => {
      const target = (0, import_event.getEventTarget)(endEvent);
      if ((0, import_node.contains)(pointerNode, target)) {
        onPress?.(getInfo(endEvent));
      } else {
        onPressEnd?.(getInfo(endEvent));
      }
    };
    const removePointerUpListener = (0, import_event.addDomEvent)(win, "pointerup", endPointerPress, { passive: !onPress, once: true });
    const removePointerCancelListener = (0, import_event.addDomEvent)(win, "pointercancel", cancelPress, {
      passive: !onPressEnd,
      once: true
    });
    removeEndListeners = (0, import_shared.pipe)(removePointerUpListener, removePointerCancelListener);
    if ((0, import_node.isActiveElement)(keyboardNode) && startEvent.pointerType === "mouse") {
      startEvent.preventDefault();
    }
    startPress(startEvent);
  };
  const removePointerListener = (0, import_event.addDomEvent)(pointerNode, "pointerdown", startPointerPress, { passive: !onPressStart });
  const removeFocusListener = (0, import_event.addDomEvent)(keyboardNode, "focus", startAccessiblePress);
  removeStartListeners = (0, import_shared.pipe)(removePointerListener, removeFocusListener);
  function startAccessiblePress() {
    const handleKeydown = (keydownEvent) => {
      if (!isValidKey(keydownEvent)) return;
      const handleKeyup = (keyupEvent) => {
        if (!isValidKey(keyupEvent)) return;
        const evt2 = new win.PointerEvent("pointerup");
        const info = getInfo(evt2);
        onPress?.(info);
        onPressEnd?.(info);
      };
      removeEndListeners();
      removeEndListeners = (0, import_event.addDomEvent)(keyboardNode, "keyup", handleKeyup);
      const evt = new win.PointerEvent("pointerdown");
      startPress(evt);
    };
    const handleBlur = () => {
      const evt = new win.PointerEvent("pointercancel");
      cancelPress(evt);
    };
    const removeKeydownListener = (0, import_event.addDomEvent)(keyboardNode, "keydown", handleKeydown);
    const removeBlurListener = (0, import_event.addDomEvent)(keyboardNode, "blur", handleBlur);
    removeAccessibleListeners = (0, import_shared.pipe)(removeKeydownListener, removeBlurListener);
  }
  return () => {
    removeStartListeners();
    removeEndListeners();
    removeAccessibleListeners();
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  trackPress
});
