import { MobileContentContainer } from "@/app/_shared/layouts/mobile-content-container";

export default function CouponsLoading() {
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
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-neutral-200" />
                  <div className="h-3 w-20 animate-pulse rounded bg-neutral-100" />
                </div>
                <div className="h-10 w-24 animate-pulse rounded-full bg-neutral-200" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-neutral-100" />
              </div>
            </div>
          ))}
        </div>
      </MobileContentContainer>
    </div>
  );
}
