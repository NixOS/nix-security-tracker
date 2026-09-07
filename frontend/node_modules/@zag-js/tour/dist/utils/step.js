"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/utils/step.ts
var step_exports = {};
__export(step_exports, {
  findStep: () => findStep,
  findStepIndex: () => findStepIndex,
  getEffectiveStepIndex: () => getEffectiveStepIndex,
  getEffectiveSteps: () => getEffectiveSteps,
  getProgress: () => getProgress,
  isDialogStep: () => isDialogStep,
  isTooltipPlacement: () => isTooltipPlacement,
  isTooltipStep: () => isTooltipStep,
  isWaitStep: () => isWaitStep
});
module.exports = __toCommonJS(step_exports);
var isTooltipStep = (step) => {
  return step?.type === "tooltip";
};
var isDialogStep = (step) => {
  return step?.type === "dialog";
};
var isWaitStep = (step) => {
  return step?.type === "wait";
};
var getEffectiveSteps = (steps) => {
  return steps.filter((step) => step.type !== "wait");
};
var getProgress = (steps, stepIndex) => {
  const effectiveLength = getEffectiveSteps(steps).length;
  return (stepIndex + 1) / effectiveLength;
};
var getEffectiveStepIndex = (steps, stepId) => {
  const effectiveSteps = getEffectiveSteps(steps);
  return findStepIndex(effectiveSteps, stepId);
};
var isTooltipPlacement = (placement) => {
  return placement != null && placement != "center";
};
var normalizeStep = (step) => {
  if (step.type === "floating") {
    return { backdrop: false, arrow: false, placement: "bottom-end", ...step };
  }
  if (step.target == null || step.type === "dialog") {
    return { type: "dialog", placement: "center", backdrop: true, ...step };
  }
  if (!step.type || step.type === "tooltip") {
    return { type: "tooltip", arrow: true, backdrop: true, ...step };
  }
  return step;
};
var findStep = (steps, id) => {
  const res = id != null ? steps.find((step) => step.id === id) : null;
  return res ? normalizeStep(res) : null;
};
var findStepIndex = (steps, id) => {
  return id != null ? steps.findIndex((step) => step.id === id) : -1;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  findStep,
  findStepIndex,
  getEffectiveStepIndex,
  getEffectiveSteps,
  getProgress,
  isDialogStep,
  isTooltipPlacement,
  isTooltipStep,
  isWaitStep
});
