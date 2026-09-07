import { EditableProps } from './editable.types.js';
import '@zag-js/core';
import '@zag-js/interact-outside';
import '@zag-js/types';

declare const props: (keyof EditableProps)[];
declare const splitProps: <Props extends Partial<EditableProps>>(props: Props) => [Partial<EditableProps>, Omit<Props, keyof EditableProps>];

export { props, splitProps };
