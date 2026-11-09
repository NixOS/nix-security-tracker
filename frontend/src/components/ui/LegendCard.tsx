import type { ComponentChildren } from "preact";
import { BorderFrame } from "./BorderFrame";
import { FrameLegend } from "./FrameLegend";

type Props = {
  /** Left border-legend content (e.g. a permalink and external link). */
  legend: ComponentChildren;
  /** Right border-legend content (e.g. a compact view-mode toggle). */
  viewToggle: ComponentChildren;
  /** Purely visual: dashed instead of solid border, e.g. for dimmed/filtered-out items. */
  dashed?: boolean;
  testId?: string;
  /** Accessible description of the card, e.g. why it is dashed. */
  description?: string;
  children: ComponentChildren;
};

/**
 * Card with a left legend breaking the top border (e.g. a permalink) and a right legend holding a compact view-mode toggle.
 * Shared by `Suggestion` and `Issue`.
 */
export function LegendCard({
  legend,
  viewToggle,
  dashed = false,
  testId,
  description,
  children,
}: Props) {
  return (
    <BorderFrame
      as="article"
      topLeft={
        <FrameLegend as="div">
          <div className="row gap-small">{legend}</div>
        </FrameLegend>
      }
      topRight={viewToggle}
      border={dashed ? "dashed" : "solid"}
      shadow={!dashed}
      rounded
      testId={testId}
      description={description}
    >
      <div>{children}</div>
    </BorderFrame>
  );
}
