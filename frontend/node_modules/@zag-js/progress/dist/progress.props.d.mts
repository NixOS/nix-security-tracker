import { ProgressProps } from './progress.types.mjs';
import '@zag-js/core';
import '@zag-js/types';

declare const props: (keyof ProgressProps)[];
declare const splitProps: <Props extends Partial<ProgressProps>>(props: Props) => [Partial<ProgressProps>, Omit<Props, keyof ProgressProps>];

export { props, splitProps };
