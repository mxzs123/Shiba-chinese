import { MobileContentContainer } from "@/app/_shared/layouts/mobile-content-container";

export default function ProfileLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 pb-24">
      <MobileContentContainer className="pt-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-neutral-200" />
          <div className="space-y-2">
            <div className="h-5 w-24 animate-pulse rounded bg-neutral-200" />
            <div className="h-3 w-48 animate-pulse rounded bg-neutral-100" />
          </div>
        </div>
      </MobileContentContainer>

      <MobileContentContainer className="flex-1 pt-0">
        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-neutral-100" />
                <div className="h-11 w-full animate-pulse rounded-xl bg-neutral-200" />
              </div>
            ))}
            <div className="flex gap-3">
              <div className="h-11 w-32 animate-pulse rounded-xl bg-neutral-200" />
              <div className="h-11 w-24 animate-pulse rounded-xl bg-neutral-100" />
            </div>
          </div>
        </div>
      </MobileContentContainer>
    </div>
  );
}
