"use client";

// src/use-layout-effect.ts
import { useEffect, useLayoutEffect } from "react";
var useSafeLayoutEffect = typeof globalThis.document !== "undefined" ? useLayoutEffect : useEffect;
export {
  useSafeLayoutEffect
};
