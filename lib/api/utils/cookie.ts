import { headers } from "next/headers";

export const CART_ID_COOKIE = "cartId";
export const CART_STATE_COOKIE = "cartState";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type ForwardedHeader = string | null | undefined;

export function normalizeProto(value: ForwardedHeader) {
  if (!value) {
    return undefined;
  }

  const [first] = value.split(",");
  if (!first) {
    return undefined;
  }

  return first
    .trim()
    .replace(/^proto=/i, "")
    .replace(/"/g, "")
    .toLowerCase();
}

export function extractProtoFromForwarded(value: ForwardedHeader) {
  if (!value) {
    return undefined;
  }

  const segments = value.split(";");
  for (const segment of segments) {
    const trimmed = segment.trim();
    if (trimmed.toLowerCase().startsWith("proto=")) {
      return normalizeProto(trimmed);
    }
  }

  return undefined;
}

export async function shouldUseSecureCookies(): Promise<boolean> {
  try {
    const headerStore = await headers();

    const forwardedProto = normalizeProto(
      headerStore.get("x-forwarded-proto") ||
        headerStore.get("x-forwarded-protocol"),
    );

    if (forwardedProto) {
      return forwardedProto === "https";
    }

    const forwarded = extractProtoFromForwarded(headerStore.get("forwarded"));
    if (forwarded) {
      return forwarded === "https";
    }

    const forwardedSsl = headerStore.get("x-forwarded-ssl");
    if (forwardedSsl) {
      return forwardedSsl.trim().toLowerCase() === "on";
    }

    const cfVisitor = headerStore.get("cf-visitor");
    if (cfVisitor) {
      try {
        const parsed = JSON.parse(cfVisitor);
        const scheme = typeof parsed?.scheme === "string" ? parsed.scheme : "";
        if (scheme) {
          return scheme.toLowerCase() === "https";
        }
      } catch (error) {
        // ignore malformed JSON
      }
    }
  } catch (error) {
    // Fallback handled below
  }

  return false;
}

export async function getCartCookieOptions() {
  const secure = await shouldUseSecureCookies();

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure,
    maxAge: CART_COOKIE_MAX_AGE,
  };
}
