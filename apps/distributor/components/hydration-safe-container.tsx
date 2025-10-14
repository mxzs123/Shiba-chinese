"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface HydrationSafeContainerProps {
  className: string;
  children: ReactNode;
}

export function HydrationSafeContainer({
  className,
  children,
}: HydrationSafeContainerProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = nodeRef.current;
    if (!element) {
      return;
    }

    // Extensions occasionally override the root container and inline styles before hydration.
    // Re-apply the expected class list and strip unexpected inline styles so React reconciles cleanly.
    element.className = className;
    if (element.hasAttribute("style")) {
      element.removeAttribute("style");
    }
  }, [className]);

  return (
    <div
      ref={nodeRef}
      suppressHydrationWarning
      data-hydration-safe
      className={className}
    >
      {children}
    </div>
  );
}
