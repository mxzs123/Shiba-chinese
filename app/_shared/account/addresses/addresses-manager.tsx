"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DefaultBadge } from "@/app/_shared/account/DefaultBadge";
import { Edit, MapPin, Trash2 } from "lucide-react";

import type { Address, AddressInput, User } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { AddressFormFields, PrimaryButton } from "@/app/_shared";
import { useAuthStore } from "@/hooks/useAuthStore";
import {
  removeAddressAction,
  saveAddressAction,
  setDefaultAddressAction,
} from "../actions";

type AddressesManagerProps = {
  user: User;
};

type FormMode = "create" | "edit";

type AddressFormState = AddressInput & { id?: string };

const EMPTY_FORM: AddressFormState = {
  id: undefined,
  firstName: "",
  lastName: "",
  phone: "",
  phoneCountryCode: "+86",
  company: "",
  country: "中国",
  countryCode: "CN",
  province: "",
  city: "",
  district: "",
  postalCode: "",
  address1: "",
  address2: "",
  isDefault: false,
};

function toFormState(address: Address): AddressFormState {
  return {
    id: address.id,
    firstName: address.firstName ?? "",
    lastName: address.lastName ?? "",
    phone: address.phone ?? "",
    phoneCountryCode: address.phoneCountryCode ?? "+86",
    company: address.company ?? "",
    country: address.country ?? "中国",
    countryCode: address.countryCode ?? "CN",
    province: address.province ?? "",
    city: address.city ?? "",
    district: address.district ?? "",
    postalCode: address.postalCode ?? "",
    address1: address.address1 ?? "",
    address2: address.address2 ?? "",
    isDefault: Boolean(address.isDefault),
  };
}

function validateAddress(form: AddressFormState) {
  if (!form.lastName.trim() || !form.firstName.trim()) {
    return "请填写收件人的姓与名";
  }

  if (!form.phoneCountryCode?.trim()) {
    return "请选择国际区号";
  }

  if (!form.phone?.trim()) {
    return "请填写联系电话";
  }

  if (!form.country.trim()) {
    return "请填写国家或地区";
  }

  if (!form.city.trim()) {
    return "请填写城市";
  }

  if (!form.address1.trim()) {
    return "请填写详细地址";
  }

  return null;
}

function formatDisplayPhone(address: Address) {
  const parts = [address.phoneCountryCode, address.phone]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part && part.length > 0));

  return parts.join(" ");
}

function buildAddressLines(address: Address) {
  if (address.formatted && address.formatted.length > 0) {
    return address.formatted;
  }

  const primaryLines = address.address1
    ? address.address1
        .split(/\n+/)
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
    : [];

  const lines = [
    ...primaryLines,
    address.address2,
    [address.city, address.district].filter(Boolean).join(", "),
    [address.province, address.postalCode].filter(Boolean).join(" "),
    [
      address.country,
      address.countryCode ? `(${address.countryCode.toUpperCase()})` : undefined,
    ]
      .filter(Boolean)
      .join(" "),
  ].filter((value) => Boolean(value && value.trim().length > 0));

  return lines;
}

