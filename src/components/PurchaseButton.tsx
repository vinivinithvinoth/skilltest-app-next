"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { usePurchaseStore } from "@/lib/purchaseStore";

type Props =
  | { productId: string | number; variationProductId?: never }
  | { variationProductId: string | number; productId?: never };

export default function PurchaseButton(
  props: Props & { variant?: "light" | "dark" | "white"; label?: string },
) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setPurchase = usePurchaseStore((s) => s.setPurchase);

  async function purchase() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/purchase-product/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          "productId" in props
            ? { product_id: props.productId }
            : { variation_product_id: props.variationProductId },
        ),
      });
      const data = (await res.json().catch(() => null)) as
        | null
        | {
            message?: string;
            order?: {
              id?: string;
              total_amount?: number;
              payment_status?: string;
              created?: string;
              order_details?: Array<{
                product_name?: string;
                product_image?: string;
                amount?: number;
                price?: number;
                product?: string | number;
                variation_product?: string | number | null;
              }>;
            };
            order_details?: Array<{
              product_name?: string;
              product_image?: string;
              amount?: number;
              price?: number;
            }>;
            error?: string;
          };
      if (!res.ok || !data?.order?.id) {
        setError(data?.error ?? "Purchase failed");
        return;
      }

      const productId =
        "productId" in props ? String(props.productId) : String(props.variationProductId);

      const detail = data.order.order_details?.[0] ?? data.order_details?.[0];
      setPurchase({
        orderId: data.order.id,
        productId,
        status: data.order.payment_status,
        amount: typeof detail?.amount === "number" ? detail.amount : data.order.total_amount,
        productName: detail?.product_name,
        productImage: detail?.product_image,
        createdAt: data.order.created,
      });

      router.push(`/order-success/${encodeURIComponent(data.order.id)}`);
    } catch {
      setError("Purchase failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className={
          props.variant === "dark"
            ? "h-10 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-medium text-white backdrop-blur disabled:opacity-60 hover:bg-white/15"
            : props.variant === "white"
              ? "h-11 rounded-xl bg-white px-6 text-sm font-semibold text-black disabled:opacity-60 hover:bg-white/90"
              : "h-10 rounded-xl bg-black px-4 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-black"
        }
        onClick={purchase}
        disabled={loading}
      >
        {loading ? "Buying..." : (props.label ?? "Buy")}
      </button>
      {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}


