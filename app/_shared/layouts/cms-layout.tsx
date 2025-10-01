import type { ReactNode } from "react";

import Footer from "components/layout/footer";

export function CmsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="w-full">
        <div className="w-full max-w-2xl mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default CmsLayout;
