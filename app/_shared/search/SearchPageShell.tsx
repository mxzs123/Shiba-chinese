import type { ReactNode } from "react";

import { DesktopSearchSidebar } from "./DesktopSearchSidebar";
import type { DesktopSearchSidebarProps } from "./DesktopSearchSidebar";
export type SearchPageShellProps = {
  sidebar: DesktopSearchSidebarProps;
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
};

export function SearchPageShell({
  sidebar,
  children,
  header,
  footer,
}: SearchPageShellProps) {
  return (
    <div className="flex flex-col gap-6 md:sticky md:top-28 md:h-[calc(100vh-8rem)] md:overflow-hidden md:flex-row md:gap-10">
      <div className="md:w-[260px] md:flex-none md:h-full md:min-h-0">
        <DesktopSearchSidebar {...sidebar} />
      </div>
      <div className="flex-1 md:h-full md:min-h-0 md:overflow-y-auto overscroll-contain space-y-6">
        {header}
        {children}
        {footer}
      </div>
    </div>
  );
}

export default SearchPageShell;
