import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { CartProvider } from "components/cart/cart-context";
import { Navbar } from "components/layout/navbar";
import { PrescriptionComplianceReminder } from "components/prescription/PrescriptionComplianceReminder";
import { getCart, getCurrentUser, getUserById } from "lib/api";
import {
  IDENTITY_HIGHLIGHT_HREF,
  SURVEY_HIGHLIGHT_HREF,
  loadPrescriptionReviewState,
} from "lib/prescription";

export async function DesktopAppLayout({ children }: { children: ReactNode }) {
  const cart = getCart();
  const [sessionUser, fallbackUser] = await Promise.all([
    getCurrentUser(),
    getUserById("user-demo"),
  ]);

  const user = sessionUser ?? fallbackUser;
  const reviewState = user ? await loadPrescriptionReviewState(user) : null;
  const pendingSurveyCount = reviewState?.pendingAssignments.length ?? 0;

  return (
    <CartProvider cartPromise={cart}>
      <Navbar />
      <main>
        {children}
        {/**
         * 内测阶段不上架处方药，隐藏“待完成处方审核”浮窗。
         * 恢复显示时：
         *  1) 在此处重新渲染 PrescriptionComplianceReminder；
         *  2) 继续复用 reviewState/IDENTITY_HIGHLIGHT_HREF/SURVEY_HIGHLIGHT_HREF。
         */}
        <Toaster closeButton />
      </main>
    </CartProvider>
  );
}

export default DesktopAppLayout;
