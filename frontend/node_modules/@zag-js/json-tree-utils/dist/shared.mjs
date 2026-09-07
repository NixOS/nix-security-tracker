// src/shared.ts
var regexReturnCharacters = /\r/g;
function hash(str) {
  const v = str.replace(regexReturnCharacters, "");
  let hash2 = 5381;
  let i = v.length;
  while (i--) hash2 = (hash2 << 5) - hash2 ^ v.charCodeAt(i);
  return (hash2 >>> 0).toString(36);
}
function hasProp(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}
function getProp(value, key) {
  return value[key];
}
function defu(a, b) {
  const res = { ...a };
  for (const key in b) {
    if (b[key] !== void 0) res[key] = b[key];
  }
  return res;
}
var isObj = (v) => v != null && typeof v === "object" && !Array.isArray(v);
var typeOf = (value) => Object.prototype.toString.call(value);
export {
  defu,
  getProp,
  hasProp,
  hash,
  isObj,
  typeOf
};
