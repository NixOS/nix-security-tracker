import { FilterOptions, FilterReturn } from '@zag-js/i18n-utils';
export interface UseFilterProps extends FilterOptions {
}
export declare function useFilter(props: UseFilterProps): UseFilterReturn;
export interface UseFilterReturn extends FilterReturn {
}
