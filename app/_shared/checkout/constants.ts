import type { AddressFormState } from "./types";

export const ADDRESS_CACHE_PREFIX = "checkout_addresses";

export const DEFAULT_ADDRESS_FORM: AddressFormState = {
  id: undefined,
  firstName: "",
  lastName: "",
  phone: "",
  phoneCountryCode: "+86",
  wechat: "",
  email: "",
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

export const SELECTABLE_CARD_SELECTED_CLASSES =
  "border-[#049e6b] bg-[#049e6b]/10";

export const SELECTABLE_CARD_UNSELECTED_CLASSES =
  "border-neutral-200 hover:border-[#049e6b]/60 hover:bg-[#049e6b]/5 focus-within:border-[#049e6b]/60 focus-within:bg-[#049e6b]/5";
