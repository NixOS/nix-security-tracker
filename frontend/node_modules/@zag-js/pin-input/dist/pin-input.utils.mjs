// src/pin-input.utils.ts
var REGEX = {
  numeric: /^[0-9]+$/,
  alphabetic: /^[A-Za-z]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/i
};
function isValidType(type, value) {
  if (!type) return true;
  return !!REGEX[type]?.test(value);
}
function isValidValue(value, type, pattern) {
  if (!pattern) return isValidType(type, value);
  const regex = new RegExp(pattern, "g");
  return regex.test(value);
}
export {
  isValidType,
  isValidValue
};
