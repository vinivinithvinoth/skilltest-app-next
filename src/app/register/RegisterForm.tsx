"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { loginRegister } from "@/services/authService";
import { useAuthStore } from "@/lib/authStore";
import { useUserStore } from "@/lib/userStore";

type RegisterFormValues = {
    name: string;
    phone_number: string;
};

export default function RegisterForm({ phone }: { phone: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const storedPhone = useAuthStore((s) => s.phone);
    const resetFlow = useAuthStore((s) => s.reset);
    const setUserName = useUserStore((s) => s.setUserName);

    const effectivePhone = phone || storedPhone;
    const phoneLocked = Boolean(effectivePhone);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormValues>({
        defaultValues: { name: "", phone_number: effectivePhone },
        mode: "onSubmit",
        reValidateMode: "onChange",
    });

    useEffect(() => {
        // Don't validate immediately; only show errors after submit.
        setValue("phone_number", effectivePhone, { shouldValidate: false });
    }, [effectivePhone, setValue]);

    return (
        <div className="h-full min-h-0 w-full font-sans">
            <div className="mx-auto grid w-full max-w-[1440px] min-h-[calc(100dvh-170px)] grid-cols-1 md:min-h-[calc(100dvh-314px)] md:grid-cols-2">
                {/* Left image */}
                <div className="relative hidden h-full w-full md:block">
                    <img
                        src="/login_bg.png"
                        alt="Register"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                </div>

                {/* Right panel */}
                <div className="flex h-full min-h-0 w-full items-center justify-center bg-black px-6">
                    <main className="w-full max-w-md">
                        <h1 className="text-center text-lg font-semibold tracking-tight text-white">Register</h1>
                        <p className="mt-2 text-center text-xs text-white/60">
                            No user found for this phone number. Kindly register.
                        </p>

                        <form
                            className="mt-10 grid gap-3"
                            onSubmit={handleSubmit(async (values) => {
                                setLoading(true);
                                setError(null);
                                try {
                                    const res = await loginRegister({
                                        name: values.name.trim(),
                                        phone_number: values.phone_number,
                                    });

                                    setUserName(res.name ?? values.name.trim());

                                    const signInRes = await signIn("token", {
                                        phone: res.phone_number,
                                        accessToken: res.token.access,
                                        userId: res.user_id,
                                        name: res.name,
                                        redirect: false,
                                        callbackUrl: "/profile-complete",
                                    });

                                    if (!signInRes || signInRes.error) {
                                        setError("Registered, but failed to create session. Please login again.");
                                        return;
                                    }

                                    resetFlow();
                                    router.push(signInRes.url ?? "/profile-complete");
                                } catch {
                                    setError("Registration failed. Please try again.");
                                } finally {
                                    setLoading(false);
                                }
                            })}
                        >
                            <label className="text-xs text-white/70">Phone</label>
                            <input
                                className="h-11 w-full rounded-xl bg-white/10 px-3 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-white/20"
                                aria-label="Phone number"
                                placeholder="Enter Phone"
                                readOnly={phoneLocked}
                                inputMode="numeric"
                                autoComplete="tel"
                                {...register("phone_number", {
                                    required: "Phone number is required",
                                    minLength: { value: 10, message: "Enter at least 10 digits" },
                                    maxLength: { value: 15, message: "Enter at most 15 digits" },
                                    pattern: { value: /^[0-9]+$/, message: "Only digits allowed" },
                                })}
                            />
                            {errors.phone_number ? (
                                <p className="text-sm text-red-400">{errors.phone_number.message}</p>
                            ) : null}

                            <label className="mt-2 text-xs text-white/70">Name</label>
                            <input
                                className="h-11 w-full rounded-xl bg-white/10 px-3 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-white/20"
                                aria-label="Full name"
                                placeholder="Enter Name"
                                autoComplete="name"
                                {...register("name", {
                                    required: "Name is required",
                                    minLength: { value: 2, message: "Name must be at least 2 characters" },
                                    maxLength: { value: 50, message: "Name must be at most 50 characters" },
                                })}
                            />
                            {errors.name ? <p className="text-sm text-red-400">{errors.name.message}</p> : null}

                            {error ? <p className="mt-1 text-sm text-red-400">{error}</p> : null}

                            <button
                                className="mt-4 h-11 w-full rounded-xl bg-white px-4 text-sm font-semibold text-black disabled:opacity-60"
                                type="submit"
                                disabled={loading || isSubmitting}
                            >
                                {loading || isSubmitting ? "Registering..." : "Continue"}
                            </button>
                        </form>
                    </main>
                </div>
            </div>
        </div>
    );
}


