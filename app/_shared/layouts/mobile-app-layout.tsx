import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { APP_TEXT } from "lib/i18n/constants";
import { CartProvider } from "@/components/cart/cart-context";
import { MobileBottomNav } from "components/layout/mobile-bottom-nav";
import { PrescriptionComplianceReminder } from "components/prescription/PrescriptionComplianceReminder";
import { getCart, getCurrentUser, getUserById } from "lib/api";
import {
  IDENTITY_HIGHLIGHT_HREF,
  SURVEY_HIGHLIGHT_HREF,
  loadPrescriptionReviewState,
} from "lib/prescription";

export async function MobileAppLayout({ children }: { children: ReactNode }) {
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
      <main className="pb-16">
        {children}
        {/**
         * 内测阶段不上架处方药，隐藏“待完成处方审核”浮窗。
         * 恢复显示时：
         *  1) 在此处重新渲染 PrescriptionComplianceReminder；
         *  2) 继续复用 reviewState/IDENTITY_HIGHLIGHT_HREF/SURVEY_HIGHLIGHT_HREF。
         */}
        <Toaster
          position="top-center"
          offset="calc(env(safe-area-inset-top) + 64px)"
          toastOptions={{ duration: APP_TEXT.toastDuration.medium }}
        />
      </main>
      {/* 内测阶段隐藏个人中心入口（仅 UI 层） */}
      <MobileBottomNav
        hideAccount={
          process.env.HIDE_ACCOUNT === "1" ||
          process.env.NEXT_PUBLIC_HIDE_ACCOUNT === "1" ||
          process.env.MOCK_MODE === "1" ||
          process.env.NEXT_PUBLIC_MOCK_MODE === "1" ||
          process.env.INTERNAL_TESTING === "1" ||
          process.env.NEXT_PUBLIC_INTERNAL_TESTING === "1"
        }
      />
    </CartProvider>
  );
}

export default MobileAppLayout;
