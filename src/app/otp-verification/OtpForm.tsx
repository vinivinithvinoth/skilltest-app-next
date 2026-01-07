"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAuthStore } from "@/lib/authStore";
import { verifyUser } from "@/services/authService";

export default function OtpForm({ phone }: { phone: string }) {
    const router = useRouter();
    const [digits, setDigits] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const storedPhone = useAuthStore((s) => s.phone);
    const lastOtp = useAuthStore((s) => s.lastOtp);
    const resetFlow = useAuthStore((s) => s.reset);
    const setVerifyMeta = useAuthStore((s) => s.setVerifyMeta);

    const effectivePhone = phone || storedPhone;

    const otpLength = useMemo(() => {
        const n = lastOtp ? lastOtp.length : 0;
        // Screenshot shows 4 boxes, but backend OTP may be longer; adapt when we know.
        return Math.max(4, n);
    }, [lastOtp]);

    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        // Ensure digits array matches current OTP length.
        setDigits((prev) => {
            const next = Array.from({ length: otpLength }, (_, i) => prev[i] ?? "");
            return next;
        });
    }, [otpLength]);

    const otp = digits.join("");

    const [resendLeft, setResendLeft] = useState(34);
    useEffect(() => {
        setResendLeft(34);
        const t = window.setInterval(() => {
            setResendLeft((s) => (s <= 0 ? 0 : s - 1));
        }, 1000);
        return () => window.clearInterval(t);
    }, [effectivePhone]);

    function focusIndex(i: number) {
        const el = inputsRef.current[i];
        if (!el) return;
        el.focus();
        el.select();
    }

    function setDigitAt(i: number, value: string) {
        const v = value.replace(/\D/g, "").slice(-1); // last digit only
        setDigits((prev) => {
            const next = [...prev];
            next[i] = v;
            return next;
        });
        if (v && i < otpLength - 1) focusIndex(i + 1);
    }

    function handlePaste(e: React.ClipboardEvent) {
        const text = e.clipboardData.getData("text");
        const onlyDigits = (text ?? "").replace(/\D/g, "");
        if (!onlyDigits) return;
        e.preventDefault();

        const chars = onlyDigits.slice(0, otpLength).split("");
        setDigits((prev) => {
            const next = [...prev];
            for (let i = 0; i < otpLength; i++) next[i] = chars[i] ?? "";
            return next;
        });
        const lastFilled = Math.min(chars.length, otpLength) - 1;
        if (lastFilled >= 0) focusIndex(lastFilled);
    }

    async function verifyOtp() {
        setLoading(true);
        setError(null);
        try {
            const res = await signIn("credentials", {
                phone: effectivePhone,
                otp,
                redirect: false,
                callbackUrl: "/products",
            });
            if (!res || res.error) {
                setError("Invalid OTP");
                return;
            }
            resetFlow();
            router.push(res.url ?? "/products");
        } finally {
            setLoading(false);
        }
    }

    async function resendOtp() {
        if (!effectivePhone || resendLeft > 0) return;
        setResending(true);
        setError(null);
        try {
            const data = await verifyUser(effectivePhone);
            setVerifyMeta({ lastOtp: data.otp, userExists: data.user });
            setResendLeft(34);
        } catch {
            setError("Failed to resend OTP");
        } finally {
            setResending(false);
        }
    }

    return (
        <div className="flex h-full min-h-0 items-center justify-center bg-black px-6 font-sans text-white">
            <main className="w-full max-w-md">
                <h1 className="text-center text-xl font-semibold tracking-tight">Verify phone</h1>
                <div className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-white/60">
                    <p>
                        Enter the OTP sent to{" "}
                        <span className="text-white/80">{effectivePhone || "your phone"}</span>
                    </p>
                    <Link
                        href="/home"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
                        aria-label="Edit phone"
                        title="Edit phone"
                    >
                        <Pencil className="h-4 w-4 text-white/70" />
                    </Link>
                </div>

                <div className="mt-12">
                    <p className="text-xs text-white/60">Enter OTP</p>

                    <div className="mt-4 grid grid-cols-4 gap-4" onPaste={handlePaste}>
                        {Array.from({ length: otpLength }).map((_, i) => (
                            <input
                                key={i}
                                ref={(el) => {
                                    inputsRef.current[i] = el;
                                }}
                                inputMode="numeric"
                                autoComplete={i === 0 ? "one-time-code" : "off"}
                                aria-label={`OTP digit ${i + 1}`}
                                className="h-16 w-full rounded-lg bg-white/10 text-center text-xl font-semibold text-white outline-none ring-1 ring-white/10 placeholder:text-white/25 focus:ring-white/25"
                                placeholder="-"
                                value={digits[i] ?? ""}
                                onChange={(e) => setDigitAt(i, e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Backspace") {
                                        if ((digits[i] ?? "") === "" && i > 0) focusIndex(i - 1);
                                        return;
                                    }
                                    if (e.key === "ArrowLeft" && i > 0) {
                                        e.preventDefault();
                                        focusIndex(i - 1);
                                    }
                                    if (e.key === "ArrowRight" && i < otpLength - 1) {
                                        e.preventDefault();
                                        focusIndex(i + 1);
                                    }
                                }}
                            />
                        ))}
                    </div>

                    <div className="mt-4 text-xs text-white/50">
                        {resendLeft > 0 ? (
                            <p>
                                Resend OTP in <span className="text-white/80">{resendLeft}s</span>
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={resendOtp}
                                disabled={resending || !effectivePhone}
                                className="text-white/80 underline underline-offset-4 hover:text-white disabled:opacity-60"
                            >
                                {resending ? "Resending..." : "Resend OTP"}
                            </button>
                        )}
                    </div>

                    {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

                    <button
                        className="mt-8 h-12 w-full rounded-xl bg-white px-4 text-sm font-semibold text-black disabled:opacity-60 cursor-pointer"
                        onClick={verifyOtp}
                        disabled={loading || !effectivePhone || otp.trim().length !== otpLength}
                        type="button"
                    >
                        {loading ? "Verifying..." : "Verify"}
                    </button>

                    {!effectivePhone ? (
                        <p className="mt-4 text-sm text-red-400">Missing phone. Go back and request OTP again.</p>
                    ) : null}

                </div>
            </main>
        </div>
    );
}


