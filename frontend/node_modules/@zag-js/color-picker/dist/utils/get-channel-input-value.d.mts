import { Color, ColorChannelRange } from '@zag-js/color-utils';
import { ExtendedColorChannel } from '../color-picker.types.mjs';
import '@zag-js/core';
import '@zag-js/dismissable';
import '@zag-js/popper';
import '@zag-js/types';

declare function getChannelValue(color: Color, channel: ExtendedColorChannel | null | undefined): string;
declare function getChannelRange(color: Color, channel: ExtendedColorChannel): ColorChannelRange | undefined;

export { getChannelRange, getChannelValue };
