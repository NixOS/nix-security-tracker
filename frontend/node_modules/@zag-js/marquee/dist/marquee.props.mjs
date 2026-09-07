// src/marquee.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "autoFill",
  "defaultPaused",
  "delay",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "loopCount",
  "onComplete",
  "onLoopComplete",
  "onPauseChange",
  "paused",
  "pauseOnInteraction",
  "reverse",
  "side",
  "spacing",
  "speed",
  "translations"
]);
var splitProps = createSplitProps(props);
export {
  props,
  splitProps
};
