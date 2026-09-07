import { InputProps, DatePickerProps, PresetTriggerProps, TableCellProps, TableProps, ViewProps } from './date-picker.types.js';
import '@internationalized/date';
import '@zag-js/core';
import '@zag-js/date-utils';
import '@zag-js/live-region';
import '@zag-js/popper';
import '@zag-js/types';

declare const props: (keyof DatePickerProps)[];
declare const splitProps: <Props extends Partial<DatePickerProps>>(props: Props) => [Partial<DatePickerProps>, Omit<Props, keyof DatePickerProps>];
declare const inputProps: (keyof InputProps)[];
declare const splitInputProps: <Props extends InputProps>(props: Props) => [InputProps, Omit<Props, keyof InputProps>];
declare const presetTriggerProps: "value"[];
declare const splitPresetTriggerProps: <Props extends PresetTriggerProps>(props: Props) => [PresetTriggerProps, Omit<Props, "value">];
declare const tableProps: (keyof TableProps)[];
declare const splitTableProps: <Props extends TableProps>(props: Props) => [TableProps, Omit<Props, keyof TableProps>];
declare const tableCellProps: (keyof TableCellProps)[];
declare const splitTableCellProps: <Props extends TableCellProps>(props: Props) => [TableCellProps, Omit<Props, keyof TableCellProps>];
declare const viewProps: "view"[];
declare const splitViewProps: <Props extends ViewProps>(props: Props) => [ViewProps, Omit<Props, "view">];

export { inputProps, presetTriggerProps, props, splitInputProps, splitPresetTriggerProps, splitProps, splitTableCellProps, splitTableProps, splitViewProps, tableCellProps, tableProps, viewProps };
