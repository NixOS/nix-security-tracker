import {
  PaginationEllipsis,
  PaginationItem,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
  usePaginationContext,
} from "@ark-ui/react";
import { ChevronLeftIcon, ChevronRightIcon, EllipsisIcon } from "lucide-preact";
import styles from "./Pagination.module.css";

type Props = {
  page: number;
  count: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Borderless previous/next controls sized to the text, e.g. to sit in a `BorderFrame` slot. */
  compact?: boolean;
  /** Id of the element naming this paginator, instead of the generic "pagination". */
  labelledBy?: string;
};

function PaginationPages() {
  const { pages } = usePaginationContext();

  return (
    <>
      {pages.map((page, index) =>
        page.type === "page" ? (
          <PaginationItem
            key={`page-${page.value}`}
            type="page"
            value={page.value}
            className={`btn-plain ${styles.page}`}
          >
            {page.value}
          </PaginationItem>
        ) : (
          <PaginationEllipsis key={`ellipsis-${index}`} index={index} className="row centered">
            <EllipsisIcon />
          </PaginationEllipsis>
        ),
      )}
    </>
  );
}

export function Pagination({
  page,
  count,
  pageSize,
  onPageChange,
  compact = false,
  labelledBy,
}: Props) {
  if (count <= pageSize) {
    return null;
  }

  const triggerClassName = compact
    ? "btn-plain text-black row centered"
    : "btn btn-gray row centered";
  const iconSize = compact ? "1.2em" : undefined;

  return (
    <PaginationRoot
      aria-labelledby={labelledBy}
      count={count}
      pageSize={pageSize}
      page={page}
      onPageChange={(details) => onPageChange(details.page)}
      className={`row stretched ${compact ? styles.compact : "gap-small"}`}
    >
      <PaginationPrevTrigger className={triggerClassName} aria-label="Previous page">
        <ChevronLeftIcon size={iconSize} />
      </PaginationPrevTrigger>
      <PaginationPages />
      <PaginationNextTrigger className={triggerClassName} aria-label="Next page">
        <ChevronRightIcon size={iconSize} />
      </PaginationNextTrigger>
    </PaginationRoot>
  );
}
