export type Order = Record<string, unknown> & {
  id?: string;
  total_amount?: number;
  payment_status?: string;
  status?: string;
};

export type UserOrdersResponse =
  | Order[]
  | { results?: Order[] }
  | { orders?: Order[] }
  | { data?: Order[] };

function getBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error(
      "Missing API base URL. Set NEXT_PUBLIC_API_BASE_URL in .env",
    );
  }

  return baseUrl.replace(/\/$/, "");
}

export async function getUserOrders(accessToken: string): Promise<Order[]> {
  const res = await fetch(`${getBaseUrl()}/api/user-orders/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load orders");
  const data = (await res.json()) as UserOrdersResponse;
  if (Array.isArray(data)) return data;
  const maybeArray =
    (data as { results?: Order[] }).results ??
    (data as { orders?: Order[] }).orders ??
    (data as { data?: Order[] }).data;
  return Array.isArray(maybeArray) ? maybeArray : [];
}


