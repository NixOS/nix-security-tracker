// src/get-file-mime-type.ts
import { mimeTypesMap } from "./mime-types.mjs";
function getFileMimeType(name) {
  const extension = name.split(".").pop();
  return extension ? mimeTypesMap.get(extension) || null : null;
}
export {
  getFileMimeType
};
