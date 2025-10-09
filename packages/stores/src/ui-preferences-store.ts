import { create } from "zustand";

type NavigationVariant = "sales" | "distributor";

interface UIPreferencesState {
  navigationVariant: NavigationVariant;
  setNavigationVariant: (variant: NavigationVariant) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: (collapsed?: boolean) => void;
}

export const useUIPreferencesStore = create<UIPreferencesState>((set) => ({
  navigationVariant: "sales",
  setNavigationVariant: (variant) => set({ navigationVariant: variant }),
  isSidebarCollapsed: false,
  toggleSidebar: (collapsed) =>
    set((state) => ({
      isSidebarCollapsed:
        typeof collapsed === "boolean" ? collapsed : !state.isSidebarCollapsed,
    })),
}));
