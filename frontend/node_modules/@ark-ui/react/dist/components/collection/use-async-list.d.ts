import * as asyncList from '@zag-js/async-list';
export interface UseAsyncListProps<T, C = string> extends asyncList.Props<T, C> {
}
export interface UseAsyncListReturn<T, C = string> extends asyncList.Api<T, C> {
}
export declare function useAsyncList<T, C = string>(props: UseAsyncListProps<T, C>): UseAsyncListReturn<T, C>;
