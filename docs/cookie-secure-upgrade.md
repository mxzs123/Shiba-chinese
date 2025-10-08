# Cookie Secure Flag Upgrade Checklist

## Overview

Unify how we set the `secure` attribute on cookies across the project so deployments behind HTTP-terminating proxies behave consistently. Reuse the existing helpers `shouldUseSecureCookies()` and `getCartCookieOptions()` introduced for the cart flow.

## Action Items

- [ ] `lib/api/auth-store.ts`
  - Replace direct `cookies().set(...)` calls with helper-derived options when writing session-related cookies.
  - Ensure session invalidation mirrors the same logic when clearing cookies.
- [ ] `app/api/auth/logout/route.ts`
  - Update logout handler to clear cookies using helper-aware options to avoid mismatched attributes.
- [ ] `app/d/checkout/page.tsx`
  - Swap manual cookie writes for selection filters to use `shouldUseSecureCookies()` (or shared wrapper) so desktop checkout respects deployment protocol.
- [ ] `app/m/checkout/page.tsx`
  - Mirror the desktop checkout fixes for mobile shell to keep device selections in sync.

## Verification

- Run `npm run lint`, `npm run prettier:check`, and `npm run build` after each batch of updates.
- Manually inspect the `Set-Cookie` headers in staging/production to confirm `secure` toggles correctly when proxied over HTTPS.
