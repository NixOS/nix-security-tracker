// src/utils/is-valid-hex.ts
var HEX_REGEX = /^[0-9a-fA-F]{3,8}$/;
function isValidHex(value) {
  return HEX_REGEX.test(value);
}
function prefixHex(value) {
  if (value.startsWith("#")) return value;
  if (isValidHex(value)) return `#${value}`;
  return value;
}
export {
  isValidHex,
  prefixHex
};
