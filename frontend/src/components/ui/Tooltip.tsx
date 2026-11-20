import { Tooltip as ArkTooltip, Portal } from "@ark-ui/react";
import type { ComponentChild, ComponentChildren } from "preact";
import { cx } from "@/utils/className";

type TooltipProps = {
  content: ComponentChildren;
  children: ComponentChild;
  compact?: boolean;
};

export function Tooltip({ content, children, compact = false }: TooltipProps) {
  return (
    <ArkTooltip.Root openDelay={100} closeDelay={100} interactive>
      <ArkTooltip.Trigger asChild>{children}</ArkTooltip.Trigger>
      <Portal>
        <ArkTooltip.Positioner>
          <ArkTooltip.Content
            className={cx("rounded box border shadow bg-white", compact && "compact")}
          >
            {content}
          </ArkTooltip.Content>
        </ArkTooltip.Positioner>
      </Portal>
    </ArkTooltip.Root>
  );
}
