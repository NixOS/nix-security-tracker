import { ToastStoreProps, ToastStore } from './toast.types.js';
import '@zag-js/types';
import '@zag-js/core';
import '@zag-js/dom-query';

declare function createToastStore<V = any>(props?: ToastStoreProps): ToastStore<V>;

export { createToastStore };
