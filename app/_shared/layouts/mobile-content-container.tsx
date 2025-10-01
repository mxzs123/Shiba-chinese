import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function MobileContentContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-2xl px-4 pb-6 pt-6 sm:px-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default MobileContentContainer;
