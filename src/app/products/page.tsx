"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Heart, ShoppingCart, ChevronDown, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useProducts } from "@/lib/products-context";

type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc";

export default function AllProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F6]" />}>
      <AllProductsContent />
    </Suspense>
  );
}

function AllProductsContent() {
  const { addItem, toggleWishlist, isInWishlist } = useCart();
  const { products, loaded, searchProducts } = useProducts();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [products]);

  const displayProducts = useMemo(() => {
    let filtered = query ? searchProducts(query) : [...products];

    if (selectedCategory) {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        break;
    }

    return filtered;
  }, [query, products, searchProducts, sortBy, selectedCategory]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-10 md:py-14">
          <div className="container px-4 md:px-8">
            <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
              {query ? `Search: "${query}"` : "All Products"}
            </h1>
            <nav className="mt-2 text-[13px] text-[#757575]">
              <a href="/" className="hover:text-[#1A1A1A] transition-colors">Home</a>
              <span className="mx-2">&gt;</span>
              <span className="text-[#1A1A1A]">{query ? "Search Results" : "All Products"}</span>
            </nav>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-16">
          {!loaded ? (
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
          ) : (
          <>
          {categories.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-4 py-1.5 rounded-full text-[13px] border transition-colors ${
                  !selectedCategory
                    ? "bg-[#5C4B3D] text-white border-[#5C4B3D]"
                    : "bg-white text-[#757575] border-[#E0DCD7] hover:border-[#5C4B3D] hover:text-[#5C4B3D]"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(selectedCategory === cat ? "" : cat)}
                  className={`px-4 py-1.5 rounded-full text-[13px] border transition-colors capitalize ${
                    selectedCategory === cat
                      ? "bg-[#5C4B3D] text-white border-[#5C4B3D]"
                      : "bg-white text-[#757575] border-[#E0DCD7] hover:border-[#5C4B3D] hover:text-[#5C4B3D]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <p className="text-[14px] text-[#757575]">{displayProducts.length} product{displayProducts.length !== 1 ? "s" : ""}</p>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory("")}
                  className="inline-flex items-center gap-1 text-[12px] text-[#5C4B3D] bg-[#F5F2ED] px-2.5 py-1 rounded-full hover:bg-[#E8E4DE] transition-colors capitalize"
                >
                  {selectedCategory}
                  <X size={12} />
                </button>
              )}
              {query && (
                <a href="/products" className="text-[13px] text-[#5C4B3D] hover:underline underline-offset-4">
                  Clear search
                </a>
              )}
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-white border border-[#E0DCD7] rounded-lg pl-3 pr-8 py-2 text-[13px] text-[#1A1A1A] cursor-pointer hover:border-[#5C4B3D] transition-colors focus:outline-none focus:border-[#5C4B3D]"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#757575] pointer-events-none" />
            </div>
          </div>

          {displayProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[18px] font-serif text-[#1A1A1A] mb-2">No products found</p>
              <p className="text-[14px] text-[#757575] mb-6">Try a different search term</p>
              <a href="/products" className="inline-block bg-[#5C4B3D] text-white px-6 py-3 rounded-sm text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors">
                View All Products
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
              {displayProducts.map((product) => {
                const wishlisted = isInWishlist(product.id);
                return (
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
                      {product.badge && (
                        <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium rounded-full ${product.badge === "Sale" ? "bg-[#991B1B] text-white" : "bg-[#5C4B3D] text-white"}`}>
                          {product.badge}
                        </span>
                      )}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors ${wishlisted ? "bg-red-50 text-red-500" : "bg-white hover:bg-[#F5F2ED] text-[#757575]"}`}
                        >
                          <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
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
                );
              })}
            </div>
          )}
          </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
