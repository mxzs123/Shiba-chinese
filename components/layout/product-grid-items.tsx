import clsx from "clsx";
import Grid from "components/grid";
import type { Product } from "lib/api/types";

import { ProductCard } from "@/app/_shared/ProductCard";

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
          <ProductCard product={product} />
        </Grid.Item>
      ))}
    </>
  );
}
