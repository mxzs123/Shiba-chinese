import type { FormEvent } from "react";
import { Plus } from "lucide-react";
import { PrimaryButton } from "@/app/_shared";
import { AddressFormFields } from "@/app/_shared/address";
import { DefaultBadge } from "@/app/_shared/account/DefaultBadge";
import type { Address } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import type { AddressFormState, CheckoutVariant } from "../types";
import {
  SELECTABLE_CARD_SELECTED_CLASSES,
  SELECTABLE_CARD_UNSELECTED_CLASSES,
} from "../constants";
import { formatAddressLines, formatAddressPhone } from "../utils";

type AddressSectionProps = {
  addresses: Address[];
  selectedAddressId?: string;
  addressForm: AddressFormState;
  addressError: string | null;
  isAddingAddress: boolean;
  editingAddressId: string | null;
  defaultUpdatingId: string | null;
  addressSubmitting: boolean;
  variant: CheckoutVariant;
  disabled: boolean;
  onSelect: (addressId: string) => void;
  onEdit: (address: Address) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSetDefault: (addressId: string) => void;
  onToggleAdd: () => void;
  onFormChange: (partial: Partial<AddressFormState>) => void;
  onCancel: () => void;
};

export function AddressSection({
  addresses,
  selectedAddressId,
  addressForm,
  addressError,
  isAddingAddress,
  editingAddressId,
  defaultUpdatingId,
  addressSubmitting,
  variant,
  disabled,
  onSelect,
  onEdit,
  onSubmit,
  onSetDefault,
  onToggleAdd,
  onFormChange,
  onCancel,
}: AddressSectionProps) {
  const isMobile = variant === "mobile";

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-sm shadow-black/[0.02]">
      <header
        className={cn(
          "flex gap-3",
          isMobile ? "flex-col items-start" : "items-center justify-between",
        )}
      >
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">收货地址</h2>
          <p className="mt-1 text-sm text-neutral-500">
            选择已有地址或新增地址用于本次配送。
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleAdd}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900",
            isMobile && "w-full justify-center",
          )}
          disabled={disabled}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />{" "}
          {editingAddressId ? "编辑收货地址" : "新增收货地址"}
        </button>
      </header>

      <div className="mt-6 space-y-4">
        {addresses.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-500">
            暂无收货地址，请先新增一个地址。
          </p>
        ) : (
          <ul className="space-y-3">
            {addresses.map((address) => {
              const isSelected = address.id === selectedAddressId;
              const isUpdating = defaultUpdatingId === address.id;
              const displayPhone = formatAddressPhone(address);
              const addressLines = formatAddressLines(address);

              return (
                <li key={address.id}>
                  <label
                    className={cn(
                      "flex cursor-pointer flex-col gap-3 rounded-2xl border p-4 transition",
                      isSelected
                        ? SELECTABLE_CARD_SELECTED_CLASSES
                        : SELECTABLE_CARD_UNSELECTED_CLASSES,
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="checkout-address"
                          className="h-4 w-4 border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                          checked={isSelected}
                          onChange={() => onSelect(address.id)}
                          disabled={disabled}
                        />
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">
                            {`${address.lastName}${address.firstName}`}
                          </p>
                          {displayPhone ? (
                            <p className="text-xs text-neutral-500">
                              {displayPhone}
                            </p>
                          ) : null}
                          {address.wechat ? (
                            <p className="text-xs text-neutral-500">
                              微信：{address.wechat}
                            </p>
                          ) : null}
                          {address.email ? (
                            <p className="text-xs text-neutral-500">
                              邮箱：{address.email}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {address.isDefault ? (
                          <DefaultBadge />
                        ) : (
                          <button
                            type="button"
                            className={cn(
                              "text-xs font-medium text-neutral-500 transition hover:text-neutral-900",
                              (disabled || isUpdating) && "opacity-60",
                            )}
                            onClick={() => onSetDefault(address.id)}
                            disabled={disabled || isUpdating}
                          >
                            {isUpdating ? "设置中..." : "设为默认"}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-neutral-500">
                      {addressLines.length === 0
                        ? null
                        : addressLines.map((line, index) => (
                            <p key={`${index}-${line}`}>{line}</p>
                          ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          onEdit(address);
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-200 px-3 py-1 text-[11px] font-medium text-emerald-700 transition hover:border-emerald-600 hover:text-emerald-800"
                        disabled={disabled}
                      >
                        编辑
                      </button>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {addressError ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">
          {addressError}
        </p>
      ) : null}

      {isAddingAddress ? (
        <form
          className="mt-6 space-y-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/80 p-4"
          onSubmit={onSubmit}
        >
          <h3 className="text-sm font-semibold text-neutral-800">
            {editingAddressId ? "编辑收货地址" : "新增收货地址"}
          </h3>
          <AddressFormFields
            value={addressForm}
            onChange={onFormChange}
            disabled={addressSubmitting}
            showDefaultToggle
          />
          <div className="flex gap-3 pt-2">
            <PrimaryButton
              type="submit"
              className="w-full justify-center"
              disabled={addressSubmitting}
              loading={addressSubmitting}
              loadingText="保存中..."
            >
              {editingAddressId ? "保存修改" : "保存地址"}
            </PrimaryButton>
            <button
              type="button"
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-500 transition hover:border-neutral-900 hover:text-neutral-900"
              onClick={onCancel}
            >
              取消
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
