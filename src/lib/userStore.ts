import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserState = {
  userName: string;
  setUserName: (name: string) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userName: "",
      setUserName: (name) => set({ userName: name }),
      clearUser: () => set({ userName: "" }),
    }),
    { name: "user-store-v1" },
  ),
);


