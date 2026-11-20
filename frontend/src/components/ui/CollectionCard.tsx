import { ChevronsDownIcon, ChevronsUpIcon } from "lucide-preact";
import type { ComponentChildren } from "preact";
import { useId, useState } from "preact/hooks";
import { cx } from "@/utils/className";
import { BorderFrame } from "./BorderFrame";
import { FrameLegend } from "./FrameLegend";
import { HeightTransition } from "./HeightTransition";
import { InlineIcon } from "./InlineIcon";
import { Pagination } from "./Pagination";

/** Default number of items shown at once: before "Show more", or per page. */
const SHOWN_ITEMS = 10;

/** Default number of items up to which hybrid mode truncates rather than paginates. */
const MAX_TRUNCATED_ITEMS = 30;

/**
 * What the card does with items beyond those it shows at once.
 *
 * - `hybrid`: `truncate` up to `maxTruncatedItems` items (default 30), `paginate` beyond, both by `shownItems` (default 10)
 * - `truncate`: the first `shownItems` (default 10), then "Show more" / "Show less"
 * - `paginate`: pages of `pageSize` items (default 10) with a paginator
 */
export type CollectionOverflow =
  | { mode: "hybrid"; shownItems?: number; maxTruncatedItems?: number }
  | { mode: "truncate"; shownItems?: number }
  | { mode: "paginate"; pageSize?: number };

type ResolvedOverflow =
  | { mode: "none" }
  | { mode: "truncate"; shownItems: number }
  | { mode: "paginate"; pageSize: number };

/** The mode and parameters actually applied to a list of `count` items. */
function resolveOverflow(overflow: CollectionOverflow, count: number): ResolvedOverflow {
  switch (overflow.mode) {
    case "truncate": {
      const shownItems = overflow.shownItems ?? SHOWN_ITEMS;
      return count <= shownItems ? { mode: "none" } : { mode: "truncate", shownItems };
    }
    case "paginate": {
      const pageSize = overflow.pageSize ?? SHOWN_ITEMS;
      return count <= pageSize ? { mode: "none" } : { mode: "paginate", pageSize };
    }
    case "hybrid": {
      const shownItems = overflow.shownItems ?? SHOWN_ITEMS;
      const maxTruncatedItems = overflow.maxTruncatedItems ?? MAX_TRUNCATED_ITEMS;
      return resolveOverflow(
        count <= maxTruncatedItems
          ? { mode: "truncate", shownItems }
          : { mode: "paginate", pageSize: shownItems },
        count,
      );
    }
  }
}

type Props<T> = {
  items: readonly T[];
  /** Title in the top-left border */
  label: ComponentChildren;
  /** Top-right border legend, e.g. a view toggle. */
  viewToggle?: ComponentChildren;
  overflow?: CollectionOverflow;
  /** The items are themselves cards, whose legends this card's legends line up with. */
  containsCards?: boolean;
  testId?: string;
  /** Renders the items currently shown. */
  children: (shownItems: readonly T[]) => ComponentChildren;
  /** Shown after the items, outside of pagination (e.g. a form to add an item). */
  footer?: ComponentChildren;
};

type ShowMoreButtonProps = {
  expanded: boolean;
  /** Id of the element whose content the button expands. */
  controls: string;
  /** Items not shown while collapsed. */
  hiddenCount: number;
  onToggle: () => void;
};

function ShowMoreButton({ expanded, controls, hiddenCount, onToggle }: ShowMoreButtonProps) {
  return (
    <button
      type="button"
      className={cx("btn-plain", !expanded && "text-black")}
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onToggle}
    >
      <InlineIcon icon={expanded ? ChevronsUpIcon : ChevronsDownIcon} />
      {expanded ? "Show less" : `Show more (${hiddenCount})`}
    </button>
  );
}

/**
 * Light frame around a collection, with a title and an optional view toggle in its border.
 * Items beyond those shown at once are reachable through a control in the bottom border, depending on `overflow`.
 */
export function CollectionCard<T>({
  items,
  label,
  viewToggle,
  overflow = { mode: "hybrid" },
  containsCards = false,
  testId,
  children,
  footer,
}: Props<T>) {
  // Kept whatever the mode, so that a list crossing a threshold just switches mode.
  const [expanded, setExpanded] = useState(false);
  const [requestedPage, setPage] = useState(1);
  const titleId = useId();
  const itemsId = useId();

  const resolved = resolveOverflow(overflow, items.length);

  let shownItems = items;
  let page = requestedPage;
  if (resolved.mode === "truncate" && !expanded) {
    shownItems = items.slice(0, resolved.shownItems);
  } else if (resolved.mode === "paginate") {
    // When items go away, the page is clamped to the new last page.
    page = Math.min(requestedPage, Math.ceil(items.length / resolved.pageSize));
    shownItems = items.slice((page - 1) * resolved.pageSize, page * resolved.pageSize);
  }

  return (
    <BorderFrame
      as="section"
      border={containsCards ? "dashed" : "solid"}
      rounded
      alignSlotsWithNested={containsCards}
      labelledBy={titleId}
      topLeft={
        <FrameLegend as="h2" id={titleId}>
          {label}
        </FrameLegend>
      }
      topRight={viewToggle}
      bottomLeft={
        (resolved.mode === "truncate" && (
          <ShowMoreButton
            expanded={expanded}
            controls={itemsId}
            hiddenCount={items.length - resolved.shownItems}
            onToggle={() => setExpanded(!expanded)}
          />
        )) ||
        (resolved.mode === "paginate" && (
          <Pagination
            page={page}
            count={items.length}
            pageSize={resolved.pageSize}
            onPageChange={setPage}
            labelledBy={titleId}
            compact
          />
        ))
      }
      testId={testId}
    >
      <HeightTransition id={itemsId} trigger={expanded}>
        {children(shownItems)}
      </HeightTransition>
      {footer}
    </BorderFrame>
  );
}
