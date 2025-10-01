"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "lib/utils";

type MobileBackButtonProps = {
  className?: string;
};

export function MobileBackButton({ className }: MobileBackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.back();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="返回上一页"
      className={cn(
        "absolute left-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur",
        "transition hover:bg-black/55 active:scale-95",
        className,
      )}
    >
      <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
    </button>
  );
}

export default MobileBackButton;
