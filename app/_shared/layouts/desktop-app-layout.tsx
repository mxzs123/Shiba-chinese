import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { CartProvider } from "components/cart/cart-context";
import { Navbar } from "components/layout/navbar";
import { PrescriptionComplianceReminder } from "components/prescription/PrescriptionComplianceReminder";
import { PrescriptionComplianceSteps } from "@/app/_shared/checkout/PrescriptionComplianceSteps";
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
  const surveyCompleted = pendingSurveyCount === 0;

  return (
    <CartProvider cartPromise={cart}>
      <Navbar />
      <main>
        {children}
        {reviewState ? (
          <PrescriptionComplianceReminder
            orderId={reviewState.order.id}
            orderNumber={reviewState.order.number}
            productTitles={reviewState.productTitles}
            pendingSurveyCount={pendingSurveyCount}
            identityCompleted={reviewState.identityCompleted}
          >
            <PrescriptionComplianceSteps
              identityCompleted={reviewState.identityCompleted}
              identityHref={IDENTITY_HIGHLIGHT_HREF}
              surveyCompleted={surveyCompleted}
              surveyHref={SURVEY_HIGHLIGHT_HREF}
              pendingSurveyCount={pendingSurveyCount}
              variant="minimal"
            />
          </PrescriptionComplianceReminder>
        ) : null}
        <Toaster closeButton />
      </main>
    </CartProvider>
  );
}

export default DesktopAppLayout;
