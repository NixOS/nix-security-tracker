// src/utils/step.ts
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
export {
  findStep,
  findStepIndex,
  getEffectiveStepIndex,
  getEffectiveSteps,
  getProgress,
  isDialogStep,
  isTooltipPlacement,
  isTooltipStep,
  isWaitStep
};
