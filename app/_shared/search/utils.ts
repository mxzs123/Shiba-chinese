import { defaultSort, sorting } from "lib/constants";

export function resolveSort(sortSlug?: string | null) {
  if (!sortSlug) {
    return defaultSort;
  }

  const matched = sorting.find((item) => item.slug === sortSlug);
  return matched || defaultSort;
}

export function parsePageParam(value?: string | null) {
  if (!value) {
    return 1;
  }

  const page = Number.parseInt(value, 10);
  if (Number.isNaN(page) || page < 1) {
    return 1;
  }

  return page;
}

export function createSearchParams(
  params: Record<string, string | number | undefined | null>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, rawValue]) => {
    if (rawValue === undefined || rawValue === null || rawValue === "") {
      return;
    }

    searchParams.set(key, String(rawValue));
  });

  return searchParams;
}
