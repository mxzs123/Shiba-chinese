"use client";

import { useSearchParams } from "next/navigation";
import { Fragment, type ReactNode } from "react";

// Ensure children are re-rendered when the search query changes.
export function SearchChildrenWrapper({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  return <Fragment key={searchParams.get("q")}>{children}</Fragment>;
}

export default SearchChildrenWrapper;
