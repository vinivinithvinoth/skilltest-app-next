import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/authOptions";

type PurchaseBody = {
  product_id?: string | number;
  variation_product_id?: string | number;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as PurchaseBody;
  const product_id = body.product_id;
  const variation_product_id = body.variation_product_id;

  const hasProduct = product_id !== undefined && product_id !== null && `${product_id}`.trim() !== "";
  const hasVariation =
    variation_product_id !== undefined &&
    variation_product_id !== null &&
    `${variation_product_id}`.trim() !== "";

  if ((hasProduct && hasVariation) || (!hasProduct && !hasVariation)) {
    return NextResponse.json(
      { error: "send_either_product_id_or_variation_product_id" },
      { status: 400 },
    );
  }

  const baseUrl =
    process.env.SKILLTEST_API_BASE_URL ??
    "https://skilltestnextjs.evidam.zybotechlab.com";
  const upstreamUrl = `${baseUrl.replace(/\/$/, "")}/api/purchase-product/`;

  const upstreamRes = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(hasProduct ? { product_id } : { variation_product_id }),
    cache: "no-store",
  });

  const data = await upstreamRes.json().catch(() => null);
  if (!upstreamRes.ok || !data) {
    return NextResponse.json({ error: "purchase_failed" }, { status: 502 });
  }

  return NextResponse.json(data, { status: 200 });
}


