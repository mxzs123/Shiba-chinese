"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Address, User } from "lib/api/types";
import { addAddressAction, setDefaultAddressAction } from "../actions";
import { DEFAULT_ADDRESS_FORM } from "../constants";
import type { AddressFormState } from "../types";
import { buildAddressCacheKey, mergeAddressSources } from "../utils";

type UseCheckoutAddressesOptions = {
  customer?: User;
  initialAddresses: Address[];
};

export function useCheckoutAddresses({
  customer,
  initialAddresses,
}: UseCheckoutAddressesOptions) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const addressCacheKey = useMemo(
    () => buildAddressCacheKey(customer?.id),
    [customer?.id],
  );

  const [selectedAddressId, setSelectedAddressId] = useState<
    string | undefined
  >(
    initialAddresses.find((entry) => entry.isDefault)?.id ||
      initialAddresses[0]?.id,
  );

  const [addressForm, setAddressForm] =
    useState<AddressFormState>(DEFAULT_ADDRESS_FORM);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressSubmitting, setAddressSubmitting] = useState(false);
  const [defaultUpdatingId, setDefaultUpdatingId] = useState<string | null>(
    null,
  );
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const persistAddresses = useCallback(
    (next: Address[]) => {
      setAddresses(next);
      if (!addressCacheKey) {
        return;
      }

      try {
        window.localStorage.setItem(addressCacheKey, JSON.stringify(next));
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Failed to cache checkout addresses", error);
        }
      }
    },
    [addressCacheKey],
  );

  // 从 localStorage 恢复缓存的地址
  useEffect(() => {
    if (!addressCacheKey) {
      return;
    }

    try {
      const raw = window.localStorage.getItem(addressCacheKey);
      if (!raw) {
        return;
      }

      const cached = JSON.parse(raw);
      if (!Array.isArray(cached) || cached.length === 0) {
        return;
      }

      setAddresses((prev) => mergeAddressSources(prev, cached));
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to read cached checkout addresses", error);
      }
    }
  }, [addressCacheKey]);

  // 当地址列表变化时，确保选中的地址仍然有效
  useEffect(() => {
    if (!addresses.length) {
      setSelectedAddressId(undefined);
      return;
    }

    if (selectedAddressId) {
      const exists = addresses.some((entry) => entry.id === selectedAddressId);
      if (exists) {
        return;
      }
    }

    const fallback =
      addresses.find((entry) => entry.isDefault)?.id || addresses[0]?.id;
    setSelectedAddressId(fallback);
  }, [addresses, selectedAddressId]);

  const selectedAddress = useMemo(
    () => addresses.find((entry) => entry.id === selectedAddressId),
    [addresses, selectedAddressId],
  );

  const updateAddressForm = useCallback((partial: Partial<AddressFormState>) => {
    setAddressForm((prev) => ({
      ...prev,
      ...partial,
    }));
  }, []);

  const resetAddressForm = useCallback(() => {
    setAddressForm(DEFAULT_ADDRESS_FORM);
    setAddressError(null);
    setEditingAddressId(null);
  }, []);

  const validateAddressForm = useCallback(() => {
    if (!addressForm.firstName.trim() || !addressForm.lastName.trim()) {
      return "请填写收件人的姓与名";
    }

    if (!addressForm.phoneCountryCode?.trim()) {
      return "请选择国际区号";
    }

    if (!addressForm.phone?.trim()) {
      return "请填写联系方式";
    }

    if (!addressForm.country.trim()) {
      return "请填写国家或地区";
    }

    if (!addressForm.city.trim()) {
      return "请填写城市";
    }

    if (!addressForm.address1.trim()) {
      return "请填写详细地址";
    }

    return null;
  }, [addressForm]);

  const handleSubmitAddress = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setAddressError(null);

      const validationError = validateAddressForm();
      if (validationError) {
        setAddressError(validationError);
        return;
      }

      if (!customer?.id) {
        setAddressError("未找到当前用户，无法保存地址");
        return;
      }

      try {
        setAddressSubmitting(true);
        const result = await addAddressAction(customer.id, addressForm);

        if (!result.success) {
          setAddressError(result.error);
          return;
        }

        persistAddresses(result.data.addresses);
        setSelectedAddressId(result.data.added.id);
        resetAddressForm();
        setIsAddingAddress(false);
        setEditingAddressId(null);
      } finally {
        setAddressSubmitting(false);
      }
    },
    [
      validateAddressForm,
      customer?.id,
      addressForm,
      persistAddresses,
      resetAddressForm,
    ],
  );

  const handleEditAddress = useCallback((address: Address) => {
    setIsAddingAddress(true);
    setEditingAddressId(address.id);
    setAddressError(null);
    setAddressForm({
      id: address.id,
      firstName: address.firstName ?? "",
      lastName: address.lastName ?? "",
      phone: address.phone ?? "",
      phoneCountryCode: address.phoneCountryCode ?? "+86",
      wechat: address.wechat ?? "",
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
    });
  }, []);

  const handleSetDefaultAddress = useCallback(
    async (addressId: string) => {
      if (!customer?.id) {
        setAddressError("未找到当前用户，无法设置默认地址");
        return;
      }

      try {
        setDefaultUpdatingId(addressId);
        const result = await setDefaultAddressAction(customer.id, addressId);

        if (!result.success) {
          setAddressError(result.error);
          return;
        }

        persistAddresses(result.data.addresses);
        setSelectedAddressId(addressId);
      } finally {
        setDefaultUpdatingId(null);
      }
    },
    [customer?.id, persistAddresses],
  );

  const handleToggleAddAddress = useCallback(() => {
    setIsAddingAddress((prev) => {
      const next = !prev;
      if (next === true) {
        resetAddressForm();
      } else {
        setEditingAddressId(null);
      }
      return next;
    });
    setAddressError(null);
  }, [resetAddressForm]);

  const handleCancelAddAddress = useCallback(() => {
    setIsAddingAddress(false);
    resetAddressForm();
  }, [resetAddressForm]);

  return {
    addresses,
    selectedAddressId,
    selectedAddress,
    addressForm,
    addressError,
    addressSubmitting,
    isAddingAddress,
    editingAddressId,
    defaultUpdatingId,
    setSelectedAddressId,
    updateAddressForm,
    resetAddressForm,
    handleSubmitAddress,
    handleEditAddress,
    handleSetDefaultAddress,
    handleToggleAddAddress,
    handleCancelAddAddress,
  };
}
