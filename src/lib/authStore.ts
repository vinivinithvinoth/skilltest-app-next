import { create } from "zustand";

type AuthFlowState = {
  phone: string;
  lastOtp?: string;
  userExists?: boolean;
  setPhone: (phone: string) => void;
  setVerifyMeta: (meta: { lastOtp?: string; userExists?: boolean }) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthFlowState>((set) => ({
  phone: "",
  lastOtp: undefined,
  userExists: undefined,
  setPhone: (phone) => set({ phone }),
  setVerifyMeta: (meta) => set(meta),
  reset: () => set({ phone: "", lastOtp: undefined, userExists: undefined }),
}));


