import { AsyncListService, AsyncListApi } from './async-list.types.js';
import '@zag-js/core';

declare function connect<T, C>(service: AsyncListService<T, C>): AsyncListApi<T, C>;

export { connect };
