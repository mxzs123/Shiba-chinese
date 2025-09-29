import { NextResponse, userAgent, type NextRequest } from "next/server";

const DEVICE_COOKIE_NAME = "device";
const DEVICE_QUERY_KEY = "device";
const DEVICE_HEADER_KEY = "x-device";
const INTERNAL_PREFIXES = ["/d", "/m"];
const PUBLIC_FILE_PATTERN = /\.(.*)$/;
const MOBILE_DEVICE_VALUE = "m";
const DESKTOP_DEVICE_VALUE = "d";

function resolveDevice(req: NextRequest) {
  const queryOverride = req.nextUrl.searchParams.get(DEVICE_QUERY_KEY);
  const cookieOverride = req.cookies.get(DEVICE_COOKIE_NAME)?.value;
  const { device: uaDevice } = userAgent(req);

  const inferred =
    uaDevice.type === "mobile" || uaDevice.type === "tablet"
      ? MOBILE_DEVICE_VALUE
      : DESKTOP_DEVICE_VALUE;

  const resolved = queryOverride || cookieOverride || inferred;

  return resolved === MOBILE_DEVICE_VALUE
    ? MOBILE_DEVICE_VALUE
    : DESKTOP_DEVICE_VALUE;
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
  const device = resolveDevice(req);

  // TEMPORARY: Mobile shell (/m) is not yet implemented.
  // Currently, all mobile traffic falls back to the desktop shell (/d).
  // TODO: Remove this fallback once app/m directory structure is complete.
  const rewriteTargetDevice =
    device === MOBILE_DEVICE_VALUE ? DESKTOP_DEVICE_VALUE : device;

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
    return response;
  }

  const destination = req.nextUrl.clone();
  destination.pathname = `/${rewriteTargetDevice}${pathname}`;

  const response = NextResponse.rewrite(destination, {
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set(DEVICE_HEADER_KEY, device);
  applyVaryHeader(response, DEVICE_HEADER_KEY);

  const queryOverride = req.nextUrl.searchParams.get(DEVICE_QUERY_KEY);
  const cookieOverride = req.cookies.get(DEVICE_COOKIE_NAME)?.value;

  if (queryOverride && queryOverride !== cookieOverride) {
    response.cookies.set(DEVICE_COOKIE_NAME, device, { path: "/" });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)",
  ],
};
