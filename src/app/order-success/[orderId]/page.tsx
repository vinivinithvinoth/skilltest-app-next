"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { usePurchaseStore } from "@/lib/purchaseStore";

function formatINR(value: string | number) {
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n)) return String(value);
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);
}

function formatTimestamp(d: Date) {
    const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).format(d);
    const day = d.getDate();
    const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(d);
    const year = new Intl.DateTimeFormat("en-US", { year: "numeric" }).format(d);
    const suffix = (n: number) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
    };
    return `${time}, ${suffix(day)} ${month} ${year}`;
}

export default function OrderSuccessByIdPage() {
    const params = useParams<{ orderId: string }>();
    const orderId = params?.orderId ? decodeURIComponent(params.orderId) : "";

    const record = usePurchaseStore((s) => (orderId ? s.byOrderId[orderId] : undefined));
    const lastOrderId = usePurchaseStore((s) => s.lastOrderId);
    const fallback = usePurchaseStore((s) => (lastOrderId ? s.byOrderId[lastOrderId] : undefined));
    const data = record ?? fallback;

    const name = data?.productName ?? "Nike Shoes";
    const image = data?.productImage ?? "";
    const status = data?.status ?? "";
    const total = typeof data?.amount === "number" ? data.amount : undefined;
    const mrp = typeof data?.mrp === "number" ? data.mrp : undefined;

    const timestamp =
        data?.createdLabel ??
        (data?.createdAt ? formatTimestamp(new Date(data.createdAt)) : formatTimestamp(new Date()));

    return (
        <div className="w-full bg-[#161616] px-6 py-8 font-sans text-white">
            <div className="mx-auto flex w-full max-w-[548px] flex-col items-center pb-10 text-center">
                <img src="/logo_sm.svg" alt="Nike" className="h-10 w-10 opacity-95" />

                <h1 className="mt-4 text-center text-2xl font-semibold tracking-tight">Successfully Ordered!</h1>
                <p className="mt-2 text-center text-xs text-white/60">{timestamp}</p>

                <section className="mt-10 w-full rounded-lg bg-white/5 p-4 text-left backdrop-blur">
                    <div className="flex items-center gap-4">
                        <div className="relative h-14 w-20 overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 ring-1 ring-white/10">
                            {image ? (
                                <img src={image} alt={name} className="w-full object-contain p-2" />
                            ) : (
                                <img src="/logo_sm.svg" alt="" className="w-full object-contain p-4 opacity-80" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{name}</p>
                            <p className="mt-0.5 truncate text-[11px] text-white/55">
                                {orderId ? `Order ${orderId}` : "Order confirmed"}
                            </p>
                            {status ? <p className="mt-0.5 text-[11px] text-white/55">Payment: {status}</p> : null}
                        </div>

                        <div className="shrink-0 text-right">
                            {typeof total === "number" ? <p className="text-sm font-semibold">{formatINR(total)}</p> : null}
                            {typeof mrp === "number" ? (
                                <p className="mt-0.5 text-[11px] text-white/45 line-through">{formatINR(mrp)}</p>
                            ) : null}
                        </div>
                    </div>
                </section>

                {!data ? (
                    <div className="mt-6 text-center text-sm text-white/60">
                        <p>No recent purchase found in this browser.</p>
                        <div className="mt-3 flex justify-center gap-4">
                            <Link className="underline underline-offset-4 hover:text-white" href="/products">
                                Back to Products
                            </Link>
                            <Link className="underline underline-offset-4 hover:text-white" href="/my-orders">
                                View My Orders
                            </Link>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}


