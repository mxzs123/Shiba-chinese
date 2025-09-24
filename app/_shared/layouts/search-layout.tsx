import type { ReactNode } from "react";

import Footer from "components/layout/footer";

export function SearchLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 pb-10 pt-6">
        {children}
      </div>
      <Footer />
    </>
  );
}

export default SearchLayout;
