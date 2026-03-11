"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Gift,
  Save,
  Upload,
  ImageIcon,
  Package,
  GripVertical,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import MediaPickerModal from "@/components/admin/media-picker-modal";

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
  description: string;
  imageUrl: string;
  price: string;
  comparePrice: string | null;
  includedProductIds: number[] | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface HamperFormData {
  title: string;
  description: string;
  imageUrl: string;
  price: string;
  comparePrice: string;
  displayOrder: string;
  isActive: boolean;
}

const emptyForm: HamperFormData = {
  title: "",
  description: "",
  imageUrl: "",
  price: "",
  comparePrice: "",
  displayOrder: "0",
  isActive: true,
};

export default function AdminGiftHampersPage() {
  const [hampers, setHampers] = useState<GiftHamper[]>([]);
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedHamperId, setSelectedHamperId] = useState<number | null>(null);
  const [showHamperForm, setShowHamperForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<HamperFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [showProductPicker, setShowProductPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const fetchHampers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/gift-hampers");
      if (res.ok) {
        const data = await res.json();
        setHampers(data.hampers || []);
      }
    } catch (err) {
      console.error("Error fetching gift hampers:", err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.products || []);
        setAllProducts(list.map((p: { id: string | number; name: string; image: string; price: number; handle: string; category?: string; subtitle?: string; compareAt?: number }) => ({
          id: String(p.id),
          name: p.name,
          image: p.image,
          price: p.price,
          handle: p.handle || "",
          category: p.category,
          subtitle: p.subtitle,
          compareAt: p.compareAt,
        })));
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchHampers(), fetchProducts()]);
      setLoading(false);
    };
    load();
  }, [fetchHampers, fetchProducts]);

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

  const selectedHamper = hampers.find((h) => h.id === selectedHamperId) || null;

  const includedIds = selectedHamper?.includedProductIds || [];

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

  const handleAddProduct = async (productId: string) => {
    if (!selectedHamper) return;
    setAdding(true);
    setShowProductPicker(false);
    setSearchQuery("");
    try {
      const newIds = [...includedIds, Number(productId)];
      const res = await fetch(`/api/admin/gift-hampers/${selectedHamper.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includedProductIds: newIds }),
      });
      if (res.ok) {
        showSuccess("Product added to hamper");
        await fetchHampers();
      }
    } catch (err) {
      console.error("Error adding product:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveProduct = async (productId: number) => {
    if (!selectedHamper) return;
    try {
      const newIds = includedIds.filter((id) => id !== productId);
      const res = await fetch(`/api/admin/gift-hampers/${selectedHamper.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includedProductIds: newIds }),
      });
      if (res.ok) {
        showSuccess("Product removed from hamper");
        await fetchHampers();
      }
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
    if (!selectedHamper || draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
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
      const res = await fetch(`/api/admin/gift-hampers/${selectedHamper.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includedProductIds: reordered }),
      });
      if (res.ok) {
        showSuccess("Order updated");
        await fetchHampers();
      }
    } catch (err) {
      console.error("Error reordering:", err);
    }
  };

  const handleStartAdd = () => {
    setShowHamperForm(true);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleStartEdit = (hamper: GiftHamper) => {
    setShowHamperForm(true);
    setEditingId(hamper.id);
    setForm({
      title: hamper.title,
      description: hamper.description,
      imageUrl: hamper.imageUrl,
      price: hamper.price,
      comparePrice: hamper.comparePrice || "",
      displayOrder: hamper.displayOrder.toString(),
      isActive: hamper.isActive,
    });
  };

  const handleCancelForm = () => {
    setShowHamperForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setForm((f) => ({ ...f, imageUrl: data.url }));
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveHamper = async () => {
    if (!form.title || !form.price) return;
    setSaving(true);
    try {
      const body = {
        title: form.title,
        description: form.description,
        imageUrl: form.imageUrl,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        displayOrder: parseInt(form.displayOrder) || 0,
        isActive: form.isActive,
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/admin/gift-hampers/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/admin/gift-hampers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        const saved = await res.json();
        showSuccess(editingId ? "Gift hamper updated!" : "Gift hamper created!");
        handleCancelForm();
        await fetchHampers();
        if (!editingId) {
          setSelectedHamperId(saved.id);
        }
      }
    } catch (err) {
      console.error("Error saving hamper:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHamper = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/gift-hampers/${id}`, { method: "DELETE" });
      if (res.ok) {
        showSuccess("Gift hamper deleted!");
        setDeleteConfirm(null);
        if (selectedHamperId === id) setSelectedHamperId(null);
        await fetchHampers();
      }
    } catch (err) {
      console.error("Error deleting hamper:", err);
    }
  };

  const [deleteProductConfirm, setDeleteProductConfirm] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="bg-[#F5F2ED] py-10 md:py-14">
        <div className="container px-4 md:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
              Gift Hampers
            </h1>
            <p className="mt-2 text-[14px] text-[#757575]">
              Create hampers and manage which products are included. Drag to reorder.
            </p>
          </div>
          <button
            onClick={handleStartAdd}
            className="flex items-center gap-2 bg-[#5C4B3D] text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#4A3C31] transition-colors"
          >
            <Plus size={16} />
            Add Hamper
          </button>
        </div>
      </div>

      <div className="container px-4 md:px-8 py-8 md:py-12">
        {successMessage && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-[13px] text-green-700">
            {successMessage}
          </div>
        )}

        {showHamperForm && (
          <div className="mb-8 bg-white border border-[#E8E4DE] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[16px] font-serif font-semibold text-[#1A1A1A]">
                {editingId ? "Edit Gift Hamper" : "Add Gift Hamper"}
              </h2>
              <button onClick={handleCancelForm} className="p-1 text-[#757575] hover:text-[#1A1A1A] transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                  placeholder="e.g. Luxury Hijab Gift Set"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">Price (₹) *</label>
                <input
                  type="number"
                  step="any"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                  placeholder="2999"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">Compare Price (₹)</label>
                <input
                  type="number"
                  step="any"
                  value={form.comparePrice}
                  onChange={(e) => setForm((f) => ({ ...f, comparePrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                  placeholder="3999"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">Display Order</label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D] resize-none"
                  rows={3}
                  placeholder="Describe the gift hamper..."
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">Image</label>
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-2 px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] cursor-pointer hover:bg-[#F5F2ED] transition-colors">
                    <Upload size={14} />
                    {uploading ? "Uploading..." : "Upload"}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="flex items-center gap-2 px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] text-[#5C4B3D] hover:bg-[#F5F2ED] transition-colors"
                  >
                    <ImageIcon size={14} />
                    Browse Media
                  </button>
                  {form.imageUrl && (
                    <div className="relative w-10 h-10 rounded border border-[#E8E4DE] overflow-hidden">
                      <Image src={form.imageUrl} alt="Preview" fill className="object-cover" sizes="40px" />
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  className="w-full mt-2 px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                  placeholder="Or paste image URL"
                />
              </div>
              <div className="flex items-center gap-3 self-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded border-[#E8E4DE] text-[#5C4B3D] focus:ring-[#5C4B3D]"
                  />
                  <span className="text-[13px] text-[#1A1A1A] font-medium">Active (visible on store)</span>
                </label>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#E8E4DE]">
              <button
                onClick={handleSaveHamper}
                disabled={saving || !form.title || !form.price}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#5C4B3D] text-white text-[13px] font-medium rounded-lg hover:bg-[#4A3D31] transition-colors disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? "Saving..." : editingId ? "Update Hamper" : "Create Hamper"}
              </button>
              <button
                onClick={handleCancelForm}
                className="px-4 py-2.5 text-[#757575] text-[13px] font-medium rounded-lg hover:bg-[#F5F2ED] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white border border-[#E8E4DE] rounded-xl p-12 text-center">
            <div className="w-8 h-8 border-2 border-[#5C4B3D] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[13px] text-[#757575]">Loading...</p>
          </div>
        ) : hampers.length === 0 ? (
          <div className="bg-white border border-[#E8E4DE] rounded-xl p-12 text-center">
            <Gift size={40} className="mx-auto text-[#C4B5A5] mb-3" />
            <p className="text-[15px] font-medium text-[#1A1A1A] mb-1">No gift hampers yet</p>
            <p className="text-[13px] text-[#757575]">Create your first hamper to get started.</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-[13px] font-semibold text-[#757575] uppercase tracking-wider mb-3">
                Your Hampers
              </h2>
              <div className="space-y-2">
                {hampers.map((hamper) => {
                  const isSelected = selectedHamperId === hamper.id;
                  return (
                    <div
                      key={hamper.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#5C4B3D] bg-white shadow-sm"
                          : "border-[#E8E4DE] bg-white hover:border-[#C4B5A5]"
                      }`}
                      onClick={() => setSelectedHamperId(isSelected ? null : hamper.id)}
                    >
                      {hamper.imageUrl ? (
                        <div className="relative w-12 h-12 rounded-lg border border-[#E8E4DE] overflow-hidden flex-shrink-0">
                          <Image src={hamper.imageUrl} alt={hamper.title} fill className="object-cover" sizes="48px" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#F5F2ED] flex items-center justify-center flex-shrink-0">
                          <Gift size={18} className="text-[#C4B5A5]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-medium text-[#1A1A1A] truncate">{hamper.title}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${hamper.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                            {hamper.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#757575] mt-0.5">
                          ₹{parseFloat(hamper.price).toLocaleString("en-IN")} · {(hamper.includedProductIds || []).length} products
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleStartEdit(hamper)}
                          className="p-2 text-[#757575] hover:text-[#5C4B3D] hover:bg-[#F5F2ED] rounded-lg transition-colors"
                          title="Edit hamper"
                        >
                          <Pencil size={14} />
                        </button>
                        {deleteConfirm === hamper.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteHamper(hamper.id)}
                              className="px-2 py-1 text-[11px] font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 text-[11px] font-medium text-[#757575] hover:text-[#1A1A1A] transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(hamper.id)}
                            className="p-2 text-[#757575] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete hamper"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <ChevronRight
                          size={16}
                          className={`text-[#C4B5A5] transition-transform ml-1 ${isSelected ? "rotate-90" : ""}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedHamper && (
              <div>
                <div className="bg-white border border-[#E8E4DE] rounded-xl p-6 mb-6">
                  <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">
                    Add Product to &quot;{selectedHamper.title}&quot;
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
                                : "All products are already in this hamper"}
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
                                    <Image src={p.image} alt={p.name} fill className="object-cover" sizes="44px" />
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
                    {productsInHamper.length} products in &quot;{selectedHamper.title}&quot;
                  </p>
                  {productsInHamper.length > 1 && (
                    <p className="text-[12px] text-[#999] flex items-center gap-1">
                      <GripVertical size={12} /> Drag rows to reorder
                    </p>
                  )}
                </div>

                <div className="bg-white border border-[#E8E4DE] rounded-xl overflow-hidden">
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
                      <p className="text-[14px] text-[#757575]">No products in this hamper yet</p>
                      <p className="text-[12px] text-[#999] mt-1">Add products above to include them</p>
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
                            <Image src={product.image} alt={product.name} fill className="object-cover" sizes="50px" />
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
                          {deleteProductConfirm === Number(product.id) ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  handleRemoveProduct(Number(product.id));
                                  setDeleteProductConfirm(null);
                                }}
                                className="px-2 py-1 text-[11px] bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              >
                                Remove
                              </button>
                              <button
                                onClick={() => setDeleteProductConfirm(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F2ED] text-[#757575] transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteProductConfirm(Number(product.id))}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#757575] hover:text-red-600 transition-colors"
                              title="Remove from hamper"
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
            )}
          </>
        )}
      </div>

      <MediaPickerModal
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
      />
    </div>
  );
}
