import type { Address } from "lib/api/types";

export function formatAddressLines(address: Address): string[] {
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
      address.countryCode
        ? `(${address.countryCode.toUpperCase()})`
        : undefined,
    ]
      .filter(Boolean)
      .join(" "),
  ].filter((value): value is string =>
    Boolean(value && value.trim().length > 0),
  );

  return lines;
}

export function formatAddressPhone(address: Address): string {
  const parts = [address.phoneCountryCode, address.phone]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value && value.length > 0));

  return parts.join(" ");
}

export function mergeAddressSources(
  primary: Address[],
  fallback: Address[],
): Address[] {
  if (!fallback.length) {
    return primary;
  }

  const map = new Map(primary.map((entry) => [entry.id, entry]));

  fallback.forEach((entry) => {
    if (!entry || !entry.id || map.has(entry.id)) {
      return;
    }
    map.set(entry.id, entry);
  });

  return Array.from(map.values());
}
