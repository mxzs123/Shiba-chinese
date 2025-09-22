import { create } from "zustand";
import type { User } from "@/lib/api/types";

type AuthState = {
  user?: User;
  setUser: (user: User | undefined) => void;
  clearUser: () => void;
  updateUser: (updater: (user: User) => User) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: undefined,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: undefined }),
  updateUser: (updater) =>
    set((state) => {
      if (!state.user) {
        return state;
      }

      const nextUser = updater({ ...state.user });
      return { user: nextUser };
    }),
}));
