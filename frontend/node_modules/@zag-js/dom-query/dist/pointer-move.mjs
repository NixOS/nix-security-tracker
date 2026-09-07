import "./chunk-QZ7TP4HQ.mjs";

// src/pointer-move.ts
import { addDomEvent, getEventPoint } from "./event.mjs";
import { disableTextSelection } from "./text-selection.mjs";
function trackPointerMove(doc, handlers) {
  const { onPointerMove, onPointerUp } = handlers;
  const handleMove = (event) => {
    const point = getEventPoint(event);
    const distance = Math.sqrt(point.x ** 2 + point.y ** 2);
    const moveBuffer = event.pointerType === "touch" ? 10 : 5;
    if (distance < moveBuffer) return;
    if (event.pointerType === "mouse" && event.buttons === 0) {
      handleUp(event);
      return;
    }
    onPointerMove({ point, event });
  };
  const handleUp = (event) => {
    const point = getEventPoint(event);
    onPointerUp({ point, event });
  };
  const cleanups = [
    addDomEvent(doc, "pointermove", handleMove, false),
    addDomEvent(doc, "pointerup", handleUp, false),
    addDomEvent(doc, "pointercancel", handleUp, false),
    addDomEvent(doc, "contextmenu", handleUp, false),
    disableTextSelection({ doc })
  ];
  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}
export {
  trackPointerMove
};
