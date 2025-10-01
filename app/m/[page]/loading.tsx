export default function MobileCmsLoading() {
  return (
    <div className="w-full space-y-6">
      <div className="w-3/4 h-9 animate-pulse rounded-full bg-neutral-200 sm:h-12" />
      <div className="space-y-4">
        <div className="w-full h-4 animate-pulse rounded bg-neutral-100" />
        <div className="w-11/12 h-4 animate-pulse rounded bg-neutral-100" />
        <div className="w-5/6 h-4 animate-pulse rounded bg-neutral-100" />
        <div className="w-4/5 h-4 animate-pulse rounded bg-neutral-100" />
      </div>
      <div className="space-y-3">
        <div className="w-1/2 h-3 animate-pulse rounded bg-neutral-100" />
        <div className="w-1/3 h-3 animate-pulse rounded bg-neutral-100" />
      </div>
    </div>
  );
}
