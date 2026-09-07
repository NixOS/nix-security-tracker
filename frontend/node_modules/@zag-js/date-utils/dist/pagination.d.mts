import { DateDuration } from '@internationalized/date';
import { DateValue } from './types.mjs';

interface AdjustDateParams {
    startDate: DateValue;
    focusedDate: DateValue;
}
interface AdjustDateReturn extends AdjustDateParams {
    endDate: DateValue;
}
declare function getAdjustedDateFn(visibleDuration: DateDuration, locale: string, minValue?: DateValue, maxValue?: DateValue): (options: AdjustDateParams) => AdjustDateReturn;
declare function getNextPage(focusedDate: DateValue, startDate: DateValue, visibleDuration: DateDuration, locale: string, minValue?: DateValue, maxValue?: DateValue): AdjustDateReturn;
declare function getPreviousPage(focusedDate: DateValue, startDate: DateValue, visibleDuration: DateDuration, locale: string, minValue?: DateValue, maxValue?: DateValue): AdjustDateReturn;
declare function getNextRow(focusedDate: DateValue, startDate: DateValue, visibleDuration: DateDuration, locale: string, minValue?: DateValue, maxValue?: DateValue): AdjustDateReturn | undefined;
declare function getPreviousRow(focusedDate: DateValue, startDate: DateValue, visibleDuration: DateDuration, locale: string, minValue?: DateValue, maxValue?: DateValue): AdjustDateReturn | undefined;
declare function getSectionStart(focusedDate: DateValue, startDate: DateValue, visibleDuration: DateDuration, locale: string, minValue?: DateValue, maxValue?: DateValue): AdjustDateReturn | undefined;
declare function getSectionEnd(focusedDate: DateValue, startDate: DateValue, visibleDuration: DateDuration, locale: string, minValue?: DateValue, maxValue?: DateValue): AdjustDateReturn | undefined;
declare function getNextSection(focusedDate: DateValue, startDate: DateValue, larger: boolean, visibleDuration: DateDuration, locale: string, minValue?: DateValue, maxValue?: DateValue): AdjustDateReturn | undefined;
declare function getPreviousSection(focusedDate: DateValue, startDate: DateValue, larger: boolean, visibleDuration: DateDuration, locale: string, minValue?: DateValue, maxValue?: DateValue): AdjustDateReturn | undefined;

export { type AdjustDateParams, type AdjustDateReturn, getAdjustedDateFn, getNextPage, getNextRow, getNextSection, getPreviousPage, getPreviousRow, getPreviousSection, getSectionEnd, getSectionStart };
