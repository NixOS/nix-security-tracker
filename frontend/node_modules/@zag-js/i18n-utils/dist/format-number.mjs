// src/format-number.ts
import { i18nCache } from "./cache.mjs";
var getNumberFormatter = i18nCache(Intl.NumberFormat);
function formatNumber(v, locale, options = {}) {
  const formatter = getNumberFormatter(locale, options);
  return formatter.format(v);
}
export {
  formatNumber
};
