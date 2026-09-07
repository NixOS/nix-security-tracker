// src/navigation-menu.utils.ts
function setCloseTimeout(refs, context, prop) {
  clearCloseTimeout(refs);
  const closeTimeoutId = window.setTimeout(() => {
    context.set("value", "");
  }, prop("closeDelay"));
  refs.set("closeTimeoutId", closeTimeoutId);
}
function clearCloseTimeout(refs) {
  const closeTimeoutId = refs.get("closeTimeoutId");
  if (closeTimeoutId) {
    clearTimeout(closeTimeoutId);
    refs.set("closeTimeoutId", null);
  }
}
function setOpenTimeout(refs, value, timeoutId) {
  const openTimeoutIds = refs.get("openTimeoutIds");
  refs.set("openTimeoutIds", {
    ...openTimeoutIds,
    [value]: timeoutId
  });
}
function clearOpenTimeout(refs, value) {
  const openTimeoutIds = refs.get("openTimeoutIds");
  const timeoutId = openTimeoutIds[value];
  if (timeoutId) {
    clearTimeout(timeoutId);
    const { [value]: _, ...rest } = openTimeoutIds;
    refs.set("openTimeoutIds", rest);
  }
}
function clearAllOpenTimeouts(refs) {
  const openTimeoutIds = refs.get("openTimeoutIds");
  Object.values(openTimeoutIds).forEach((timeoutId) => {
    if (timeoutId) clearTimeout(timeoutId);
  });
  refs.set("openTimeoutIds", {});
}
export {
  clearAllOpenTimeouts,
  clearCloseTimeout,
  clearOpenTimeout,
  setCloseTimeout,
  setOpenTimeout
};
