"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

export function AccountLink() {
  const pathname = usePathname();
  const isActive =
    pathname?.startsWith("/account") || pathname?.startsWith("/d/account");

  return (
    <Link
      href="/account"
      aria-label="个人中心"
      prefetch
      className="inline-flex"
    >
      <span
        className={cn(
          "group relative flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-[#049e6b] transition hover:border-[#049e6b]",
          isActive && "border-[#049e6b] bg-[#049e6b]/10",
        )}
      >
        <UserRound className="h-5 w-5 transition-transform duration-200 ease-in-out group-hover:scale-110" />
      </span>
    </Link>
  );
}

export default AccountLink;
