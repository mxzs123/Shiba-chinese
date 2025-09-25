import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { CartProvider } from "components/cart/cart-context";
import { Navbar } from "components/layout/navbar";
import { getCart } from "lib/api";

export async function DesktopAppLayout({ children }: { children: ReactNode }) {
  const cart = getCart();

  return (
    <CartProvider cartPromise={cart}>
      <Navbar />
      <main>
        {children}
        <Toaster closeButton />
      </main>
    </CartProvider>
  );
}

export default DesktopAppLayout;
