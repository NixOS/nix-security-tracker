"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/grid-collection.ts
var grid_collection_exports = {};
__export(grid_collection_exports, {
  GridCollection: () => GridCollection,
  isGridCollection: () => isGridCollection
});
module.exports = __toCommonJS(grid_collection_exports);
var import_utils = require("@zag-js/utils");
var import_list_collection = require("./list-collection.js");
var GridCollection = class extends import_list_collection.ListCollection {
  constructor(options) {
    const { columnCount } = options;
    super(options);
    __publicField(this, "columnCount");
    __publicField(this, "rows", null);
    /**
     * Returns the row data in the grid
     */
    __publicField(this, "getRows", () => {
      if (!this.rows) {
        this.rows = (0, import_utils.chunk)([...this.items], this.columnCount);
      }
      return this.rows;
    });
    /**
     * Returns the number of rows in the grid
     */
    __publicField(this, "getRowCount", () => {
      return Math.ceil(this.items.length / this.columnCount);
    });
    /**
     * Returns the index of the specified row and column in the grid
     */
    __publicField(this, "getCellIndex", (row, column) => {
      return row * this.columnCount + column;
    });
    /**
     * Returns the item at the specified row and column in the grid
     */
    __publicField(this, "getCell", (row, column) => {
      return this.at(this.getCellIndex(row, column));
    });
    /**
     * Returns the row and column index for a given value
     */
    __publicField(this, "getValueCell", (value) => {
      const index = this.indexOf(value);
      if (index === -1) return null;
      const row = Math.floor(index / this.columnCount);
      const column = index % this.columnCount;
      return { row, column };
    });
    /**
     * Returns the value of the last enabled column in a row
     */
    __publicField(this, "getLastEnabledColumnIndex", (row) => {
      for (let col = this.columnCount - 1; col >= 0; col--) {
        const cell = this.getCell(row, col);
        if (cell && !this.getItemDisabled(cell)) {
          return col;
        }
      }
      return null;
    });
    /**
     * Returns the index of the first enabled column in a row
     */
    __publicField(this, "getFirstEnabledColumnIndex", (row) => {
      for (let col = 0; col < this.columnCount; col++) {
        const cell = this.getCell(row, col);
        if (cell && !this.getItemDisabled(cell)) {
          return col;
        }
      }
      return null;
    });
    /**
     * Returns the value of the previous row in the grid, based on the current value
     */
    __publicField(this, "getPreviousRowValue", (value, loop = false) => {
      const currentCell = this.getValueCell(value);
      if (currentCell === null) return null;
      const rows = this.getRows();
      const rowCount = rows.length;
      let prevRowIndex = currentCell.row;
      let prevColumnIndex = currentCell.column;
      for (let i = 1; i <= rowCount; i++) {
        prevRowIndex = (0, import_utils.prevIndex)(rows, prevRowIndex, { loop });
        const prevRow = rows[prevRowIndex];
        if (!prevRow) continue;
        const prevCell = prevRow[prevColumnIndex];
        if (!prevCell) {
          const lastColumnIndex = this.getLastEnabledColumnIndex(prevRowIndex);
          if (lastColumnIndex != null) {
            prevColumnIndex = lastColumnIndex;
          }
        }
        const cell = this.getCell(prevRowIndex, prevColumnIndex);
        if (!this.getItemDisabled(cell)) {
          return this.getItemValue(cell);
        }
      }
      return this.firstValue;
    });
    /**
     * Returns the value of the next row in the grid, based on the current value
     */
    __publicField(this, "getNextRowValue", (value, loop = false) => {
      const currentCell = this.getValueCell(value);
      if (currentCell === null) return null;
      const rows = this.getRows();
      const rowCount = rows.length;
      let nextRowIndex = currentCell.row;
      let nextColumnIndex = currentCell.column;
      for (let i = 1; i <= rowCount; i++) {
        nextRowIndex = (0, import_utils.nextIndex)(rows, nextRowIndex, { loop });
        const nextRow = rows[nextRowIndex];
        if (!nextRow) continue;
        const nextCell = nextRow[nextColumnIndex];
        if (!nextCell) {
          const lastColumnIndex = this.getLastEnabledColumnIndex(nextRowIndex);
          if (lastColumnIndex != null) {
            nextColumnIndex = lastColumnIndex;
          }
        }
        const cell = this.getCell(nextRowIndex, nextColumnIndex);
        if (!this.getItemDisabled(cell)) {
          return this.getItemValue(cell);
        }
      }
      return this.lastValue;
    });
    this.columnCount = columnCount;
  }
};
function isGridCollection(v) {
  return (0, import_utils.hasProp)(v, "columnCount") && (0, import_utils.hasProp)(v, "getRows");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GridCollection,
  isGridCollection
});
