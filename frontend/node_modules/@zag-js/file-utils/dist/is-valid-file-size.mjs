// src/is-valid-file-size.ts
var isDefined = (v) => v !== void 0 && v !== null;
function isValidFileSize(file, minSize, maxSize) {
  if (isDefined(file.size)) {
    if (isDefined(minSize) && isDefined(maxSize)) {
      if (file.size > maxSize) return [false, "FILE_TOO_LARGE"];
      if (file.size < minSize) return [false, "FILE_TOO_SMALL"];
    } else if (isDefined(minSize) && file.size < minSize) {
      return [false, "FILE_TOO_SMALL"];
    } else if (isDefined(maxSize) && file.size > maxSize) {
      return [false, "FILE_TOO_LARGE"];
    }
  }
  return [true, null];
}
export {
  isValidFileSize
};
