import { cn } from "lib/utils";

type HomeHeroSectionProps = {
  className?: string;
};

/**
 * Placeholder hero carousel container with a fixed aspect ratio so both desktop and mobile
 * shells can drop images in without layout shifts. The backend can later hydrate it with
 * real carousel content.
 */
export function HomeHeroSection({ className }: HomeHeroSectionProps) {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-(--breakpoint-2xl) px-4",
        "sm:px-6 lg:px-8",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-3xl border border-[#049e6b]/20 bg-[#049e6b]/5 shadow-sm">
        <div className="relative aspect-[4/3] w-full md:aspect-[16/9]">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <span className="rounded-full bg-white/85 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#049e6b] shadow-sm">
              Carousel Placeholder
            </span>
            <p className="max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
              轮播区域预留，用于后续对接后台上传的营销 Banner。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeHeroSection;
