// src/pagination.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "boundaryCount",
  "count",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "onPageChange",
  "onPageSizeChange",
  "page",
  "defaultPage",
  "pageSize",
  "defaultPageSize",
  "siblingCount",
  "translations",
  "type",
  "getPageUrl"
]);
var splitProps = createSplitProps(props);
var itemProps = createProps()(["value", "type"]);
var splitItemProps = createSplitProps(itemProps);
var ellipsisProps = createProps()(["index"]);
var splitEllipsisProps = createSplitProps(ellipsisProps);
export {
  ellipsisProps,
  itemProps,
  props,
  splitEllipsisProps,
  splitItemProps,
  splitProps
};
