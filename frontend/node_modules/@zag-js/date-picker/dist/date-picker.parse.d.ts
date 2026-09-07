import { DateValue } from '@zag-js/date-utils';

declare function parse(value: string | Date): DateValue;
declare function parse(value: string[] | Date[]): DateValue[];

export { parse };
