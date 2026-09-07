// src/placement.ts
function isValidPlacement(v) {
  return /^(?:top|bottom|left|right)(?:-(?:start|end))?$/.test(v);
}
function getPlacementDetails(placement) {
  const [side, align] = placement.split("-");
  return { side, align, hasAlign: align != null };
}
function getPlacementSide(placement) {
  return placement.split("-")[0];
}
export {
  getPlacementDetails,
  getPlacementSide,
  isValidPlacement
};
