"use client";

import { useId } from "react";

import type { AddressInput } from "@/lib/api/types";

import { PhoneInput } from "./phone-input";

export type AddressFormValue = AddressInput;

type AddressFormFieldsProps = {
  value: AddressFormValue;
  onChange: (partial: Partial<AddressFormValue>) => void;
  disabled?: boolean;
  showDefaultToggle?: boolean;
};

function buildFieldId(prefix: string, name: string) {
  return `${prefix}-${name}`;
}

export function AddressFormFields({
  value,
  onChange,
  disabled,
  showDefaultToggle = true,
}: AddressFormFieldsProps) {
  const idPrefix = useId();

  const applyChange = (partial: Partial<AddressFormValue>) => {
    onChange(partial);
  };

  const handleChange = (field: keyof AddressFormValue, next: string | boolean) => {
    applyChange({
      [field]: typeof next === "string" ? next : next,
    } as Partial<AddressFormValue>);
  };

  const detailedAddressValue = value.address2
    ? `${value.address1}${value.address1 ? "\n" : ""}${value.address2}`
    : value.address1;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={buildFieldId(idPrefix, "lastName")}
          label="姓"
          placeholder="例如：Smith"
          value={value.lastName}
          onChange={(next) => handleChange("lastName", next)}
          disabled={disabled}
          required
        />
        <TextField
          id={buildFieldId(idPrefix, "firstName")}
          label="名"
          placeholder="例如：Jane"
          value={value.firstName}
          onChange={(next) => handleChange("firstName", next)}
          disabled={disabled}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-[170px_1fr]">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700" htmlFor={buildFieldId(idPrefix, "phone")}>
            联系电话
          </label>
          <PhoneInput
            dialCode={value.phoneCountryCode || "+"}
            number={value.phone ?? ""}
            onDialCodeChange={(next) => handleChange("phoneCountryCode", next)}
            onNumberChange={(next) => handleChange("phone", next)}
            disabled={disabled}
          />
        </div>
      </div>

      <TextField
        id={buildFieldId(idPrefix, "country")}
        label="国家 / 地区"
        placeholder="例如：United States"
        value={value.country}
        onChange={(next) => handleChange("country", next)}
        disabled={disabled}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={buildFieldId(idPrefix, "countryCode")}
          label="国家代码 (ISO)"
          placeholder="例如：CN"
          value={value.countryCode ?? ""}
          onChange={(next) => handleChange("countryCode", next.toUpperCase())}
          disabled={disabled}
        />
        <TextField
          id={buildFieldId(idPrefix, "postalCode")}
          label="邮政编码 (选填)"
          placeholder="例如：100000"
          value={value.postalCode ?? ""}
          onChange={(next) => handleChange("postalCode", next)}
          disabled={disabled}
        />
      </div>

      <TextAreaField
        id={buildFieldId(idPrefix, "address1")}
        label="详细地址"
        placeholder="例如：北京市海淀区中关村大街 1 号 科技大厦 A 座 302"
        value={detailedAddressValue}
        onChange={(next) =>
          applyChange({
            address1: next,
            address2: "",
            province: "",
            city: "",
            district: "",
          })
        }
        disabled={disabled}
        required
      />

      {showDefaultToggle ? (
        <ToggleField
          id={buildFieldId(idPrefix, "default")}
          label="设为默认地址"
          checked={Boolean(value.isDefault)}
          onChange={(checked) => handleChange("isDefault", checked)}
          disabled={disabled}
        />
      ) : null}
    </div>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
};

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  required,
}: TextFieldProps) {
  return (
    <div className="space-y-2">
      <label
        className="text-sm font-medium text-neutral-700"
        htmlFor={id}
      >
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 transition focus:border-[#049e6b] focus:outline-none focus:ring-2 focus:ring-[#049e6b]/20 disabled:bg-neutral-50 disabled:text-neutral-400"
        disabled={disabled}
        required={required}
      />
    </div>
  );
}

type TextAreaFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
};

function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  required,
}: TextAreaFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-neutral-700" htmlFor={id}>
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[120px] w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 transition focus:border-[#049e6b] focus:outline-none focus:ring-2 focus:ring-[#049e6b]/20 disabled:bg-neutral-50 disabled:text-neutral-400"
        disabled={disabled}
        required={required}
      />
    </div>
  );
}

type ToggleFieldProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

function ToggleField({ id, label, checked, onChange, disabled }: ToggleFieldProps) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      <label
        htmlFor={id}
        className="flex h-11 cursor-pointer items-center rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-600 transition hover:border-neutral-300"
      >
        <input
          id={id}
          type="checkbox"
          className="h-4 w-4 border-neutral-300 text-neutral-900 focus:ring-neutral-900"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
        />
        <span className="ml-2">{label}</span>
      </label>
    </div>
  );
}
