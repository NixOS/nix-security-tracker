// src/file-upload.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "accept",
  "acceptedFiles",
  "allowDrop",
  "capture",
  "defaultAcceptedFiles",
  "dir",
  "directory",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "locale",
  "maxFiles",
  "maxFileSize",
  "minFileSize",
  "name",
  "onFileAccept",
  "onFileChange",
  "onFileReject",
  "preventDocumentDrop",
  "readOnly",
  "required",
  "transformFiles",
  "translations",
  "validate"
]);
var splitProps = createSplitProps(props);
var itemProps = createProps()(["file", "type"]);
var splitItemProps = createSplitProps(itemProps);
export {
  itemProps,
  props,
  splitItemProps,
  splitProps
};
