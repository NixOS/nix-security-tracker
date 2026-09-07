import { PropsWithChildren, RefObject, JSX } from 'react';

interface PortalProps {
    disabled?: boolean | undefined;
    container?: RefObject<HTMLElement> | undefined;
    getRootNode?: (() => ShadowRoot | Document | Node) | undefined;
}
declare const Portal: (props: PropsWithChildren<PortalProps>) => JSX.Element;

export { Portal, type PortalProps };
