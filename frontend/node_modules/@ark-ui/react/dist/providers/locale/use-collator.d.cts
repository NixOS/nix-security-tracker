export interface UseCollatorProps extends Intl.CollatorOptions {
    locale?: string;
}
export declare function useCollator(props?: UseCollatorProps): Intl.Collator;
