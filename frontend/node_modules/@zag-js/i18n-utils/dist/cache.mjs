// src/cache.ts
function i18nCache(Ins) {
  const formatterCache = /* @__PURE__ */ new Map();
  return function create(locale, options) {
    const cacheKey = locale + (options ? Object.entries(options).sort((a, b) => a[0] < b[0] ? -1 : 1).join() : "");
    if (formatterCache.has(cacheKey)) {
      return formatterCache.get(cacheKey);
    }
    let formatter = new Ins(locale, options);
    formatterCache.set(cacheKey, formatter);
    return formatter;
  };
}
export {
  i18nCache
};
