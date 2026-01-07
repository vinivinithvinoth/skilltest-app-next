import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-black text-white">
            <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-center gap-[48px] px-[60px] md:min-h-[244px] md:flex-row md:justify-between">
                <Link href="/home" className="inline-flex items-center">
                    <Image
                        src="/logo_md.svg"
                        alt="Logo"
                        width={100}
                        height={100}
                        priority
                    />
                </Link>

                <div className="flex items-center gap-[48px]">
                    <a
                        className="opacity-90 hover:opacity-100"
                        href="#"
                        aria-label="Facebook"
                    >
                        <Facebook size={20} />
                    </a>
                    <a
                        className="opacity-90 hover:opacity-100"
                        href="#"
                        aria-label="Instagram"
                    >
                        <Instagram size={20} />
                    </a>
                    <a
                        className="opacity-90 hover:opacity-100"
                        href="#"
                        aria-label="X"
                    >
                        <Twitter size={20} />
                    </a>
                </div>
            </div>
        </footer>
    );
}


