import { MobileHeader } from "@/components/layout/mobile-header";
import { getNotifications } from "@/lib/api";

import SharedFaqPage from "@/app/_shared/pages/faq";

export { metadata } from "@/app/_shared/pages/faq";

export default async function MobileFaqPage(props: {
  searchParams?: Promise<{ q?: string; section?: string }>;
}) {
  const notifications = await getNotifications();

  return (
    <div className="bg-neutral-50">
      <MobileHeader notifications={notifications} leadingVariant="back" />
      <SharedFaqPage {...props} />
    </div>
  );
}

