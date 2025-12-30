import { NextResponse, userAgent, type NextRequest } from "next/server";

const DEVICE_COOKIE_NAME = "device";
const DEVICE_OVERRIDE_COOKIE_NAME = "device_override";
const DEVICE_OVERRIDE_COOKIE_VALUE = "1";
const DEVICE_QUERY_KEY = "device";
const DEVICE_HEADER_KEY = "x-device";
const INTERNAL_PREFIXES = ["/d", "/m"];
const PUBLIC_FILE_PATTERN = /\.(.*)$/;
const MOBILE_DEVICE_VALUE = "m";
const DESKTOP_DEVICE_VALUE = "d";

const ROUTE_DEVICE_HINTS: Array<{ prefix: string; device: string }> = [
  { prefix: "/categories", device: MOBILE_DEVICE_VALUE },
  { prefix: "/search", device: DESKTOP_DEVICE_VALUE },
];

function normalizeDevice(value: string | null | undefined) {
  return value === MOBILE_DEVICE_VALUE
    ? MOBILE_DEVICE_VALUE
    : value === DESKTOP_DEVICE_VALUE
      ? DESKTOP_DEVICE_VALUE
      : undefined;
}

function resolveDeviceFromPathname(pathname: string) {
  const hint = ROUTE_DEVICE_HINTS.find((entry) =>
    pathname.startsWith(entry.prefix),
  );
  return hint ? normalizeDevice(hint.device) : undefined;
}

function resolveInternalPathDevice(pathname: string) {
  return pathname.startsWith("/m")
    ? MOBILE_DEVICE_VALUE
    : pathname.startsWith("/d")
      ? DESKTOP_DEVICE_VALUE
      : undefined;
}

function resolveInferredDevice(req: NextRequest) {
  const { device: uaDevice } = userAgent(req);
  return uaDevice.type === "mobile" || uaDevice.type === "tablet"
    ? MOBILE_DEVICE_VALUE
    : DESKTOP_DEVICE_VALUE;
}

function resolveDevice(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const queryOverride = normalizeDevice(
    req.nextUrl.searchParams.get(DEVICE_QUERY_KEY),
  );

  if (queryOverride) {
    return queryOverride;
  }

  const internalPathDevice = resolveInternalPathDevice(pathname);
  if (internalPathDevice) {
    return internalPathDevice;
  }

  const hinted = resolveDeviceFromPathname(pathname);
  if (hinted) {
    return hinted;
  }

  const overrideEnabled =
    req.cookies.get(DEVICE_OVERRIDE_COOKIE_NAME)?.value ===
    DEVICE_OVERRIDE_COOKIE_VALUE;
  const cookieOverride = normalizeDevice(
    req.cookies.get(DEVICE_COOKIE_NAME)?.value,
  );

  if (overrideEnabled && cookieOverride) {
    return cookieOverride;
  }

  return resolveInferredDevice(req);
}

function applyVaryHeader(response: NextResponse, header: string) {
  const existing = response.headers.get("Vary");

  if (!existing) {
    response.headers.set("Vary", header);
    return;
  }

  if (existing === "*") {
    return;
  }

  const hasHeader = existing
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .includes(header.toLowerCase());

  if (!hasHeader) {
    response.headers.set("Vary", `${existing}, ${header}`);
  }
}

export function middleware(req: NextRequest) {
  const queryOverride = normalizeDevice(
    req.nextUrl.searchParams.get(DEVICE_QUERY_KEY),
  );
  const cookieOverride = normalizeDevice(
    req.cookies.get(DEVICE_COOKIE_NAME)?.value,
  );
  const overrideEnabled =
    req.cookies.get(DEVICE_OVERRIDE_COOKIE_NAME)?.value ===
    DEVICE_OVERRIDE_COOKIE_VALUE;
  const device = resolveDevice(req);

  const { pathname } = req.nextUrl;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(DEVICE_HEADER_KEY, device);

  const isInternalPath = INTERNAL_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (PUBLIC_FILE_PATTERN.test(pathname)) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    response.headers.set(DEVICE_HEADER_KEY, device);
    applyVaryHeader(response, DEVICE_HEADER_KEY);
    return response;
  }

  if (isInternalPath) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    response.headers.set(DEVICE_HEADER_KEY, device);
    applyVaryHeader(response, DEVICE_HEADER_KEY);
    const pathDevice = resolveInternalPathDevice(pathname);

    if (pathDevice) {
      if (pathDevice !== cookieOverride) {
        response.cookies.set(DEVICE_COOKIE_NAME, pathDevice, { path: "/" });
      }

      if (!overrideEnabled) {
        response.cookies.set(
          DEVICE_OVERRIDE_COOKIE_NAME,
          DEVICE_OVERRIDE_COOKIE_VALUE,
          {
            path: "/",
          },
        );
      }
    }
    return response;
  }

  const destination = req.nextUrl.clone();
  destination.pathname = `/${device}${pathname}`;

  const response = NextResponse.rewrite(destination, {
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set(DEVICE_HEADER_KEY, device);
  applyVaryHeader(response, DEVICE_HEADER_KEY);

  if (queryOverride) {
    if (device !== cookieOverride) {
      response.cookies.set(DEVICE_COOKIE_NAME, device, { path: "/" });
    }

    if (!overrideEnabled) {
      response.cookies.set(
        DEVICE_OVERRIDE_COOKIE_NAME,
        DEVICE_OVERRIDE_COOKIE_VALUE,
        {
          path: "/",
        },
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/data|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)",
  ],
};
