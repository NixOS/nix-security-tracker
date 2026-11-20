/** A pure change to the URL search params. */
export type ParamsUpdate = (params: URLSearchParams) => URLSearchParams;

// An empty value removes the parameter.
export const setParam =
  (key: string, value: string): ParamsUpdate =>
  (params) => {
    const next = new URLSearchParams(params);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    return next;
  };

export const pipe =
  (...updates: ParamsUpdate[]): ParamsUpdate =>
  (params) =>
    updates.reduce((acc, update) => update(acc), params);

// Invalidate the current page: jump back to page 1.
export const resetPage = setParam("page", "");
