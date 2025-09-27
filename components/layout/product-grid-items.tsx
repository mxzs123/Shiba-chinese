import clsx from "clsx";
import Grid from "components/grid";
import type { Product } from "lib/api/types";

import { ProductCard, ProductCardQuickAdd } from "@/app/_shared";

export default function ProductGridItems({
  products,
  animate = true,
  showQuickAdd = false,
}: {
  products: Product[];
  animate?: boolean;
  showQuickAdd?: boolean;
}) {
  return (
    <>
      {products.map((product) => (
        <Grid.Item
          key={product.handle}
          className={clsx(animate ? "animate-fadeIn" : undefined)}
        >
          <ProductCard
            product={product}
            actionSlot={
              showQuickAdd ? (
                <ProductCardQuickAdd product={product} />
              ) : undefined
            }
          />
        </Grid.Item>
      ))}
    </>
  );
}
