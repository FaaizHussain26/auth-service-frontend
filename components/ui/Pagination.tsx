import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "./Button";
import { PageSizeSelect } from "./PageSizeSelect";
import type { PaginationMeta } from "@/lib/types";

export function Pagination({
  meta,
  onPageChange,
  limit,
  onLimitChange,
}: {
  meta: PaginationMeta | null | undefined;
  onPageChange: (page: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
}) {
  if (!meta || meta.total === 0) return null;

  const isFirstPage = meta.page <= 1;
  const isLastPage = meta.page >= meta.totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-border px-1 pt-4">
      {limit && onLimitChange ? <PageSizeSelect value={limit} onValueChange={onLimitChange} /> : <span />}

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          className="h-9 w-9 px-0"
          disabled={isFirstPage}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          className="h-9 w-9 px-0"
          disabled={isFirstPage}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="px-1 text-sm font-semibold text-ink-900">
          Page {meta.page} of {meta.totalPages}
        </p>
        <Button
          variant="secondary"
          className="h-9 w-9 px-0"
          disabled={isLastPage}
          onClick={() => onPageChange(meta.page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          className="h-9 w-9 px-0"
          disabled={isLastPage}
          onClick={() => onPageChange(meta.totalPages)}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
