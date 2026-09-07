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

// src/toggle-group.connect.ts
var toggle_group_connect_exports = {};
__export(toggle_group_connect_exports, {
  connect: () => connect
});
module.exports = __toCommonJS(toggle_group_connect_exports);
var import_dom_query = require("@zag-js/dom-query");
var import_toggle_group = require("./toggle-group.anatomy.js");
var dom = __toESM(require("./toggle-group.dom.js"));
function connect(service, normalize) {
  const { context, send, prop, scope } = service;
  const value = context.get("value");
  const disabled = prop("disabled");
  const isSingle = !prop("multiple");
  const rovingFocus = prop("rovingFocus");
  const isHorizontal = prop("orientation") === "horizontal";
  function getItemState(props) {
    const id = dom.getItemId(scope, props.value);
    return {
      id,
      disabled: Boolean(props.disabled || disabled),
      pressed: !!value.includes(props.value),
      focused: context.get("focusedId") === id
    };
  }
  return {
    value,
    setValue(value2) {
      send({ type: "VALUE.SET", value: value2 });
    },
    getRootProps() {
      return normalize.element({
        ...import_toggle_group.parts.root.attrs,
        id: dom.getRootId(scope),
        dir: prop("dir"),
        role: isSingle ? "radiogroup" : "group",
        tabIndex: context.get("isTabbingBackward") ? -1 : 0,
        "data-disabled": (0, import_dom_query.dataAttr)(disabled),
        "data-orientation": prop("orientation"),
        "data-focus": (0, import_dom_query.dataAttr)(context.get("focusedId") != null),
        style: { outline: "none" },
        onMouseDown() {
          if (disabled) return;
          send({ type: "ROOT.MOUSE_DOWN" });
        },
        onFocus(event) {
          if (disabled) return;
          if (event.currentTarget !== (0, import_dom_query.getEventTarget)(event)) return;
          if (context.get("isClickFocus")) return;
          if (context.get("isTabbingBackward")) return;
          send({ type: "ROOT.FOCUS" });
        },
        onBlur(event) {
          const target = event.relatedTarget;
          if ((0, import_dom_query.contains)(event.currentTarget, target)) return;
          if (disabled) return;
          send({ type: "ROOT.BLUR" });
        }
      });
    },
    getItemState,
    getItemProps(props) {
      const itemState = getItemState(props);
      const rovingTabIndex = itemState.focused ? 0 : -1;
      return normalize.button({
        ...import_toggle_group.parts.item.attrs,
        id: itemState.id,
        type: "button",
        "data-ownedby": dom.getRootId(scope),
        "data-focus": (0, import_dom_query.dataAttr)(itemState.focused),
        disabled: itemState.disabled,
        tabIndex: rovingFocus ? rovingTabIndex : void 0,
        // radio
        role: isSingle ? "radio" : void 0,
        "aria-checked": isSingle ? itemState.pressed : void 0,
        "aria-pressed": isSingle ? void 0 : itemState.pressed,
        //
        "data-disabled": (0, import_dom_query.dataAttr)(itemState.disabled),
        "data-orientation": prop("orientation"),
        dir: prop("dir"),
        "data-state": itemState.pressed ? "on" : "off",
        onFocus() {
          if (itemState.disabled) return;
          send({ type: "TOGGLE.FOCUS", id: itemState.id });
        },
        onClick(event) {
          if (itemState.disabled) return;
          send({ type: "TOGGLE.CLICK", id: itemState.id, value: props.value });
          if ((0, import_dom_query.isSafari)()) {
            event.currentTarget.focus({ preventScroll: true });
          }
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return;
          if (!(0, import_dom_query.contains)(event.currentTarget, (0, import_dom_query.getEventTarget)(event))) return;
          if (itemState.disabled) return;
          const keyMap = {
            Tab(event2) {
              const isShiftTab = event2.shiftKey;
              send({ type: "TOGGLE.SHIFT_TAB", isShiftTab });
            },
            ArrowLeft() {
              if (!rovingFocus || !isHorizontal) return;
              send({ type: "TOGGLE.FOCUS_PREV" });
            },
            ArrowRight() {
              if (!rovingFocus || !isHorizontal) return;
              send({ type: "TOGGLE.FOCUS_NEXT" });
            },
            ArrowUp() {
              if (!rovingFocus || isHorizontal) return;
              send({ type: "TOGGLE.FOCUS_PREV" });
            },
            ArrowDown() {
              if (!rovingFocus || isHorizontal) return;
              send({ type: "TOGGLE.FOCUS_NEXT" });
            },
            Home() {
              if (!rovingFocus) return;
              send({ type: "TOGGLE.FOCUS_FIRST" });
            },
            End() {
              if (!rovingFocus) return;
              send({ type: "TOGGLE.FOCUS_LAST" });
            }
          };
          const exec = keyMap[(0, import_dom_query.getEventKey)(event)];
          if (exec) {
            exec(event);
            if (event.key !== "Tab") event.preventDefault();
          }
        }
      });
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  connect
});
