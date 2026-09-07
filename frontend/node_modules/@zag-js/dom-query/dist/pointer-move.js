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

// src/pointer-move.ts
var pointer_move_exports = {};
__export(pointer_move_exports, {
  trackPointerMove: () => trackPointerMove
});
module.exports = __toCommonJS(pointer_move_exports);
var import_event = require("./event.js");
var import_text_selection = require("./text-selection.js");
function trackPointerMove(doc, handlers) {
  const { onPointerMove, onPointerUp } = handlers;
  const handleMove = (event) => {
    const point = (0, import_event.getEventPoint)(event);
    const distance = Math.sqrt(point.x ** 2 + point.y ** 2);
    const moveBuffer = event.pointerType === "touch" ? 10 : 5;
    if (distance < moveBuffer) return;
    if (event.pointerType === "mouse" && event.buttons === 0) {
      handleUp(event);
      return;
    }
    onPointerMove({ point, event });
  };
  const handleUp = (event) => {
    const point = (0, import_event.getEventPoint)(event);
    onPointerUp({ point, event });
  };
  const cleanups = [
    (0, import_event.addDomEvent)(doc, "pointermove", handleMove, false),
    (0, import_event.addDomEvent)(doc, "pointerup", handleUp, false),
    (0, import_event.addDomEvent)(doc, "pointercancel", handleUp, false),
    (0, import_event.addDomEvent)(doc, "contextmenu", handleUp, false),
    (0, import_text_selection.disableTextSelection)({ doc })
  ];
  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  trackPointerMove
});
