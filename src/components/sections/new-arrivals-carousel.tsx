"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart, Search, ShoppingCart } from "lucide-react";
import { Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { useProducts } from "@/lib/products-context";

const ProductCard = ({ product }: { product: Product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem, toggleWishlist, isInWishlist } = useCart();
  const wishlisted = isInWishlist(product.id);

  return (
    <div 
      className="group flex flex-col items-center text-center px-2 mb-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full aspect-square overflow-hidden rounded-[12px] bg-white transition-premium">
        <a href={`/products/${product.handle}`} className="block w-full h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`object-cover transition-opacity duration-500 scale-100 group-hover:scale-105 ${
              isHovered ? "opacity-0" : "opacity-100"
            }`}
          />
          <Image
            src={product.hoverImage}
            alt={`${product.name} alternate view`}
            fill
            className={`object-cover transition-opacity duration-500 scale-105 group-hover:scale-100 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />
        </a>

        <div className="absolute inset-0 flex flex-col justify-end p-4 pointer-events-none">
          <div className="flex flex-col gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 pointer-events-auto">
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-soft transition-colors ${wishlisted ? "bg-red-50 text-red-500" : "bg-white hover:bg-primary hover:text-white"}`}
              >
                <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
              </button>
              <a href={`/products/${product.handle}`} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-soft hover:bg-primary hover:text-white transition-colors">
                <Search size={18} />
              </a>
            </div>
            
            <button
              onClick={() => addItem({ id: product.id, handle: product.handle, name: product.name, subtitle: product.subtitle, price: product.price, image: product.image })}
              className="w-full bg-white/90 backdrop-blur-sm text-foreground py-3 rounded-[8px] font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all duration-300"
            >
              <ShoppingCart size={16} />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1 w-full">
        <h3 className="text-[14px] font-normal text-foreground capitalize tracking-tight line-clamp-1">
          <a href={`/products/${product.handle}`} className="hover:text-primary transition-colors">
            {product.name}
          </a>
        </h3>
          <p className="text-[12px] text-[#757575]">{product.subtitle}</p>
            <div className="flex flex-col gap-0.5 mt-1">
              <span className="text-[16px] font-semibold text-foreground">
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
};

export default function NewArrivalsCarousel() {
  const { products: allProducts } = useProducts();
  const products = allProducts.slice(0, 4);
  return (
    <section className="py-[80px] bg-background">
      <div className="container">
        <header className="flex flex-col items-center mb-10 text-center">
          <h2 className="text-[32px] font-serif italic text-foreground mb-2">
            New Arrivals
          </h2>
          <p className="text-[14px] text-[#757575] mb-4">Designed for comfort. Crafted for elegance.</p>
          <div className="w-[60px] h-[1px] bg-border mb-8"></div>
        </header>

        <div className="relative group/carousel">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <button 
            className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-soft opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:left-[-40px] transition-all duration-300 hidden xl:flex"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-soft opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:right-[-40px] transition-all duration-300 hidden xl:flex"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="w-1.5 h-1.5 rounded-full bg-border" />
          <span className="w-1.5 h-1.5 rounded-full bg-border" />
          <span className="w-1.5 h-1.5 rounded-full bg-border" />
          <span className="w-1.5 h-1.5 rounded-full bg-border" />
        </div>

        <div className="mt-10 text-center">
          <a 
            href="/collections/all" 
            className="inline-flex items-center gap-2 text-[14px] font-medium text-foreground hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1"
          >
            View All
            <ChevronRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
