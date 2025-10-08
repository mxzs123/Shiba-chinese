import Image from "next/image";

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
        <div className="relative aspect-[16/9] w-full">
          <Image
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80"
            alt="医护人员正在整理医疗资料"
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export default HomeHeroSection;
