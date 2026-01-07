"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useUserStore } from "@/lib/userStore";

const ProfileCompleteClient = () => {
  const router = useRouter();
  const userName = useUserStore((s) => s.userName);

  return (
    <div className="flex w-full items-center justify-center bg-black px-6 font-sans text-white min-h-[calc(100dvh-70px)] md:min-h-[calc(100dvh-314px)]">
      <main className="w-full max-w-md">
        <h1 className="text-center text-2xl font-semibold tracking-tight">Welcome, You are?</h1>

        <div className="mt-10 grid gap-3">
          <label className="text-xs text-white/70">Name</label>
          <input
            className="h-11 w-full rounded-xl bg-white/10 px-3 text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-white/20"
            placeholder="Enter Name"
            aria-label="Full name"
            defaultValue={userName}
          />

          <button
            type="button"
            className="mt-4 h-11 w-full rounded-xl bg-white px-4 text-sm font-semibold text-black disabled:opacity-60"
            onClick={() => router.push("/products")}
          >
            Continue
          </button>

        </div>
      </main>
    </div>
  );
}

export default ProfileCompleteClient;



