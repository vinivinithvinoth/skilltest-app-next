import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PurchaseRecord = {
  orderId: string;
  productId?: string; // product_id or variation_product_id (optional)
  status?: string;
  amount?: number;
  mrp?: number;
  productName?: string;
  productImage?: string;
  // Prefer server-provided formatted label if available (e.g. "02:03 AM, 07 Jan 2026")
  createdLabel?: string;
  // Otherwise ISO string
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


