import clsx from "clsx";
import Image from "next/image";

import Label from "../label";

type GridTileImageProps = {
  isInteractive?: boolean;
  active?: boolean;
  label?: {
    title: string;
    amount: string;
    currencyCode: string;
    position?: "bottom" | "center";
  };
  className?: string;
} & React.ComponentProps<typeof Image>;

export function GridTileImage({
  isInteractive = true,
  active = false,
  label,
  className,
  alt,
  src,
  ...imageProps
}: GridTileImageProps) {
  const resolvedAlt = alt ?? label?.title ?? "";
  const wrapperClassName = clsx(
    "group relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border bg-white transition-colors",
    isInteractive && "hover:border-neutral-300",
    active
      ? "border-teal-500 bg-teal-50/60 shadow-[0_0_0_1px_rgba(12,104,96,0.12)]"
      : "border-neutral-200",
    className,
  );

  return (
    <div className={wrapperClassName}>
      {src ? (
        <Image
          alt={resolvedAlt}
          src={src}
          className={clsx(
            "relative h-full w-full object-contain",
            isInteractive &&
              "transition-transform duration-300 ease-out group-hover:scale-[1.03]",
          )}
          {...imageProps}
        />
      ) : null}
      {label ? (
        <Label
          title={label.title}
          amount={label.amount}
          currencyCode={label.currencyCode}
          position={label.position}
        />
      ) : null}
    </div>
  );
}

export default GridTileImage;
