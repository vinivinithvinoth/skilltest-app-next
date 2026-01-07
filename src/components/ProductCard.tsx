"use client";

import type { Product } from "@/services/productService";
import PurchaseButton from "@/components/PurchaseButton";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";

function getName(p: Product) {
    return (
        p.name ??
        p.title ??
        (p as unknown as { product_name?: string }).product_name ??
        "PRODUCT"
    ).toString();
}

function getImageUrl(p: Product): string | null {
    const anyP = p as unknown as {
        image?: string;
        image_url?: string;
        thumbnail?: string;
        thumbnail_url?: string;
        product_image?: string;
        product_images?: Array<{ product_image?: string }>;
        images?: Array<string | { url?: string }>;
        variation_colors?: Array<{ color_images?: string[] }>;
    };

    const direct =
        anyP.image ??
        anyP.image_url ??
        anyP.thumbnail ??
        anyP.thumbnail_url ??
        anyP.product_image ??
        null;
    if (typeof direct === "string" && direct.trim()) return direct;

    const productImage0 = anyP.product_images?.[0]?.product_image;
    if (typeof productImage0 === "string" && productImage0.trim()) return productImage0;

    const first = anyP.images?.[0];
    if (typeof first === "string" && first.trim()) return first;
    if (first && typeof first === "object" && typeof first.url === "string" && first.url.trim())
        return first.url;

    const firstColorImage = anyP.variation_colors?.[0]?.color_images?.[0];
    if (typeof firstColorImage === "string" && firstColorImage.trim()) return firstColorImage;

    return null;
}

function getProductId(p: Product) {
    return p.id ?? p.product_id;
}

export default function ProductCard({ product, index }: { product: Product; index: number }) {
    const name = getName(product).toUpperCase();
    const imageUrl = getImageUrl(product);
    const productId = getProductId(product);

    const cardRef = useRef<HTMLDivElement | null>(null);
    const imageRef = useRef<HTMLDivElement | null>(null);
    const overlayRef = useRef<HTMLDivElement | null>(null);
    const sizeRowRef = useRef<HTMLDivElement | null>(null);
    const colorRowRef = useRef<HTMLDivElement | null>(null);
    const buyRef = useRef<HTMLDivElement | null>(null);

    const [size, setSize] = useState<number>(7);
    const [color, setColor] = useState<string>("#B6F400");

    const sizes = [7, 8, 9, 10];
    const colors = ["#B6F400", "#7A0AA6", "#A33035"];

    useEffect(() => {
        gsap.set([sizeRowRef.current, colorRowRef.current, buyRef.current], {
            autoAlpha: 0,
            y: 10,
        });
        gsap.set(overlayRef.current, { autoAlpha: 0.5 });
    }, []);

    function handleEnter() {
        const card = cardRef.current;
        const imageEl = imageRef.current;
        if (!card || !imageEl) return;

        const sizeEl = sizeRowRef.current;
        const colorEl = colorRowRef.current;
        const buyEl = buyRef.current;
        const overlayEl = overlayRef.current;

        gsap.killTweensOf([card, imageEl, overlayEl, sizeEl, colorEl, buyEl].filter(Boolean));
        gsap.to(card, {
            y: -6,
            duration: 0.35,
            ease: "power3.out",
            boxShadow: "0 18px 55px rgba(0,0,0,0.55)",
        });
        gsap.to(imageEl, {
            y: -10,
            scale: 1.03,
            duration: 0.45,
            ease: "power3.out",
            transformOrigin: "50% 50%",
        });

        gsap.to(overlayEl, {
            autoAlpha: 0.98,
            duration: 0.3,
            ease: "power2.out",
        });

        gsap.to([sizeEl, colorEl, buyEl].filter(Boolean), {
            autoAlpha: 1,
            y: 0,
            duration: 0.25,
            ease: "power2.out",
            stagger: 0.05,
        });
    }

    function handleLeave() {
        const card = cardRef.current;
        const imageEl = imageRef.current;
        if (!card || !imageEl) return;

        const sizeEl = sizeRowRef.current;
        const colorEl = colorRowRef.current;
        const buyEl = buyRef.current;
        const overlayEl = overlayRef.current;

        gsap.killTweensOf([card, imageEl, overlayEl, sizeEl, colorEl, buyEl].filter(Boolean));
        gsap.to(card, {
            y: 0,
            duration: 0.25,
            ease: "power2.out",
            boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
        });
        gsap.to(imageEl, {
            y: 0,
            scale: 1,
            duration: 0.25,
            ease: "power2.out",
            transformOrigin: "50% 50%",
        });

        gsap.to(overlayEl, {
            autoAlpha: 0.5,
            duration: 0.2,
            ease: "power2.out",
        });

        gsap.to([sizeEl, colorEl, buyEl].filter(Boolean), {
            autoAlpha: 0,
            y: 10,
            duration: 0.2,
            ease: "power2.out",
            stagger: 0.02,
        });
    }

    return (
        <div
            ref={cardRef}
            className="relative h-[420px] overflow-hidden rounded-md bg-[#1C1C1C] shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            {/* faint watermark */}
            <div className="pointer-events-none absolute left-4 top-[92px] max-w-[320px] select-none truncate text-[64px] font-black tracking-tight text-white/5">
                {name}
            </div>

            <div
                ref={imageRef}
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    willChange: "transform",
                    backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
                }}
            >
                {/* hover-controlled overlay: top light -> bottom dark */}
                <div
                    ref={overlayRef}
                    className="absolute inset-0 bg-gradient-to-b from-white/0 via-black/15 to-black/90"
                    style={{ willChange: "opacity" }}
                />
            </div>

            {!imageUrl ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-white/60">
                    No image
                </div>
            ) : null}

            {/* content overlay (transparent) */}
            <div className="relative z-10 flex h-full w-full flex-col justify-end px-6 pb-6">
                <h4 className="text-center text-xs font-semibold tracking-widest text-white">{name}</h4>

                {/* Size row */}
                <div ref={sizeRowRef} className="mt-6">
                    <div className="mx-auto flex w-full max-w-[220px] items-center justify-center gap-3 text-[11px] text-white/70">
                        <span className="w-12 text-left font-semibold tracking-widest">SIZE:</span>
                        <div className="flex items-center gap-1.5">
                            {sizes.map((s) => {
                                const selected = s === size;
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSize(s);
                                        }}
                                        className={
                                            selected
                                                ? "h-7 w-7 rounded-md bg-white/15 text-white"
                                                : "h-7 w-7 rounded-md bg-white/10 text-white/85 hover:bg-white/15"
                                        }
                                        aria-label={`Size ${s}`}
                                    >
                                        {s}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Color row */}
                <div ref={colorRowRef} className="mt-3">
                    <div className="mx-auto flex w-full max-w-[220px] items-center justify-center gap-3 text-[11px] text-white/70">
                        <span className="w-12 text-left font-semibold tracking-widest">COLOR:</span>
                        <div className="flex items-center gap-2">
                            {colors.map((c) => {
                                const selected = c === color;
                                return (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setColor(c);
                                        }}
                                        className="grid h-4 w-4 place-items-center rounded-full"
                                        aria-label="Color option"
                                    >
                                        <span
                                            className={selected ? "h-3.5 w-3.5 rounded-full ring-2 ring-white/80" : "h-3.5 w-3.5 rounded-full"}
                                            style={{ backgroundColor: c }}
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Buy */}
                <div ref={buyRef} className="mt-5 flex justify-center">
                    {productId !== undefined ? (
                        <PurchaseButton productId={productId} variant="white" label="Buy Now" />
                    ) : null}
                </div>
            </div>
        </div>
    );
}


