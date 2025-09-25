import clsx from "clsx";
import Image from "next/image";

const SITE_NAME = process.env.SITE_NAME ?? "Logo";

export default function LogoSquare({ size }: { size?: "sm" | undefined }) {
  const isSmall = size === "sm";
  const dimension = isSmall ? 30 : 40;

  return (
    <div
      className={clsx(
        "flex flex-none items-center justify-center border border-neutral-200 bg-white",
        {
          "h-[40px] w-[40px] rounded-xl": !size,
          "h-[30px] w-[30px] rounded-lg": isSmall,
        },
      )}
    >
      <div className="relative h-full w-full">
        <Image
          src="/LOGO.svg"
          alt={SITE_NAME}
          fill
          sizes={`${dimension}px`}
          className="object-contain"
          priority={!isSmall}
        />
      </div>
    </div>
  );
}
