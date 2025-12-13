import type { Address, AddressInput } from "./types";
import { users } from "./mock-data";
import {
  cloneAddress,
  createAddressRecord,
  formatAddressLines,
} from "./serializers";

function findUserRecord(userId: string) {
  return users.find((user) => user.id === userId);
}

export async function getCustomerAddresses(userId: string): Promise<Address[]> {
  const user = findUserRecord(userId);

  if (!user) {
    return [];
  }

  return user.addresses.map(cloneAddress);
}

export async function addCustomerAddress(
  userId: string,
  payload: AddressInput,
): Promise<Address> {
  return upsertCustomerAddress(userId, payload);
}

export async function upsertCustomerAddress(
  userId: string,
  payload: AddressInput,
): Promise<Address> {
  const user = findUserRecord(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const addressRecord = createAddressRecord(payload);
  const existing = addressRecord.id
    ? user.addresses.find((entry) => entry.id === addressRecord.id)
    : undefined;

  if (existing) {
    Object.assign(existing, addressRecord);
  } else {
    user.addresses.push(addressRecord);
  }

  if (addressRecord.isDefault) {
    user.addresses = user.addresses.map((entry) => ({
      ...entry,
      isDefault: entry.id === addressRecord.id,
      formatted: entry.formatted || formatAddressLines(entry),
    }));
    user.defaultAddress = user.addresses.find(
      (entry) => entry.id === addressRecord.id,
    );
  } else if (!user.defaultAddress) {
    addressRecord.isDefault = true;
    user.defaultAddress = addressRecord;
  } else if (
    existing &&
    user.defaultAddress?.id === existing.id &&
    !existing.isDefault
  ) {
    const fallbackCandidate =
      user.addresses.find(
        (entry) => entry.isDefault && entry.id !== existing.id,
      ) ||
      user.addresses.find((entry) => entry.id !== existing.id) ||
      user.addresses[0];

    if (fallbackCandidate) {
      user.addresses = user.addresses.map((entry) => ({
        ...entry,
        isDefault: entry.id === fallbackCandidate.id,
        formatted: entry.formatted || formatAddressLines(entry),
      }));
      user.defaultAddress = user.addresses.find(
        (entry) => entry.id === fallbackCandidate.id,
      );
    } else {
      user.defaultAddress = undefined;
    }
  }

  const updated = existing ?? addressRecord;

  return cloneAddress({
    ...updated,
    formatted: updated.formatted || formatAddressLines(updated),
  });
}

export async function setDefaultCustomerAddress(
  userId: string,
  addressId: string,
): Promise<Address | undefined> {
  const user = findUserRecord(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const target = user.addresses.find((entry) => entry.id === addressId);

  if (!target) {
    throw new Error("Address not found");
  }

  user.addresses = user.addresses.map((entry) => ({
    ...entry,
    isDefault: entry.id === addressId,
    formatted: entry.formatted || formatAddressLines(entry),
  }));

  const defaultAddress = user.addresses.find((entry) => entry.id === addressId);
  user.defaultAddress = defaultAddress;

  return defaultAddress ? cloneAddress(defaultAddress) : undefined;
}

export async function deleteCustomerAddress(
  userId: string,
  addressId: string,
): Promise<Address[]> {
  const user = findUserRecord(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const wasDefault = user.defaultAddress?.id === addressId;

  user.addresses = user.addresses
    .filter((entry) => entry.id !== addressId)
    .map((entry) => ({
      ...entry,
      formatted: entry.formatted || formatAddressLines(entry),
    }));

  if (wasDefault) {
    const fallback = user.addresses[0];
    if (fallback) {
      fallback.isDefault = true;
      user.defaultAddress = fallback;
    } else {
      user.defaultAddress = undefined;
    }
  } else if (
    user.defaultAddress &&
    !user.addresses.some((entry) => entry.id === user.defaultAddress?.id)
  ) {
    user.defaultAddress = user.addresses.find((entry) => entry.isDefault);
  }

  return user.addresses.map(cloneAddress);
}
