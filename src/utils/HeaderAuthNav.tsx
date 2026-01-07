"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const HeaderAuthNav = ({
    isAuthed,
}: {
    isAuthed: boolean;
}) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();
    const { status } = useSession();

    const isAuthedEffective = status === "loading" ? isAuthed : status === "authenticated";

    useEffect(() => {
        function onDocMouseDown(e: MouseEvent) {
            if (!open) return;
            const root = rootRef.current;
            if (!root) return;
            if (e.target instanceof Node && !root.contains(e.target)) setOpen(false);
        }
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", onDocMouseDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onDocMouseDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    return (
        <div ref={rootRef} className="relative">
            {!isAuthedEffective ? (
                pathname === "/home" ? null : (
                    <nav className="flex items-center gap-4 text-sm text-white">
                        <Link
                            className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white hover:bg-white/10"
                            href="/home"
                        >
                            Login
                        </Link>
                    </nav>
                )
            ) : (
                <>
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        className="inline-flex items-center rounded-full bg-white/5 text-sm text-white hover:bg-white/10 cursor-pointer"
                        aria-haspopup="menu"
                        aria-expanded={open}
                    >
                        <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10">
                            <User className="h-4 w-4 text-white/85" />
                        </span>
                    </button>

                    {open ? (
                        <div
                            role="menu"
                            className="absolute right-0 mt-3 w-48 overflow-hidden rounded-xl border border-white/10 bg-[#1C1C1C] shadow-[0_18px_55px_rgba(0,0,0,0.55)]"
                        >
                            <Link
                                role="menuitem"
                                href="/my-orders"
                                onClick={() => setOpen(false)}
                                className="block px-4 py-3 text-sm text-white/90 hover:bg-white/10 cursor-pointer"
                            >
                                My Orders
                            </Link>
                            <button
                                role="menuitem"
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    signOut({ callbackUrl: "/home" });
                                }}
                                className="block w-full px-4 py-3 text-left text-sm text-white/90 hover:bg-white/10 cursor-pointer"
                            >
                                Logout
                            </button>
                        </div>
                    ) : null}
                </>
            )}
        </div>
    );
}

export default HeaderAuthNav;

