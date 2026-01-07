import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/authOptions";
import HeaderAuthNav from "@/utils/HeaderAuthNav";

export default async function Header() {
    const session = await getServerSession(authOptions);
    const isAuthed = Boolean(session);

    return (
        <header className="sticky top-0 z-50 bg-[#191919]">
            <div className="mx-auto flex h-[70px] w-full max-w-[1440px] items-center justify-between px-[60px] py-[8px]">
                <Link href="/products" className="inline-flex items-center">
                    <Image
                        src="/logo_sm.svg"
                        alt="Logo"
                        width={40}
                        height={40}
                        priority
                    />
                </Link>

                <HeaderAuthNav isAuthed={isAuthed} />
            </div>
        </header>
    );
}


