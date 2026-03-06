"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Trash2, X, Star, Save, Package } from "lucide-react";

interface ProductOption {
  id: string;
  name: string;
  image: string;
  price: number;
  handle: string;
}

interface NewArrivalEntry {
  id: number;
  productId: number;
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

export default function AdminNewArrivalsPage() {
  const [entries, setEntries] = useState<NewArrivalEntry[]>([]);
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/letsgetsuccessin2026/new-arrivals");
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
      const res = await fetch("/api/letsgetsuccessin2026/products");
      if (res.ok) {
        const data = await res.json();
        setAllProducts(data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
    fetchProducts();
  }, [fetchEntries, fetchProducts]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleAdd = async () => {
    if (!selectedProductId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/letsgetsuccessin2026/new-arrivals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: parseInt(selectedProductId),
          displayOrder: parseInt(displayOrder) || 0,
        }),
      });
      if (res.ok) {
        showSuccess("Product added to new arrivals");
        setSelectedProductId("");
        setDisplayOrder("0");
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

  const handleUpdateOrder = async (id: number, newOrder: number) => {
    try {
      const res = await fetch(`/api/letsgetsuccessin2026/new-arrivals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayOrder: newOrder }),
      });
      if (res.ok) {
        fetchEntries();
      }
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/letsgetsuccessin2026/new-arrivals/${id}`, { method: "DELETE" });
      if (res.ok) {
        showSuccess("Product removed from new arrivals");
        setDeleteConfirm(null);
        fetchEntries();
      }
    } catch (err) {
      console.error("Error deleting new arrival:", err);
    }
  };

  const existingProductIds = entries.map((e) => e.productId);
  const availableProducts = allProducts.filter(
    (p) => !existingProductIds.includes(parseInt(p.id))
  );

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="bg-[#F5F2ED] py-10 md:py-14">
        <div className="container px-4 md:px-8">
          <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
            New Arrivals
          </h1>
          <p className="mt-2 text-[14px] text-[#757575]">
            Manage which products appear in the New Arrivals section
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                Select Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
              >
                <option value="">Choose a product...</option>
                {availableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₹{p.price.toLocaleString("en-IN")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                placeholder="0"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleAdd}
              disabled={!selectedProductId || saving}
              className="flex items-center gap-2 bg-[#5C4B3D] text-white px-5 py-2.5 rounded-sm text-[13px] font-medium uppercase tracking-wider hover:bg-[#4A3C31] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
              {saving ? "Adding..." : "Add to New Arrivals"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] text-[#757575]">{entries.length} products in new arrivals</p>
        </div>

        <div className="bg-white border border-[#E8E4DE] rounded-[12px] overflow-hidden">
          <div className="hidden md:grid grid-cols-[60px_1fr_100px_100px_80px] gap-4 px-6 py-3 border-b border-[#E8E4DE] bg-[#FAFAF8]">
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Image</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Product</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Price</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Order</span>
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
            entries.map((entry) => (
              <div
                key={entry.id}
                className="grid grid-cols-[60px_1fr_100px_100px_80px] gap-4 px-6 py-4 border-b border-[#F5F2ED] last:border-b-0 hover:bg-[#FAFAF8] transition-colors items-center"
              >
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
                  <p className="text-[11px] text-[#757575]">{entry.product.subtitle}</p>
                </div>
                <p className="text-[13px] text-[#1A1A1A]">
                  ₹{entry.product.price.toLocaleString("en-IN")}
                </p>
                <div>
                  <input
                    type="number"
                    defaultValue={entry.displayOrder}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val !== entry.displayOrder) {
                        handleUpdateOrder(entry.id, val);
                      }
                    }}
                    className="w-[70px] h-[32px] px-2 border border-[#E8E4DE] rounded-sm text-[13px] focus:outline-none focus:border-[#5C4B3D] bg-white text-center"
                  />
                </div>
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
