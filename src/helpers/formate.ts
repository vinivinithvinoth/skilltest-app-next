import { Order } from "@/services/orderService";

export const formatINR = (value: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(value);

export const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
};

export const formatOrderTimestamp = (date: Date) => {
    const time = date.toLocaleString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    const day = ordinal(Number(date.toLocaleString("en-IN", { day: "2-digit" })));
    const month = date.toLocaleString("en-IN", { month: "short" });
    const year = date.toLocaleString("en-IN", { year: "numeric" });

    return `${time}, ${day} ${month} ${year}`;
};

export const getOrderDate = (order: Order): Date => {
    const raw =
        order.created_date ??
        order.created_at ??
        order.createdAt ??
        order.created ??
        order.created_on ??
        order.date;

    const d = raw ? new Date(raw) : new Date();
    return Number.isFinite(d.getTime()) ? d : new Date();
};

export const getOrderTotal = (order: Order): number | null => {
    const value =
        order.product_amount ??
        order.product_price ??
        order.total_amount ??
        order.total ??
        order.amount;
    const n = typeof value === "string" ? Number(value) : value;
    return typeof n === "number" && Number.isFinite(n) ? n : null;
};

// export const formatINR = (value: string | number) => {
//     const n = typeof value === "number" ? value : Number(value);
//     if (!Number.isFinite(n)) return String(value);
//     return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);
// }

export const formatTimestamp = (d: Date) => {
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