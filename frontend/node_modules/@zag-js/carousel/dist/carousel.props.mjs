// src/carousel.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "dir",
  "getRootNode",
  "id",
  "ids",
  "loop",
  "page",
  "defaultPage",
  "onPageChange",
  "orientation",
  "slideCount",
  "slidesPerPage",
  "slidesPerMove",
  "spacing",
  "padding",
  "autoplay",
  "allowMouseDrag",
  "inViewThreshold",
  "translations",
  "snapType",
  "autoSize",
  "onDragStatusChange",
  "onAutoplayStatusChange"
]);
var splitProps = createSplitProps(props);
var indicatorProps = createProps()(["index", "readOnly"]);
var splitIndicatorProps = createSplitProps(indicatorProps);
var itemProps = createProps()(["index", "snapAlign"]);
var splitItemProps = createSplitProps(itemProps);
export {
  indicatorProps,
  itemProps,
  props,
  splitIndicatorProps,
  splitItemProps,
  splitProps
};
