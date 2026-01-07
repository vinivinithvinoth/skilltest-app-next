import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PurchaseRecord = {
  orderId: string;
  productId?: string; 
  status?: string;
  amount?: number;
  mrp?: number;
  productName?: string;
  productImage?: string;
  createdLabel?: string;
  createdAt?: string;
};

type PurchaseState = {
  byOrderId: Record<string, PurchaseRecord>;
  lastOrderId?: string;
  setPurchase: (p: PurchaseRecord) => void;
  clearPurchase: (orderId: string) => void;
  clearAll: () => void;
};

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set) => ({
      byOrderId: {},
      lastOrderId: undefined,
      setPurchase: (p) =>
        set((s) => ({
          byOrderId: { ...s.byOrderId, [p.orderId]: p },
          lastOrderId: p.orderId,
        })),
      clearPurchase: (orderId) =>
        set((s) => {
          const next = { ...s.byOrderId };
          delete next[orderId];
          return { byOrderId: next };
        }),
      clearAll: () => set({ byOrderId: {}, lastOrderId: undefined }),
    }),
    { name: "purchase-store-v1" },
  ),
);


