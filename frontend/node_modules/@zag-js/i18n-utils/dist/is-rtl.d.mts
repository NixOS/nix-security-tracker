declare function isRTL(locale: string): boolean;
declare function getLocaleDir(locale: string): "rtl" | "ltr";

export { getLocaleDir, isRTL };
