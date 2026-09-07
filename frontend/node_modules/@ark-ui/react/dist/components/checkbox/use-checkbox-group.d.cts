export interface UseCheckboxGroupProps {
    /**
     * The initial value of `value` when uncontrolled
     */
    defaultValue?: string[] | undefined;
    /**
     * The controlled value of the checkbox group
     */
    value?: string[] | undefined;
    /**
     * The name of the input fields in the checkbox group
     * (Useful for form submission).
     */
    name?: string | undefined;
    /**
     * The callback to call when the value changes
     */
    onValueChange?: ((value: string[]) => void) | undefined;
    /**
     * If `true`, the checkbox group is disabled
     */
    disabled?: boolean | undefined;
    /**
     * If `true`, the checkbox group is read-only
     */
    readOnly?: boolean | undefined;
    /**
     * If `true`, the checkbox group is invalid
     */
    invalid?: boolean | undefined;
    /**
     * The maximum number of selected values
     */
    maxSelectedValues?: number | undefined;
}
export interface CheckboxGroupItemProps {
    value: string | undefined;
}
export declare function useCheckboxGroup(props?: UseCheckboxGroupProps): {
    isChecked: (val: string | undefined) => boolean;
    value: string[];
    name: string | undefined;
    disabled: boolean;
    readOnly: boolean;
    invalid: boolean;
    setValue: (value: string[]) => void | undefined;
    addValue: (val: string) => void;
    toggleValue: (val: string) => void;
    getItemProps: (props: CheckboxGroupItemProps) => {
        checked: boolean | undefined;
        onCheckedChange(): void;
        name: string | undefined;
        disabled: boolean;
        readOnly: boolean | undefined;
        invalid: boolean;
    };
};
export type UseCheckboxGroupReturn = ReturnType<typeof useCheckboxGroup>;
