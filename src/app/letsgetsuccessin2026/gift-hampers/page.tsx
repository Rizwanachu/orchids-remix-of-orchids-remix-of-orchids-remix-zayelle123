"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  X,
  Gift,
  Package,
  GripVertical,
  Search,
  ChevronDown,
} from "lucide-react";

interface ProductOption {
  id: string;
  name: string;
  image: string;
  price: number;
  handle: string;
  category?: string;
  subtitle?: string;
  compareAt?: number;
}

interface GiftHamper {
  id: number;
  title: string;
  includedProductIds: number[];
}

export default function AdminGiftHampersPage() {
  const [hamper, setHamper] = useState<GiftHamper | null>(null);
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [showProductPicker, setShowProductPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        const list: ProductOption[] = (Array.isArray(data) ? data : data.products || []).map(
          (p: { id: string | number; name: string; image: string; price: number; handle?: string; category?: string; subtitle?: string; compareAt?: number }) => ({
            id: String(p.id),
            name: p.name,
            image: p.image,
            price: p.price,
            handle: p.handle || "",
            category: p.category,
            subtitle: p.subtitle,
            compareAt: p.compareAt,
          })
        );
        setAllProducts(list);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }, []);

  const fetchOrCreateHamper = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/gift-hampers");
      if (!res.ok) return;
      const data = await res.json();
      const hampers: GiftHamper[] = data.hampers || [];

      if (hampers.length > 0) {
        setHamper(hampers[0]);
      } else {
        const createRes = await fetch("/api/admin/gift-hampers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Gift Hampers Collection",
            description: "",
            imageUrl: "",
            price: 0,
            displayOrder: 0,
            isActive: 1,
            includedProductIds: [],
          }),
        });
        if (createRes.ok) {
          const newHamper = await createRes.json();
          setHamper({
            id: newHamper.id,
            title: newHamper.title,
            includedProductIds: [],
          });
        }
      }
    } catch (err) {
      console.error("Error fetching/creating hamper:", err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchOrCreateHamper(), fetchProducts()]);
      setLoading(false);
    };
    load();
  }, [fetchOrCreateHamper, fetchProducts]);

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

  const includedIds = hamper?.includedProductIds || [];

  const productsInHamper: ProductOption[] = includedIds
    .map((id) => allProducts.find((p) => Number(p.id) === id))
    .filter(Boolean) as ProductOption[];

  const availableProducts = allProducts.filter(
    (p) => !includedIds.includes(Number(p.id))
  );

  const filteredProducts = availableProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const saveProductIds = async (newIds: number[]) => {
    if (!hamper) return;
    await fetch(`/api/admin/gift-hampers/${hamper.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ includedProductIds: newIds }),
    });
    setHamper((h) => h ? { ...h, includedProductIds: newIds } : h);
  };

  const handleAddProduct = async (productId: string) => {
    setAdding(true);
    setShowProductPicker(false);
    setSearchQuery("");
    try {
      const newIds = [...includedIds, Number(productId)];
      await saveProductIds(newIds);
      showSuccess("Product added to gift hampers");
    } catch (err) {
      console.error("Error adding product:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveProduct = async (productId: number) => {
    try {
      const newIds = includedIds.filter((id) => id !== productId);
      await saveProductIds(newIds);
      showSuccess("Product removed from gift hampers");
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error removing product:", err);
    }
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);

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

    const reordered = [...includedIds];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(dragOverIndex, 0, moved);

    setDraggedIndex(null);
    setDragOverIndex(null);

    try {
      await saveProductIds(reordered);
      showSuccess("Order updated");
    } catch (err) {
      console.error("Error reordering:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="bg-[#F5F2ED] py-10 md:py-14">
        <div className="container px-4 md:px-8">
          <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
            Gift Hampers
          </h1>
          <p className="mt-2 text-[14px] text-[#757575]">
            Manage which products appear in the Gift Hampers section. Drag to reorder.
          </p>
        </div>
      </div>

      <div className="container px-4 md:px-8 py-8 md:py-12">
        {successMessage && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-[13px] text-green-700">
            {successMessage}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-[#5C4B3D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[13px] text-[#757575]">Loading...</p>
          </div>
        ) : (
          <>
            <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-6 mb-6">
              <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">
                Add Product to Gift Hampers
              </h2>
              <div className="relative" ref={pickerRef}>
                <button
                  onClick={() => setShowProductPicker(!showProductPicker)}
                  disabled={adding}
                  className="w-full flex items-center justify-between h-[46px] px-4 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white hover:bg-[#FAFAF8] transition-colors disabled:opacity-40"
                >
                  <span className="text-[#999]">
                    {adding
                      ? "Adding..."
                      : `Search & select a product to add (${availableProducts.length} available)`}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-[#999] transition-transform ${showProductPicker ? "rotate-180" : ""}`}
                  />
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
                          placeholder="Search products by name or category..."
                          className="w-full h-[38px] pl-9 pr-3 border border-[#E8E4DE] rounded-md text-[13px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {filteredProducts.length === 0 ? (
                        <div className="px-4 py-8 text-center text-[13px] text-[#999]">
                          {searchQuery
                            ? "No matching products found"
                            : "All products are already in gift hampers"}
                        </div>
                      ) : (
                        filteredProducts.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleAddProduct(p.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5F2ED] transition-colors text-left border-b border-[#F5F2ED] last:border-b-0"
                          >
                            <div className="w-[44px] h-[44px] relative rounded-md overflow-hidden bg-[#F5F2ED] flex-shrink-0">
                              {p.image ? (
                                <Image src={p.image} alt={p.name} fill className="object-cover" sizes="44px" unoptimized />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package size={18} className="text-[#D4C8BE]" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-[#1A1A1A] truncate">{p.name}</p>
                              {p.category && (
                                <p className="text-[11px] text-[#999] mt-0.5">{p.category}</p>
                              )}
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
              <p className="text-[14px] text-[#757575]">
                {productsInHamper.length} products in gift hampers
              </p>
              {productsInHamper.length > 1 && (
                <p className="text-[12px] text-[#999] flex items-center gap-1">
                  <GripVertical size={12} /> Drag rows to reorder
                </p>
              )}
            </div>

            <div className="bg-white border border-[#E8E4DE] rounded-[12px] overflow-hidden">
              <div className="hidden md:grid grid-cols-[32px_60px_1fr_100px_80px] gap-4 px-6 py-3 border-b border-[#E8E4DE] bg-[#FAFAF8]">
                <span />
                <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Image</span>
                <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Product</span>
                <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Price</span>
                <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider text-right">Actions</span>
              </div>

              {productsInHamper.length === 0 ? (
                <div className="text-center py-12">
                  <Gift size={40} className="text-[#D4C8BE] mx-auto mb-3" />
                  <p className="text-[14px] text-[#757575]">No products in gift hampers yet</p>
                  <p className="text-[12px] text-[#999] mt-1">Add products above to feature them</p>
                </div>
              ) : (
                productsInHamper.map((product, index) => (
                  <div
                    key={product.id}
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
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="50px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={20} className="text-[#D4C8BE]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#1A1A1A]">{product.name}</p>
                      {product.subtitle && (
                        <p className="text-[11px] text-[#757575]">{product.subtitle}</p>
                      )}
                      {product.category && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-[#F5F2ED] text-[10px] text-[#757575] rounded-full">
                          {product.category}
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-[#1A1A1A]">
                      ₹{product.price.toLocaleString("en-IN")}
                      {product.compareAt && product.compareAt > product.price && (
                        <span className="block text-[11px] text-[#999] line-through">
                          ₹{product.compareAt.toLocaleString("en-IN")}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      {deleteConfirm === Number(product.id) ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleRemoveProduct(Number(product.id))}
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
                          onClick={() => setDeleteConfirm(Number(product.id))}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#757575] hover:text-red-600 transition-colors"
                          title="Remove from gift hampers"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
