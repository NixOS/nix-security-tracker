import { Pages } from './pagination.types.js';
import '@zag-js/core';
import '@zag-js/types';

declare const range: (start: number, end: number) => number[];
declare const transform: (items: (string | number)[]) => Pages;
type PageContext = {
    page: number;
    totalPages: number;
    siblingCount: number;
    boundaryCount: number;
};
declare const getRange: (ctx: PageContext) => (string | number)[];
declare const getTransformedRange: (ctx: PageContext) => Pages;

export { type PageContext, getRange, getTransformedRange, range, transform };
