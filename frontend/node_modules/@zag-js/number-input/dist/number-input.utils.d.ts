import { NumberParser } from '@internationalized/number';
import { Params } from '@zag-js/core';
import { NumberInputSchema } from './number-input.types.js';
import '@zag-js/types';

declare const createFormatter: (locale: string, options?: Intl.NumberFormatOptions) => Intl.NumberFormat;
declare const createParser: (locale: string, options?: Intl.NumberFormatOptions) => NumberParser;
type Ctx = Pick<Params<NumberInputSchema>, "prop" | "computed">;
declare const parseValue: (value: string, params: Ctx) => number;
declare const formatValue: (value: number, params: Ctx) => string;
declare const getDefaultStep: (step: number | undefined, formatOptions: Intl.NumberFormatOptions | undefined) => number;

export { createFormatter, createParser, formatValue, getDefaultStep, parseValue };
