import { PropTypes, NormalizeProps } from '@zag-js/types';
import { Service } from '@zag-js/core';
import { AccordionSchema, AccordionApi } from './accordion.types.mjs';

declare function connect<T extends PropTypes>(service: Service<AccordionSchema>, normalize: NormalizeProps<T>): AccordionApi<T>;

export { connect };
