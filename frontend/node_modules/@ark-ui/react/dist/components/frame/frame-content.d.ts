import { ReactNode } from 'react';
interface FrameContentProps {
    onMount?: VoidFunction | undefined;
    onUnmount?: VoidFunction | undefined;
    children?: React.ReactNode | undefined;
}
export declare const FrameContent: (props: FrameContentProps) => ReactNode;
export {};
