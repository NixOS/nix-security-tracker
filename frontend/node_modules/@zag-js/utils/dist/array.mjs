import "./chunk-MXGZDBDQ.mjs";

// src/array.ts
function toArray(v) {
  if (v == null) return [];
  return Array.isArray(v) ? v : [v];
}
var fromLength = (length) => Array.from(Array(length).keys());
var first = (v) => v[0];
var last = (v) => v[v.length - 1];
var isEmpty = (v) => v.length === 0;
var has = (v, t) => v.indexOf(t) !== -1;
var add = (v, ...items) => v.concat(items);
var remove = (v, ...items) => v.filter((t) => !items.includes(t));
var removeAt = (v, i) => v.filter((_, idx) => idx !== i);
var insertAt = (v, i, ...items) => [...v.slice(0, i), ...items, ...v.slice(i)];
var uniq = (v) => Array.from(new Set(v));
var diff = (a, b) => {
  const set = new Set(b);
  return a.filter((t) => !set.has(t));
};
var addOrRemove = (v, item) => has(v, item) ? remove(v, item) : add(v, item);
function clear(v) {
  while (v.length > 0) v.pop();
  return v;
}
function nextIndex(v, idx, opts = {}) {
  const { step = 1, loop = true } = opts;
  const next2 = idx + step;
  const len = v.length;
  const last2 = len - 1;
  if (idx === -1) return step > 0 ? 0 : last2;
  if (next2 < 0) return loop ? last2 : 0;
  if (next2 >= len) return loop ? 0 : idx > len ? len : idx;
  return next2;
}
function next(v, idx, opts = {}) {
  return v[nextIndex(v, idx, opts)];
}
function prevIndex(v, idx, opts = {}) {
  const { step = 1, loop = true } = opts;
  return nextIndex(v, idx, { step: -step, loop });
}
function prev(v, index, opts = {}) {
  return v[prevIndex(v, index, opts)];
}
function chunk(v, size) {
  return v.reduce((rows, value, index) => {
    if (index % size === 0) rows.push([value]);
    else last(rows)?.push(value);
    return rows;
  }, []);
}
function flatArray(arr) {
  return arr.reduce((flat, item) => {
    if (Array.isArray(item)) {
      return flat.concat(flatArray(item));
    }
    return flat.concat(item);
  }, []);
}
function partition(arr, fn) {
  return arr.reduce(
    ([pass, fail], value) => {
      if (fn(value)) pass.push(value);
      else fail.push(value);
      return [pass, fail];
    },
    [[], []]
  );
}
export {
  add,
  addOrRemove,
  chunk,
  clear,
  diff,
  first,
  flatArray,
  fromLength,
  has,
  insertAt,
  isEmpty,
  last,
  next,
  nextIndex,
  partition,
  prev,
  prevIndex,
  remove,
  removeAt,
  toArray,
  uniq
};
