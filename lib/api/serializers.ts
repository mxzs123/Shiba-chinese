import type {
  Address,
  AddressInput,
  CustomerCoupon,
  Membership,
  PointAccount,
  User,
} from "./types";

export function formatAddressLines(address: Address) {
  const lines = [
    [address.province, address.city, address.district, address.address1]
      .filter(Boolean)
      .join(" "),
    address.address2,
    [address.city, address.country].filter(Boolean).join(" "),
    address.postalCode
      ? `${address.postalCode}${address.countryCode ? ` ${address.countryCode}` : ""}`
      : undefined,
  ].filter((value): value is string => Boolean(value && value.trim().length > 0));

  return lines.length ? lines : undefined;
}

export function cloneAddress(address: Address): Address {
  return {
    ...address,
    formatted: address.formatted
      ? [...address.formatted]
      : formatAddressLines(address),
  };
}

export function clonePointAccount(account: PointAccount): PointAccount {
  return {
    ...account,
    transactions: account.transactions.map((entry) => ({ ...entry })),
  };
}

export function cloneMembership(membership: Membership): Membership {
  return {
    ...membership,
    benefits: [...membership.benefits],
    next: membership.next ? { ...membership.next } : undefined,
  };
}

export function cloneCustomerCoupon(coupon: CustomerCoupon): CustomerCoupon {
  return {
    ...coupon,
    coupon: { ...coupon.coupon },
  };
}

export function cloneUser(user: User): User {
  return {
    ...user,
    defaultAddress: user.defaultAddress
      ? cloneAddress(user.defaultAddress)
      : undefined,
    addresses: user.addresses.map(cloneAddress),
    loyalty: user.loyalty ? clonePointAccount(user.loyalty) : undefined,
    membership: user.membership ? cloneMembership(user.membership) : undefined,
    coupons: user.coupons ? user.coupons.map(cloneCustomerCoupon) : undefined,
  };
}

export function createAddressRecord(input: AddressInput): Address {
  const address: Address = {
    id: input.id || `addr-${crypto.randomUUID()}`,
    firstName: (input.firstName || "").trim(),
    lastName: (input.lastName || "").trim(),
    phone: input.phone?.trim() || undefined,
    company: input.company?.trim() || undefined,
    country: input.country?.trim() || "中国",
    countryCode: input.countryCode?.trim().toUpperCase() || "CN",
    province: input.province?.trim() || undefined,
    city: (input.city || "").trim(),
    district: input.district?.trim() || undefined,
    postalCode: input.postalCode?.trim() || undefined,
    address1: (input.address1 || "").trim(),
    address2: input.address2?.trim() || undefined,
    isDefault: Boolean(input.isDefault),
  };

  const formatted = formatAddressLines(address);
  if (formatted) {
    address.formatted = formatted;
  }

  return address;
}
