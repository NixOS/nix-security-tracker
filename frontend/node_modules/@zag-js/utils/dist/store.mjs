import "./chunk-MXGZDBDQ.mjs";

// src/store.ts
function createStore(initialState, compare = Object.is) {
  let state = { ...initialState };
  const listeners = /* @__PURE__ */ new Set();
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const publish = () => {
    listeners.forEach((listener) => listener());
  };
  const get = (key) => {
    return state[key];
  };
  const set = (key, value) => {
    if (!compare(state[key], value)) {
      state[key] = value;
      publish();
    }
  };
  const update = (updates) => {
    let hasChanges = false;
    for (const key in updates) {
      const value = updates[key];
      if (value !== void 0 && !compare(state[key], value)) {
        state[key] = value;
        hasChanges = true;
      }
    }
    if (hasChanges) {
      publish();
    }
  };
  const snapshot = () => ({ ...state });
  return {
    subscribe,
    get,
    set,
    update,
    snapshot
  };
}
export {
  createStore
};
