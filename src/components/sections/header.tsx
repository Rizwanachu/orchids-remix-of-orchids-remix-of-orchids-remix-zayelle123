"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, User, Heart, ShoppingBag, Menu, ChevronDown, X, ChevronRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useProducts } from "@/lib/products-context";
import Image from "next/image";

const defaultNavigationItems = [
  { name: "Home", href: "/" },
  { name: "All Products", href: "/products", hasDropdown: true },
  { name: "New Arrivals", href: "/new-arrivals" },
  { name: "Gift Hampers", href: "/gift-hampers" },
  { name: "Collections", href: "/collections" },
  { name: "About Us", href: "/pages/about-us" },
  { name: "Contact", href: "/pages/contact" },
  { name: "FAQ", href: "/pages/faq" },
];

interface CollectionDropdownItem {
  id: number;
  title: string;
  slug: string;
  imageUrl?: string;
}

const Header = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cmsSettings, setCmsSettings] = useState<Record<string, string>>({});
  const [dropdownCollections, setDropdownCollections] = useState<CollectionDropdownItem[]>([]);
  const [mobileProductsExpanded, setMobileProductsExpanded] = useState(false);
  const { totalItems, wishlist } = useCart();
  const { user } = useAuth();
  const { searchProducts } = useProducts();

  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data: Record<string, string>) => setCmsSettings(data))
      .catch(() => {});

    fetch("/api/collections")
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data: { collections: CollectionDropdownItem[] }) => setDropdownCollections(data.collections || []))
      .catch(() => {});
  }, []);

  const searchResults = useMemo(() => {
    if (searchQuery.trim().length < 2) return [];
    return searchProducts(searchQuery).slice(0, 6);
  }, [searchQuery, searchProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(searchQuery.trim())}`;
      setIsSearchFocused(false);
    }
  };

  const navigationItems = useMemo(() => {
    if (cmsSettings.header_navigation) {
      try {
        const parsed = JSON.parse(cmsSettings.header_navigation);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return defaultNavigationItems;
  }, [cmsSettings.header_navigation]);

  const logoUrl = useMemo(() => {
    return cmsSettings.header_logo_url || "/logo.png";
  }, [cmsSettings.header_logo_url]);

  const logoSize = useMemo(() => {
    return parseInt(cmsSettings.header_logo_size || "36", 10);
  }, [cmsSettings.header_logo_size]);
  
  const searchPlaceholder = cmsSettings.header_search_placeholder || "Search Hijabs, Satin Scarves, Undercaps...";
  const announcementEnabled = cmsSettings.header_announcement_enabled === "true";
  const announcementText = cmsSettings.header_announcement_text || "";

  return (
    <div className="w-full bg-white relative z-50">
      {announcementEnabled && announcementText && (
        <div className="bg-[#524436] text-white text-center py-2 text-[12px] tracking-wide">
          {announcementText}
        </div>
      )}
      {isSearchFocused && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300" 
          onClick={() => setIsSearchFocused(false)}
        />
      )}

      <header id="page-header" className="border-b border-[#E8E4DE]">
        <div className="container mx-auto px-5 lg:px-8">
          <div className="flex items-center justify-between py-6">
            
            <div className="hidden lg:flex flex-1 max-w-[300px] relative">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  className="w-full h-[40px] pl-4 pr-10 border border-[#E8E4DE] rounded-sm text-[13px] focus:outline-none focus:border-[#524436] transition-colors"
                  onFocus={() => setIsSearchFocused(true)}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]">
                  <Search size={18} strokeWidth={1.5} />
                </button>
              </form>

              {isSearchFocused && (
                <div className="absolute top-full left-0 w-[450px] bg-white shadow-xl border border-[#E8E4DE] mt-2 p-6 rounded-sm z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[12px] uppercase tracking-wider font-semibold text-[#757575]">
                      {searchQuery.trim().length >= 2 ? `Results (${searchResults.length})` : "Quick Search:"}
                    </span>
                    <button onClick={() => setIsSearchFocused(false)} className="text-[#1A1A1A] hover:opacity-70 transition-opacity">
                      <X size={16} />
                    </button>
                  </div>

                  {searchQuery.trim().length < 2 ? (
                    <>
                      <div className="flex gap-4 mb-6">
                        {["Chiffon Hijabs", "Satin Silk", "Jersey Wraps"].map((tag) => (
                          <a 
                            key={tag} 
                            href={`/products?q=${encodeURIComponent(tag)}`} 
                            className="text-[13px] text-[#1A1A1A] hover:underline underline-offset-4"
                          >
                            {tag}
                          </a>
                        ))}
                      </div>
                    </>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {searchResults.map((product) => (
                        <a
                          key={product.id}
                          href={`/products/${product.handle}`}
                          className="flex gap-3 items-center group p-2 rounded-lg hover:bg-[#F5F2ED] transition-colors"
                        >
                          <div className="w-14 h-14 bg-[#F5F2ED] rounded-sm overflow-hidden relative flex-shrink-0">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-[#1A1A1A] line-clamp-1">{product.name}</p>
                            <p className="text-[12px] text-[#757575]">{product.subtitle}</p>
                            <p className="text-[12px] font-semibold text-[#1A1A1A]">₹{product.price.toLocaleString("en-IN")}.00</p>
                          </div>
                        </a>
                      ))}
                      {searchQuery.trim() && (
                        <a
                          href={`/products?q=${encodeURIComponent(searchQuery.trim())}`}
                          className="block text-center text-[13px] text-[#5C4B3D] font-medium py-2 hover:underline underline-offset-4"
                        >
                          View all results
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-[13px] text-[#757575] py-4 text-center">No products found for &ldquo;{searchQuery}&rdquo;</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex-shrink-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
              <a href="/" className="block">
                <img
                  src={logoUrl}
                  alt="Zayelle"
                  style={{ height: `${logoSize}px` }}
                  className="w-auto object-contain"
                />
              </a>
            </div>

            <div className="flex items-center justify-end flex-1 gap-2 lg:gap-6">
              <button 
                className="lg:hidden p-2 text-[#1A1A1A]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
              </button>
              
              <a href={user ? "/account" : "/account/login"} className="hidden lg:flex items-center p-2 text-[#1A1A1A] hover:opacity-70 transition-opacity">
                <User size={22} strokeWidth={1.5} />
              </a>
              
              <a href="/wishlist" className="flex items-center p-2 text-[#1A1A1A] hover:opacity-70 transition-opacity relative">
                  <Heart size={22} strokeWidth={1.5} />
                  {wishlist.length > 0 && (
                    <span className="absolute top-1 right-0 bg-[#5C4B3D] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-white">{wishlist.length}</span>
                  )}
                </a>

                <a href="/cart" className="flex items-center p-2 text-[#1A1A1A] hover:opacity-70 transition-opacity relative">
                  <ShoppingBag size={22} strokeWidth={1.5} />
                  {totalItems > 0 && (
                    <span className="absolute top-1 right-0 bg-[#5C4B3D] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-white">{totalItems}</span>
                  )}
                </a>
            </div>
          </div>

          <nav className="hidden lg:flex items-center justify-center py-4 border-t border-[#F5F2ED]">
            <ul className="flex items-center gap-10">
              {navigationItems.map((item) => (
                <li key={item.name} className="relative group">
                  <a
                    href={item.href}
                    className="flex items-center gap-1 text-[13px] font-medium tracking-wide text-[#1A1A1A] uppercase hover:text-[#5C4B3D] transition-colors py-1"
                  >
                    {item.name}
                    {item.hasDropdown && <ChevronDown size={14} className="opacity-60 transition-transform duration-200 group-hover:rotate-180" />}
                  </a>
                  <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#5C4B3D] transition-all duration-300 group-hover:w-full" />

                  {item.hasDropdown && dropdownCollections.length > 0 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="bg-white border border-[#E8E4DE] rounded-lg shadow-xl min-w-[240px] py-2 overflow-hidden">
                        <a
                          href="/products"
                          className="flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium text-[#1A1A1A] hover:bg-[#F5F2ED] transition-colors"
                        >
                          View All Products
                        </a>
                        <div className="border-t border-[#F0EDE8] my-1" />
                        {dropdownCollections.map((col) => (
                          <a
                            key={col.id}
                            href={`/products?collection=${encodeURIComponent(col.slug)}`}
                            className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#F5F2ED] transition-colors group/item"
                          >
                            {col.imageUrl ? (
                              <div className="relative w-8 h-8 rounded-md overflow-hidden border border-[#E8E4DE] flex-shrink-0">
                                <Image src={col.imageUrl} alt={col.title} fill className="object-cover" sizes="32px" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-md bg-[#F5F2ED] flex-shrink-0" />
                            )}
                            <span className="text-[13px] text-[#1A1A1A] group-hover/item:text-[#5C4B3D] transition-colors">{col.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-[#E8E4DE] py-4">
              <form onSubmit={handleSearchSubmit} className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full h-[40px] pl-4 pr-10 border border-[#E8E4DE] rounded-sm text-[13px] focus:outline-none focus:border-[#524436] transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]">
                  <Search size={18} strokeWidth={1.5} />
                </button>
              </form>
              <ul className="space-y-1">
                {navigationItems.map((item) => (
                  <li key={item.name}>
                    {item.hasDropdown && dropdownCollections.length > 0 ? (
                      <div>
                        <button
                          onClick={() => setMobileProductsExpanded(!mobileProductsExpanded)}
                          className="flex items-center justify-between w-full py-2.5 text-[14px] font-medium text-[#1A1A1A] hover:text-[#5C4B3D] transition-colors"
                        >
                          {item.name}
                          <ChevronRight size={16} className={`text-[#757575] transition-transform duration-200 ${mobileProductsExpanded ? "rotate-90" : ""}`} />
                        </button>
                        {mobileProductsExpanded && (
                          <div className="pl-4 pb-2 space-y-0.5">
                            <a
                              href="/products"
                              className="block py-2 text-[13px] text-[#5C4B3D] font-medium hover:text-[#1A1A1A] transition-colors"
                            >
                              View All
                            </a>
                            {dropdownCollections.map((col) => (
                              <a
                                key={col.id}
                                href={`/products?collection=${encodeURIComponent(col.slug)}`}
                                className="flex items-center gap-2.5 py-2 text-[13px] text-[#757575] hover:text-[#5C4B3D] transition-colors"
                              >
                                {col.imageUrl ? (
                                  <div className="relative w-6 h-6 rounded overflow-hidden border border-[#E8E4DE] flex-shrink-0">
                                    <Image src={col.imageUrl} alt={col.title} fill className="object-cover" sizes="24px" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded bg-[#F5F2ED] flex-shrink-0" />
                                )}
                                {col.title}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <a
                        href={item.href}
                        className="block py-2.5 text-[14px] font-medium text-[#1A1A1A] hover:text-[#5C4B3D] transition-colors"
                      >
                        {item.name}
                      </a>
                    )}
                  </li>
                ))}
                <li className="pt-2 border-t border-[#F5F2ED]">
                  <a
                    href={user ? "/account" : "/account/login"}
                    className="block py-2.5 text-[14px] font-medium text-[#1A1A1A] hover:text-[#5C4B3D] transition-colors"
                  >
                    {user ? "My Account" : "Sign In"}
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default Header;
