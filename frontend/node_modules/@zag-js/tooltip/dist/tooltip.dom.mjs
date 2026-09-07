// src/tooltip.dom.ts
import { getByOwnerId, queryAll } from "@zag-js/dom-query";
import { isFunction } from "@zag-js/utils";
var getTriggerId = (scope, value) => {
  const customId = scope.ids?.trigger;
  if (customId != null) return isFunction(customId) ? customId(value) : customId;
  return value ? `tooltip:${scope.id}:trigger:${value}` : `tooltip:${scope.id}:trigger`;
};
var getContentId = (scope) => scope.ids?.content ?? `tooltip:${scope.id}:content`;
var getArrowId = (scope) => scope.ids?.arrow ?? `tooltip:${scope.id}:arrow`;
var getPositionerId = (scope) => scope.ids?.positioner ?? `tooltip:${scope.id}:popper`;
var getTriggerEl = (scope) => scope.getById(getTriggerId(scope));
var getContentEl = (scope) => scope.getById(getContentId(scope));
var getPositionerEl = (scope) => scope.getById(getPositionerId(scope));
var getArrowEl = (scope) => scope.getById(getArrowId(scope));
var getTriggerEls = (scope) => queryAll(scope.getRootNode(), `[data-scope="tooltip"][data-part="trigger"]${getByOwnerId(scope.id)}`);
var getActiveTriggerEl = (scope, value) => {
  if (value == null) {
    return getTriggerEl(scope) ?? getTriggerEls(scope)[0];
  }
  return scope.getById(getTriggerId(scope, value));
};
export {
  getActiveTriggerEl,
  getArrowEl,
  getArrowId,
  getContentEl,
  getContentId,
  getPositionerEl,
  getPositionerId,
  getTriggerEl,
  getTriggerEls,
  getTriggerId
};
