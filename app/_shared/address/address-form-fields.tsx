"use client";

import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";

import type { AddressInput } from "@/lib/api/types";
import { cn } from "@/lib/utils";

import { PhoneInput } from "./phone-input";

export type AddressFormValue = AddressInput;

type AddressFormFieldsProps = {
  value: AddressFormValue;
  onChange: (partial: Partial<AddressFormValue>) => void;
  disabled?: boolean;
  showDefaultToggle?: boolean;
};

const COUNTRIES = [
  { name: "中国", code: "CN" },
  { name: "中国香港", code: "HK" },
  { name: "中国澳门", code: "MO" },
  { name: "中国台湾", code: "TW" },
  { name: "美国", code: "US" },
  { name: "加拿大", code: "CA" },
  { name: "澳大利亚", code: "AU" },
  { name: "新西兰", code: "NZ" },
  { name: "英国", code: "GB" },
  { name: "新加坡", code: "SG" },
  { name: "马来西亚", code: "MY" },
  { name: "日本", code: "JP" },
  { name: "韩国", code: "KR" },
  { name: "德国", code: "DE" },
  { name: "法国", code: "FR" },
  { name: "意大利", code: "IT" },
  { name: "西班牙", code: "ES" },
  { name: "荷兰", code: "NL" },
  { name: "瑞典", code: "SE" },
  { name: "瑞士", code: "CH" },
  { name: "俄罗斯", code: "RU" },
  { name: "泰国", code: "TH" },
  { name: "越南", code: "VN" },
  { name: "菲律宾", code: "PH" },
  { name: "印度尼西亚", code: "ID" },
];

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

  // Initialize default country if empty
  useEffect(() => {
    if (!value.countryCode && !value.country) {
      onChange({ country: "中国", countryCode: "CN" });
    }
  }, [value.country, value.countryCode, onChange]);

  const applyChange = (partial: Partial<AddressFormValue>) => {
    onChange(partial);
  };

  const handleChange = (
    field: keyof AddressFormValue,
    next: string | boolean,
  ) => {
    applyChange({
      [field]: typeof next === "string" ? next : next,
    } as Partial<AddressFormValue>);
  };

  const detailedAddressValue = value.address2
    ? `${value.address1}${value.address1 ? "\n" : ""}${value.address2}`
    : value.address1;

  return (
    <div className="space-y-5">
      {/* 1. Name Group - 收件人姓名 */}
      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          id={buildFieldId(idPrefix, "lastName")}
          label="姓"
          placeholder="例如：Chen"
          value={value.lastName}
          onChange={(next) => handleChange("lastName", next)}
          disabled={disabled}
          required
        />
        <TextField
          id={buildFieldId(idPrefix, "firstName")}
          label="名"
          placeholder="例如：Li"
          value={value.firstName}
          onChange={(next) => handleChange("firstName", next)}
          disabled={disabled}
          required
        />
      </div>

      {/* 2. Phone - 联系电话 */}
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-neutral-700"
          htmlFor={buildFieldId(idPrefix, "phone")}
        >
          联系电话
        </label>
        <PhoneInput
          dialCode={value.phoneCountryCode || "+86"}
          number={value.phone ?? ""}
          onDialCodeChange={(next) => handleChange("phoneCountryCode", next)}
          onNumberChange={(next) => handleChange("phone", next)}
          disabled={disabled}
        />
      </div>

      {/* 3. Email - 邮箱（选填） */}
      <TextField
        id={buildFieldId(idPrefix, "email")}
        label="邮箱（选填）"
        placeholder="例如：name@example.com"
        value={value.email ?? ""}
        onChange={(next) => handleChange("email", next)}
        disabled={disabled}
        type="email"
      />

      {/* 4. WeChat - 微信（选填） */}
      <TextField
        id={buildFieldId(idPrefix, "wechat")}
        label="微信（选填）"
        placeholder="用于客服主动联系"
        value={value.wechat ?? ""}
        onChange={(next) => handleChange("wechat", next)}
        disabled={disabled}
      />

      {/* 5. Country Selection - 国家/地区 */}
      <div className="space-y-2">
        <label
          className="text-sm font-medium text-neutral-700"
          htmlFor={buildFieldId(idPrefix, "country")}
        >
          国家/地区
        </label>
        <CountrySelect
          value={value}
          onChange={(countryName, countryCode) => {
            applyChange({ country: countryName, countryCode });
          }}
          disabled={disabled}
        />
      </div>

      {/* 6. Province & City - 省份和城市 */}
      <div className="grid gap-5 md:grid-cols-2">
        <TextField
          id={buildFieldId(idPrefix, "province")}
          label="省份"
          placeholder="例如：上海市"
          value={value.province ?? ""}
          onChange={(next) => handleChange("province", next)}
          disabled={disabled}
          required
        />
        <TextField
          id={buildFieldId(idPrefix, "city")}
          label="城市"
          placeholder="例如：浦东新区"
          value={value.city ?? ""}
          onChange={(next) => handleChange("city", next)}
          disabled={disabled}
          required
        />
      </div>

      {/* 7. Address Details - 详细地址 */}
      <TextAreaField
        id={buildFieldId(idPrefix, "address1")}
        label="详细地址"
        placeholder="例如：张江路 888 号 3 号楼"
        value={detailedAddressValue}
        onChange={(next) =>
          applyChange({
            address1: next,
            address2: "",
          })
        }
        disabled={disabled}
        required
      />

      {/* 8. Postal Code - 邮政编码（选填） */}
      <TextField
        id={buildFieldId(idPrefix, "postalCode")}
        label="邮政编码（选填）"
        placeholder="例如：200000"
        value={value.postalCode ?? ""}
        onChange={(next) => handleChange("postalCode", next)}
        disabled={disabled}
      />

      {/* 9. Default Toggle - 设为默认地址 */}
      {showDefaultToggle && (
        <ToggleField
          id={buildFieldId(idPrefix, "default")}
          label="设为默认地址"
          checked={Boolean(value.isDefault)}
          onChange={(checked) => handleChange("isDefault", checked)}
          disabled={disabled}
        />
      )}
    </div>
  );
}

