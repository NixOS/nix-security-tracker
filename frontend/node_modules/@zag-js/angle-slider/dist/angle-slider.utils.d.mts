import { Point } from '@zag-js/types';

declare const MIN_VALUE = 0;
declare const MAX_VALUE = 359;
declare function getAngle(controlEl: HTMLElement, point: Point, angularOffset?: number | null, dir?: "ltr" | "rtl"): number;
declare function getPointerValue(controlEl: HTMLElement, point: Point, angularOffset: number | null | undefined, value: number, dir?: "ltr" | "rtl"): number;
declare function getDisplayAngle(value: number, dir?: "ltr" | "rtl"): number;
declare function clampAngle(degree: number): number;
declare function constrainAngle(degree: number, step: number): number;
declare function snapAngleToStep(value: number, step: number): number;

export { MAX_VALUE, MIN_VALUE, clampAngle, constrainAngle, getAngle, getDisplayAngle, getPointerValue, snapAngleToStep };
