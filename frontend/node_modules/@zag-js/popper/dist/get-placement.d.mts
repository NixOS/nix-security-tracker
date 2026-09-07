import { MaybeFn, MaybeRectElement, MaybeElement, PositioningOptions } from './types.mjs';
import '@floating-ui/dom';

declare function getPlacement(referenceOrFn: MaybeFn<MaybeRectElement>, floatingOrFn: MaybeFn<MaybeElement>, opts?: PositioningOptions & {
    defer?: boolean | undefined;
}): () => void;

export { getPlacement };
