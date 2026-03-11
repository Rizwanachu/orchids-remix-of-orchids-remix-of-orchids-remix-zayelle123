"use client";

import React, { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Heart, ShoppingCart, ChevronDown, X, SlidersHorizontal, Filter } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useProducts } from "@/lib/products-context";

type ColorInfo = { name: string; hex: string; image?: string };

type VariantCard = {
  key: string;
  productId: number;
  handle: string;
  name: string;
  image: string;
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
        cards.push({
          key: `${p.id}-${slug}`,
          productId: p.id,
          handle: p.handle,
          name: p.name,
          image: (color.images?.[0] ?? color.image) || p.image,
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

type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc";

interface CollectionInfo {
  id: number;
  title: string;
  slug: string;
}

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
  const collectionParam = searchParams.get("collection") || "";
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedCategory, setSelectedCategory] = useState<string>(collectionParam);
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [collections, setCollections] = useState<CollectionInfo[]>([]);

  useEffect(() => {
    fetch("/api/collections")
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data: { collections: CollectionInfo[] }) => setCollections(data.collections || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (collectionParam) {
      setSelectedCategory(collectionParam);
    }
  }, [collectionParam]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [products]);

  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 10000 };
    const prices = products.map((p) => p.price);
    return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
  }, [products]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (priceMin || priceMax) count++;
    return count;
  }, [selectedCategory, priceMin, priceMax]);

  const displayProducts = useMemo(() => {
    let filtered = query ? searchProducts(query) : [...products];

    if (selectedCategory) {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (priceMin) {
      const min = parseFloat(priceMin);
      if (!isNaN(min)) filtered = filtered.filter((p) => p.price >= min);
    }
    if (priceMax) {
      const max = parseFloat(priceMax);
      if (!isNaN(max)) filtered = filtered.filter((p) => p.price <= max);
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
  }, [query, products, searchProducts, sortBy, selectedCategory, priceMin, priceMax]);

  const displayCards = useMemo(() => expandToVariantCards(displayProducts), [displayProducts]);

  const clearAllFilters = () => {
    setSelectedCategory("");
    setPriceMin("");
    setPriceMax("");
  };

  const collectionDisplayName = useMemo(() => {
    if (!selectedCategory) return "";
    const col = collections.find((c) => c.slug.toLowerCase() === selectedCategory.toLowerCase());
    return col ? col.title : selectedCategory;
  }, [selectedCategory, collections]);

  const pageTitle = useMemo(() => {
    if (query) return `Search: "${query}"`;
    if (collectionDisplayName) return collectionDisplayName;
    return "All Products";
  }, [query, collectionDisplayName]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-10 md:py-14">
          <div className="container px-4 md:px-8">
            <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
              {pageTitle}
            </h1>
            <nav className="mt-2 text-[13px] text-[#757575]">
              <a href="/" className="hover:text-[#1A1A1A] transition-colors">Home</a>
              <span className="mx-2">&gt;</span>
              {selectedCategory && !query ? (
                <>
                  <a href="/products" className="hover:text-[#1A1A1A] transition-colors">All Products</a>
                  <span className="mx-2">&gt;</span>
                  <span className="text-[#1A1A1A]">{collectionDisplayName}</span>
                </>
              ) : (
                <span className="text-[#1A1A1A]">{query ? "Search Results" : "All Products"}</span>
              )}
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-[14px] text-[#757575]">{displayProducts.length} product{displayProducts.length !== 1 ? "s" : ""}</p>

              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory("")}
                  className="inline-flex items-center gap-1 text-[12px] text-[#5C4B3D] bg-[#F5F2ED] px-2.5 py-1 rounded-full hover:bg-[#E8E4DE] transition-colors"
                >
                  {collectionDisplayName}
                  <X size={12} />
                </button>
              )}
              {(priceMin || priceMax) && (
                <button
                  onClick={() => { setPriceMin(""); setPriceMax(""); }}
                  className="inline-flex items-center gap-1 text-[12px] text-[#5C4B3D] bg-[#F5F2ED] px-2.5 py-1 rounded-full hover:bg-[#E8E4DE] transition-colors"
                >
                  {priceMin && priceMax ? `₹${priceMin} – ₹${priceMax}` : priceMin ? `From ₹${priceMin}` : `Up to ₹${priceMax}`}
                  <X size={12} />
                </button>
              )}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-[12px] text-[#757575] hover:text-[#5C4B3D] underline underline-offset-4 transition-colors"
                >
                  Clear all
                </button>
              )}
              {query && (
                <a href="/products" className="text-[13px] text-[#5C4B3D] hover:underline underline-offset-4">
                  Clear search
                </a>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3.5 py-2 border rounded-lg text-[13px] transition-colors ${showFilters ? "border-[#5C4B3D] bg-[#5C4B3D] text-white" : "border-[#E0DCD7] bg-white text-[#1A1A1A] hover:border-[#5C4B3D]"}`}
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-semibold ${showFilters ? "bg-white text-[#5C4B3D]" : "bg-[#5C4B3D] text-white"}`}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
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
          </div>

          {showFilters && (
            <div className="mb-8 bg-white border border-[#E8E4DE] rounded-xl p-5 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-[12px] font-semibold text-[#757575] uppercase tracking-wider mb-3">Collections</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`px-3.5 py-1.5 rounded-full text-[13px] border transition-colors ${
                        !selectedCategory
                          ? "bg-[#5C4B3D] text-white border-[#5C4B3D]"
                          : "bg-white text-[#757575] border-[#E0DCD7] hover:border-[#5C4B3D] hover:text-[#5C4B3D]"
                      }`}
                    >
                      All
                    </button>
                    {(collections.length > 0 ? collections : categories.map((c, i) => ({ id: i, title: c, slug: c }))).map((col) => (
                      <button
                        key={col.id}
                        onClick={() => setSelectedCategory(selectedCategory === col.slug ? "" : col.slug)}
                        className={`px-3.5 py-1.5 rounded-full text-[13px] border transition-colors ${
                          selectedCategory === col.slug
                            ? "bg-[#5C4B3D] text-white border-[#5C4B3D]"
                            : "bg-white text-[#757575] border-[#E0DCD7] hover:border-[#5C4B3D] hover:text-[#5C4B3D]"
                        }`}
                      >
                        {col.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[12px] font-semibold text-[#757575] uppercase tracking-wider mb-3">Price Range</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#757575]">₹</span>
                      <input
                        type="number"
                        placeholder={String(priceRange.min)}
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 border border-[#E0DCD7] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D] transition-colors"
                      />
                    </div>
                    <span className="text-[13px] text-[#757575]">to</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#757575]">₹</span>
                      <input
                        type="number"
                        placeholder={String(priceRange.max)}
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 border border-[#E0DCD7] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D] transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[
                      { label: "Under ₹500", min: "", max: "500" },
                      { label: "₹500 – ₹1000", min: "500", max: "1000" },
                      { label: "₹1000 – ₹2000", min: "1000", max: "2000" },
                      { label: "Over ₹2000", min: "2000", max: "" },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => { setPriceMin(preset.min); setPriceMax(preset.max); }}
                        className={`px-2.5 py-1 text-[11px] rounded-md border transition-colors ${
                          priceMin === preset.min && priceMax === preset.max
                            ? "bg-[#5C4B3D] text-white border-[#5C4B3D]"
                            : "bg-[#FAF9F6] text-[#757575] border-[#E0DCD7] hover:border-[#5C4B3D] hover:text-[#5C4B3D]"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {displayProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[18px] font-serif text-[#1A1A1A] mb-2">No products found</p>
              <p className="text-[14px] text-[#757575] mb-6">Try adjusting your filters or search term</p>
              <div className="flex items-center justify-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="inline-block bg-white border border-[#E0DCD7] text-[#1A1A1A] px-6 py-3 rounded-sm text-[13px] uppercase tracking-wider hover:border-[#5C4B3D] transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
                <a href="/products" className="inline-block bg-[#5C4B3D] text-white px-6 py-3 rounded-sm text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors">
                  View All Products
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
              {displayCards.map((card) => {
                const wishlisted = isInWishlist(card.productId);
                return (
                  <div key={card.key} className="group flex flex-col">
                    <div className="relative w-full aspect-square overflow-hidden rounded-[12px] bg-white">
                      <a href={card.href} className="block w-full h-full">
                        <Image
                          src={card.image}
                          alt={card.colorName ? `${card.name} — ${card.colorName}` : card.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      </a>
                      {card.badge && (
                        <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] uppercase tracking-wider font-medium rounded-full ${card.badge === "Sale" ? "bg-[#991B1B] text-white" : "bg-[#5C4B3D] text-white"}`}>
                          {card.badge}
                        </span>
                      )}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleWishlist(card.productId)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors ${wishlisted ? "bg-red-50 text-red-500" : "bg-white hover:bg-[#F5F2ED] text-[#757575]"}`}
                        >
                          <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <button
                          onClick={() => addItem({ id: card.productId, handle: card.handle, name: card.colorName ? `${card.name} — ${card.colorName}` : card.name, subtitle: card.subtitle, price: card.price, image: card.image })}
                          className="w-full bg-white/90 backdrop-blur-sm text-[#1A1A1A] py-2.5 rounded-[8px] font-medium text-[12px] flex items-center justify-center gap-1.5 hover:bg-[#5C4B3D] hover:text-white transition-colors"
                        >
                          <ShoppingCart size={14} />
                          Add to Cart
                        </button>
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
          )}
          </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
