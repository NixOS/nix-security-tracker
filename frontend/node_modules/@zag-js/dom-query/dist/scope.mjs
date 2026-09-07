import "./chunk-QZ7TP4HQ.mjs";

// src/scope.ts
import { setElementValue } from "./form.mjs";
import { getActiveElement, getDocument, isActiveElement } from "./node.mjs";
function createScope(methods) {
  const dom = {
    getRootNode: (ctx) => ctx.getRootNode?.() ?? document,
    getDoc: (ctx) => getDocument(dom.getRootNode(ctx)),
    getWin: (ctx) => dom.getDoc(ctx).defaultView ?? window,
    getActiveElement: (ctx) => getActiveElement(dom.getRootNode(ctx)),
    isActiveElement,
    getById: (ctx, id) => dom.getRootNode(ctx).getElementById(id),
    setValue: (elem, value) => {
      if (elem == null || value == null) return;
      setElementValue(elem, value.toString());
    }
  };
  return { ...dom, ...methods };
}
export {
  createScope
};
