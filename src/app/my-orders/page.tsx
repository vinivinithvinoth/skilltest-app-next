import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/authOptions";
import { getUserOrders, type Order } from "@/services/orderService";

export default async function MyOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/home");

  const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
  if (!accessToken) redirect("/home");

  const orders = (await getUserOrders(accessToken).catch(() => [])) ?? [];

  function orderId(o: Order, idx: number) {
    return o.id ?? (o as unknown as { order_id?: string }).order_id ?? String(idx + 1);
  }

  function getOrderTotal(o: Order): number | null {
    if (typeof o.total_amount === "number") return o.total_amount;
    const anyO = o as unknown as { total?: number | string; amount?: number | string; total_amount?: number | string };
    const v = anyO.total_amount ?? anyO.total ?? anyO.amount;
    const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
    return Number.isFinite(n) ? n : null;
  }

  function getOrderDate(o: Order): Date | null {
    const anyO = o as unknown as {
      created_at?: string;
      createdAt?: string;
      created?: string;
      created_on?: string;
      date?: string;
    };
    const raw = anyO.created_at ?? anyO.createdAt ?? anyO.created ?? anyO.created_on ?? anyO.date;
    if (!raw) return null;
    const d = new Date(raw);
    return Number.isFinite(d.getTime()) ? d : null;
  }

  function ordinal(n: number) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
  }

  function formatOrderTimestamp(d: Date) {
    const time = d.toLocaleString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
    const day = ordinal(Number(d.toLocaleString("en-IN", { day: "2-digit" })));
    const month = d.toLocaleString("en-IN", { month: "short" });
    const year = d.toLocaleString("en-IN", { year: "numeric" });
    return `${time}, ${day} ${month} ${year}`;
  }

  function formatINR(value: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
  }

  return (
    <div className="relative w-full bg-[#0B0B0B] px-6 py-10 font-sans text-white">
      {/* subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),rgba(11,11,11,0)_60%)]" />

      <main className="relative mx-auto w-full max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight">My Orders</h1>

        <div className="mt-8 grid max-w-2xl gap-5">
          {orders.length === 0 ? (
            <p className="text-sm text-white/60">No orders found.</p>
          ) : (
            orders.map((o, idx) => {
              const id = orderId(o, idx);
              const total = getOrderTotal(o);
              const mrp = total ? Math.round(total * 1.15) : null;
              const d = getOrderDate(o);
              const timestamp = d ? formatOrderTimestamp(d) : formatOrderTimestamp(new Date());

              // API doesn't reliably return product metadata yet; keep graceful fallbacks.
              const title =
                (o as unknown as { product_name?: string; name?: string; title?: string }).product_name ??
                (o as unknown as { product_name?: string; name?: string; title?: string }).name ??
                (o as unknown as { product_name?: string; name?: string; title?: string }).title ??
                "Nike Air Max 90";
              const subtitle =
                (o as unknown as { sku?: string; code?: string; product_code?: string }).sku ??
                (o as unknown as { sku?: string; code?: string; product_code?: string }).code ??
                (o as unknown as { sku?: string; code?: string; product_code?: string }).product_code ??
                `Order ${id}`;
              const image =
                (o as unknown as { image?: string; image_url?: string; thumbnail?: string; thumbnail_url?: string }).
                  image ??
                (o as unknown as { image?: string; image_url?: string; thumbnail?: string; thumbnail_url?: string }).
                  image_url ??
                (o as unknown as { image?: string; image_url?: string; thumbnail?: string; thumbnail_url?: string }).
                  thumbnail ??
                (o as unknown as { image?: string; image_url?: string; thumbnail?: string; thumbnail_url?: string }).
                  thumbnail_url ??
                "";

              return (
                <div
                  key={String(id)}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  {/* faint watermark */}
                  <div className="pointer-events-none absolute -left-1 top-1/2 -translate-y-1/2 select-none text-[84px] font-black tracking-tight text-white/5">
                    NIKE
                  </div>

                  <div className="relative flex items-start gap-4">
                    <div className="relative h-16 w-24 overflow-hidden rounded-2xl bg-gradient-to-br from-lime-400/80 to-lime-500/30 ring-1 ring-white/10">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.25)_70%)]" />
                      {image ? (
                        <img src={image} alt={title} className="relative h-full w-full object-contain p-2" />
                      ) : (
                        <img src="/logo_sm.svg" alt="" className="relative h-full w-full object-contain p-5 opacity-90" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{title}</p>
                      <p className="mt-0.5 truncate text-[11px] text-white/55">{subtitle}</p>
                      <p className="mt-2 text-[10px] text-white/40">{timestamp}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      {total !== null ? <p className="text-sm font-semibold">{formatINR(total)}</p> : null}
                      {mrp !== null ? (
                        <p className="mt-0.5 text-[10px] text-white/35 line-through">{formatINR(mrp)}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}


