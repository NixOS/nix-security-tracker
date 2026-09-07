import * as _internationalized_date from '@internationalized/date';
import { DateDuration } from '@internationalized/date';
import { DateValue } from './types.mjs';

declare function getUnitDuration(duration: DateDuration): {
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
};
declare function getEndDate(startDate: DateValue, duration: DateDuration): _internationalized_date.CalendarDate | _internationalized_date.CalendarDateTime | _internationalized_date.ZonedDateTime;

export { getEndDate, getUnitDuration };
