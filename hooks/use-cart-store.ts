import { create } from "zustand";

type CartStore = {
  isOpen: boolean;
  lastQuantity: number | undefined;
  open: () => void;
  close: () => void;
  setLastQuantity: (quantity: number | undefined) => void;
};

export const useCartStore = create<CartStore>((set) => ({
  isOpen: false,
  lastQuantity: undefined,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setLastQuantity: (quantity) => set({ lastQuantity: quantity }),
}));
