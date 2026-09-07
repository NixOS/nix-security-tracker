// src/format-list.ts
import { i18nCache } from "./cache.mjs";
var getListFormatter = i18nCache(Intl.ListFormat);
function formatList(list, locale, options = {}) {
  const formatter = getListFormatter(locale, options);
  return formatter.format(list);
}
export {
  formatList
};
