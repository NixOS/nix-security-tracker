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

// src/toggle.connect.ts
var toggle_connect_exports = {};
__export(toggle_connect_exports, {
  connect: () => connect
});
module.exports = __toCommonJS(toggle_connect_exports);
var import_dom_query = require("@zag-js/dom-query");
var import_toggle = require("./toggle.anatomy.js");
function connect(service, normalize) {
  const { context, prop, send } = service;
  const pressed = context.get("pressed");
  return {
    pressed,
    disabled: !!prop("disabled"),
    setPressed(value) {
      send({ type: "PRESS.SET", value });
    },
    getRootProps() {
      return normalize.element({
        type: "button",
        ...import_toggle.parts.root.attrs,
        disabled: prop("disabled"),
        "aria-pressed": pressed,
        "data-state": pressed ? "on" : "off",
        "data-pressed": (0, import_dom_query.dataAttr)(pressed),
        "data-disabled": (0, import_dom_query.dataAttr)(prop("disabled")),
        onClick(event) {
          if (event.defaultPrevented) return;
          if (prop("disabled")) return;
          send({ type: "PRESS.TOGGLE" });
        }
      });
    },
    getIndicatorProps() {
      return normalize.element({
        ...import_toggle.parts.indicator.attrs,
        "data-disabled": (0, import_dom_query.dataAttr)(prop("disabled")),
        "data-pressed": (0, import_dom_query.dataAttr)(pressed),
        "data-state": pressed ? "on" : "off"
      });
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  connect
});
