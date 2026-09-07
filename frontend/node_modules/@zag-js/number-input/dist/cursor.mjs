// src/cursor.ts
function recordCursor(inputEl, scope) {
  if (!inputEl || !scope.isActiveElement(inputEl)) return;
  try {
    const { selectionStart: start, selectionEnd: end, value } = inputEl;
    if (start == null || end == null) return void 0;
    return { start, end, value };
  } catch {
    return void 0;
  }
}
function restoreCursor(inputEl, selection, scope) {
  if (!inputEl || !scope.isActiveElement(inputEl)) return;
  if (!selection) {
    const len = inputEl.value.length;
    inputEl.setSelectionRange(len, len);
    return;
  }
  try {
    const newValue = inputEl.value;
    const { start, end, value: oldValue } = selection;
    if (newValue === oldValue) {
      inputEl.setSelectionRange(start, end);
      return;
    }
    const newStart = getNextCursorPosition(oldValue, newValue, start);
    const newEnd = start === end ? newStart : getNextCursorPosition(oldValue, newValue, end);
    const clampedStart = Math.max(0, Math.min(newStart, newValue.length));
    const clampedEnd = Math.max(clampedStart, Math.min(newEnd, newValue.length));
    inputEl.setSelectionRange(clampedStart, clampedEnd);
  } catch {
    const len = inputEl.value.length;
    inputEl.setSelectionRange(len, len);
  }
}
function getNextCursorPosition(oldValue, newValue, oldPosition) {
  const beforeCursor = oldValue.slice(0, oldPosition);
  const afterCursor = oldValue.slice(oldPosition);
  let prefixLength = 0;
  const maxPrefixLength = Math.min(beforeCursor.length, newValue.length);
  for (let i = 0; i < maxPrefixLength; i++) {
    if (beforeCursor[i] === newValue[i]) {
      prefixLength = i + 1;
    } else {
      break;
    }
  }
  let suffixLength = 0;
  const maxSuffixLength = Math.min(afterCursor.length, newValue.length - prefixLength);
  for (let i = 0; i < maxSuffixLength; i++) {
    const oldIndex = afterCursor.length - 1 - i;
    const newIndex = newValue.length - 1 - i;
    if (afterCursor[oldIndex] === newValue[newIndex]) {
      suffixLength = i + 1;
    } else {
      break;
    }
  }
  if (beforeCursor.length > 0 && prefixLength >= beforeCursor.length) {
    return prefixLength;
  }
  if (suffixLength >= afterCursor.length) {
    return newValue.length - suffixLength;
  }
  if (prefixLength > 0) {
    return prefixLength;
  }
  if (suffixLength > 0) {
    return newValue.length - suffixLength;
  }
  if (oldPosition === 0 && prefixLength === 0 && suffixLength === 0) {
    return newValue.length;
  }
  if (oldValue.length > 0) {
    const ratio = oldPosition / oldValue.length;
    return Math.round(ratio * newValue.length);
  }
  return newValue.length;
}
export {
  getNextCursorPosition,
  recordCursor,
  restoreCursor
};
