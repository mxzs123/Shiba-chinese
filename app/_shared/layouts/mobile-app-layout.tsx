import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { APP_TEXT } from "lib/i18n/constants";
import { CartProvider } from "components/cart/cart-context";
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
        {reviewState ? (
          <PrescriptionComplianceReminder
            orderId={reviewState.order.id}
            orderNumber={reviewState.order.number}
            productTitles={reviewState.productTitles}
            pendingSurveyCount={pendingSurveyCount}
            identityCompleted={reviewState.identityCompleted}
            identityHref={IDENTITY_HIGHLIGHT_HREF}
            surveyHref={SURVEY_HIGHLIGHT_HREF}
            type="prescription"
          />
        ) : null}
        <Toaster
          position="top-center"
          offset="calc(env(safe-area-inset-top) + 64px)"
          toastOptions={{ duration: APP_TEXT.toastDuration.medium }}
        />
      </main>
      <MobileBottomNav />
    </CartProvider>
  );
}

export default MobileAppLayout;
