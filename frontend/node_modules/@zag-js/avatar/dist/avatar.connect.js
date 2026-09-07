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

// src/avatar.connect.ts
var avatar_connect_exports = {};
__export(avatar_connect_exports, {
  connect: () => connect
});
module.exports = __toCommonJS(avatar_connect_exports);
var import_avatar = require("./avatar.anatomy.js");
var dom = __toESM(require("./avatar.dom.js"));
function connect(service, normalize) {
  const { state, send, prop, scope } = service;
  const loaded = state.matches("loaded");
  return {
    loaded,
    setSrc(src) {
      const img = dom.getImageEl(scope);
      img?.setAttribute("src", src);
    },
    setLoaded() {
      send({ type: "img.loaded", src: "api" });
    },
    setError() {
      send({ type: "img.error", src: "api" });
    },
    getRootProps() {
      return normalize.element({
        ...import_avatar.parts.root.attrs,
        dir: prop("dir"),
        id: dom.getRootId(scope)
      });
    },
    getImageProps() {
      return normalize.img({
        ...import_avatar.parts.image.attrs,
        hidden: !loaded,
        dir: prop("dir"),
        id: dom.getImageId(scope),
        "data-state": loaded ? "visible" : "hidden",
        onLoad() {
          send({ type: "img.loaded", src: "element" });
        },
        onError() {
          send({ type: "img.error", src: "element" });
        }
      });
    },
    getFallbackProps() {
      return normalize.element({
        ...import_avatar.parts.fallback.attrs,
        dir: prop("dir"),
        id: dom.getFallbackId(scope),
        hidden: loaded,
        "data-state": loaded ? "hidden" : "visible"
      });
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  connect
});
