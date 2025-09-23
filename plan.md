# Desktop Auth & Checkout Plan

## Context Snapshot

- Mock auth/session store lives in `lib/api/auth-store.ts` (cookie `auth_session`, captcha stored in-memory, password PBKDF2).
- Mock `users` array still the single source of truth; serializers in `lib/api/serializers.ts` avoid mutation leaks.
- API routes ready: `/api/auth/{captcha,register,login,logout,session}`; all issue/clear cookies.
- Desktop auth UI shipped under `/d/(auth)/{login,register}` with shared shell + Zustand store (`hooks/useAuthStore.ts`).
- Captcha now rendered entirely client-side SVG — no third-party font dependency.
- `npm run build` + `npm run lint` both green after latest changes.

## Outstanding Work

1. **Profile Minimal Set**
   - Surface editable nickname/phone in a desktop account page (e.g. `/d/account/profile`).
   - Build form that talks to `updateUserProfile` (extend API route if needed) and keeps Zustand/auth cookie in sync.
2. **Address Management**
   - UX for listing + CRUD on addresses (likely `/d/account/addresses`).
   - Reuse `upsertCustomerAddress` & `deleteCustomerAddress`; expose through API routes (`/api/account/addresses`).
   - Support default toggle + optimistic updates in client store.
3. **Checkout Login Gate & Address Selection**
   - On “去结算” ensure auth: unauthenticated users redirected to `/login?next=/checkout`.
   - Checkout page should require login before rendering sensitive sections; load addresses from current user and allow select/create inline.
   - Mock “提交订单” route that validates login + selected address, returns success payload for `/d/checkout/success`.
4. **Verification & Cleanup**
   - Manual flow: 注册 → 登录 → 地址管理 → 加入购物车 → 去结算 → 下单。
   - Confirm middleware/device rewrite still intact for `/login`/`/register` (desktop + ?device overrides).
   - Note follow-up hooks for backend swap-in (documented in code comments or README section if needed).

## Implementation Notes

- All data remains mock/in-memory; avoid persisting beyond process lifetime.
- Favor server actions/API routes under `app/api` to keep parity with future backend integration.
- Preserve `AuthPageShell` aesthetic if adding additional auth-related views.
- Keep typography via global fonts (do not hardcode `font-family`).
- Remember to run `npm run lint` / `npm run build` after each major milestone.
