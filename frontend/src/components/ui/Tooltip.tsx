import { Tooltip as ArkTooltip, Portal } from "@ark-ui/react";
import type { ComponentChild, ComponentChildren } from "preact";
import { useState } from "preact/hooks";

type TooltipProps = {
  content: ComponentChildren;
  children: ComponentChild;
  compact?: boolean;
};

export function Tooltip({ content, children, compact = false }: TooltipProps) {
  const [open, setOpen] = useState(false);
  return (
    <ArkTooltip.Root
      openDelay={100}
      closeDelay={100}
      interactive
      open={open}
      onOpenChange={({ open }) => setOpen(open)}
      closeOnClick={false}
      closeOnPointerDown={false}
    >
      <ArkTooltip.Trigger asChild onClick={() => setOpen(!open)}>
        {children}
      </ArkTooltip.Trigger>
      <Portal>
        <ArkTooltip.Positioner>
          <ArkTooltip.Content
            className={`rounded box border shadow bg-white ${compact && "compact"}`}
          >
            {content}
          </ArkTooltip.Content>
        </ArkTooltip.Positioner>
      </Portal>
    </ArkTooltip.Root>
  );
}
