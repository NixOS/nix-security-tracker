import "./chunk-QZ7TP4HQ.mjs";

// src/caret.ts
function isCaretAtStart(input) {
  if (!input) return false;
  try {
    return input.selectionStart === 0 && input.selectionEnd === 0;
  } catch {
    return input.value === "";
  }
}
function setCaretToEnd(input) {
  if (!input) return;
  try {
    if (input.ownerDocument.activeElement !== input) return;
    const len = input.value.length;
    input.setSelectionRange(len, len);
  } catch {
  }
}
export {
  isCaretAtStart,
  setCaretToEnd
};
