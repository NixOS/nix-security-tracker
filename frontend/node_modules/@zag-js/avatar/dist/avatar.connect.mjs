// src/avatar.connect.ts
import { parts } from "./avatar.anatomy.mjs";
import * as dom from "./avatar.dom.mjs";
function connect(service, normalize) {
  const { state, send, prop, scope } = service;
  const loaded = state.matches("loaded");
  return {
    loaded,
    setSrc(src) {
      const img = dom.getImageEl(scope);
      img?.setAttribute("src", src);
    },
    setLoaded() {
      send({ type: "img.loaded", src: "api" });
    },
    setError() {
      send({ type: "img.error", src: "api" });
    },
    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        dir: prop("dir"),
        id: dom.getRootId(scope)
      });
    },
    getImageProps() {
      return normalize.img({
        ...parts.image.attrs,
        hidden: !loaded,
        dir: prop("dir"),
        id: dom.getImageId(scope),
        "data-state": loaded ? "visible" : "hidden",
        onLoad() {
          send({ type: "img.loaded", src: "element" });
        },
        onError() {
          send({ type: "img.error", src: "element" });
        }
      });
    },
    getFallbackProps() {
      return normalize.element({
        ...parts.fallback.attrs,
        dir: prop("dir"),
        id: dom.getFallbackId(scope),
        hidden: loaded,
        "data-state": loaded ? "hidden" : "visible"
      });
    }
  };
}
export {
  connect
};
