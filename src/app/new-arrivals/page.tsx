"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Heart } from "lucide-react";
import AddToCartButton from "@/components/ui/add-to-cart-button";
import { useCart } from "@/lib/cart-context";

interface NewArrivalProduct {
  id: string;
  handle: string;
  colorSlug: string | null;
  colorName: string | null;
  name: string;
  subtitle: string;
  price: number;
  compareAt?: number;
  image: string;
  hoverImage: string;
  badge?: string;
}

export default function NewArrivalsPage() {
  const { addItem, toggleWishlist, isInWishlist } = useCart();
  const [products, setProducts] = useState<NewArrivalProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/new-arrivals")
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-10 md:py-14">
          <div className="container px-4 md:px-8">
            <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
              New Arrivals
            </h1>
            <p className="mt-2 text-[14px] text-[#757575]">Designed for comfort. Crafted for elegance.</p>
            <nav className="mt-2 text-[13px] text-[#757575]">
              <a href="/" className="hover:text-[#1A1A1A] transition-colors">Home</a>
              <span className="mx-2">&gt;</span>
              <span className="text-[#1A1A1A]">New Arrivals</span>
            </nav>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-16">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col">
                  <div className="w-full aspect-square rounded-[12px] bg-[#E8E4DE] animate-pulse" />
                  <div className="mt-3 space-y-2">
                    <div className="h-3.5 bg-[#E8E4DE] rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-[#E8E4DE] rounded animate-pulse w-1/2" />
                    <div className="h-4 bg-[#E8E4DE] rounded animate-pulse w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[15px] text-[#757575]">No new arrivals at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
              {products.map((product) => {
                const wishlistKey = product.id;
                const wishlisted = isInWishlist(wishlistKey);
                const productUrl = product.colorSlug
                  ? `/products/${product.handle}?color=${product.colorSlug}`
                  : `/products/${product.handle}`;
                return (
                  <div key={product.id} className="group flex flex-col">
                    <div className="relative w-full aspect-square overflow-hidden rounded-[12px] bg-white">
                      <a href={productUrl} className="relative block w-full h-full">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      </a>
                      <span className="absolute top-3 left-3 bg-[#5C4B3D] text-white text-[11px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider">
                        New
                      </span>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleWishlist(wishlistKey)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors ${wishlisted ? "bg-red-50 text-red-500" : "bg-white hover:bg-[#F5F2ED] text-[#757575]"}`}
                        >
                          <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <AddToCartButton
                          onAdd={() => addItem({
                            id: wishlistKey,
                            handle: product.handle,
                            name: product.name,
                            subtitle: product.subtitle,
                            price: product.price,
                            image: product.image,
                          })}
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <h3 className="text-[14px] font-medium text-[#1A1A1A] line-clamp-1">
                        <a href={productUrl} className="hover:text-[#5C4B3D] transition-colors">
                          {product.name}
                        </a>
                      </h3>
                      <p className="text-[12px] text-[#757575] mt-0.5">{product.subtitle}</p>
                      <div className="flex flex-col gap-0.5 mt-1">
                        <span className="text-[15px] font-semibold text-[#1A1A1A]">₹{product.price.toLocaleString("en-IN")}.00</span>
                        {product.compareAt && product.compareAt > product.price && (
                          <span className="text-[13px] text-[#757575] line-through">₹{product.compareAt.toLocaleString("en-IN")}.00</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