export default function AddressesManager({ user }: AddressesManagerProps) {
  const router = useRouter();
  const updateUser = useAuthStore((state) => state.updateUser);
  const [addresses, setAddresses] = useState<Address[]>(user.addresses ?? []);
  const [mode, setMode] = useState<FormMode | null>(null);
  const [formState, setFormState] = useState<AddressFormState>(() => {
    if (!user.addresses?.length) {
      return { ...EMPTY_FORM, isDefault: true };
    }
    return EMPTY_FORM;
  });
  const [formPending, startFormTransition] = useTransition();
  const [listPendingId, setListPendingId] = useState<string | null>(null);
  const [listPendingType, setListPendingType] = useState<
    "default" | "delete" | null
  >(null);
  const [formError, setFormError] = useState<string | null>(null);

  const hasAddresses = addresses.length > 0;

  useEffect(() => {
    setAddresses(user.addresses ?? []);
  }, [user.addresses]);

  useEffect(() => {
    if (!hasAddresses && mode === null) {
      setMode("create");
      setFormState({ ...EMPTY_FORM, isDefault: true });
    }
  }, [hasAddresses, mode]);

  const handleCreateClick = () => {
    setMode("create");
    setFormError(null);
    setFormState({
      ...EMPTY_FORM,
      isDefault: !addresses.length,
    });
  };

  const handleEdit = (address: Address) => {
    setMode("edit");
    setFormError(null);
    setFormState(toFormState(address));
  };

  const handleCancel = () => {
    setMode(hasAddresses ? null : "create");
    setFormError(null);
    setFormState({
      ...EMPTY_FORM,
      isDefault: !hasAddresses,
    });
  };

  const syncAddresses = (nextAddresses: Address[]) => {
    setAddresses(nextAddresses);
    updateUser((current) => ({
      ...current,
      addresses: nextAddresses,
      defaultAddress:
        nextAddresses.find((entry) => entry.isDefault) ??
        current.defaultAddress,
    }));
  };

  const handleSubmit = () => {
    const validation = validateAddress(formState);
    if (validation) {
      setFormError(validation);
      return;
    }

    setFormError(null);
    startFormTransition(async () => {
      const result = await saveAddressAction(user.id, formState);

      if (!result.success) {
        setFormError(result.error);
        toast.error(result.error);
        return;
      }

      syncAddresses(result.data.addresses);
      toast.success(formState.id ? "地址已更新" : "地址已新增");
      router.refresh();
      handleCancel();
    });
  };

  const handleSetDefault = async (addressId: string) => {
    setListPendingId(addressId);
    setListPendingType("default");
    const result = await setDefaultAddressAction(user.id, addressId);
    setListPendingId(null);
    setListPendingType(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    syncAddresses(result.data.addresses);
    toast.success("已设为默认地址");
    router.refresh();
  };

  const handleDelete = async (addressId: string) => {
    const confirmed = window.confirm("确定要删除该地址吗？");
    if (!confirmed) {
      return;
    }

    setListPendingId(addressId);
    setListPendingType("delete");
    const result = await removeAddressAction(user.id, addressId);
    setListPendingId(null);
    setListPendingType(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    syncAddresses(result.data.addresses);
    toast.success("地址已删除");
    router.refresh();

    if (!result.data.addresses.length) {
      handleCreateClick();
    }
  };

  const defaultAddressId = useMemo(() => {
    return addresses.find((entry) => entry.isDefault)?.id;
  }, [addresses]);

  const isFormVisible = mode !== null;
  const formTitle = mode === "edit" ? "编辑收货地址" : "新增收货地址";
  const submitLabel = mode === "edit" ? "保存修改" : "保存地址";

  return (
    <div className="space-y-6">
      <div className="flex w-full items-center rounded-full border border-neutral-200 bg-neutral-100 p-1 text-sm">
        <button
          type="button"
          onClick={() => {
            setMode(null);
            setFormError(null);
          }}
          className={cn(
            "flex-1 rounded-full px-4 py-2 font-medium transition",
            !isFormVisible
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700",
          )}
        >
          地址列表
        </button>
        <button
          type="button"
          onClick={handleCreateClick}
          className={cn(
            "flex-1 rounded-full px-4 py-2 font-medium transition",
            isFormVisible
              ? "bg-white text-neutral-900 shadow-sm"
              : "text-neutral-500 hover:text-neutral-700",
          )}
        >
          {mode === "edit" ? "编辑地址" : "新增地址"}
        </button>
      </div>

      {!isFormVisible ? (
        <div className="space-y-4">
          {!hasAddresses ? (
            <p className="rounded-2xl border border-dashed border-neutral-200 bg-white/70 px-6 py-12 text-center text-sm text-neutral-500">
              暂无收货地址，请通过上方按钮新增一个。
            </p>
          ) : (
            <ul className="space-y-4">
              {addresses.map((address) => {
                const isDefault = address.id === defaultAddressId;
                const isPending = listPendingId === address.id;
                const pendingType = listPendingType;
                const displayPhone = formatDisplayPhone(address);
                const addressLines = buildAddressLines(address);

                return (
                  <li key={address.id}>
                    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white/95 p-5 transition hover:border-neutral-300">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">
                            {`${address.lastName ?? ""}${address.firstName ?? ""}` ||
                              "--"}
                          </p>
                          {displayPhone ? (
                            <p className="mt-1 text-xs text-neutral-500">
                              {displayPhone}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                          {isDefault ? (
                            <DefaultBadge />
                          ) : (
                            <button
                              type="button"
                              onClick={() => void handleSetDefault(address.id)}
                              className={cn(
                                "text-xs font-medium text-neutral-500 transition hover:text-neutral-900",
                                pendingType === "default" &&
                                  isPending &&
                                  "opacity-60",
                              )}
                              disabled={pendingType === "default" && isPending}
                            >
                              设为默认
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 text-sm text-neutral-600">
                        <div className="inline-flex items-start gap-2 text-sm text-neutral-600">
                          <MapPin
                            className="mt-0.5 h-4 w-4 flex-none text-neutral-400"
                            aria-hidden
                          />
                          <div className="space-y-1">
                            {addressLines.map((line) => (
                              <p key={line}>{line}</p>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                        <button
                          type="button"
                          onClick={() => handleEdit(address)}
                          className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 font-medium transition hover:border-neutral-900 hover:text-neutral-900"
                          disabled={isPending}
                        >
                          <Edit className="h-3.5 w-3.5" aria-hidden /> 编辑
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(address.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 font-medium text-red-500 transition hover:border-red-500/80 hover:text-red-500"
                          disabled={pendingType === "delete" && isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden /> 删除
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <AddressForm
          key={mode === "edit" ? (formState.id ?? "edit") : "create"}
          formState={formState}
          setFormState={setFormState}
          error={formError}
          pending={formPending}
          title={formTitle}
          submitLabel={submitLabel}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

type AddressFormProps = {
  formState: AddressFormState;
  setFormState: React.Dispatch<React.SetStateAction<AddressFormState>>;
  pending: boolean;
  error: string | null;
  title: string;
  submitLabel: string;
  onSubmit: () => void;
  onCancel: () => void;
};

function AddressForm({
  formState,
  setFormState,
  pending,
  error,
  title,
  submitLabel,
  onSubmit,
  onCancel,
}: AddressFormProps) {
  const handlePartialChange = (partial: Partial<AddressFormState>) => {
    setFormState((prev) => ({
      ...prev,
      ...partial,
    }));
  };

  return (
    <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white/95 p-6">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        <p className="text-sm text-neutral-500">
          请填写完整的收货人与地址信息，确保快递可顺利送达。
        </p>
      </header>

      <AddressFormFields
        value={formState}
        onChange={handlePartialChange}
        disabled={pending}
        showDefaultToggle
      />

      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <PrimaryButton
          type="button"
          loading={pending}
          loadingText="保存中..."
          onClick={onSubmit}
        >
          {submitLabel}
        </PrimaryButton>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 px-6 text-sm font-medium text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-900"
          disabled={pending}
        >
          取消
        </button>
      </div>
    </div>
  );
}