// --- Sub Components ---

function CountrySelect({
  value,
  onChange,
  disabled,
}: {
  value: AddressFormValue;
  onChange: (name: string, code: string) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");

  // Determine current selected object based on code or name
  const selectedCountry = useMemo(() => {
    return (
      COUNTRIES.find(
        (c) =>
          c.code === value.countryCode ||
          (value.country && c.name === value.country),
      ) || { name: value.country || "", code: value.countryCode || "" }
    );
  }, [value.country, value.countryCode]);

  const filteredCountries =
    query === ""
      ? COUNTRIES
      : COUNTRIES.filter((person) => {
          return person.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <Combobox
      value={selectedCountry}
      onChange={(newVal) => {
        if (newVal) {
          onChange(newVal.name, newVal.code);
        }
      }}
      disabled={disabled}
      onClose={() => setQuery("")}
    >
      <div className="relative">
        <div className="relative w-full cursor-default overflow-hidden rounded-xl border border-neutral-200 bg-white text-left focus-within:border-[#049e6b] focus-within:ring-2 focus-within:ring-[#049e6b]/20 disabled:bg-neutral-50 disabled:text-neutral-400">
          <ComboboxInput
            className="w-full border-none py-3 pl-4 pr-10 text-sm leading-5 text-neutral-900 focus:ring-0 disabled:bg-neutral-50 disabled:text-neutral-400"
            displayValue={(country: typeof selectedCountry) => country.name}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索国家/地区"
            autoComplete="off"
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown
              className="h-4 w-4 text-neutral-400"
              aria-hidden="true"
            />
          </ComboboxButton>
        </div>
        <ComboboxOptions
          transition
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
        >
          {filteredCountries.length === 0 && query !== "" ? (
            <div className="relative cursor-default select-none px-4 py-2 text-neutral-500">
              未找到结果
            </div>
          ) : (
            filteredCountries.map((country) => (
              <ComboboxOption
                key={country.code}
                value={country}
                className="group relative cursor-default select-none py-2 pl-10 pr-4 text-neutral-900 data-[focus]:bg-[#049e6b]/10 data-[focus]:text-[#03583b]"
              >
                {({ selected }) => (
                  <>
                    <span
                      className={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {country.name}
                    </span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#049e6b]">
                        <Check className="h-4 w-4" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
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
  className?: string;
  inputClassName?: string;
  type?: string;
};

function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  required,
  className,
  inputClassName,
  type = "text",
}: TextFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-neutral-700" htmlFor={id}>
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        className={cn(
          "h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 transition focus:border-[#049e6b] focus:outline-none focus:ring-2 focus:ring-[#049e6b]/20 disabled:bg-neutral-50 disabled:text-neutral-400",
          inputClassName,
        )}
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
  className?: string;
};

function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  required,
  className,
}: TextAreaFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-neutral-700" htmlFor={id}>
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[100px] w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 transition focus:border-[#049e6b] focus:outline-none focus:ring-2 focus:ring-[#049e6b]/20 disabled:bg-neutral-50 disabled:text-neutral-400"
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
  className?: string;
};

function ToggleField({
  id,
  label,
  checked,
  onChange,
  disabled,
  className,
}: ToggleFieldProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <label htmlFor={id} className="flex h-5 items-center cursor-pointer">
        <input
          id={id}
          type="checkbox"
          className="h-4 w-4 rounded border-neutral-300 text-[#049e6b] focus:ring-[#049e6b]"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          disabled={disabled}
        />
      </label>
      <label
        htmlFor={id}
        className="text-sm font-medium text-neutral-700 cursor-pointer select-none"
      >
        {label}
      </label>
    </div>
  );
}
