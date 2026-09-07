// src/collator.ts
import { i18nCache } from "./cache.mjs";
var getCollator = i18nCache(Intl.Collator);
function createCollator(locale = "en-US", options = {}) {
  return getCollator(locale, options);
}
export {
  createCollator
};
