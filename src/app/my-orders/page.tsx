import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/authOptions";
import { getUserOrders } from "@/services/orderService";
import type { Order } from "@/services/orderService";
import { formatINR, formatOrderTimestamp, getOrderDate, getOrderTotal } from "@/helpers/formate";



const MyOrdersPage = async () => {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/home");

  const accessToken = (session as { accessToken?: string }).accessToken;
  if (!accessToken) redirect("/home");

  const orders: Order[] = (await getUserOrders(accessToken).catch(() => [])) ?? [];
  console.log(orders, "orders");

  return (
    <div className="relative w-full bg-[#0B0B0B] px-6 py-10 font-sans text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),rgba(11,11,11,0)_60%)]" />

      <main className="relative mx-auto w-full max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight">My Orders</h1>

        <div className="mt-8 grid max-w-2xl gap-5">
          {orders.length === 0 ? (
            <p className="text-sm text-white/60">No orders found.</p>
          ) : (
            orders.map((order, index) => {
              const id = order?.id ?? (order.order_id ? order.order_id : String(index + 1));
              const total = getOrderTotal(order);
              const orderMrp = order.product_mrp ? (typeof order.product_mrp === 'string' ? Number(order.product_mrp) : order.product_mrp) : null;
              const mrp = orderMrp ?? (total ? Math.round(total * 1.15) : null);

              const title =
                order.product_name ?? "Product";
              const subtitle =
                order?.order_id ??
                `Order ${id}`;
              const image =
                order.product_image ??
                "";

              const date = getOrderDate(order);

              return (
                <div
                  key={id}
                  className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#1A1A1A]/80 p-4 transition-all hover:bg-[#1A1A1A]"
                >
                  <div className="relative flex items-center gap-4">
                    <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-[#B5E445]">
                      <div className="pointer-events-none absolute -bottom-2 -left-2 text-4xl font-black text-black/10 select-none italic">
                        NIKE
                      </div>

                      {image ? (
                        <img
                          src={image}
                          alt={title}
                          className="relative z-10 h-full w-full object-contain p-2"
                        />
                      ) : (
                        <img
                          src="/logo_sm.svg"
                          alt=""
                          className="relative z-10 h-full w-full object-contain p-4 opacity-40"
                        />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch py-0.5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-medium text-white/95 leading-tight">
                            {title}
                          </h3>
                          <p className="mt-1 truncate text-[11px] text-white/50 leading-tight">
                            {subtitle}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-baseline gap-2 text-right">
                          {total !== null && (
                            <p className="text-base font-bold text-white leading-tight">
                              {formatINR(total).replace(/\.00$/, "")}
                            </p>
                          )}
                          {mrp !== null && (
                            <p className="text-[10px] text-white/30 line-through leading-tight">
                              {formatINR(mrp).replace(/\.00$/, "")}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="mt-auto text-[10px] text-white/40 leading-tight">
                        {formatOrderTimestamp(date)}
                      </p>
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
export default MyOrdersPage;