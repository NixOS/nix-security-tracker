// src/async-list.machine.ts
import { createMachine } from "@zag-js/core";
import { ensure, ensureProps } from "@zag-js/utils";
var machine = createMachine({
  props({ props }) {
    ensureProps(props, ["load"], "load is required");
    return props;
  },
  context({ prop, bindable }) {
    return {
      items: bindable(() => ({
        defaultValue: prop("initialItems") ?? []
      })),
      cursor: bindable(() => ({
        defaultValue: null
      })),
      filterText: bindable(() => ({
        defaultValue: prop("initialFilterText") ?? ""
      })),
      sortDescriptor: bindable(() => ({
        defaultValue: prop("initialSortDescriptor")
      })),
      error: bindable(() => ({
        defaultValue: void 0
      }))
    };
  },
  refs() {
    return {
      abort: null,
      seq: 0
    };
  },
  watch({ prop, track, send }) {
    track([() => hashDeps(prop("dependencies"))], () => {
      send({ type: "RELOAD" });
    });
  },
  initialState() {
    return "idle";
  },
  on: {
    RELOAD: {
      target: "loading",
      reenter: true,
      actions: ["clearItems"]
    }
  },
  entry: ["loadIfNeeded"],
  states: {
    idle: {
      on: {
        LOAD_MORE: {
          guard: "hasCursor",
          target: "loading"
        },
        SORT: [
          {
            guard: "hasSortFn",
            target: "sorting",
            actions: ["setSortDescriptor", "clearCursor", "performSort"]
          },
          {
            target: "loading",
            actions: ["setSortDescriptor", "clearCursor"]
          }
        ],
        FILTER: {
          target: "loading",
          actions: ["setFilterText", "clearCursor"]
        }
      }
    },
    loading: {
      entry: ["performFetch"],
      exit: ["cancelFetch"],
      on: {
        SUCCESS: {
          target: "idle",
          actions: ["setItems", "setCursor", "clearError", "invokeOnSuccess"]
        },
        ERROR: {
          target: "idle",
          actions: ["setError", "invokeOnError"]
        },
        ABORT: {
          target: "idle",
          actions: ["cancelFetch"]
        },
        FILTER: {
          reenter: true,
          target: "loading",
          actions: ["setFilterText", "clearCursor"]
        }
      }
    },
    sorting: {
      on: {
        SUCCESS: {
          target: "idle",
          actions: ["setItems", "setCursor", "clearError", "invokeOnSuccess"]
        },
        ERROR: {
          target: "idle",
          actions: ["setError", "invokeOnError"]
        },
        ABORT: {
          target: "idle",
          actions: ["cancelSort"]
        },
        FILTER: {
          target: "loading",
          actions: ["setFilterText", "clearCursor", "cancelSort"]
        },
        RELOAD: {
          target: "loading",
          actions: ["clearItems", "cancelSort"]
        },
        SORT: [
          {
            guard: "hasSortFn",
            target: "sorting",
            reenter: true,
            actions: ["setSortDescriptor", "clearCursor", "cancelSort", "performSort"]
          },
          {
            target: "loading",
            actions: ["setSortDescriptor", "clearCursor", "cancelSort"]
          }
        ]
      }
    }
  },
  implementations: {
    guards: {
      hasCursor({ context }) {
        return context.get("cursor") != null;
      },
      hasSortFn({ prop }) {
        return prop("sort") != null;
      }
    },
    actions: {
      loadIfNeeded({ prop, send }) {
        if (!prop("autoReload")) return;
        send({ type: "RELOAD" });
      },
      performFetch({ context, prop, refs, send, event }) {
        refs.set("abort", new AbortController());
        const abort = refs.get("abort");
        context.set("error", void 0);
        const seq = refs.get("seq") + 1;
        refs.set("seq", seq);
        const isLoadMore = event.type === "LOAD_MORE";
        const loadFn = prop("load");
        loadFn({
          signal: abort?.signal,
          cursor: isLoadMore ? context.get("cursor") : null,
          filterText: event.filterText ?? context.get("filterText"),
          sortDescriptor: event.sortDescriptor ?? context.get("sortDescriptor")
        }).then(({ items, cursor }) => {
          if (seq !== refs.get("seq")) return;
          send({ type: "SUCCESS", items, cursor, append: isLoadMore });
        }).catch((error) => {
          if (seq !== refs.get("seq")) return;
          if (isAbortError(error)) return;
          send({ type: "ERROR", error });
        });
      },
      performSort({ context, prop, send, event, refs }) {
        const sortFn = prop("sort");
        ensure(sortFn, () => "[zag-js/async-list] sort is required");
        const currentItems = context.get("items");
        const filterText = context.get("filterText");
        const seq = refs.get("seq") + 1;
        refs.set("seq", seq);
        Promise.resolve(
          sortFn({
            items: currentItems,
            descriptor: event.sortDescriptor,
            filterText
          })
        ).then((r) => {
          if (seq !== refs.get("seq")) return;
          const sortedItems = r?.items ?? currentItems;
          send({ type: "SUCCESS", items: sortedItems, cursor: void 0, append: false });
        }).catch((e) => {
          if (seq !== refs.get("seq")) return;
          send({ type: "ERROR", error: e });
        });
      },
      setSortDescriptor({ context, event }) {
        context.set("sortDescriptor", event.sortDescriptor);
      },
      setFilterText({ context, event }) {
        context.set("filterText", event.filterText);
      },
      invokeOnSuccess({ prop, event }) {
        prop("onSuccess")?.({ items: event.items });
      },
      invokeOnError({ prop, event }) {
        prop("onError")?.({ error: event.error });
      },
      clearItems({ context }) {
        context.set("items", []);
      },
      setItems({ context, event }) {
        context.set("items", (prev) => event.append ? [...prev, ...event.items] : event.items);
      },
      setCursor({ context, event }) {
        context.set("cursor", event.cursor);
      },
      setError({ context, event }) {
        context.set("error", event.error);
      },
      clearError({ context }) {
        context.set("error", void 0);
      },
      clearCursor({ context }) {
        context.set("cursor", null);
      },
      cancelFetch({ refs }) {
        const _abort = refs.get("abort");
        _abort?.abort();
        refs.set("abort", null);
      },
      cancelSort({ refs }) {
        const seq = refs.get("seq") + 1;
        refs.set("seq", seq);
      }
    }
  }
});
function isAbortError(err) {
  return err instanceof Error && err.name === "AbortError";
}
function hashDeps(deps = []) {
  return deps.filter(Boolean).join(",");
}
export {
  machine
};
