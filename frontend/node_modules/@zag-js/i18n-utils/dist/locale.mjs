// src/locale.ts
import { isRTL } from "./is-rtl.mjs";
function getDefaultLocale() {
  let locale = typeof navigator !== "undefined" && (navigator.language || navigator.userLanguage) || "en-US";
  try {
    Intl.DateTimeFormat.supportedLocalesOf([locale]);
  } catch {
    locale = "en-US";
  }
  return {
    locale,
    dir: isRTL(locale) ? "rtl" : "ltr"
  };
}
export {
  getDefaultLocale
};
