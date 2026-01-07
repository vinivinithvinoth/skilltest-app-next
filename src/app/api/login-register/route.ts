import { NextResponse } from "next/server";

type LoginRegisterRequest = {
  name: string;
  phone_number: string;
  unique_id?: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<LoginRegisterRequest>;

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone_number = typeof body.phone_number === "string" ? body.phone_number.trim() : "";
  const unique_id = typeof body.unique_id === "string" ? body.unique_id.trim() : undefined;

  if (!name || !phone_number) {
    return NextResponse.json(
      { error: "name_and_phone_number_required" },
      { status: 400 },
    );
  }

  const baseUrl =
    process.env.SKILLTEST_API_BASE_URL ??
    "https://skilltestnextjs.evidam.zybotechlab.com";

  const upstreamUrl = `${baseUrl.replace(/\/$/, "")}/api/login-register/`;

  const upstreamRes = await fetch(upstreamUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name,
      phone_number,
      ...(unique_id ? { unique_id } : {}),
    }),
    cache: "no-store",
  });

  const data = await upstreamRes.json().catch(() => null);
  if (!upstreamRes.ok || !data) {
    return NextResponse.json(
      { error: "login_register_failed" },
      { status: 502 },
    );
  }

  return NextResponse.json(data, { status: 200 });
}


