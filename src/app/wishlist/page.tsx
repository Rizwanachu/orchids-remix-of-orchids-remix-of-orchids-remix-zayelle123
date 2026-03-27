"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Heart } from "lucide-react";
import AddToCartButton from "@/components/ui/add-to-cart-button";
import { useCart } from "@/lib/cart-context";
import { useProducts } from "@/lib/products-context";

type ColorInfo = { name: string; hex: string; image?: string; images?: string[] };

interface WishlistCard {
  key: string;
  productId: number;
  handle: string;
  name: string;
  image: string;
  hoverImage: string;
  price: number;
  compareAt?: number;
  subtitle: string;
  colorName?: string;
  colorSlug?: string;
  href: string;
}

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addItem } = useCart();
  const { products } = useProducts();

  const wishlistCards = useMemo<WishlistCard[]>(() => {
    return wishlist.map((key) => {
      const firstDash = key.indexOf("-");
      const productIdStr = firstDash > -1 ? key.slice(0, firstDash) : key;
      const colorSlug = firstDash > -1 ? key.slice(firstDash + 1) : null;

      const product = products.find((p) => String(p.id) === productIdStr);
      if (!product) return null;

      let colorInfo: ColorInfo | null = null;
      if (colorSlug) {
        const colors: ColorInfo[] = (() => {
          try {
            if (Array.isArray(product.colors)) return product.colors as ColorInfo[];
            return product.colors ? JSON.parse(product.colors as unknown as string) : [];
          } catch { return []; }
        })();
        colorInfo = colors.find((c) =>
          c.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") === colorSlug
        ) || null;
      }

      const primaryImg = colorInfo ? ((colorInfo.images?.[0] ?? colorInfo.image) || product.image) : product.image;
      const hoverImg = colorInfo ? (colorInfo.images?.[1] || product.hoverImage || primaryImg) : (product.hoverImage || product.image);

      return {
        key,
        productId: product.id,
        handle: product.handle,
        name: product.name,
        image: primaryImg,
        hoverImage: hoverImg,
        price: product.price,
        compareAt: product.compareAt,
        subtitle: product.subtitle,
        colorName: colorInfo?.name,
        colorSlug: colorSlug || undefined,
        href: colorSlug ? `/products/${product.handle}?color=${colorSlug}` : `/products/${product.handle}`,
      } as WishlistCard;
    }).filter(Boolean) as WishlistCard[];
  }, [wishlist, products]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-10 md:py-14">
          <div className="container px-4 md:px-8">
            <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
              Wishlist
            </h1>
            <p className="mt-2 text-[14px] text-[#757575]">
              {wishlistCards.length} {wishlistCards.length === 1 ? "item" : "items"} saved
            </p>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-16">
          {wishlistCards.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
              {wishlistCards.map((card) => (
                <div key={card.key} className="group flex flex-col">
                  <div className="relative w-full aspect-square overflow-hidden rounded-[12px] bg-white">
                    <a href={card.href} className="relative block w-full h-full">
                      <Image
                        src={card.image}
                        alt={card.colorName ? `${card.name} — ${card.colorName}` : card.name}
                        fill
                        unoptimized
                        className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <Image
                        src={card.hoverImage}
                        alt={card.colorName ? `${card.name} — ${card.colorName}` : card.name}
                        fill
                        unoptimized
                        className="object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                        sizes="(max-width: 640px) 33vw, 25vw"
                      />
                    </a>
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => toggleWishlist(card.key)}
                        className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm bg-red-50 text-red-500 transition-colors hover:bg-red-100"
                      >
                        <Heart size={15} fill="currentColor" />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <AddToCartButton
                        onAdd={() => addItem({
                          id: card.key,
                          handle: card.handle,
                          name: card.colorName ? `${card.name} — ${card.colorName}` : card.name,
                          subtitle: card.subtitle,
                          price: card.price,
                          image: card.image,
                        })}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-[14px] font-medium text-[#1A1A1A] line-clamp-1">
                      <a href={card.href} className="hover:text-[#5C4B3D] transition-colors">
                        {card.name}
                      </a>
                    </h3>
                    {card.colorName && (
                      <p className="text-[12px] text-[#5C4B3D] mt-0.5">{card.colorName}</p>
                    )}
                    <p className="text-[12px] text-[#757575] mt-0.5">{card.subtitle}</p>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <span className="text-[15px] font-semibold text-[#1A1A1A]">₹{card.price.toLocaleString("en-IN")}.00</span>
                      {card.compareAt && card.compareAt > card.price && (
                        <span className="text-[13px] text-[#757575] line-through">₹{card.compareAt.toLocaleString("en-IN")}.00</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Heart size={48} className="text-[#D4C8BE] mx-auto mb-4" />
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-2">Your wishlist is empty</h2>
              <p className="text-[14px] text-[#757575] mb-6">
                Save your favorite pieces and come back to them later.
              </p>
              <a
                href="/products"
                className="inline-flex items-center justify-center bg-[#5C4B3D] text-white px-8 py-3.5 rounded-sm font-medium text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors"
              >
                Browse Products
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
