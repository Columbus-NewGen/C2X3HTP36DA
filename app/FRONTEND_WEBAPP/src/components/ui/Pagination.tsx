import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const delta = 1;
  const pages: (number | string)[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  const startItem =
    totalItems !== undefined && pageSize !== undefined
      ? (currentPage - 1) * pageSize + 1
      : null;

  const endItem =
    totalItems !== undefined && pageSize !== undefined
      ? Math.min(currentPage * pageSize, totalItems)
      : null;

  const handleChange = (p: number) => {
    if (p < 1 || p > totalPages) return;
    onPageChange(p);
  };

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={`flex items-center justify-between gap-3 py-3 ${className}`}
    >
      {/* Result summary */}
      {startItem !== null && endItem !== null && totalItems !== undefined ? (
        <p className="text-xs text-gray-500">
          <span className="font-medium text-gray-900">
            {startItem}–{endItem}
          </span>{" "}
          of {totalItems}
        </p>
      ) : (
        <div />
      )}

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-xs text-gray-400"
              >
                …
              </span>
            );
          }

          const pageNum = p as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => handleChange(pageNum)}
              aria-current={isActive ? "page" : undefined}
              className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-medium transition ${
                isActive
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => handleChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="h-8 w-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
