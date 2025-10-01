"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3x3, ShoppingCart, User } from "lucide-react";

import { useCart } from "components/cart/cart-context";
import { CartBadge } from "app/_shared";
import { cn } from "lib/utils";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/categories", label: "分类", icon: Grid3x3 },
  { href: "/cart", label: "购物车", icon: ShoppingCart },
  { href: "/account", label: "我的", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const normalizedPathname =
    pathname?.replace(/^\/(m|d)(?=\/)/, "") ?? pathname ?? "";
  const { cart } = useCart();
  const cartQuantity = cart?.totalQuantity ?? 0;

  if (normalizedPathname.startsWith("/product/")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
      <div className="grid h-16 grid-cols-4">
        {navItems.map((item) => {
          const isActive =
            normalizedPathname === item.href ||
            (item.href !== "/" &&
              normalizedPathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          const isCart = item.href === "/cart";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-neutral-500 hover:text-neutral-900",
              )}
            >
              <div className="relative">
                <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                {isCart && cartQuantity > 0 ? (
                  <CartBadge
                    quantity={cartQuantity}
                    className="absolute -right-2 -top-2 border-2 border-white"
                  />
                ) : null}
              </div>
              <span className={cn("text-xs", isActive && "font-semibold")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
