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
            className={`rounded ${styles.item}`}
          >
            {page.value}
          </PaginationItem>
        ) : (
          <PaginationEllipsis key={`ellipsis-${index}`} index={index} className="row centered">
            <EllipsisIcon size="1em" />
          </PaginationEllipsis>
        ),
      )}
    </>
  );
}

export function Pagination({ page, count, pageSize, onPageChange }: Props) {
  if (count <= pageSize) {
    return null;
  }

  return (
    <PaginationRoot
      count={count}
      pageSize={pageSize}
      page={page}
      onPageChange={(details) => onPageChange(details.page)}
      className="row gap-small stretched"
    >
      <PaginationPrevTrigger className="btn btn-gray row centered" aria-label="Previous page">
        <ChevronLeftIcon size="1em" />
      </PaginationPrevTrigger>
      <PaginationPages />
      <PaginationNextTrigger className="btn btn-gray row centered" aria-label="Next page">
        <ChevronRightIcon size="1em" />
      </PaginationNextTrigger>
    </PaginationRoot>
  );
}
