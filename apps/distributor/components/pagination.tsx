"use client";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const handlePrev = () => {
    if (canPrev) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (canNext) onPageChange(page + 1);
  };

  return (
    <div className="flex items-center justify-between gap-4 text-sm text-neutral-600">
      <p>
        第 <span className="font-semibold text-neutral-900">{page}</span> 页，共{" "}
        <span className="font-semibold text-neutral-900">{totalPages}</span> 页
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={!canPrev}
          className="rounded-md border border-neutral-200 px-3 py-1.5 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-neutral-300 hover:bg-neutral-50"
        >
          上一页
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canNext}
          className="rounded-md border border-neutral-200 px-3 py-1.5 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 hover:border-neutral-300 hover:bg-neutral-50"
        >
          下一页
        </button>
      </div>
    </div>
  );
}
