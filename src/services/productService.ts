export type ProductVariation = Record<string, unknown> & {
  id?: string | number;
  variation_product_id?: string | number;
  color?: string;
  size?: string;
  price?: number;
};

export type Product = Record<string, unknown> & {
  id?: string | number;
  product_id?: string | number;
  name?: string;
  title?: string;
  price?: number;
  variations?: ProductVariation[];
};

export type NewProductsResponse = Product[] | { results: Product[] };

export type PurchaseRequest =
  | { product_id: string | number; variation_product_id?: never }
  | { variation_product_id: string | number; product_id?: never };

export type PurchaseResponse = {
  message: string;
  order: {
    id: string;
    total_amount: number;
    payment_status: string;
  };
};

function getBaseUrl() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error(
      "Missing API base URL. Set NEXT_PUBLIC_API_BASE_URL in .env",
    );
  }

  return baseUrl.replace(/\/$/, "");
}

export async function getNewProducts(): Promise<Product[]> {
  const res = await fetch(`${getBaseUrl()}/api/new-products/`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load products");
  const data = (await res.json()) as NewProductsResponse;
  return Array.isArray(data) ? data : data.results;
}

export async function purchaseProduct(params: {
  accessToken: string;
  payload: PurchaseRequest;
}): Promise<PurchaseResponse> {
  const res = await fetch(`${getBaseUrl()}/api/purchase-product/`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${params.accessToken}`,
    },
    body: JSON.stringify(params.payload),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to purchase product");
  return (await res.json()) as PurchaseResponse;
}


