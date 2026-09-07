// src/is-valid-file-type.ts
import { getFileMimeType } from "./get-file-mime-type.mjs";
function isFileAccepted(file, accept) {
  if (file && accept) {
    const types = Array.isArray(accept) ? accept : typeof accept === "string" ? accept.split(",") : [];
    if (types.length === 0) return true;
    const fileName = file.name || "";
    const mimeType = (file.type || getFileMimeType(fileName) || "").toLowerCase();
    const baseMimeType = mimeType.replace(/\/.*$/, "");
    return types.some((type) => {
      const validType = type.trim().toLowerCase();
      if (validType.charAt(0) === ".") {
        return fileName.toLowerCase().endsWith(validType);
      }
      if (validType.endsWith("/*")) {
        return baseMimeType === validType.replace(/\/.*$/, "");
      }
      return mimeType === validType;
    });
  }
  return true;
}
function isValidFileType(file, accept) {
  const isAcceptable = file.type === "application/x-moz-file" || isFileAccepted(file, accept);
  return [isAcceptable, isAcceptable ? null : "FILE_INVALID_TYPE"];
}
export {
  isValidFileType
};
