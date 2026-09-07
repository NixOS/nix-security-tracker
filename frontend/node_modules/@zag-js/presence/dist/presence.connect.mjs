// src/presence.connect.ts
function connect(service, _normalize) {
  const { state, send, context } = service;
  const present = state.matches("mounted", "unmountSuspended");
  return {
    skip: !context.get("initial"),
    present,
    setNode(node) {
      if (!node) return;
      send({ type: "NODE.SET", node });
    },
    unmount() {
      send({ type: "UNMOUNT" });
    }
  };
}
export {
  connect
};
