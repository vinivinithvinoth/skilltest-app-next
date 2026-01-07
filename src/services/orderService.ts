export type Order = {
  id?: string;
  order_id?: string;
  created_date?: string;
  product_amount?: number | string;
  product_image?: string;
  product_mrp?: number | string;
  product_price?: number | string;
  quantity?: number;
  total_amount?: number | string;
  payment_status?: string;
  status?: string;
  product_name?: string;
  name?: string;
  title?: string;
  sku?: string;
  code?: string;
  product_code?: string;
  image?: string;
  image_url?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  created_at?: string | Date;
  createdAt?: string | Date;
  created?: string | Date;
  created_on?: string | Date;
  date?: string | Date;
  total?: number | string;
  amount?: number | string;
} & Record<string, unknown>;

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


