"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { WorkspaceNavItem } from "./workspace-shell";

interface WorkspaceNavProps {
  items: WorkspaceNavItem[];
  orientation?: "vertical" | "horizontal";
  className?: string;
}

function buildClassName(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}

export function WorkspaceNav({
  items,
  orientation = "vertical",
  className,
}: WorkspaceNavProps) {
  const pathname = usePathname();

  const containerClasses =
    orientation === "vertical"
      ? "flex flex-col gap-1"
      : "flex items-center gap-2 overflow-x-auto";

  return (
    <nav className={buildClassName(containerClasses, className)}>
      {items.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        const linkBase =
          orientation === "vertical"
            ? "block rounded-md px-3 py-2 text-sm font-medium transition"
            : "rounded-full px-3 py-1.5 text-sm font-medium transition";

        const linkClasses = isActive
          ? `${linkBase} bg-primary/10 text-primary`
          : `${linkBase} text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900`;

        return (
          <Link key={item.href} href={item.href} className={linkClasses}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
