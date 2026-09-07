"use client";

// src/portal.tsx
import * as React from "react";
import { createPortal } from "react-dom";
import { jsx } from "react/jsx-runtime";
var Portal = (props) => {
  const { children, container, disabled, getRootNode } = props;
  const isServer = typeof window === "undefined";
  if (isServer || disabled) return /* @__PURE__ */ jsx(React.Fragment, { children });
  const doc = getRootNode?.().ownerDocument ?? document;
  const mountNode = container?.current ?? doc.body;
  return /* @__PURE__ */ jsx(React.Fragment, { children: React.Children.map(children, (child) => createPortal(child, mountNode)) });
};
export {
  Portal
};
