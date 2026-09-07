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

// src/data-transfer.ts
var data_transfer_exports = {};
__export(data_transfer_exports, {
  getFileEntries: () => getFileEntries
});
module.exports = __toCommonJS(data_transfer_exports);
var getItemEntry = (item) => typeof item.getAsEntry === "function" ? item.getAsEntry() : typeof item.webkitGetAsEntry === "function" ? item.webkitGetAsEntry() : null;
var isDirectoryEntry = (entry) => entry.isDirectory;
var isFileEntry = (entry) => entry.isFile;
var addRelativePath = (file, path) => {
  Object.defineProperty(file, "relativePath", { value: path ? `${path}/${file.name}` : file.name });
  return file;
};
var getFileEntries = (items, traverseDirectories) => Promise.all(
  Array.from(items).filter((item) => item.kind === "file").map((item) => {
    const entry = getItemEntry(item);
    if (!entry) return null;
    if (isDirectoryEntry(entry) && traverseDirectories) {
      return getDirectoryFiles(entry.createReader(), `${entry.name}`);
    }
    if (isFileEntry(entry) && typeof item.getAsFile === "function") {
      const file = item.getAsFile();
      return Promise.resolve(file ? addRelativePath(file, "") : null);
    }
    if (isFileEntry(entry)) {
      return new Promise((resolve) => {
        entry.file((file) => {
          resolve(addRelativePath(file, ""));
        });
      });
    }
  }).filter((b) => b)
);
var getDirectoryFiles = (reader, path = "") => new Promise((resolve) => {
  const entryPromises = [];
  const readDirectoryEntries = () => {
    reader.readEntries((entries) => {
      if (entries.length === 0) {
        resolve(Promise.all(entryPromises).then((entries2) => entries2.flat()));
        return;
      }
      const promises = entries.map((entry) => {
        if (!entry) return null;
        if (isDirectoryEntry(entry)) {
          return getDirectoryFiles(entry.createReader(), `${path}${entry.name}`);
        }
        if (isFileEntry(entry)) {
          return new Promise((resolve2) => {
            entry.file((file) => {
              resolve2(addRelativePath(file, path));
            });
          });
        }
      }).filter((b) => b);
      entryPromises.push(Promise.all(promises));
      readDirectoryEntries();
    });
  };
  readDirectoryEntries();
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getFileEntries
});
