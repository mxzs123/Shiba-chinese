import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import type { Product } from "lib/api/types";

export type SearchResultsGridProps = {
  products: Product[];
  emptyMessage?: string;
};

export function SearchResultsGrid({
  products,
  emptyMessage,
}: SearchResultsGridProps) {
  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-200 p-12 text-center text-sm text-neutral-500">
        {emptyMessage || "暂无搜索结果"}
      </div>
    );
  }

  return (
    <Grid className="grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ProductGridItems
        products={products}
        animate={false}
        showQuickAdd
      />
    </Grid>
  );
}

export default SearchResultsGrid;
