// src/scope.ts
import { getActiveElement, getDocument, isActiveElement } from "@zag-js/dom-query";
function createScope(props) {
  const getRootNode = () => props.getRootNode?.() ?? document;
  const getDoc = () => getDocument(getRootNode());
  const getWin = () => getDoc().defaultView ?? window;
  const getActiveElementFn = () => getActiveElement(getRootNode());
  const getById = (id) => getRootNode().getElementById(id);
  return {
    ...props,
    getRootNode,
    getDoc,
    getWin,
    getActiveElement: getActiveElementFn,
    isActiveElement,
    getById
  };
}
export {
  createScope
};
