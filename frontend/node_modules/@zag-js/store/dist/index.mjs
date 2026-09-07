// src/index.ts
import { clone } from "./clone.mjs";
import { globalRef } from "./global.mjs";
import { proxy, ref, snapshot, subscribe } from "./proxy.mjs";
import { proxyWithComputed } from "./proxy-computed.mjs";
export {
  clone,
  globalRef,
  proxy,
  proxyWithComputed,
  ref,
  snapshot,
  subscribe
};
