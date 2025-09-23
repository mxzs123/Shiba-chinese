import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type AccountNavItem = {
  key: string;
  label: string;
  href: string;
  description?: string;
};

type AccountShellProps = {
  title: string;
  description?: string;
  navItems: readonly AccountNavItem[];
  activeItem: string;
  children: ReactNode;
};

export function AccountShell({
  title,
  description,
  navItems,
  activeItem,
  children,
}: AccountShellProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 lg:px-0">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-900">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm text-neutral-500">{description}</p>
        ) : null}
      </header>
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        <aside>
          <nav aria-label="个人中心导航" className="space-y-2">
            {navItems.map((item) => {
              const isActive = item.key === activeItem;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "block rounded-2xl border border-transparent bg-white px-4 py-3 transition hover:border-neutral-200 hover:bg-neutral-50",
                    isActive
                      ? "border-[#049e6b] bg-[#049e6b]/10 text-[#03583b]"
                      : "text-neutral-600",
                  )}
                  prefetch
                >
                  <div className="text-sm font-semibold">{item.label}</div>
                  {item.description ? (
                    <p className="mt-1 text-xs text-neutral-400">
                      {item.description}
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </aside>
        <section className="min-w-0 space-y-6">{children}</section>
      </div>
    </div>
  );
}

export default AccountShell;
