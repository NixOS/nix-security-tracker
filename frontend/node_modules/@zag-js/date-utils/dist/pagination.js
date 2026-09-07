"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/pagination.ts
var pagination_exports = {};
__export(pagination_exports, {
  getAdjustedDateFn: () => getAdjustedDateFn,
  getNextPage: () => getNextPage,
  getNextRow: () => getNextRow,
  getNextSection: () => getNextSection,
  getPreviousPage: () => getPreviousPage,
  getPreviousRow: () => getPreviousRow,
  getPreviousSection: () => getPreviousSection,
  getSectionEnd: () => getSectionEnd,
  getSectionStart: () => getSectionStart
});
module.exports = __toCommonJS(pagination_exports);
var import_date = require("@internationalized/date");
var import_assertion = require("./assertion.js");
var import_constrain = require("./constrain.js");
var import_duration = require("./duration.js");
function getAdjustedDateFn(visibleDuration, locale, minValue, maxValue) {
  return function getDate(options) {
    const { startDate, focusedDate } = options;
    const endDate = (0, import_duration.getEndDate)(startDate, visibleDuration);
    if ((0, import_assertion.isDateOutsideRange)(focusedDate, minValue, maxValue)) {
      return {
        startDate,
        focusedDate: (0, import_constrain.constrainValue)(focusedDate, minValue, maxValue),
        endDate
      };
    }
    if (focusedDate.compare(startDate) < 0) {
      return {
        startDate: (0, import_constrain.alignEnd)(focusedDate, visibleDuration, locale, minValue, maxValue),
        focusedDate: (0, import_constrain.constrainValue)(focusedDate, minValue, maxValue),
        endDate
      };
    }
    if (focusedDate.compare(endDate) > 0) {
      return {
        startDate: (0, import_constrain.alignStart)(focusedDate, visibleDuration, locale, minValue, maxValue),
        endDate,
        focusedDate: (0, import_constrain.constrainValue)(focusedDate, minValue, maxValue)
      };
    }
    return {
      startDate,
      endDate,
      focusedDate: (0, import_constrain.constrainValue)(focusedDate, minValue, maxValue)
    };
  };
}
function getNextPage(focusedDate, startDate, visibleDuration, locale, minValue, maxValue) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue);
  const start = startDate.add(visibleDuration);
  return adjust({
    focusedDate: focusedDate.add(visibleDuration),
    startDate: (0, import_constrain.alignStart)(
      (0, import_constrain.constrainStart)(focusedDate, start, visibleDuration, locale, minValue, maxValue),
      visibleDuration,
      locale
    )
  });
}
function getPreviousPage(focusedDate, startDate, visibleDuration, locale, minValue, maxValue) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue);
  let start = startDate.subtract(visibleDuration);
  return adjust({
    focusedDate: focusedDate.subtract(visibleDuration),
    startDate: (0, import_constrain.alignStart)(
      (0, import_constrain.constrainStart)(focusedDate, start, visibleDuration, locale, minValue, maxValue),
      visibleDuration,
      locale
    )
  });
}
function getNextRow(focusedDate, startDate, visibleDuration, locale, minValue, maxValue) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue);
  if (visibleDuration.days) {
    return getNextPage(focusedDate, startDate, visibleDuration, locale, minValue, maxValue);
  }
  if (visibleDuration.weeks || visibleDuration.months || visibleDuration.years) {
    return adjust({
      focusedDate: focusedDate.add({ weeks: 1 }),
      startDate
    });
  }
}
function getPreviousRow(focusedDate, startDate, visibleDuration, locale, minValue, maxValue) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue);
  if (visibleDuration.days) {
    return getPreviousPage(focusedDate, startDate, visibleDuration, locale, minValue, maxValue);
  }
  if (visibleDuration.weeks || visibleDuration.months || visibleDuration.years) {
    return adjust({
      focusedDate: focusedDate.subtract({ weeks: 1 }),
      startDate
    });
  }
}
function getSectionStart(focusedDate, startDate, visibleDuration, locale, minValue, maxValue) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue);
  if (visibleDuration.days) {
    return adjust({
      focusedDate: startDate,
      startDate
    });
  }
  if (visibleDuration.weeks) {
    return adjust({
      focusedDate: (0, import_date.startOfWeek)(focusedDate, locale),
      startDate
    });
  }
  if (visibleDuration.months || visibleDuration.years) {
    return adjust({
      focusedDate: (0, import_date.startOfMonth)(focusedDate),
      startDate
    });
  }
}
function getSectionEnd(focusedDate, startDate, visibleDuration, locale, minValue, maxValue) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue);
  const endDate = (0, import_duration.getEndDate)(startDate, visibleDuration);
  if (visibleDuration.days) {
    return adjust({
      focusedDate: endDate,
      startDate
    });
  }
  if (visibleDuration.weeks) {
    return adjust({
      focusedDate: (0, import_date.endOfWeek)(focusedDate, locale),
      startDate
    });
  }
  if (visibleDuration.months || visibleDuration.years) {
    return adjust({
      focusedDate: (0, import_date.endOfMonth)(focusedDate),
      startDate
    });
  }
}
function getNextSection(focusedDate, startDate, larger, visibleDuration, locale, minValue, maxValue) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue);
  if (!larger && !visibleDuration.days) {
    return adjust({
      focusedDate: focusedDate.add((0, import_duration.getUnitDuration)(visibleDuration)),
      startDate
    });
  }
  if (visibleDuration.days) {
    return getNextPage(focusedDate, startDate, visibleDuration, locale, minValue, maxValue);
  }
  if (visibleDuration.weeks) {
    return adjust({
      focusedDate: focusedDate.add({ months: 1 }),
      startDate
    });
  }
  if (visibleDuration.months || visibleDuration.years) {
    return adjust({
      focusedDate: focusedDate.add({ years: 1 }),
      startDate
    });
  }
}
function getPreviousSection(focusedDate, startDate, larger, visibleDuration, locale, minValue, maxValue) {
  const adjust = getAdjustedDateFn(visibleDuration, locale, minValue, maxValue);
  if (!larger && !visibleDuration.days) {
    return adjust({
      focusedDate: focusedDate.subtract((0, import_duration.getUnitDuration)(visibleDuration)),
      startDate
    });
  }
  if (visibleDuration.days) {
    return getPreviousPage(focusedDate, startDate, visibleDuration, locale, minValue, maxValue);
  }
  if (visibleDuration.weeks) {
    return adjust({
      focusedDate: focusedDate.subtract({ months: 1 }),
      startDate
    });
  }
  if (visibleDuration.months || visibleDuration.years) {
    return adjust({
      focusedDate: focusedDate.subtract({ years: 1 }),
      startDate
    });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getAdjustedDateFn,
  getNextPage,
  getNextRow,
  getNextSection,
  getPreviousPage,
  getPreviousRow,
  getPreviousSection,
  getSectionEnd,
  getSectionStart
});
