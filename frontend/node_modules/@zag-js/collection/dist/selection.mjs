import {
  __publicField
} from "./chunk-QZ7TP4HQ.mjs";

// src/selection.ts
import { isEqual } from "@zag-js/utils";
var Selection = class _Selection extends Set {
  constructor(values = []) {
    super(values);
    __publicField(this, "selectionMode", "single");
    __publicField(this, "deselectable", true);
    __publicField(this, "copy", () => {
      const clone = new _Selection([...this]);
      return this.sync(clone);
    });
    __publicField(this, "sync", (other) => {
      other.selectionMode = this.selectionMode;
      other.deselectable = this.deselectable;
      return other;
    });
    __publicField(this, "isEmpty", () => {
      return this.size === 0;
    });
    __publicField(this, "isSelected", (value) => {
      if (this.selectionMode === "none" || value == null) {
        return false;
      }
      return this.has(value);
    });
    __publicField(this, "canSelect", (collection, value) => {
      return this.selectionMode !== "none" || !collection.getItemDisabled(collection.find(value));
    });
    __publicField(this, "firstSelectedValue", (collection) => {
      let firstValue = null;
      for (let value of this) {
        if (!firstValue || collection.compareValue(value, firstValue) < 0) {
          firstValue = value;
        }
      }
      return firstValue;
    });
    __publicField(this, "lastSelectedValue", (collection) => {
      let lastValue = null;
      for (let value of this) {
        if (!lastValue || collection.compareValue(value, lastValue) > 0) {
          lastValue = value;
        }
      }
      return lastValue;
    });
    __publicField(this, "extendSelection", (collection, anchorValue, targetValue) => {
      if (this.selectionMode === "none") {
        return this;
      }
      if (this.selectionMode === "single") {
        return this.replaceSelection(collection, targetValue);
      }
      const selection = this.copy();
      const lastSelected = Array.from(this).pop();
      for (let key of collection.getValueRange(anchorValue, lastSelected ?? targetValue)) {
        selection.delete(key);
      }
      for (let key of collection.getValueRange(targetValue, anchorValue)) {
        if (this.canSelect(collection, key)) {
          selection.add(key);
        }
      }
      return selection;
    });
    __publicField(this, "toggleSelection", (collection, value) => {
      if (this.selectionMode === "none") {
        return this;
      }
      if (this.selectionMode === "single" && !this.isSelected(value)) {
        return this.replaceSelection(collection, value);
      }
      const selection = this.copy();
      if (selection.has(value)) {
        selection.delete(value);
      } else if (selection.canSelect(collection, value)) {
        selection.add(value);
      }
      return selection;
    });
    __publicField(this, "replaceSelection", (collection, value) => {
      if (this.selectionMode === "none") {
        return this;
      }
      if (value == null) {
        return this;
      }
      if (!this.canSelect(collection, value)) {
        return this;
      }
      const selection = new _Selection([value]);
      return this.sync(selection);
    });
    __publicField(this, "setSelection", (values) => {
      if (this.selectionMode === "none") {
        return this;
      }
      let selection = new _Selection();
      for (let value of values) {
        if (value != null) {
          selection.add(value);
          if (this.selectionMode === "single") {
            break;
          }
        }
      }
      return this.sync(selection);
    });
    __publicField(this, "clearSelection", () => {
      const selection = this.copy();
      if (selection.deselectable && selection.size > 0) {
        selection.clear();
      }
      return selection;
    });
    __publicField(this, "select", (collection, value, forceToggle) => {
      if (this.selectionMode === "none") {
        return this;
      }
      if (this.selectionMode === "single") {
        if (this.isSelected(value) && this.deselectable) {
          return this.toggleSelection(collection, value);
        } else {
          return this.replaceSelection(collection, value);
        }
      } else if (this.selectionMode === "multiple" || forceToggle) {
        return this.toggleSelection(collection, value);
      } else {
        return this.replaceSelection(collection, value);
      }
    });
    __publicField(this, "deselect", (value) => {
      const selection = this.copy();
      selection.delete(value);
      return selection;
    });
    __publicField(this, "isEqual", (other) => {
      return isEqual(Array.from(this), Array.from(other));
    });
  }
};
export {
  Selection
};
