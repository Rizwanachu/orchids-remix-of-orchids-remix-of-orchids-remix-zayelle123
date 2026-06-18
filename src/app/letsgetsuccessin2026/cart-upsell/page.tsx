"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Save, Search, ShoppingCart, ToggleLeft, ToggleRight } from "lucide-react";

interface Product {
  id: number;
  name: string;
  handle: string;
  image: string;
  price: number | string;
}

interface UpsellItem {
  id: number;
  productId: number;
  customPrice: number;
  displayOrder: number;
  isActive: boolean;
  name: string;
  handle: string;
  image: string;
  originalPrice: number;
}

interface FormState {
  productId: string;
  customPrice: string;
  displayOrder: string;
  isActive: boolean;
}

const emptyForm: FormState = {
  productId: "",
  customPrice: "",
  displayOrder: "0",
  isActive: true,
};

export default function CartUpsellPage() {
  const [items, setItems] = useState<UpsellItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cart-upsell");
      if (res.ok) {
        const data = await res.json();
        setItems(
          data.map((r: any) => ({
            id: r.id,
            productId: r.product_id,
            customPrice: Number(r.custom_price),
            displayOrder: r.display_order,
            isActive: r.is_active,
            name: r.name,
            handle: r.handle,
            image: r.image,
            originalPrice: Number(r.original_price),
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/products");
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.products || [];
      setProducts(list.map((p: any) => ({ id: p.id, name: p.name, handle: p.handle, image: p.image, price: p.price })));
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchProducts();
  }, [fetchItems, fetchProducts]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedProduct(null);
    setProductSearch("");
    setError("");
    setShowForm(true);
  };

  const openEdit = (item: UpsellItem) => {
    setEditingId(item.id);
    const prod = products.find(p => p.id === item.productId) || null;
    setSelectedProduct(prod);
    setProductSearch(prod ? prod.name : "");
    setForm({
      productId: String(item.productId),
      customPrice: String(item.customPrice),
      displayOrder: String(item.displayOrder),
      isActive: item.isActive,
    });
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.productId) { setError("Please select a product."); return; }
    if (!form.customPrice || isNaN(Number(form.customPrice))) { setError("Please enter a valid price."); return; }

    setSaving(true);
    setError("");
    try {
      const payload = {
        productId: Number(form.productId),
        customPrice: Number(form.customPrice),
        displayOrder: Number(form.displayOrder) || 0,
        isActive: form.isActive,
      };

      const url = editingId ? `/api/admin/cart-upsell/${editingId}` : "/api/admin/cart-upsell";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Failed to save.");
        return;
      }
      setSuccess(editingId ? "Item updated." : "Item added.");
      setTimeout(() => setSuccess(""), 3000);
      setShowForm(false);
      fetchItems();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/cart-upsell/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDeleteConfirm(null);
      setSuccess("Item removed.");
      setTimeout(() => setSuccess(""), 3000);
      fetchItems();
    }
  };

  const handleToggleActive = async (item: UpsellItem) => {
    await fetch(`/api/admin/cart-upsell/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    fetchItems();
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Cart Upsell — Complete Your Order</h1>
          <p className="text-sm text-[#757575] mt-1">Products shown in the "Complete Your Order" section on the cart page.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#5C4B3D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4a3b30] transition-colors"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">{success}</div>
      )}

      {loading ? (
        <div className="text-center py-16 text-[#757575]">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-[#E8E4DE] rounded-xl">
          <ShoppingCart className="mx-auto text-[#C5B9B0] mb-3" size={36} />
          <p className="text-[#757575] font-medium">No upsell products yet</p>
          <p className="text-sm text-[#A09890] mt-1">Add products to show in the cart's "Complete Your Order" section.</p>
          <button
            onClick={openAdd}
            className="mt-4 flex items-center gap-2 mx-auto bg-[#5C4B3D] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4a3b30] transition-colors"
          >
            <Plus size={15} /> Add Product
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div
              key={item.id}
              className={`flex items-center gap-4 bg-white border rounded-xl px-4 py-3 transition-all ${item.isActive ? "border-[#E8E4DE]" : "border-[#E8E4DE] opacity-50"}`}
            >
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#F5F2ED] flex-shrink-0">
                {item.image && (
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#1A1A1A] text-sm truncate">{item.name}</p>
                <p className="text-xs text-[#757575] mt-0.5">
                  Show price: <span className="font-semibold text-[#1A1A1A]">₹{item.customPrice}</span>
                  <span className="ml-2 line-through text-[#A09890]">₹{item.originalPrice}</span>
                </p>
                <p className="text-xs text-[#A09890]">Order: {item.displayOrder}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggleActive(item)}
                  className="text-[#5C4B3D] hover:opacity-70 transition-opacity"
                  title={item.isActive ? "Active — click to disable" : "Inactive — click to enable"}
                >
                  {item.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} className="text-[#A09890]" />}
                </button>
                <button
                  onClick={() => openEdit(item)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F2ED] text-[#757575] hover:text-[#5C4B3D] transition-colors"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(item.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#757575] hover:text-red-500 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DE]">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">{editingId ? "Edit Upsell Item" : "Add Upsell Product"}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#757575] hover:text-[#1A1A1A]"><X size={20} /></button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

              {/* Product Picker */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Product</label>
                {selectedProduct ? (
                  <div className="flex items-center gap-3 border border-[#5C4B3D] rounded-lg px-3 py-2 bg-[#FDF9F5]">
                    <div className="relative w-10 h-10 rounded overflow-hidden bg-[#F5F2ED] flex-shrink-0">
                      {selectedProduct.image && (
                        <Image src={selectedProduct.image} alt={selectedProduct.name} fill className="object-cover" sizes="40px" />
                      )}
                    </div>
                    <span className="flex-1 text-sm font-medium text-[#1A1A1A] truncate">{selectedProduct.name}</span>
                    <button
                      onClick={() => { setSelectedProduct(null); setForm(f => ({ ...f, productId: "" })); setProductSearch(""); }}
                      className="text-[#757575] hover:text-red-500 flex-shrink-0"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A09890]" />
                      <input
                        type="text"
                        placeholder="Search products…"
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border border-[#E8E4DE] rounded-lg text-sm focus:outline-none focus:border-[#5C4B3D]"
                      />
                    </div>
                    {productSearch && (
                      <div className="mt-1 border border-[#E8E4DE] rounded-lg overflow-hidden max-h-52 overflow-y-auto bg-white shadow-lg">
                        {filteredProducts.length === 0 ? (
                          <p className="px-4 py-3 text-sm text-[#757575]">No products found</p>
                        ) : (
                          filteredProducts.slice(0, 20).map(p => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedProduct(p);
                                setForm(f => ({ ...f, productId: String(p.id), customPrice: f.customPrice || String(p.price) }));
                                setProductSearch(p.name);
                              }}
                              className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-[#F5F2ED] transition-colors"
                            >
                              <div className="relative w-9 h-9 rounded overflow-hidden bg-[#F5F2ED] flex-shrink-0">
                                {p.image && <Image src={p.image} alt={p.name} fill className="object-cover" sizes="36px" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#1A1A1A] truncate">{p.name}</p>
                                <p className="text-xs text-[#757575]">₹{p.price}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Custom Price */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
                  Show Price (₹)
                  <span className="ml-1 text-xs text-[#757575] font-normal">— what customers pay when adding from the cart</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.customPrice}
                  onChange={e => setForm(f => ({ ...f, customPrice: e.target.value }))}
                  placeholder="e.g. 99"
                  className="w-full px-3 py-2.5 border border-[#E8E4DE] rounded-lg text-sm focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Display Order</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.displayOrder}
                  onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-[#E8E4DE] rounded-lg text-sm focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                  className={`w-10 h-6 rounded-full transition-colors relative ${form.isActive ? "bg-[#5C4B3D]" : "bg-[#D1CBC5]"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "left-5" : "left-1"}`} />
                </div>
                <span className="text-sm text-[#1A1A1A]">{form.isActive ? "Active (visible on cart)" : "Inactive (hidden)"}</span>
              </label>
            </div>

            <div className="px-6 py-4 border-t border-[#E8E4DE] flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm rounded-lg border border-[#E8E4DE] text-[#555] hover:bg-[#F5F2ED] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 text-sm rounded-lg bg-[#5C4B3D] text-white font-medium hover:bg-[#4a3b30] disabled:opacity-60 transition-colors"
              >
                {saving ? "Saving…" : <><Save size={14} /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Remove this item?</h3>
            <p className="text-sm text-[#757575] mb-6">This product will no longer appear in the cart upsell section.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm rounded-lg border border-[#E8E4DE] text-[#555] hover:bg-[#F5F2ED] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
