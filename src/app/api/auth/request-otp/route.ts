import { NextResponse } from "next/server";

import { createOtpForPhone } from "@/lib/otpStore";

export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}));
    const phone = typeof body?.phone === "string" ? body.phone : "";

    if (!phone.trim()) {
        return NextResponse.json({ ok: false, error: "phone_required" }, { status: 400 });
    }

    const { otp } = createOtpForPhone(phone);

    // In a real app, you'd send OTP via SMS provider and never return it.
    // For skill-test/dev, return OTP only in non-production.
    const includeOtp = process.env.NODE_ENV !== "production";

    return NextResponse.json({
        ok: true,
        ...(includeOtp ? { otp } : {}),
    });
}


