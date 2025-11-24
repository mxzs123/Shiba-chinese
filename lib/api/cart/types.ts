import type { CartItem } from "../types";

export type CartSnapshotLine = {
  merchandiseId: string;
  quantity: number;
  lineId?: string;
  backend?: CartItem["backend"];
};

export type CartSnapshot = {
  id: string;
  lines: CartSnapshotLine[];
  appliedCoupons: string[];
  updatedAt?: string;
};

export type CartLineOptions = {
  lineId?: string | number;
  backend?: CartItem["backend"];
  product?: import("../types").Product;
};

export type LegacyAddLine = { merchandiseId: string; quantity: number };
export type LegacyUpdateLine = { id: string; merchandiseId: string; quantity: number };
export type BackendUpdateLine = { id: string; nums: number; objectId?: number };
