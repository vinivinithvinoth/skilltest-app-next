"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { verifyUser } from "@/services/authService";
import { useAuthStore } from "@/lib/authStore";

type LoginFormValues = {
    phone: string;
};

export default function HomeLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [debugOtp, setDebugOtp] = useState<string | null>(null);
    const setPhone = useAuthStore((s) => s.setPhone);
    const setVerifyMeta = useAuthStore((s) => s.setVerifyMeta);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        defaultValues: { phone: "" },
        mode: "onChange",
    });

    const phone = watch("phone");

    const requestOtp = async (values: LoginFormValues) => {
        setLoading(true);
        setError(null);
        setDebugOtp(null);
        try {
            const data = await verifyUser(values.phone);
            setDebugOtp(data.otp);
            setPhone(values.phone);
            setVerifyMeta({ lastOtp: data.otp, userExists: data.user });
            if (data.user === false) {
                setError("No user found. Kindly register.");
                return;
            }
            router.push(`/otp-verification?phone=${encodeURIComponent(values.phone)}`);
        } catch {
            setError("Failed to request OTP");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full font-sans">
            <div className="mx-auto grid w-full max-w-[1440px] min-h-[calc(100dvh-170px)] grid-cols-1 md:min-h-[calc(100dvh-314px)] md:grid-cols-2">
                {/* Left image */}
                <div className="relative hidden w-full md:block">
                    <img
                        src="/login_bg.png"
                        alt="Login"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                </div>

                {/* Right panel */}
                <div className="flex w-full items-center justify-center bg-black px-6">
                    <main className="w-full max-w-md">
                        <h1 className="text-center text-lg font-semibold tracking-tight text-white">
                            Log In
                        </h1>

                        <form className="grid gap-3" onSubmit={handleSubmit(requestOtp)}>
                            <label className="text-xs text-white/70">Phone</label>
                            <input
                                className="h-11 w-full rounded-xl bg-white/10 px-3 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-white/20"
                                placeholder="Enter Phone"
                                aria-label="Phone number"
                                inputMode="numeric"
                                autoComplete="tel"
                                {...register("phone", {
                                    required: "Phone number is required",
                                    minLength: { value: 10, message: "Enter at least 10 digits" },
                                    maxLength: { value: 15, message: "Enter at most 15 digits" },
                                    pattern: { value: /^[0-9]+$/, message: "Only digits allowed" },
                                })}
                            />
                            {errors.phone ? (
                                <p className="text-sm text-red-400">{errors.phone.message}</p>
                            ) : null}

                            {error ? (
                                <div className="text-sm">
                                    <p className="text-red-400">{error}</p>
                                    {error.includes("register") ? (
                                        <div className="mt-2">
                                            <Link
                                                className="text-white/80 underline underline-offset-4 hover:text-white"
                                                href={`/register?phone=${encodeURIComponent(phone)}`}
                                            >
                                                Go to Register
                                            </Link>
                                        </div>
                                    ) : null}
                                </div>
                            ) : null}

                            <button
                                className="mt-4 h-11 w-full rounded-xl bg-white px-4 text-sm font-semibold text-black disabled:opacity-60 cursor-pointer"
                                disabled={loading || isSubmitting}
                                type="submit"
                            >
                                {loading || isSubmitting ? "Sending..." : "Continue"}
                            </button>
                        </form>

                        {debugOtp ? (
                            <p className="mt-4 text-sm text-white/60">
                                Dev OTP: <span className="font-mono">{debugOtp}</span>
                            </p>
                        ) : null}
                    </main>
                </div>
            </div>
        </div>
    );
}


