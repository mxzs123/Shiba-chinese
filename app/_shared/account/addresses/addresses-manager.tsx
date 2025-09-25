"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DefaultBadge } from "@/app/_shared/account/DefaultBadge";
import { Edit, MapPin, Trash2 } from "lucide-react";

import type { Address, AddressInput, User } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { PrimaryButton } from "@/app/_shared";
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

  if (!form.phone?.trim()) {
    return "请填写联系手机号";
  }

  if (!form.city.trim() || !form.address1.trim()) {
    return "请完善城市与详细地址";
  }

  return null;
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

                return (
                  <li key={address.id}>
                    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white/95 p-5 transition hover:border-neutral-300">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">
                            {`${address.lastName ?? ""}${address.firstName ?? ""}` ||
                              "--"}
                          </p>
                          {address.phone ? (
                            <p className="mt-1 text-xs text-neutral-500">
                              {address.phone}
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
                          <span>
                            {[
                              address.province,
                              address.city,
                              address.district,
                              address.address1,
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          </span>
                        </div>
                        {address.address2 ? (
                          <p className="text-xs text-neutral-500">
                            {address.address2}
                          </p>
                        ) : null}
                        {address.postalCode ? (
                          <p className="text-xs text-neutral-400">
                            邮编 {address.postalCode}
                          </p>
                        ) : null}
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
  const defaultFieldId = formState.id
    ? `account-address-default-${formState.id}`
    : "account-address-default-new";
  const handleChange = (
    field: keyof AddressFormState,
    value: string | boolean,
  ) => {
    setFormState((prev) => ({
      ...prev,
      [field]: typeof value === "string" ? value : value,
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="姓"
          value={formState.lastName}
          onChange={(value) => handleChange("lastName", value)}
          placeholder="例如：张"
          disabled={pending}
        />
        <Field
          label="名"
          value={formState.firstName}
          onChange={(value) => handleChange("firstName", value)}
          placeholder="例如：三"
          disabled={pending}
        />
      </div>

      <Field
        label="联系电话"
        value={formState.phone ?? ""}
        onChange={(value) => handleChange("phone", value)}
        placeholder="请输入常用手机号"
        disabled={pending}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="所在省份"
          value={formState.province ?? ""}
          onChange={(value) => handleChange("province", value)}
          placeholder="例如：上海市"
          disabled={pending}
        />
        <Field
          label="城市"
          value={formState.city ?? ""}
          onChange={(value) => handleChange("city", value)}
          placeholder="例如：上海"
          disabled={pending}
        />
      </div>

      <Field
        label="区县 / 街道"
        value={formState.district ?? ""}
        onChange={(value) => handleChange("district", value)}
        placeholder="例如：浦东新区"
        disabled={pending}
      />

      <Field
        label="详细地址"
        value={formState.address1 ?? ""}
        onChange={(value) => handleChange("address1", value)}
        placeholder="例如：世纪大道 100 号"
        disabled={pending}
      />

      <Field
        label="楼层 / 门牌号 (选填)"
        value={formState.address2 ?? ""}
        onChange={(value) => handleChange("address2", value)}
        placeholder="例如：A 座 302"
        disabled={pending}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="邮编 (选填)"
          value={formState.postalCode ?? ""}
          onChange={(value) => handleChange("postalCode", value)}
          placeholder="例如：200000"
          disabled={pending}
        />
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">
            设为默认地址
          </label>
          <div className="flex h-11 items-center rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-600">
            <input
              id={defaultFieldId}
              type="checkbox"
              className="h-4 w-4 border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              checked={Boolean(formState.isDefault)}
              onChange={(event) =>
                handleChange("isDefault", event.target.checked)
              }
              disabled={pending}
            />
            <label
              htmlFor={defaultFieldId}
              className="ml-2 text-sm text-neutral-600"
            >
              同步设为默认地址
            </label>
          </div>
        </div>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

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

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

function Field({ label, value, onChange, placeholder, disabled }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 transition focus:border-[#049e6b] focus:outline-none focus:ring-2 focus:ring-[#049e6b]/20 disabled:bg-neutral-50"
        disabled={disabled}
      />
    </div>
  );
}
