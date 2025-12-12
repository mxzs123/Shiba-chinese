"use client";

import Link from "next/link";
import { useEffect } from "react";

import OpenCart from "./open-cart";
import { createCartAndSetCookie } from "@/app/_shared/cart/actions";
import { useCart } from "@/components/cart/cart-context";

export function CartLink() {
  const { cart } = useCart();

  useEffect(() => {
    if (!cart) {
      createCartAndSetCookie();
    }
  }, [cart]);

  return (
    <Link href="/cart" aria-label="查看购物车" prefetch className="inline-flex">
      <OpenCart quantity={cart?.totalQuantity} />
    </Link>
  );
}

export default CartLink;
