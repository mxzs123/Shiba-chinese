import type { ReactNode } from "react";

import Footer from "components/layout/footer";

export function CmsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="w-full">
        <div className="mx-8 max-w-2xl py-20 sm:mx-auto">{children}</div>
      </div>
      <Footer />
    </>
  );
}

export default CmsLayout;
