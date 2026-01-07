import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/authOptions";
import { getNewProducts } from "@/services/productService";
import ProductCard from "@/components/ProductCard";

export default async function ProductsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/home");

    const products = await getNewProducts().catch(() => []);
    console.log("[ProductsPage] products:", products);


    return (
        <div className="w-full bg-[#161616] px-6 py-8 font-sans text-white">
            <div className="mx-auto w-full max-w-[1320px] pb-10">
                <h1 className="mt-2 text-2xl font-semibold tracking-tight">Men&apos;s Jordan Shoes</h1>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {products.slice(0, 8).map((p, idx) => (
                        <ProductCard key={idx} product={p} index={idx} />
                    ))}
                </div>

                {products.length === 0 ? (
                    <p className="mt-6 text-sm text-white/60">No products found.</p>
                ) : null}

            </div>
        </div>
    );
}
