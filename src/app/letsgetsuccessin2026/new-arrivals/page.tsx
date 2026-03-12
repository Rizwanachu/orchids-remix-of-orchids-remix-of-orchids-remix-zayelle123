"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Plus, Trash2, X, Star, Package, GripVertical, Search, ChevronDown } from "lucide-react";

interface ColorInfo {
  name: string;
  hex: string;
  image?: string;
  images?: string[];
}

interface ProductOption {
  id: string;
  name: string;
  displayLabel: string;
  image: string;
  price: number;
  handle: string;
  category?: string;
  colorSlug?: string;
  colorName?: string;
  colorHex?: string;
}

interface NewArrivalEntry {
  id: number;
  productId: number;
  colorSlug?: string | null;
  colorName?: string | null;
  colorHex?: string | null;
  displayOrder: number;
  createdAt: string;
  product: {
    id: number;
    handle: string;
    name: string;
    subtitle: string;
    price: number;
    compareAt?: number;
    image: string;
    hoverImage: string;
    badge?: string;
    category: string;
  };
}

function colorToSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function AdminNewArrivalsPage() {
  const [entries, setEntries] = useState<NewArrivalEntry[]>([]);
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [showProductPicker, setShowProductPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/new-arrivals");
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (err) {
      console.error("Error fetching new arrivals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        const expanded: ProductOption[] = [];
        for (const p of data) {
          let colors: ColorInfo[] = [];
          try {
            if (Array.isArray(p.colors)) colors = p.colors;
            else if (p.colors) colors = JSON.parse(p.colors);
          } catch { colors = []; }

          if (Array.isArray(colors) && colors.length > 0) {
            for (const color of colors) {
              const slug = colorToSlug(color.name);
              const colorImage = color.images?.[0] ?? color.image ?? p.image;
              expanded.push({
                id: p.id,
                name: p.name,
                displayLabel: `${p.name} — ${color.name}`,
                image: colorImage || p.image,
                price: p.price,
                handle: p.handle,
                category: p.category,
                colorSlug: slug,
                colorName: color.name,
                colorHex: color.hex,
              });
            }
          } else {
            expanded.push({
              id: p.id,
              name: p.name,
              displayLabel: p.name,
              image: p.image,
              price: p.price,
              handle: p.handle,
              category: p.category,
            });
          }
        }
        setAllProducts(expanded);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
    fetchProducts();
  }, [fetchEntries, fetchProducts]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowProductPicker(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showProductPicker && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showProductPicker]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleAddProduct = async (option: ProductOption) => {
    setSaving(true);
    setShowProductPicker(false);
    setSearchQuery("");
    try {
      const maxOrder = entries.length > 0
        ? Math.max(...entries.map((e) => e.displayOrder))
        : -1;
      const res = await fetch("/api/admin/new-arrivals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: parseInt(option.id),
          colorSlug: option.colorSlug || null,
          displayOrder: maxOrder + 1,
        }),
      });
      if (res.ok) {
        showSuccess("Product added to new arrivals");
        fetchEntries();
      } else {
        const err = await res.json();
        console.error("Error:", err);
      }
    } catch (err) {
      console.error("Error adding new arrival:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/new-arrivals/${id}`, { method: "DELETE" });
      if (res.ok) {
        showSuccess("Product removed from new arrivals");
        setDeleteConfirm(null);
        fetchEntries();
      }
    } catch (err) {
      console.error("Error deleting new arrival:", err);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...entries];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(dragOverIndex, 0, moved);

    setEntries(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);

    const updatePromises = reordered.map((entry, idx) =>
      fetch(`/api/admin/new-arrivals/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: idx }),
      })
    );

    try {
      await Promise.all(updatePromises);
      showSuccess("Order updated");
      fetchEntries();
    } catch (err) {
      console.error("Error reordering:", err);
      fetchEntries();
    }
  };

  const existingKeys = new Set(
    entries.map((e) => `${e.productId}::${e.colorSlug || ""}`)
  );
  const availableProducts = allProducts.filter(
    (p) => !existingKeys.has(`${p.id}::${p.colorSlug || ""}`)
  );

  const filteredProducts = availableProducts.filter((p) =>
    p.displayLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="bg-[#F5F2ED] py-10 md:py-14">
        <div className="container px-4 md:px-8">
          <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
            New Arrivals
          </h1>
          <p className="mt-2 text-[14px] text-[#757575]">
            Manage which products appear in the New Arrivals section. Drag to reorder.
          </p>
        </div>
      </div>

      <div className="container px-4 md:px-8 py-8 md:py-12">
        {successMessage && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-sm text-[13px] text-green-700">
            {successMessage}
          </div>
        )}

        <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-6 mb-6">
          <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">
            Add Product to New Arrivals
          </h2>
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setShowProductPicker(!showProductPicker)}
              disabled={saving}
              className="w-full flex items-center justify-between h-[46px] px-4 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white hover:bg-[#FAFAF8] transition-colors disabled:opacity-40"
            >
              <span className="text-[#999]">
                {saving ? "Adding..." : `Search & select a product to add (${availableProducts.length} available)`}
              </span>
              <ChevronDown size={16} className={`text-[#999] transition-transform ${showProductPicker ? "rotate-180" : ""}`} />
            </button>

            {showProductPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E8E4DE] rounded-lg shadow-lg z-50 max-h-[400px] flex flex-col">
                <div className="p-3 border-b border-[#F5F2ED]">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products by name, color, or category..."
                      className="w-full h-[38px] pl-9 pr-3 border border-[#E8E4DE] rounded-md text-[13px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto flex-1">
                  {filteredProducts.length === 0 ? (
                    <div className="px-4 py-8 text-center text-[13px] text-[#999]">
                      {searchQuery ? "No matching products found" : "All products are already in new arrivals"}
                    </div>
                  ) : (
                    filteredProducts.map((p, idx) => (
                      <button
                        key={`${p.id}-${p.colorSlug || "base"}-${idx}`}
                        onClick={() => handleAddProduct(p)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5F2ED] transition-colors text-left border-b border-[#F5F2ED] last:border-b-0"
                      >
                        <div className="w-[44px] h-[44px] relative rounded-md overflow-hidden bg-[#F5F2ED] flex-shrink-0">
                          {p.image ? (
                            <Image src={p.image} alt={p.displayLabel} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={18} className="text-[#D4C8BE]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-[#1A1A1A] truncate">{p.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {p.colorHex && (
                              <span
                                className="inline-block w-3 h-3 rounded-full border border-black/10 flex-shrink-0"
                                style={{ backgroundColor: p.colorHex }}
                              />
                            )}
                            {p.colorName ? (
                              <p className="text-[11px] text-[#5C4B3D]">{p.colorName}</p>
                            ) : p.category ? (
                              <p className="text-[11px] text-[#999]">{p.category}</p>
                            ) : null}
                          </div>
                        </div>
                        <span className="text-[13px] font-medium text-[#5C4B3D] flex-shrink-0">
                          ₹{p.price.toLocaleString("en-IN")}
                        </span>
                        <Plus size={16} className="text-[#5C4B3D] flex-shrink-0" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] text-[#757575]">{entries.length} products in new arrivals</p>
          {entries.length > 1 && (
            <p className="text-[12px] text-[#999] flex items-center gap-1">
              <GripVertical size={12} /> Drag rows to reorder
            </p>
          )}
        </div>

        <div className="bg-white border border-[#E8E4DE] rounded-[12px] overflow-hidden">
          <div className="hidden md:grid grid-cols-[32px_60px_1fr_100px_80px] gap-4 px-6 py-3 border-b border-[#E8E4DE] bg-[#FAFAF8]">
            <span></span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Image</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Product</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Price</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider text-right">Actions</span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-[14px] text-[#757575]">Loading...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <Star size={40} className="text-[#D4C8BE] mx-auto mb-3" />
              <p className="text-[14px] text-[#757575]">No new arrivals yet</p>
              <p className="text-[12px] text-[#999] mt-1">Add products above to feature them</p>
            </div>
          ) : (
            entries.map((entry, index) => (
              <div
                key={entry.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`grid grid-cols-[32px_60px_1fr_100px_80px] gap-4 px-6 py-4 border-b border-[#F5F2ED] last:border-b-0 transition-all items-center cursor-grab active:cursor-grabbing ${
                  draggedIndex === index ? "opacity-50 bg-[#F5F2ED]" : "hover:bg-[#FAFAF8]"
                } ${dragOverIndex === index && draggedIndex !== index ? "border-t-2 border-t-[#5C4B3D]" : ""}`}
              >
                <div className="flex items-center justify-center text-[#C4B9AD] hover:text-[#757575] transition-colors">
                  <GripVertical size={16} />
                </div>
                <div className="w-[50px] h-[50px] relative rounded-lg overflow-hidden bg-[#F5F2ED]">
                  {entry.product.image ? (
                    <Image
                      src={entry.product.image}
                      alt={entry.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={20} className="text-[#D4C8BE]" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#1A1A1A]">{entry.product.name}</p>
                  {entry.colorName && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {entry.colorHex && (
                        <span
                          className="inline-block w-3 h-3 rounded-full border border-black/10 flex-shrink-0"
                          style={{ backgroundColor: entry.colorHex }}
                        />
                      )}
                      <p className="text-[11px] text-[#5C4B3D]">{entry.colorName}</p>
                    </div>
                  )}
                  <p className="text-[11px] text-[#757575] mt-0.5">{entry.product.subtitle}</p>
                  {entry.product.category && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-[#F5F2ED] text-[10px] text-[#757575] rounded-full">
                      {entry.product.category}
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-[#1A1A1A]">
                  ₹{entry.product.price.toLocaleString("en-IN")}
                  {entry.product.compareAt && entry.product.compareAt > entry.product.price && (
                    <span className="block text-[11px] text-[#999] line-through">
                      ₹{entry.product.compareAt.toLocaleString("en-IN")}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-1 justify-end">
                  {deleteConfirm === entry.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="px-2 py-1 text-[11px] bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F2ED] text-[#757575] transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(entry.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#757575] hover:text-red-600 transition-colors"
                      title="Remove from new arrivals"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
