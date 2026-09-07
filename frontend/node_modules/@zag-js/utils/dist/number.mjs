import "./chunk-MXGZDBDQ.mjs";

// src/number.ts
var { floor, abs, round, min, max, pow, sign } = Math;
var isNaN = (v) => Number.isNaN(v);
var nan = (v) => isNaN(v) ? 0 : v;
var mod = (v, m) => (v % m + m) % m;
var wrap = (v, vmax) => (v % vmax + vmax) % vmax;
var getMinValueAtIndex = (i, v, vmin) => i === 0 ? vmin : v[i - 1];
var getMaxValueAtIndex = (i, v, vmax) => i === v.length - 1 ? vmax : v[i + 1];
var isValueAtMax = (v, vmax) => nan(v) >= vmax;
var isValueAtMin = (v, vmin) => nan(v) <= vmin;
var isValueWithinRange = (v, vmin, vmax) => {
  const value = nan(v);
  const minCheck = vmin == null || value >= vmin;
  const maxCheck = vmax == null || value <= vmax;
  return minCheck && maxCheck;
};
var roundValue = (v, vmin, step) => round((nan(v) - vmin) / step) * step + vmin;
var clampValue = (v, vmin, vmax) => min(max(nan(v), vmin), vmax);
var clampPercent = (v) => clampValue(v, 0, 1);
var getValuePercent = (v, vmin, vmax) => (nan(v) - vmin) / (vmax - vmin);
var getPercentValue = (p, vmin, vmax, step) => clampValue(roundValue(p * (vmax - vmin) + vmin, vmin, step), vmin, vmax);
var roundToStepPrecision = (v, step) => {
  let rv = v;
  let ss = step.toString();
  let pi = ss.indexOf(".");
  let p = pi >= 0 ? ss.length - pi : 0;
  if (p > 0) {
    let pw = pow(10, p);
    rv = round(rv * pw) / pw;
  }
  return rv;
};
var roundToDpr = (v, dpr) => typeof dpr === "number" ? floor(v * dpr + 0.5) / dpr : round(v);
var snapValueToStep = (v, vmin, vmax, step) => {
  const min2 = vmin != null ? Number(vmin) : 0;
  const max2 = Number(vmax);
  const remainder = (v - min2) % step;
  let snapped = abs(remainder) * 2 >= step ? v + sign(remainder) * (step - abs(remainder)) : v - remainder;
  snapped = roundToStepPrecision(snapped, step);
  if (!isNaN(min2) && snapped < min2) {
    snapped = min2;
  } else if (!isNaN(max2) && snapped > max2) {
    const stepsInRange = floor((max2 - min2) / step);
    const largestValidStep = min2 + stepsInRange * step;
    snapped = stepsInRange <= 0 || largestValidStep < min2 ? max2 : largestValidStep;
  }
  return roundToStepPrecision(snapped, step);
};
var setValueAtIndex = (vs, i, v) => {
  if (vs[i] === v) return vs;
  return [...vs.slice(0, i), v, ...vs.slice(i + 1)];
};
function getValueSetterAtIndex(index, ctx) {
  const minValueAtIndex = getMinValueAtIndex(index, ctx.values, ctx.min);
  const maxValueAtIndex = getMaxValueAtIndex(index, ctx.values, ctx.max);
  let nextValues = ctx.values.slice();
  return function setValue(value) {
    let nextValue = snapValueToStep(value, minValueAtIndex, maxValueAtIndex, ctx.step);
    nextValues = setValueAtIndex(nextValues, index, value);
    nextValues[index] = nextValue;
    return nextValues;
  };
}
function getNextStepValue(index, ctx) {
  const nextValue = ctx.values[index] + ctx.step;
  return getValueSetterAtIndex(index, ctx)(nextValue);
}
function getPreviousStepValue(index, ctx) {
  const nextValue = ctx.values[index] - ctx.step;
  return getValueSetterAtIndex(index, ctx)(nextValue);
}
var getClosestValueIndex = (vs, t) => {
  let i = vs.findIndex((v) => t - v < 0);
  if (i === 0) return i;
  if (i === -1) return vs.length - 1;
  let vLeft = vs[i - 1];
  let vRight = vs[i];
  if (abs(vLeft - t) < abs(vRight - t)) return i - 1;
  return i;
};
var getClosestValue = (vs, t) => vs[getClosestValueIndex(vs, t)];
var getValueRanges = (vs, vmin, vmax, gap) => vs.map((v, i) => ({
  min: i === 0 ? vmin : vs[i - 1] + gap,
  max: i === vs.length - 1 ? vmax : vs[i + 1] - gap,
  value: v
}));
var getValueTransformer = (va, vb) => {
  const [a, b] = va;
  const [c, d] = vb;
  return (v) => a === b || c === d ? c : c + (d - c) / (b - a) * (v - a);
};
var toFixedNumber = (v, d = 0, b = 10) => {
  const pow2 = Math.pow(b, d);
  return round(v * pow2) / pow2;
};
var countDecimals = (value) => {
  if (!Number.isFinite(value)) return 0;
  let e = 1, p = 0;
  while (Math.round(value * e) / e !== value) {
    e *= 10;
    p += 1;
  }
  return p;
};
var decimalOp = (a, op, b) => {
  let result = op === "+" ? a + b : a - b;
  if (a % 1 !== 0 || b % 1 !== 0) {
    const multiplier = 10 ** Math.max(countDecimals(a), countDecimals(b));
    a = Math.round(a * multiplier);
    b = Math.round(b * multiplier);
    result = op === "+" ? a + b : a - b;
    result /= multiplier;
  }
  return result;
};
var incrementValue = (v, s) => decimalOp(nan(v), "+", s);
var decrementValue = (v, s) => decimalOp(nan(v), "-", s);
var toPx = (v) => typeof v === "number" ? `${v}px` : v;
export {
  clampPercent,
  clampValue,
  decrementValue,
  getClosestValue,
  getClosestValueIndex,
  getMaxValueAtIndex,
  getMinValueAtIndex,
  getNextStepValue,
  getPercentValue,
  getPreviousStepValue,
  getValuePercent,
  getValueRanges,
  getValueSetterAtIndex,
  getValueTransformer,
  incrementValue,
  isNaN,
  isValueAtMax,
  isValueAtMin,
  isValueWithinRange,
  mod,
  nan,
  roundToDpr,
  roundToStepPrecision,
  roundValue,
  setValueAtIndex,
  snapValueToStep,
  toFixedNumber,
  toPx,
  wrap
};
