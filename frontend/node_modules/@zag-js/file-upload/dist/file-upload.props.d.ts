import { ItemProps, FileUploadProps } from './file-upload.types.js';
import '@zag-js/core';
import '@zag-js/file-utils';
import '@zag-js/types';

declare const props: (keyof FileUploadProps)[];
declare const splitProps: <Props extends Partial<FileUploadProps>>(props: Props) => [Partial<FileUploadProps>, Omit<Props, keyof FileUploadProps>];
declare const itemProps: (keyof ItemProps)[];
declare const splitItemProps: <Props extends ItemProps>(props: Props) => [ItemProps, Omit<Props, keyof ItemProps>];

export { itemProps, props, splitItemProps, splitProps };
