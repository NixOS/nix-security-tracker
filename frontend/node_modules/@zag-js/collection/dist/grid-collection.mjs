import {
  __publicField
} from "./chunk-QZ7TP4HQ.mjs";

// src/grid-collection.ts
import { chunk, hasProp, nextIndex, prevIndex } from "@zag-js/utils";
import { ListCollection } from "./list-collection.mjs";
var GridCollection = class extends ListCollection {
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
        this.rows = chunk([...this.items], this.columnCount);
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
        prevRowIndex = prevIndex(rows, prevRowIndex, { loop });
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
        nextRowIndex = nextIndex(rows, nextRowIndex, { loop });
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
  return hasProp(v, "columnCount") && hasProp(v, "getRows");
}
export {
  GridCollection,
  isGridCollection
};
