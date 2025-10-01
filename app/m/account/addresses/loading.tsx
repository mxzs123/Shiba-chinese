import { MobileContentContainer } from "@/app/_shared/layouts/mobile-content-container";

export default function AddressesLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 pb-24">
      <MobileContentContainer className="pt-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-neutral-200" />
          <div className="space-y-2">
            <div className="h-5 w-24 animate-pulse rounded bg-neutral-200" />
            <div className="h-3 w-40 animate-pulse rounded bg-neutral-100" />
          </div>
        </div>
      </MobileContentContainer>

      <MobileContentContainer className="flex-1 pt-0">
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <div className="h-5 w-32 animate-pulse rounded bg-neutral-200" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
              <div className="h-4 w-11/12 animate-pulse rounded bg-neutral-100" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-100" />
            </div>
            <div className="mt-6 flex gap-3">
              <div className="h-10 flex-1 animate-pulse rounded-lg bg-neutral-200" />
              <div className="h-10 w-20 animate-pulse rounded-lg bg-neutral-100" />
            </div>
          </div>
        </div>
      </MobileContentContainer>
    </div>
  );
}
