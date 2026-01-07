"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { usePurchaseStore } from "@/lib/purchaseStore";

export default function OrderSuccessIndexPage() {
    const router = useRouter();
    const lastOrderId = usePurchaseStore((s) => s.lastOrderId);

    useEffect(() => {
        if (lastOrderId) {
            router.replace(`/order-success/${encodeURIComponent(lastOrderId)}`);
        } else {
            router.replace("/products");
        }
    }, [lastOrderId, router]);

    return null;
}


