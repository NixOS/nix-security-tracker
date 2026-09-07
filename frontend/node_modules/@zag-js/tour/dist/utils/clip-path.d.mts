import { AnchorRect } from '@zag-js/popper';
import { Required } from '@zag-js/types';

interface CompositeRadius {
    topLeft: number;
    topRight: number;
    bottomRight: number;
    bottomLeft: number;
}
interface Options {
    rect: Required<AnchorRect>;
    rootSize: {
        width: number;
        height: number;
    };
    radius: number | CompositeRadius;
    enabled: boolean;
}
declare function getClipPath(options: Options): string;

export { getClipPath };
