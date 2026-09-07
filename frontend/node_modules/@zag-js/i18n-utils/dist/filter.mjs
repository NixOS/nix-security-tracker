// src/filter.ts
import { i18nCache } from "./cache.mjs";
var collatorCache = i18nCache(Intl.Collator);
function createFilter(options) {
  const { locale, ...rest } = options || {};
  const collator = collatorCache(locale || "en-US", { usage: "search", ...rest });
  function normalize(string) {
    string = string.normalize("NFC");
    if (collator.resolvedOptions().ignorePunctuation) {
      string = string.replace(/\p{P}/gu, "");
    }
    return string;
  }
  function startsWith(string, substring) {
    if (substring.length === 0) return true;
    string = normalize(string);
    substring = normalize(substring);
    return collator.compare(string.slice(0, substring.length), substring) === 0;
  }
  function endsWith(string, substring) {
    if (substring.length === 0) return true;
    string = normalize(string);
    substring = normalize(substring);
    return collator.compare(string.slice(-substring.length), substring) === 0;
  }
  function contains(string, substring) {
    if (substring.length === 0) return true;
    string = normalize(string);
    substring = normalize(substring);
    let scan = 0;
    let sliceLen = substring.length;
    for (; scan + sliceLen <= string.length; scan++) {
      let slice = string.slice(scan, scan + sliceLen);
      if (collator.compare(substring, slice) === 0) {
        return true;
      }
    }
    return false;
  }
  return {
    startsWith,
    endsWith,
    contains
  };
}
export {
  createFilter
};
