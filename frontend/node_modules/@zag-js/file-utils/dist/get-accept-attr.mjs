// src/get-accept-attr.ts
function isMIMEType(v) {
  return v === "audio/*" || v === "video/*" || v === "image/*" || v === "text/*" || /\w+\/[-+.\w]+/g.test(v);
}
function isExt(v) {
  return /^.*\.[\w]+$/.test(v);
}
var isValidMIME = (v) => isMIMEType(v) || isExt(v);
function getAcceptAttrString(accept) {
  if (accept == null) return;
  if (typeof accept === "string") {
    return accept;
  }
  if (Array.isArray(accept)) {
    return accept.filter(isValidMIME).join(",");
  }
  return Object.entries(accept).reduce((a, [mimeType, ext]) => [...a, mimeType, ...ext], []).filter(isValidMIME).join(",");
}
export {
  getAcceptAttrString
};
