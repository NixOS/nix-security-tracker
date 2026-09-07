import { Service } from '@zag-js/core';
import { PropTypes, NormalizeProps } from '@zag-js/types';
import { PresenceSchema, PresenceApi } from './presence.types.mjs';

declare function connect<T extends PropTypes>(service: Service<PresenceSchema>, _normalize: NormalizeProps<T>): PresenceApi;

export { connect };
