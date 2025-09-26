import clsx from "clsx";
import Grid from "components/grid";
import type { Product } from "lib/api/types";

import { ProductCard, ProductCardQuickAdd } from "@/app/_shared";

export default function ProductGridItems({
  products,
  animate = true,
}: {
  products: Product[];
  animate?: boolean;
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
            actionSlot={<ProductCardQuickAdd product={product} />}
          />
        </Grid.Item>
      ))}
    </>
  );
}
