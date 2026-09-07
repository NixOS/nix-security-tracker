import "./chunk-QZ7TP4HQ.mjs";

// src/platform.ts
var isDom = () => typeof document !== "undefined";
function getPlatform() {
  const agent = navigator.userAgentData;
  return agent?.platform ?? navigator.platform;
}
function getUserAgent() {
  const ua2 = navigator.userAgentData;
  if (ua2 && Array.isArray(ua2.brands)) {
    return ua2.brands.map(({ brand, version }) => `${brand}/${version}`).join(" ");
  }
  return navigator.userAgent;
}
var pt = (v) => isDom() && v.test(getPlatform());
var ua = (v) => isDom() && v.test(getUserAgent());
var vn = (v) => isDom() && v.test(navigator.vendor);
var IPHONE_REGEX = /^iPhone/i;
var IPAD_REGEX = /^iPad/i;
var MAC_REGEX = /^Mac/i;
var APPLE_VENDOR_REGEX = /apple/i;
var FIREFOX_REGEX = /Firefox/i;
var CHROME_REGEX = /Chrome/i;
var WEBKIT_REGEX = /AppleWebKit/i;
var ANDROID_REGEX = /Android/i;
var LINUX_PLATFORM_REGEX = /^(Linux|CrOS|Chrome ?OS|Chromium ?OS)/i;
var isTouchDevice = () => isDom() && !!navigator.maxTouchPoints;
var isIPhone = () => pt(IPHONE_REGEX);
var isIPad = () => pt(IPAD_REGEX) || isMac() && navigator.maxTouchPoints > 1;
var isIos = () => isIPhone() || isIPad();
var isApple = () => isMac() || isIos();
var isMac = () => pt(MAC_REGEX);
var isSafari = () => isApple() && vn(APPLE_VENDOR_REGEX);
var isFirefox = () => ua(FIREFOX_REGEX);
var isChrome = () => ua(CHROME_REGEX);
var isWebKit = () => ua(WEBKIT_REGEX) && !isChrome();
var isAndroid = () => ua(ANDROID_REGEX);
var isLinux = () => pt(LINUX_PLATFORM_REGEX) && !isAndroid();
export {
  getPlatform,
  getUserAgent,
  isAndroid,
  isApple,
  isChrome,
  isDom,
  isFirefox,
  isIPad,
  isIPhone,
  isIos,
  isLinux,
  isMac,
  isSafari,
  isTouchDevice,
  isWebKit
};
