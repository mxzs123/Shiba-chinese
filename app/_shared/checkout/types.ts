import type { AddressInput } from "lib/api/types";

export type AddressFormState = AddressInput;

export type PaymentStep = "idle" | "qr" | "help" | "success";

export type CheckoutVariant = "desktop" | "mobile";
