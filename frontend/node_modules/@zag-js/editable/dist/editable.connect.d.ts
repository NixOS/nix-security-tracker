import { Service } from '@zag-js/core';
import { PropTypes, NormalizeProps } from '@zag-js/types';
import { EditableSchema, EditableApi } from './editable.types.js';
import '@zag-js/interact-outside';

declare function connect<T extends PropTypes>(service: Service<EditableSchema>, normalize: NormalizeProps<T>): EditableApi<T>;

export { connect };
