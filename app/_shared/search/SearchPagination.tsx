import Link from "next/link";

import { createUrl } from "lib/utils";

import { createSearchParams } from "./utils";

export type SearchPaginationProps = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  searchValue?: string;
  sort?: string | null;
};

function createPageHref({
  basePath,
  page,
  searchValue,
  sort,
}: {
  basePath: string;
  page: number;
  searchValue?: string;
  sort?: string | null;
}) {
  const params = createSearchParams({
    ...(searchValue ? { q: searchValue } : null),
    ...(sort ? { sort } : null),
    ...(page > 1 ? { page } : null),
  });

  return createUrl(basePath, params);
}

function createPageRange(current: number, total: number, max = 5) {
  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, start + max - 1);

  if (end - start + 1 < max) {
    start = Math.max(1, end - max + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function SearchPagination({
  basePath,
  currentPage,
  totalPages,
  searchValue,
  sort,
}: SearchPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = createPageRange(currentPage, totalPages);

  return (
    <nav
      aria-label="搜索结果分页"
      className="flex items-center justify-between gap-4 border-t border-neutral-200 pt-6"
    >
      <Link
        href={createPageHref({
          basePath,
          page: Math.max(currentPage - 1, 1),
          searchValue,
          sort,
        })}
        aria-disabled={currentPage === 1}
        className="flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:border-neutral-300 aria-disabled:pointer-events-none aria-disabled:opacity-50"
      >
        上一页
      </Link>

      <ul className="flex items-center gap-2">
        {pages.map((pageNumber) => {
          const isActive = pageNumber === currentPage;
          return (
            <li key={pageNumber}>
              <Link
                href={createPageHref({
                  basePath,
                  page: pageNumber,
                  searchValue,
                  sort,
                })}
                aria-current={isActive ? "page" : undefined}
                className="flex size-9 items-center justify-center rounded-full border border-transparent text-sm font-medium transition hover:border-neutral-300 aria-[current=page]:border-[#049e6b] aria-[current=page]:bg-[#049e6b]/10 aria-[current=page]:text-[#049e6b]"
              >
                {pageNumber}
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href={createPageHref({
          basePath,
          page: Math.min(currentPage + 1, totalPages),
          searchValue,
          sort,
        })}
        aria-disabled={currentPage === totalPages}
        className="flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:border-neutral-300 aria-disabled:pointer-events-none aria-disabled:opacity-50"
      >
        下一页
      </Link>
    </nav>
  );
}

export default SearchPagination;
