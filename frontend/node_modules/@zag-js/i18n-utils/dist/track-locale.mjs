// src/track-locale.ts
import { getWindow } from "@zag-js/dom-query";
import { getDefaultLocale } from "./locale.mjs";
function trackLocale(options = {}) {
  const { getRootNode, onLocaleChange } = options;
  onLocaleChange?.(getDefaultLocale());
  const handleLocaleChange = () => {
    onLocaleChange?.(getDefaultLocale());
  };
  const win = getRootNode ? getWindow(getRootNode()) : window;
  win.addEventListener("languagechange", handleLocaleChange);
  return () => {
    win.removeEventListener("languagechange", handleLocaleChange);
  };
}
export {
  trackLocale
};
