import type { ReactNode } from "react";

import { DesktopAppLayout } from "@/app/_shared/layouts/desktop-app-layout";

export default async function DesktopLayout({
  children,
}: {
  children: ReactNode;
}) {
  return DesktopAppLayout({ children });
}
