import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const baseUrl =
    process.env.SKILLTEST_API_BASE_URL ??
    "https://skilltestnextjs.evidam.zybotechlab.com";
  const upstreamUrl = `${baseUrl.replace(/\/$/, "")}/api/user-orders/`;

  const upstreamRes = await fetch(upstreamUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  const data = await upstreamRes.json().catch(() => null);
  if (!upstreamRes.ok || !data) {
    return NextResponse.json({ error: "user_orders_failed" }, { status: 502 });
  }

  return NextResponse.json(data, { status: 200 });
}


