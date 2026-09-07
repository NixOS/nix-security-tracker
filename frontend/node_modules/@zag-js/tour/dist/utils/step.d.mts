import { Placement } from '@zag-js/popper';
import { StepDetails, StepPlacement } from '../tour.types.mjs';
import '@zag-js/core';
import '@zag-js/dismissable';
import '@zag-js/types';
import './rect.mjs';

declare const isTooltipStep: (step: StepDetails | null) => step is Omit<StepDetails, "placement"> & {
    placement: Placement;
};
declare const isDialogStep: (step: StepDetails | null) => boolean;
declare const isWaitStep: (step: StepDetails | null) => boolean;
declare const getEffectiveSteps: (steps: StepDetails[]) => StepDetails[];
declare const getProgress: (steps: StepDetails[], stepIndex: number) => number;
declare const getEffectiveStepIndex: (steps: StepDetails[], stepId: string | null | undefined) => number;
declare const isTooltipPlacement: (placement: StepPlacement | undefined) => placement is Placement;
declare const findStep: (steps: StepDetails[], id: string | undefined | null) => StepDetails | null;
declare const findStepIndex: (steps: StepDetails[], id: string | undefined | null) => number;

export { findStep, findStepIndex, getEffectiveStepIndex, getEffectiveSteps, getProgress, isDialogStep, isTooltipPlacement, isTooltipStep, isWaitStep };
