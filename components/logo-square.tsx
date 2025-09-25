import clsx from "clsx";
import Image from "next/image";

const SITE_NAME = process.env.SITE_NAME ?? "Logo";

export default function LogoSquare({ size }: { size?: "sm" | undefined }) {
  const isSmall = size === "sm";
  const ratio = 25 / 6;
  const height = isSmall ? 30 : 40;
  const width = height * ratio;
  const widthHint = Math.round(width);

  return (
    <div
      className={clsx(
        "flex flex-none items-center justify-center border border-neutral-200 bg-white aspect-[25/6]",
        {
          "h-[40px] rounded-xl": !isSmall,
          "h-[30px] rounded-lg": isSmall,
        },
      )}
    >
      <div className="relative h-full w-full">
        <Image
          src="/LOGO.svg"
          alt={SITE_NAME}
          fill
          sizes={`${widthHint}px`}
          className="object-contain"
          priority={!isSmall}
        />
      </div>
    </div>
  );
}
