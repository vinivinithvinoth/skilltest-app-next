import { NextResponse } from "next/server";

import { normalizePhone, setOtpForPhone } from "@/lib/otpStore";

type VerifyRequest = {
  phone_number: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<VerifyRequest>;
  const phoneNumber = typeof body.phone_number === "string" ? body.phone_number : "";

  if (!phoneNumber.trim()) {
    return NextResponse.json(
      { error: "phone_number_required" },
      { status: 400 },
    );
  }

  const phone = normalizePhone(phoneNumber);

  const baseUrl =
    process.env.SKILLTEST_API_BASE_URL ??
    "https://skilltestnextjs.evidam.zybotechlab.com";

  const upstreamUrl = `${baseUrl.replace(/\/$/, "")}/api/verify/`;

  const upstreamRes = await fetch(upstreamUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone_number: phone }),
    cache: "no-store",
  });

  const data = (await upstreamRes.json().catch(() => null)) as
    | null
    | {
        otp?: string;
        token?: { access?: string };
        user?: boolean;
      };

  if (!upstreamRes.ok || !data) {
    return NextResponse.json(
      { error: "verify_failed" },
      { status: 502 },
    );
  }

  const otp = typeof data.otp === "string" ? data.otp : "";
  const user = Boolean(data.user);
  const accessToken =
    typeof data.token?.access === "string" ? data.token.access : undefined;

  if (otp) {
    // Store OTP (and token if any) so NextAuth Credentials can validate and create session.
    setOtpForPhone(phone, otp, {
      ttlMs: 5 * 60 * 1000,
      accessToken,
      userExists: user,
    });
  }

  // Return upstream response as-is (keeping shape user expects)
  return NextResponse.json(data, { status: 200 });
}


