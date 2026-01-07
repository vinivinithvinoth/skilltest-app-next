import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl =
    process.env.SKILLTEST_API_BASE_URL ??
    "https://skilltestnextjs.evidam.zybotechlab.com";
  const upstreamUrl = `${baseUrl.replace(/\/$/, "")}/api/new-products/`;

  const upstreamRes = await fetch(upstreamUrl, { cache: "no-store" });
  const data = await upstreamRes.json().catch(() => null);
  if (!upstreamRes.ok || !data) {
    return NextResponse.json({ error: "new_products_failed" }, { status: 502 });
  }
  return NextResponse.json(data, { status: 200 });
}


