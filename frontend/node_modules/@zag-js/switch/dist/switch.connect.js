"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/switch.connect.ts
var switch_connect_exports = {};
__export(switch_connect_exports, {
  connect: () => connect
});
module.exports = __toCommonJS(switch_connect_exports);
var import_dom_query = require("@zag-js/dom-query");
var import_focus_visible = require("@zag-js/focus-visible");
var import_switch = require("./switch.anatomy.js");
var dom = __toESM(require("./switch.dom.js"));
function connect(service, normalize) {
  const { context, send, prop, scope } = service;
  const disabled = !!prop("disabled");
  const readOnly = !!prop("readOnly");
  const required = !!prop("required");
  const checked = !!context.get("checked");
  const focused = !disabled && context.get("focused");
  const focusVisible = !disabled && context.get("focusVisible");
  const active = !disabled && context.get("active");
  const dataAttrs = {
    "data-active": (0, import_dom_query.dataAttr)(active),
    "data-focus": (0, import_dom_query.dataAttr)(focused),
    "data-focus-visible": (0, import_dom_query.dataAttr)(focusVisible),
    "data-readonly": (0, import_dom_query.dataAttr)(readOnly),
    "data-hover": (0, import_dom_query.dataAttr)(context.get("hovered")),
    "data-disabled": (0, import_dom_query.dataAttr)(disabled),
    "data-state": checked ? "checked" : "unchecked",
    "data-invalid": (0, import_dom_query.dataAttr)(prop("invalid")),
    "data-required": (0, import_dom_query.dataAttr)(required)
  };
  return {
    checked,
    disabled,
    focused,
    setChecked(checked2) {
      send({ type: "CHECKED.SET", checked: checked2, isTrusted: false });
    },
    toggleChecked() {
      send({ type: "CHECKED.TOGGLE", checked, isTrusted: false });
    },
    getRootProps() {
      return normalize.label({
        ...import_switch.parts.root.attrs,
        ...dataAttrs,
        dir: prop("dir"),
        id: dom.getRootId(scope),
        htmlFor: dom.getHiddenInputId(scope),
        onPointerMove() {
          if (disabled) return;
          send({ type: "CONTEXT.SET", context: { hovered: true } });
        },
        onPointerLeave() {
          if (disabled) return;
          send({ type: "CONTEXT.SET", context: { hovered: false } });
        },
        onClick(event) {
          if (disabled) return;
          const target = (0, import_dom_query.getEventTarget)(event);
          if (target === dom.getHiddenInputEl(scope)) {
            event.stopPropagation();
          }
          if ((0, import_dom_query.isSafari)()) {
            dom.getHiddenInputEl(scope)?.focus();
          }
        }
      });
    },
    getLabelProps() {
      return normalize.element({
        ...import_switch.parts.label.attrs,
        ...dataAttrs,
        dir: prop("dir"),
        id: dom.getLabelId(scope)
      });
    },
    getThumbProps() {
      return normalize.element({
        ...import_switch.parts.thumb.attrs,
        ...dataAttrs,
        dir: prop("dir"),
        id: dom.getThumbId(scope),
        "aria-hidden": true
      });
    },
    getControlProps() {
      return normalize.element({
        ...import_switch.parts.control.attrs,
        ...dataAttrs,
        dir: prop("dir"),
        id: dom.getControlId(scope),
        "aria-hidden": true
      });
    },
    getHiddenInputProps() {
      return normalize.input({
        id: dom.getHiddenInputId(scope),
        type: "checkbox",
        required: prop("required"),
        defaultChecked: checked,
        disabled,
        "aria-labelledby": dom.getLabelId(scope),
        "aria-invalid": prop("invalid"),
        name: prop("name"),
        form: prop("form"),
        value: prop("value"),
        style: import_dom_query.visuallyHiddenStyle,
        onFocus() {
          const focusVisible2 = (0, import_focus_visible.isFocusVisible)();
          send({ type: "CONTEXT.SET", context: { focused: true, focusVisible: focusVisible2 } });
        },
        onBlur() {
          send({ type: "CONTEXT.SET", context: { focused: false, focusVisible: false } });
        },
        onClick(event) {
          if (readOnly) {
            event.preventDefault();
            return;
          }
          const checked2 = event.currentTarget.checked;
          send({ type: "CHECKED.SET", checked: checked2, isTrusted: true });
        }
      });
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  connect
});
