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

// src/angle-slider.connect.ts
var angle_slider_connect_exports = {};
__export(angle_slider_connect_exports, {
  connect: () => connect
});
module.exports = __toCommonJS(angle_slider_connect_exports);
var import_dom_query = require("@zag-js/dom-query");
var import_angle_slider = require("./angle-slider.anatomy.js");
var dom = __toESM(require("./angle-slider.dom.js"));
var import_angle_slider2 = require("./angle-slider.utils.js");
function connect(service, normalize) {
  const { state, send, context, prop, computed, scope } = service;
  const dragging = state.matches("dragging");
  const value = context.get("value");
  const valueAsDegree = computed("valueAsDegree");
  const dir = prop("dir");
  const displayAngle = (0, import_angle_slider2.getDisplayAngle)(value, dir);
  const disabled = prop("disabled");
  const invalid = prop("invalid");
  const readOnly = prop("readOnly");
  const interactive = computed("interactive");
  const ariaLabel = prop("aria-label");
  const ariaLabelledBy = prop("aria-labelledby");
  return {
    value,
    valueAsDegree,
    dragging,
    setValue(value2) {
      send({ type: "VALUE.SET", value: value2 });
    },
    getRootProps() {
      return normalize.element({
        ...import_angle_slider.parts.root.attrs,
        id: dom.getRootId(scope),
        dir: prop("dir"),
        "data-disabled": (0, import_dom_query.dataAttr)(disabled),
        "data-invalid": (0, import_dom_query.dataAttr)(invalid),
        "data-readonly": (0, import_dom_query.dataAttr)(readOnly),
        style: {
          "--value": value,
          "--angle": `${displayAngle}deg`
        }
      });
    },
    getLabelProps() {
      return normalize.label({
        ...import_angle_slider.parts.label.attrs,
        id: dom.getLabelId(scope),
        htmlFor: dom.getHiddenInputId(scope),
        dir: prop("dir"),
        "data-disabled": (0, import_dom_query.dataAttr)(disabled),
        "data-invalid": (0, import_dom_query.dataAttr)(invalid),
        "data-readonly": (0, import_dom_query.dataAttr)(readOnly),
        onClick(event) {
          if (!interactive) return;
          event.preventDefault();
          dom.getThumbEl(scope)?.focus();
        }
      });
    },
    getHiddenInputProps() {
      return normalize.element({
        type: "hidden",
        value,
        name: prop("name"),
        id: dom.getHiddenInputId(scope),
        dir: prop("dir")
      });
    },
    getControlProps() {
      return normalize.element({
        ...import_angle_slider.parts.control.attrs,
        role: "presentation",
        id: dom.getControlId(scope),
        dir: prop("dir"),
        "data-disabled": (0, import_dom_query.dataAttr)(disabled),
        "data-invalid": (0, import_dom_query.dataAttr)(invalid),
        "data-readonly": (0, import_dom_query.dataAttr)(readOnly),
        onPointerDown(event) {
          if (!interactive) return;
          if (!(0, import_dom_query.isLeftClick)(event)) return;
          const point = (0, import_dom_query.getEventPoint)(event);
          const controlEl = event.currentTarget;
          const thumbEl = dom.getThumbEl(scope);
          const composedPath = (0, import_dom_query.getNativeEvent)(event).composedPath();
          const isOverThumb = thumbEl && composedPath.includes(thumbEl);
          let angularOffset = null;
          if (isOverThumb) {
            const clickAngle = (0, import_angle_slider2.getAngle)(controlEl, point);
            angularOffset = clickAngle - value;
          }
          send({ type: "CONTROL.POINTER_DOWN", point, angularOffset });
          event.stopPropagation();
        },
        style: {
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none"
        }
      });
    },
    getThumbProps() {
      return normalize.element({
        ...import_angle_slider.parts.thumb.attrs,
        id: dom.getThumbId(scope),
        role: "slider",
        dir: prop("dir"),
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy ?? dom.getLabelId(scope),
        "aria-valuemax": 360,
        "aria-valuemin": 0,
        "aria-valuenow": value,
        tabIndex: readOnly || interactive ? 0 : void 0,
        "data-disabled": (0, import_dom_query.dataAttr)(disabled),
        "data-invalid": (0, import_dom_query.dataAttr)(invalid),
        "data-readonly": (0, import_dom_query.dataAttr)(readOnly),
        onFocus() {
          send({ type: "THUMB.FOCUS" });
        },
        onBlur() {
          send({ type: "THUMB.BLUR" });
        },
        onKeyDown(event) {
          if (!interactive) return;
          const step = (0, import_dom_query.getEventStep)(event) * prop("step");
          const keyMap = {
            ArrowLeft() {
              send({ type: "THUMB.ARROW_DEC", step });
            },
            ArrowUp() {
              send({ type: "THUMB.ARROW_DEC", step });
            },
            ArrowRight() {
              send({ type: "THUMB.ARROW_INC", step });
            },
            ArrowDown() {
              send({ type: "THUMB.ARROW_INC", step });
            },
            Home() {
              send({ type: "THUMB.HOME" });
            },
            End() {
              send({ type: "THUMB.END" });
            }
          };
          const key = (0, import_dom_query.getEventKey)(event, {
            dir: prop("dir"),
            orientation: "horizontal"
          });
          const exec = keyMap[key];
          if (exec) {
            exec(event);
            event.preventDefault();
          }
        },
        style: {
          rotate: `var(--angle)`
        }
      });
    },
    getValueTextProps() {
      return normalize.element({
        ...import_angle_slider.parts.valueText.attrs,
        id: dom.getValueTextId(scope),
        dir: prop("dir")
      });
    },
    getMarkerGroupProps() {
      return normalize.element({
        ...import_angle_slider.parts.markerGroup.attrs,
        dir: prop("dir")
      });
    },
    getMarkerProps(props) {
      let markerState;
      if (props.value < value) {
        markerState = "under-value";
      } else if (props.value > value) {
        markerState = "over-value";
      } else {
        markerState = "at-value";
      }
      const markerDisplayAngle = (0, import_angle_slider2.getDisplayAngle)(props.value, dir);
      return normalize.element({
        ...import_angle_slider.parts.marker.attrs,
        dir: prop("dir"),
        "data-value": props.value,
        "data-state": markerState,
        "data-disabled": (0, import_dom_query.dataAttr)(disabled),
        style: {
          "--marker-value": props.value,
          "--marker-display-value": markerDisplayAngle,
          rotate: `calc(var(--marker-display-value) * 1deg)`
        }
      });
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  connect
});
