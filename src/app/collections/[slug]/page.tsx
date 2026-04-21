"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Heart } from "lucide-react";
import AddToCartButton from "@/components/ui/add-to-cart-button";
import { useCart } from "@/lib/cart-context";
import { useProducts } from "@/lib/products-context";

type ColorInfo = { name: string; hex: string; image?: string; images?: string[] };

type VariantCard = {
  key: string;
  productId: number;
  handle: string;
  name: string;
  image: string;
  hoverImage: string;
  badge?: string | null;
  price: number;
  compareAt?: number;
  subtitle: string;
  colorName?: string;
  href: string;
};

function colorToSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function expandToVariantCards(products: any[]): VariantCard[] {
  const cards: VariantCard[] = [];
  for (const p of products) {
    const colors = (p.colors ?? []) as ColorInfo[];
    if (colors.length > 0) {
      for (const color of colors) {
        const slug = colorToSlug(color.name);
        const primaryImg = (color.images?.[0] ?? color.image) || p.image;
        const hoverImg = color.images?.[1] || p.hoverImage || primaryImg;
        cards.push({
          key: `${p.id}-${slug}`,
          productId: p.id,
          handle: p.handle,
          name: p.name,
          image: primaryImg,
          hoverImage: hoverImg,
          badge: p.badge,
          price: p.price,
          compareAt: p.compareAt,
          subtitle: p.subtitle,
          colorName: color.name,
          href: `/products/${p.handle}?color=${slug}`,
        });
      }
    } else {
      cards.push({
        key: String(p.id),
        productId: p.id,
        handle: p.handle,
        name: p.name,
        image: p.image,
        hoverImage: p.hoverImage || p.image,
        badge: p.badge,
        price: p.price,
        compareAt: p.compareAt,
        subtitle: p.subtitle,
        colorName: undefined,
        href: `/products/${p.handle}`,
      });
    }
  }
  return cards;
}

const collectionTitles: Record<string, string> = {
  "chiffon-hijabs": "Chiffon Hijabs",
  "satin-silk-hijabs": "Satin Silk Hijabs",
  "premium-jersey-wraps": "Premium Jersey Wraps",
  "everyday-essentials": "Everyday Essentials",
  "occasion-hijabs": "Occasion Hijabs",
  "accessories": "Accessories",
};

export default function CollectionPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { addItem, toggleWishlist, isInWishlist } = useCart();
  const { products: allProducts, loaded } = useProducts();

  const [zayelleTitle, setZayelleTitle] = useState<string | null>(null);
  const [zayelleProductIds, setZayelleProductIds] = useState<string[] | null>(null);
  const [zayelleLoading, setZayelleLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      history.scrollRestoration = "manual";
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    setZayelleLoading(true);
    fetch("/api/zayelle-edit")
      .then((r) => r.json())
      .then((items: any[]) => {
        const match = items.find(
          (item) => item.redirectLink === `/collections/${slug}` || item.redirect_link === `/collections/${slug}`
        );
        if (match) {
          setZayelleTitle(match.title || null);
          const ids = (() => {
            try {
              const raw = match.productIds ?? match.product_ids;
              return Array.isArray(raw) ? raw.map(String) : JSON.parse(raw || "[]").map(String);
            } catch {
              return [];
            }
          })();
          setZayelleProductIds(ids);
        }
      })
      .catch(() => {})
      .finally(() => setZayelleLoading(false));
  }, [slug]);

  const title =
    zayelleTitle ||
    collectionTitles[slug] ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const byCategory = allProducts.filter((p) => p.category === slug);
  const filteredProducts =
    byCategory.length > 0
      ? byCategory
      : zayelleProductIds !== null
      ? allProducts.filter((p) => zayelleProductIds.includes(String(p.id)))
      : [];

  const cards = useMemo(() => expandToVariantCards(filteredProducts), [filteredProducts]);

  const pageLoading = !loaded || zayelleLoading;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-10 md:py-14">
          <div className="container px-4 md:px-8">
            <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
              {title}
            </h1>
            <nav className="mt-2 text-[13px] text-[#757575]">
              <a href="/" className="hover:text-[#1A1A1A] transition-colors">Home</a>
              <span className="mx-2">&gt;</span>
              <a href="/collections" className="hover:text-[#1A1A1A] transition-colors">Collections</a>
              <span className="mx-2">&gt;</span>
              <span className="text-[#1A1A1A]">{title}</span>
            </nav>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-16">
          {pageLoading ? (
            <>
              <p className="text-[14px] text-[#757575] mb-8">Loading products...</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex flex-col">
                    <div className="w-full aspect-square rounded-[12px] bg-[#E8E4DE] animate-pulse" />
                    <div className="mt-3 space-y-2">
                      <div className="h-4 bg-[#E8E4DE] rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-[#E8E4DE] rounded w-1/2 animate-pulse" />
                      <div className="h-4 bg-[#E8E4DE] rounded w-1/4 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : cards.length > 0 ? (
            <>
              <p className="text-[14px] text-[#757575] mb-8">{cards.length} {cards.length === 1 ? "product" : "products"}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
                {cards.map((card) => {
                  const wishlisted = isInWishlist(card.key);
                  return (
                    <div key={card.key} className="group flex flex-col">
                      <div className="relative w-full aspect-square overflow-hidden rounded-[12px] bg-white">
                        <a href={card.href} className="relative block w-full h-full">
                          <Image
                            src={card.image}
                            alt={card.colorName ? `${card.name} — ${card.colorName}` : card.name}
                            fill
                            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                          <Image
                            src={card.hoverImage}
                            alt={card.colorName ? `${card.name} — ${card.colorName}` : card.name}
                            fill
                            className="object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        </a>
                        {card.badge && (
                          <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium rounded-full ${card.badge === "Sale" ? "bg-[#991B1B] text-white" : "bg-[#5C4B3D] text-white"}`}>
                            {card.badge}
                          </span>
                        )}
                        <div className="absolute top-3 right-3 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleWishlist(card.key)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors ${wishlisted ? "bg-red-50 text-red-500" : "bg-white hover:bg-[#F5F2ED] text-[#757575]"}`}
                          >
                            <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
                          </button>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-2 sm:group-hover:translate-y-0 transition-all duration-300">
                          <AddToCartButton
                            onAdd={() => addItem({ id: card.key, handle: card.handle, name: card.colorName ? `${card.name} — ${card.colorName}` : card.name, subtitle: card.subtitle, price: card.price, image: card.image })}
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <h3 className="text-[14px] font-medium text-[#1A1A1A] line-clamp-1">
                          <a href={card.href} className="hover:text-[#5C4B3D] transition-colors">
                            {card.colorName ? `${card.name} - ${card.colorName}` : card.name}
                          </a>
                        </h3>
                        <p className="text-[12px] text-[#757575] mt-0.5">{card.subtitle}</p>
                        <div className="flex flex-col gap-0.5 mt-1">
                          <span className="text-[15px] font-semibold text-[#1A1A1A]">₹{card.price.toLocaleString("en-IN")}.00</span>
                          {card.compareAt && card.compareAt > card.price && (
                            <span className="text-[13px] text-[#757575] line-through">₹{card.compareAt.toLocaleString("en-IN")}.00</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-2">No products found</h2>
              <p className="text-[14px] text-[#757575] mb-6">Check back soon for new additions to this collection.</p>
              <a href="/products" className="inline-flex items-center justify-center bg-[#5C4B3D] text-white px-8 py-3.5 rounded-sm font-medium text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors">
                Browse All Products
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
