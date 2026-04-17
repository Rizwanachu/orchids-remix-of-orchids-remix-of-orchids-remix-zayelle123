"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Heart } from "lucide-react";
import AddToCartButton from "@/components/ui/add-to-cart-button";
import { useCart } from "@/lib/cart-context";

interface Product {
  id: number | string;
  handle: string;
  name: string;
  subtitle: string;
  price: number;
  compareAt?: number;
  image: string;
  hoverImage?: string;
  badge?: string;
  category?: string;
}

export default function GiftHampersPage() {
  const { addItem, toggleWishlist, isInWishlist } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [hampersRes, productsRes] = await Promise.all([
          fetch("/api/gift-hampers"),
          fetch("/api/products"),
        ]);

        if (!hampersRes.ok || !productsRes.ok) return;

        const hampersData = await hampersRes.json();
        const productsData = await productsRes.json();

        const allProducts: Product[] = Array.isArray(productsData)
          ? productsData
          : productsData.products || [];

        const hampers: { includedProductIds: number[] }[] = hampersData.hampers || [];

        const orderedIds: number[] = [];
        for (const hamper of hampers) {
          for (const id of hamper.includedProductIds || []) {
            if (!orderedIds.includes(id)) orderedIds.push(id);
          }
        }

        const filtered = orderedIds
          .map((id) => allProducts.find((p) => Number(p.id) === Number(id)))
          .filter(Boolean) as Product[];

        setProducts(filtered);
      } catch (err) {
        console.error("Error loading gift hampers:", err);
      } finally {
        setLoaded(true);
      }
    };

    load();
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-10 md:py-14">
          <div className="container px-4 md:px-8">
            <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
              Gift Hampers
            </h1>
            <p className="mt-2 text-[14px] text-[#757575]">Curated gift sets for every special occasion.</p>
            <nav className="mt-2 text-[13px] text-[#757575]">
              <a href="/" className="hover:text-[#1A1A1A] transition-colors">Home</a>
              <span className="mx-2">&gt;</span>
              <span className="text-[#1A1A1A]">Gift Hampers</span>
            </nav>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-16">
          {!loaded ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
              {Array.from({ length: 4 }).map((_, i) => (
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
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[18px] font-serif text-[#1A1A1A] mb-2">No gift hampers available</p>
              <p className="text-[14px] text-[#757575] mb-6">Check back soon for curated gift sets</p>
              <a
                href="/products"
                className="inline-block bg-[#5C4B3D] text-white px-6 py-3 rounded-sm text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors"
              >
                View All Products
              </a>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-[14px] text-[#757575]">
                  {products.length} product{products.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
                {products.map((product) => {
                  const wishlisted = isInWishlist(Number(product.id));
                  return (
                    <div key={String(product.id)} className="group flex flex-col">
                      <div className="relative w-full aspect-square overflow-hidden rounded-[12px] bg-white">
                        <a href={`/products/${product.handle}`} className="relative block w-full h-full">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            unoptimized
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        </a>
                        <span className="absolute top-3 left-3 bg-[#991B1B] text-white text-[11px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Gift
                        </span>
                        <div className="absolute top-3 right-3 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleWishlist(Number(product.id))}
                            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                              wishlisted
                                ? "bg-red-50 text-red-500"
                                : "bg-white hover:bg-[#F5F2ED] text-[#757575]"
                            }`}
                          >
                            <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
                          </button>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-2 sm:group-hover:translate-y-0 transition-all duration-300">
                          <AddToCartButton
                            onAdd={() => addItem({ id: Number(product.id), handle: product.handle, name: product.name, subtitle: product.subtitle, price: product.price, image: product.image })}
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <h3 className="text-[14px] font-medium text-[#1A1A1A] line-clamp-1">
                          <a
                            href={`/products/${product.handle}`}
                            className="hover:text-[#5C4B3D] transition-colors"
                          >
                            {product.name}
                          </a>
                        </h3>
                        <p className="text-[12px] text-[#757575] mt-0.5">{product.subtitle}</p>
                        <div className="flex flex-col gap-0.5 mt-1">
                          <span className="text-[15px] font-semibold text-[#1A1A1A]">
                            ₹{product.price.toLocaleString("en-IN")}.00
                          </span>
                          {product.compareAt && product.compareAt > product.price && (
                            <span className="text-[13px] text-[#757575] line-through">
                              ₹{product.compareAt.toLocaleString("en-IN")}.00
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
