"use client";

import { useParams } from "next/navigation";

import { usePurchaseStore } from "@/lib/purchaseStore";
import { formatINR, formatTimestamp } from "@/helpers/formate";

const OrderSuccessByIdPage = () => {
    const { orderId: rawOrderId } = useParams<{ orderId?: string }>();
    const orderId = rawOrderId ? decodeURIComponent(rawOrderId) : "";

    const record = usePurchaseStore((s) =>
        orderId ? s.byOrderId[orderId] : undefined
    );

    const lastOrderId = usePurchaseStore((s) => s.lastOrderId);
    const fallback = usePurchaseStore((s) =>
        lastOrderId ? s.byOrderId[lastOrderId] : undefined
    );

    const data = record ?? fallback;
    console.log("Order Success Data:", data);

    const name = data?.productName ?? "Nike Shoes";
    const image = data?.productImage ?? "";
    const status = data?.status ?? "";
    const displayOrderId = data?.orderId ?? orderId;

    const rawAmount = data?.amount;
    const total = typeof rawAmount === "string" ? parseFloat(rawAmount) : (typeof rawAmount === "number" ? rawAmount : undefined);

    const rawMrp = data?.mrp;
    const mrp = typeof rawMrp === "string" ? parseFloat(rawMrp) : (typeof rawMrp === "number" ? rawMrp : undefined);

    const timestamp =
        data?.createdLabel ??
        formatTimestamp(
            data?.createdAt ? new Date(data.createdAt) : new Date()
        );

    return (
        <div className="w-full bg-[#161616] px-6 py-8 font-sans text-white">
            <div className="mx-auto flex w-full max-w-[548px] flex-col items-center pb-10 text-center">
                <img
                    src="/logo_sm.svg"
                    alt="Nike"
                    className="h-10 w-10 opacity-95"
                />

                <h1 className="mt-4 text-2xl font-semibold tracking-tight">
                    Successfully Ordered!
                </h1>

                <p className="mt-2 text-xs text-white/60">{timestamp}</p>

                <section className="mt-10 w-full rounded-lg bg-white/5 p-4 text-left backdrop-blur-md ring-1 ring-white/10">
                    <div className="flex items-center gap-4">
                        <div className="relative h-14 w-20 overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/10 flex items-center justify-center">
                            {image ? (
                                <img
                                    src={image}
                                    alt={name}
                                    className="h-full w-full object-contain p-1"
                                />
                            ) : (
                                <span className="truncate text-sm font-semibold">{name}</span>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <span className="truncate text-sm font-semibold">{name}</span>

                            <span className="mt-0.5 truncate text-[11px] text-white/55">
                                {displayOrderId ? `Order ${displayOrderId}` : "Order confirmed"}
                            </span>


                            <span className="mt-0.5 text-[11px] text-white/45">
                                Status: <span className="text-green-400/90">{status}</span>
                            </span>

                        </div>

                        <div className="shrink-0 text-right">
                            {total !== undefined && (
                                <span className="text-sm font-semibold text-white">
                                    {formatINR(total)}
                                </span>
                            )}

                            {mrp !== undefined && (
                                <span className="mt-0.5 text-[11px] text-white/40 line-through">
                                    {formatINR(mrp).replace(/\.00$/, "")}
                                </span>
                            )}
                        </div>
                    </div>
                </section>

                {!data && (
                    <div className="mt-6 text-sm text-white/60">
                        <span>No recent purchase found in this browser.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
export default OrderSuccessByIdPage;