import { TimerProps } from './timer.types.mjs';
import '@zag-js/core';
import '@zag-js/types';

declare const props: (keyof TimerProps)[];
declare const splitProps: <Props extends Partial<TimerProps>>(props: Props) => [Partial<TimerProps>, Omit<Props, keyof TimerProps>];

export { props, splitProps };
