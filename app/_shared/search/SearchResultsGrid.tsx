import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import type { Product } from "lib/api/types";

export type SearchResultsGridProps = {
  items: Product[];
  emptyMessage?: string;
};

export function SearchResultsGrid({
  items,
  emptyMessage,
}: SearchResultsGridProps) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-200 p-12 text-center text-sm text-neutral-500">
        {emptyMessage || "暂无搜索结果"}
      </div>
    );
  }

  return (
    <Grid className="grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ProductGridItems products={items} animate={false} showQuickAdd />
    </Grid>
  );
}

export default SearchResultsGrid;
