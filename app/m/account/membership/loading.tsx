import { MobileContentContainer } from "@/app/_shared/layouts/mobile-content-container";

export default function MembershipLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 pb-24">
      <MobileContentContainer className="pt-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-neutral-200" />
          <div className="space-y-2">
            <div className="h-5 w-28 animate-pulse rounded bg-neutral-200" />
            <div className="h-3 w-52 animate-pulse rounded bg-neutral-100" />
          </div>
        </div>
      </MobileContentContainer>

      <MobileContentContainer className="flex-1 space-y-4 pt-0">
        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
              <div className="h-3 w-40 animate-pulse rounded bg-neutral-100" />
            </div>
            <div className="h-8 w-24 animate-pulse rounded-full bg-neutral-200" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="h-3 w-16 animate-pulse rounded bg-neutral-100" />
                <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
              <div className="h-3 w-32 animate-pulse rounded bg-neutral-100" />
            </div>
            <div className="text-right space-y-2">
              <div className="ml-auto h-3 w-16 animate-pulse rounded bg-neutral-100" />
              <div className="ml-auto h-6 w-20 animate-pulse rounded bg-neutral-200" />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-3 w-28 animate-pulse rounded bg-neutral-100" />
                  <div className="h-3 w-20 animate-pulse rounded bg-neutral-100" />
                </div>
                <div className="h-4 w-12 animate-pulse rounded bg-neutral-200" />
              </div>
            ))}
          </div>
        </div>
      </MobileContentContainer>
    </div>
  );
}
