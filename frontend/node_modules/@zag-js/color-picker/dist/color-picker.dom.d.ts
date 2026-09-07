import { ColorChannel } from '@zag-js/color-utils';
import { Scope } from '@zag-js/core';
import { Point, Direction } from '@zag-js/types';

declare const getRootId: (ctx: Scope) => any;
declare const getLabelId: (ctx: Scope) => any;
declare const getHiddenInputId: (ctx: Scope) => any;
declare const getControlId: (ctx: Scope) => any;
declare const getTriggerId: (ctx: Scope) => any;
declare const getContentId: (ctx: Scope) => any;
declare const getPositionerId: (ctx: Scope) => any;
declare const getFormatSelectId: (ctx: Scope) => any;
declare const getAreaId: (ctx: Scope) => any;
declare const getAreaGradientId: (ctx: Scope) => any;
declare const getAreaThumbId: (ctx: Scope) => any;
declare const getChannelSliderTrackId: (ctx: Scope, channel: ColorChannel) => any;
declare const getChannelSliderThumbId: (ctx: Scope, channel: ColorChannel) => any;
declare const getContentEl: (ctx: Scope) => HTMLElement | null;
declare const getAreaThumbEl: (ctx: Scope) => HTMLElement | null;
declare const getChannelSliderThumbEl: (ctx: Scope, channel: ColorChannel) => HTMLElement | null;
declare const getChannelInputEl: (ctx: Scope, channel: string) => HTMLInputElement[];
declare const getFormatSelectEl: (ctx: Scope) => HTMLSelectElement | null;
declare const getHiddenInputEl: (ctx: Scope) => HTMLInputElement | null;
declare const getAreaEl: (ctx: Scope) => HTMLElement | null;
declare const getAreaValueFromPoint: (ctx: Scope, point: Point, dir?: Direction) => {
    x: number;
    y: number;
} | undefined;
declare const getControlEl: (ctx: Scope) => HTMLElement | null;
declare const getTriggerEl: (ctx: Scope) => HTMLElement | null;
declare const getPositionerEl: (ctx: Scope) => HTMLElement | null;
declare const getChannelSliderTrackEl: (ctx: Scope, channel: ColorChannel) => HTMLElement | null;
declare const getChannelSliderValueFromPoint: (ctx: Scope, point: Point, channel: ColorChannel, dir?: Direction) => {
    x: number;
    y: number;
} | undefined;
declare const getChannelInputEls: (ctx: Scope) => HTMLInputElement[];

export { getAreaEl, getAreaGradientId, getAreaId, getAreaThumbEl, getAreaThumbId, getAreaValueFromPoint, getChannelInputEl, getChannelInputEls, getChannelSliderThumbEl, getChannelSliderThumbId, getChannelSliderTrackEl, getChannelSliderTrackId, getChannelSliderValueFromPoint, getContentEl, getContentId, getControlEl, getControlId, getFormatSelectEl, getFormatSelectId, getHiddenInputEl, getHiddenInputId, getLabelId, getPositionerEl, getPositionerId, getRootId, getTriggerEl, getTriggerId };
