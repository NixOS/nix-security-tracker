import { DateFormatter } from '@internationalized/date';
export interface UseDateFormatterProps extends Intl.DateTimeFormatOptions {
    locale?: string;
}
export declare function useDateFormatter(props?: UseDateFormatterProps): DateFormatter;
