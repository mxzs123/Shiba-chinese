import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

import { CartBadge } from "app/_shared";

export default function OpenCart({
  className,
  quantity,
}: {
  className?: string;
  quantity?: number;
}) {
  const total = quantity ?? 0;

  return (
    <div className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-[#049e6b] transition hover:border-[#049e6b]">
      <ShoppingCartIcon
        className={clsx(
          "h-5 w-5 transition-transform duration-200 ease-in-out group-hover:scale-110",
          className,
        )}
      />
      {total > 0 ? (
        <CartBadge
          quantity={total}
          className="absolute -right-1.5 -top-1.5 border-2 border-white"
        />
      ) : null}
    </div>
  );
}
