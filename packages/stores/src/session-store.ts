import { create } from "zustand";

import type { Session } from "@shiba/models";

export type SessionStatus =
  | "unknown"
  | "loading"
  | "authenticated"
  | "unauthenticated";

interface SessionState {
  session?: Session;
  status: SessionStatus;
  setSession: (session: Session) => void;
  clearSession: () => void;
  markUnauthenticated: () => void;
  markLoading: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  session: undefined,
  status: "unknown",
  setSession: (session) => set({ session, status: "authenticated" }),
  clearSession: () => set({ session: undefined, status: "unauthenticated" }),
  markUnauthenticated: () => set({ status: "unauthenticated" }),
  markLoading: () => set({ status: "loading" }),
}));
