import { Params } from '@zag-js/core';
import { SliderSchema, ThumbCollisionBehavior } from './slider.types.mjs';
import '@zag-js/types';

type Ctx = Params<SliderSchema>;
interface ThumbCollisionResult {
    values: number[];
    index: number;
    swapped: boolean;
}
declare function resolveThumbCollision(behavior: ThumbCollisionBehavior, index: number, value: number, values: number[], min: number, max: number, step: number, minStepsBetweenThumbs: number, startValue?: number): ThumbCollisionResult;
declare function normalizeValues(params: Ctx, nextValues: number[]): number[];
declare function getRangeAtIndex(params: Pick<Ctx, "context" | "prop">, index: number): {
    min: number;
    max: number;
    value: number;
};
declare function constrainValue(params: Pick<Ctx, "context" | "prop">, value: number, index: number): number;
declare function decrement(params: Pick<Ctx, "context" | "prop">, index?: number, step?: number): number[];
declare function increment(params: Pick<Ctx, "context" | "prop">, index?: number, step?: number): number[];
declare function getClosestIndex(params: Pick<Ctx, "context" | "prop">, pointValue: number): number;
declare function selectMovableThumb(params: Pick<Ctx, "context" | "prop">, index: number): number;
declare function assignArray(current: number[], next: number[]): void;

export { assignArray, constrainValue, decrement, getClosestIndex, getRangeAtIndex, increment, normalizeValues, resolveThumbCollision, selectMovableThumb };
