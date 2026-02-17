"use client";

import React from "react";
import Image from "next/image";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useProducts } from "@/lib/products-context";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addItem } = useCart();
  const { products } = useProducts();
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

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
              {wishlistProducts.length} {wishlistProducts.length === 1 ? "item" : "items"} saved
            </p>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-16">
          {wishlistProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
              {wishlistProducts.map((product) => (
                <div key={product.id} className="group flex flex-col">
                  <div className="relative w-full aspect-square overflow-hidden rounded-[12px] bg-white">
                    <a href={`/products/${product.handle}`} className="block w-full h-full">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </a>
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm bg-red-50 text-red-500 transition-colors"
                      >
                        <Heart size={15} fill="currentColor" />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <button
                        onClick={() => addItem({ id: product.id, handle: product.handle, name: product.name, subtitle: product.subtitle, price: product.price, image: product.image })}
                        className="w-full bg-white/90 backdrop-blur-sm text-[#1A1A1A] py-2.5 rounded-[8px] font-medium text-[12px] flex items-center justify-center gap-1.5 hover:bg-[#5C4B3D] hover:text-white transition-colors"
                      >
                        <ShoppingCart size={14} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-[14px] font-medium text-[#1A1A1A] line-clamp-1">
                      <a href={`/products/${product.handle}`} className="hover:text-[#5C4B3D] transition-colors">
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
