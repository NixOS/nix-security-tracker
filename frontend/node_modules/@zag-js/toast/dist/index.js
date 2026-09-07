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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  anatomy: () => import_toast.anatomy,
  connect: () => import_toast2.connect,
  createStore: () => import_toast4.createToastStore,
  group: () => group,
  machine: () => import_toast3.machine
});
module.exports = __toCommonJS(index_exports);
var import_toast_group = require("./toast-group.connect.js");
var import_toast_group2 = require("./toast-group.machine.js");
var import_toast = require("./toast.anatomy.js");
var import_toast2 = require("./toast.connect.js");
var import_toast3 = require("./toast.machine.js");
var import_toast4 = require("./toast.store.js");
var group = {
  connect: import_toast_group.groupConnect,
  machine: import_toast_group2.groupMachine
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  anatomy,
  connect,
  createStore,
  group,
  machine
});
