// src/index.ts
import { getComputedStyle, isIos, isOverflowElement, setStyleProperty, setStyle } from "@zag-js/dom-query";
var LOCK_CLASSNAME = "data-scroll-lock";
var lockMap = /* @__PURE__ */ new WeakMap();
function getPaddingProperty(documentElement) {
  const documentLeft = documentElement.getBoundingClientRect().left;
  const scrollbarX = Math.round(documentLeft) + documentElement.scrollLeft;
  return scrollbarX ? "paddingLeft" : "paddingRight";
}
function hasStableScrollbarGutter(element) {
  const styles = getComputedStyle(element);
  const scrollbarGutter = styles?.scrollbarGutter;
  return scrollbarGutter === "stable" || scrollbarGutter?.startsWith("stable ") === true;
}
function getScrollContainer(doc) {
  const { documentElement, body } = doc;
  return isOverflowElement(documentElement) ? documentElement : body;
}
function applyLock(doc) {
  const win = doc.defaultView ?? window;
  const { documentElement, body } = doc;
  const scroller = getScrollContainer(doc);
  const hasStableGutter = hasStableScrollbarGutter(documentElement) || hasStableScrollbarGutter(body);
  const scrollbarWidth = win.innerWidth - documentElement.clientWidth;
  body.setAttribute(LOCK_CLASSNAME, "");
  const setScrollbarWidthProperty = () => setStyleProperty(documentElement, "--scrollbar-width", `${scrollbarWidth}px`);
  const paddingProperty = getPaddingProperty(documentElement);
  const setScrollerStyle = () => {
    const styles = {
      overflow: "hidden"
    };
    if (!hasStableGutter && scrollbarWidth > 0) {
      styles[paddingProperty] = `${scrollbarWidth}px`;
    }
    return setStyle(scroller, styles);
  };
  const setBodyStyleIOS = () => {
    const { scrollX, scrollY, visualViewport } = win;
    const offsetLeft = visualViewport?.offsetLeft ?? 0;
    const offsetTop = visualViewport?.offsetTop ?? 0;
    const styles = {
      position: "fixed",
      overflow: "hidden",
      top: `${-(scrollY - Math.floor(offsetTop))}px`,
      left: `${-(scrollX - Math.floor(offsetLeft))}px`,
      right: "0"
    };
    if (!hasStableGutter && scrollbarWidth > 0) {
      styles[paddingProperty] = `${scrollbarWidth}px`;
    }
    const restoreStyle = setStyle(body, styles);
    return () => {
      restoreStyle?.();
      win.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
    };
  };
  const cleanups = [setScrollbarWidthProperty(), isIos() ? setBodyStyleIOS() : setScrollerStyle()];
  return () => {
    cleanups.forEach((fn) => fn?.());
    body.removeAttribute(LOCK_CLASSNAME);
  };
}
function preventBodyScroll(_document) {
  const doc = _document ?? document;
  let state = lockMap.get(doc);
  if (!state) {
    state = { count: 0, cleanup: applyLock(doc) };
    lockMap.set(doc, state);
  }
  state.count++;
  const lockState = state;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockState.count--;
    if (lockState.count === 0) {
      lockState.cleanup();
      lockMap.delete(doc);
    }
  };
}
export {
  preventBodyScroll
};
