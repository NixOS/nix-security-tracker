import * as _zag_js_types from '@zag-js/types';
import { JSX, HTMLAttributes, CSSProperties } from 'react';

type WithoutRef<T> = Omit<T, "ref">;
type ElementsWithoutRef = {
    [K in keyof JSX.IntrinsicElements]: WithoutRef<JSX.IntrinsicElements[K]>;
};
type PropTypes = ElementsWithoutRef & {
    element: WithoutRef<HTMLAttributes<HTMLElement>>;
    style: CSSProperties;
};
declare const normalizeProps: _zag_js_types.NormalizeProps<PropTypes>;

export { type PropTypes, normalizeProps };
