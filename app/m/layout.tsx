import type { ReactNode } from "react";

import { MobileAppLayout } from "@/app/_shared/layouts/mobile-app-layout";

export default async function MobileLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <MobileAppLayout>{children}</MobileAppLayout>;
}
