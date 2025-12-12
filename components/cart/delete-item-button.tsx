"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { removeItem } from "@/app/_shared/cart/actions";
import type { CartItem } from "@/lib/api/types";
import { useActionState, useTransition } from "react";

export function DeleteItemButton({
  item,
  optimisticUpdate,
}: {
  item: CartItem;
  optimisticUpdate: any;
}) {
  const [result, formAction, pending] = useActionState(removeItem, null);
  const [, startTransition] = useTransition();
  const merchandiseId = item.merchandise.id;
  const lineId = item.id || merchandiseId;
  const removeItemAction = formAction.bind(null, lineId);

  return (
    <form
      action={removeItemAction}
      onSubmit={() => {
        // Keep optimistic removal inside a transition for React 19/Next 15.
        startTransition(() => {
          optimisticUpdate(lineId, merchandiseId, "delete");
        });
      }}
    >
      <button
        type="submit"
        aria-label="Remove cart item"
        disabled={pending}
        className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-neutral-500 disabled:opacity-60"
      >
        <XMarkIcon className="mx-[1px] h-4 w-4 text-white" />
      </button>
      <p aria-live="polite" className="sr-only" role="status">
        {result && !result.success ? result.error : null}
      </p>
    </form>
  );
}
