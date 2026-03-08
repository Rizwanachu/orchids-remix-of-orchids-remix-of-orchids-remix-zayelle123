"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Save, Upload, LayoutGrid, ImageIcon, Link2, ChevronDown, Package, Eye, UserPlus, UserMinus } from "lucide-react";
import Image from "next/image";
import MediaPickerModal from "@/components/admin/media-picker-modal";

interface ZayelleEditItem {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  redirectLink: string;
  productIds: string | null;
  displayOrder: number;
  createdAt: string;
}

interface Product {
  id: string;
  handle: string;
  name: string;
  image: string;
  price: number;
  category: string;
  active: boolean | number;
}

interface FormData {
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  redirectLink: string;
  displayOrder: string;
}

interface CollectionItem {
  id: number;
  title: string;
  slug: string;
}

type LinkMode = "picker" | "custom";

const emptyForm: FormData = {
  imageUrl: "",
  title: "",
  subtitle: "",
  buttonText: "Shop Now",
  redirectLink: "",
  displayOrder: "0",
};

function parseProductIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export default function AdminZayelleEditPage() {
  const [items, setItems] = useState<ZayelleEditItem[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [collectionsList, setCollectionsList] = useState<CollectionItem[]>([]);
  const [linkMode, setLinkMode] = useState<LinkMode>("picker");
  const [pickerType, setPickerType] = useState<"collection" | "product">("collection");
  const [showPickerDropdown, setShowPickerDropdown] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  const [viewingItemId, setViewingItemId] = useState<number | null>(null);
  const [showAddProduct, setShowAddProduct] = useState<number | null>(null);
  const [updatingProduct, setUpdatingProduct] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/zayelle-edit");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Error fetching zayelle edit items:", err);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setAllProducts(data.products || data || []);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }, []);

  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/collections");
      if (res.ok) {
        const data = await res.json();
        setCollectionsList(data.collections || []);
      }
    } catch (err) {
      console.error("Error fetching collections:", err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchItems(), fetchProducts(), fetchCollections()]);
      setLoading(false);
    };
    loadData();
  }, [fetchItems, fetchProducts, fetchCollections]);

  const getProductsForItem = (item: ZayelleEditItem): Product[] => {
    const ids = parseProductIds(item.productIds);
    return allProducts.filter((p) => ids.includes(String(p.id)));
  };

  const getUnassignedProducts = (item: ZayelleEditItem): Product[] => {
    const ids = parseProductIds(item.productIds);
    return allProducts.filter((p) => !ids.includes(String(p.id)));
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleStartAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleStartEdit = (item: ZayelleEditItem) => {
    setShowForm(true);
    setEditingId(item.id);
    setForm({
      imageUrl: item.imageUrl,
      title: item.title,
      subtitle: item.subtitle,
      buttonText: item.buttonText,
      redirectLink: item.redirectLink,
      displayOrder: item.displayOrder.toString(),
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new window.FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, imageUrl: data.url }));
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.imageUrl || !form.title) return;
    setSaving(true);
    try {
      const payload = {
        imageUrl: form.imageUrl,
        title: form.title,
        subtitle: form.subtitle,
        buttonText: form.buttonText,
        redirectLink: form.redirectLink,
        displayOrder: parseInt(form.displayOrder) || 0,
      };

      if (editingId) {
        const res = await fetch(`/api/admin/zayelle-edit/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          showSuccess("Item updated successfully");
        }
      } else {
        const res = await fetch("/api/admin/zayelle-edit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          showSuccess("Item added successfully");
        }
      }
      handleCancel();
      fetchItems();
    } catch (err) {
      console.error("Error saving:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/zayelle-edit/${id}`, { method: "DELETE" });
      if (res.ok) {
        showSuccess("Item deleted successfully");
        fetchItems();
      }
    } catch (err) {
      console.error("Error deleting:", err);
    }
    setDeleteConfirm(null);
  };

  const handleAddProductToItem = async (productId: string, itemId: number) => {
    setUpdatingProduct(productId);
    try {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;
      const currentIds = parseProductIds(item.productIds);
      if (currentIds.includes(String(productId))) return;
      const newIds = [...currentIds, String(productId)];

      const res = await fetch(`/api/admin/zayelle-edit/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: newIds }),
      });
      if (res.ok) {
        await fetchItems();
        showSuccess("Product added!");
      }
    } catch (err) {
      console.error("Error adding product:", err);
    } finally {
      setUpdatingProduct(null);
    }
  };

  const handleRemoveProductFromItem = async (productId: string, itemId: number) => {
    setUpdatingProduct(productId);
    try {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;
      const currentIds = parseProductIds(item.productIds);
      const newIds = currentIds.filter((id) => id !== String(productId));

      const res = await fetch(`/api/admin/zayelle-edit/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: newIds }),
      });
      if (res.ok) {
        await fetchItems();
        showSuccess("Product removed!");
      }
    } catch (err) {
      console.error("Error removing product:", err);
    } finally {
      setUpdatingProduct(null);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5C4B3D] rounded-xl flex items-center justify-center">
            <LayoutGrid size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-serif font-semibold text-[#1A1A1A]">Zayelle Edit</h1>
            <p className="text-[13px] text-[#757575]">Manage curated grid items on the homepage</p>
          </div>
        </div>
        <button
          onClick={handleStartAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5C4B3D] text-white text-[13px] font-medium rounded-lg hover:bg-[#4A3D31] transition-colors"
        >
          <Plus size={16} />
          Add Item
        </button>
      </div>

      {successMessage && (
        <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-[13px] rounded-lg">
          {successMessage}
        </div>
      )}

      {showForm && (
        <div className="mb-8 bg-white border border-[#E8E4DE] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] font-serif font-semibold text-[#1A1A1A]">
              {editingId ? "Edit Item" : "Add New Item"}
            </h2>
            <button onClick={handleCancel} className="p-1 text-[#757575] hover:text-[#1A1A1A] transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">Image</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] cursor-pointer hover:bg-[#F5F2ED] transition-colors">
                  <Upload size={14} />
                  {uploading ? "Uploading..." : "Upload Image"}
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
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full mt-2 px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                placeholder="Or paste image URL"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                placeholder="e.g. Signature Satin Collection"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">Subtitle</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                placeholder="Optional subtitle"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">Button Text</label>
              <input
                type="text"
                value={form.buttonText}
                onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                placeholder="Shop Now"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">Display Order</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">Redirect Link</label>
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setLinkMode("picker")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${linkMode === "picker" ? "bg-[#5C4B3D] text-white" : "bg-[#FAF9F6] text-[#5C4B3D] hover:bg-[#E8E4DE]"}`}
                >
                  <span className="flex items-center gap-1"><Link2 size={12} /> Pick from Store</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLinkMode("custom")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${linkMode === "custom" ? "bg-[#5C4B3D] text-white" : "bg-[#FAF9F6] text-[#5C4B3D] hover:bg-[#E8E4DE]"}`}
                >
                  Custom URL
                </button>
              </div>
              {linkMode === "custom" ? (
                <input
                  type="text"
                  value={form.redirectLink}
                  onChange={(e) => setForm({ ...form, redirectLink: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                  placeholder="/collections/satin or any URL"
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setPickerType("collection"); setPickerSearch(""); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${pickerType === "collection" ? "bg-[#E8E4DE] text-[#5C4B3D]" : "text-[#8B7D6B] hover:bg-[#FAF9F6]"}`}
                    >
                      Collections ({collectionsList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPickerType("product"); setPickerSearch(""); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${pickerType === "product" ? "bg-[#E8E4DE] text-[#5C4B3D]" : "text-[#8B7D6B] hover:bg-[#FAF9F6]"}`}
                    >
                      Products ({allProducts.length})
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={pickerSearch}
                      onChange={(e) => { setPickerSearch(e.target.value); setShowPickerDropdown(true); }}
                      onFocus={() => setShowPickerDropdown(true)}
                      className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                      placeholder={pickerType === "collection" ? "Search collections..." : "Search products..."}
                    />
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7D6B] pointer-events-none" />
                    {showPickerDropdown && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-[#E8E4DE] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {pickerType === "collection" ? (
                          collectionsList
                            .filter((c) => c.title.toLowerCase().includes(pickerSearch.toLowerCase()))
                            .map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setForm({ ...form, redirectLink: `/collections/${c.slug}` });
                                  setShowPickerDropdown(false);
                                  setPickerSearch(c.title);
                                }}
                                className="w-full text-left px-3 py-2 text-[13px] hover:bg-[#FAF9F6] flex items-center justify-between"
                              >
                                <span className="text-[#5C4B3D]">{c.title}</span>
                                <span className="text-[11px] text-[#8B7D6B]">/collections/{c.slug}</span>
                              </button>
                            ))
                        ) : (
                          allProducts
                            .filter((p) => p.name.toLowerCase().includes(pickerSearch.toLowerCase()))
                            .slice(0, 20)
                            .map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setForm({ ...form, redirectLink: `/products/${p.handle}` });
                                  setShowPickerDropdown(false);
                                  setPickerSearch(p.name);
                                }}
                                className="w-full text-left px-3 py-2 text-[13px] hover:bg-[#FAF9F6] flex items-center justify-between"
                              >
                                <span className="text-[#5C4B3D]">{p.name}</span>
                                <span className="text-[11px] text-[#8B7D6B]">/products/{p.handle}</span>
                              </button>
                            ))
                        )}
                        {((pickerType === "collection" && collectionsList.filter((c) => c.title.toLowerCase().includes(pickerSearch.toLowerCase())).length === 0) ||
                          (pickerType === "product" && allProducts.filter((p) => p.name.toLowerCase().includes(pickerSearch.toLowerCase())).length === 0)) && (
                          <div className="px-3 py-2 text-[13px] text-[#8B7D6B]">No results found</div>
                        )}
                      </div>
                    )}
                  </div>
                  {form.redirectLink && (
                    <div className="flex items-center gap-2 text-[11px] text-[#8B7D6B] bg-[#FAF9F6] px-3 py-2 rounded-lg">
                      <Link2 size={12} />
                      <span>Selected: <strong className="text-[#5C4B3D]">{form.redirectLink}</strong></span>
                      <button
                        type="button"
                        onClick={() => { setForm({ ...form, redirectLink: "" }); setPickerSearch(""); }}
                        className="ml-auto text-[#8B7D6B] hover:text-red-500"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#E8E4DE]">
            <button
              onClick={handleSave}
              disabled={saving || !form.imageUrl || !form.title}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#5C4B3D] text-white text-[13px] font-medium rounded-lg hover:bg-[#4A3D31] transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? "Saving..." : editingId ? "Update Item" : "Add Item"}
            </button>
            <button
              onClick={handleCancel}
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
          <p className="text-[13px] text-[#757575]">Loading items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-[#E8E4DE] rounded-xl p-12 text-center">
          <LayoutGrid size={40} className="mx-auto text-[#C4B5A5] mb-3" />
          <p className="text-[15px] font-medium text-[#1A1A1A] mb-1">No Items Yet</p>
          <p className="text-[13px] text-[#757575]">Add curated grid items to display on the homepage.</p>
        </div>
      ) : (
        <div className="space-y-0">
          <div className="bg-white border border-[#E8E4DE] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E8E4DE] bg-[#FAFAF8]">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Image</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Title</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Link</th>
                    <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Products</th>
                    <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Order</th>
                    <th className="text-right px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const productCount = getProductsForItem(item).length;
                    return (
                      <React.Fragment key={item.id}>
                        <tr className="border-b border-[#E8E4DE] last:border-b-0 hover:bg-[#FAFAF8] transition-colors">
                          <td className="px-4 py-3">
                            {item.imageUrl ? (
                              <div className="relative w-12 h-12 rounded-lg border border-[#E8E4DE] overflow-hidden">
                                <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="48px" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-[#F5F2ED] flex items-center justify-center">
                                <LayoutGrid size={16} className="text-[#C4B5A5]" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-[13px] font-medium text-[#1A1A1A]">{item.title}</div>
                            {item.subtitle && (
                              <div className="text-[11px] text-[#757575] mt-0.5 truncate max-w-[200px]">{item.subtitle}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-[12px] text-[#757575] font-mono truncate max-w-[180px]">{item.redirectLink || "—"}</div>
                            <div className="text-[11px] text-[#9E8E7E] mt-0.5">{item.buttonText}</div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setViewingItemId(viewingItemId === item.id ? null : item.id)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F2ED] text-[#5C4B3D] text-[12px] font-medium rounded-full hover:bg-[#E8E4DE] transition-colors"
                            >
                              <Package size={12} />
                              {productCount}
                              <Eye size={12} />
                            </button>
                          </td>
                          <td className="px-4 py-3 text-center text-[13px] text-[#757575]">{item.displayOrder}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setShowAddProduct(showAddProduct === item.id ? null : item.id);
                                  setViewingItemId(item.id);
                                }}
                                className="p-2 text-[#757575] hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Add product to item"
                              >
                                <UserPlus size={14} />
                              </button>
                              <button
                                onClick={() => handleStartEdit(item)}
                                className="p-2 text-[#757575] hover:text-[#5C4B3D] hover:bg-[#F5F2ED] rounded-lg transition-colors"
                              >
                                <Pencil size={14} />
                              </button>
                              {deleteConfirm === item.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleDelete(item.id)}
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
                                  onClick={() => setDeleteConfirm(item.id)}
                                  className="p-2 text-[#757575] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {viewingItemId === item.id && (
                          <tr>
                            <td colSpan={6} className="px-4 py-4 bg-[#FAFAF8] border-b border-[#E8E4DE]">
                              {showAddProduct === item.id && (
                                <div className="mb-4 p-4 bg-white border border-[#E8E4DE] rounded-lg">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-[13px] font-semibold text-[#1A1A1A]">Add Product to &quot;{item.title}&quot;</h4>
                                    <button
                                      onClick={() => setShowAddProduct(null)}
                                      className="p-1 text-[#757575] hover:text-[#1A1A1A] transition-colors"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                  {getUnassignedProducts(item).length === 0 ? (
                                    <p className="text-[12px] text-[#757575]">All products are already in this item.</p>
                                  ) : (
                                    <div className="max-h-[240px] overflow-y-auto space-y-1">
                                      {getUnassignedProducts(item).map((product) => (
                                        <div
                                          key={product.id}
                                          className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F2ED] transition-colors"
                                        >
                                          <div className="flex items-center gap-3">
                                            {product.image ? (
                                              <div className="relative w-8 h-8 rounded border border-[#E8E4DE] overflow-hidden flex-shrink-0">
                                                <Image src={product.image} alt={product.name} fill className="object-cover" sizes="32px" />
                                              </div>
                                            ) : (
                                              <div className="w-8 h-8 rounded bg-[#F5F2ED] flex items-center justify-center flex-shrink-0">
                                                <Package size={12} className="text-[#C4B5A5]" />
                                              </div>
                                            )}
                                            <div>
                                              <div className="text-[12px] font-medium text-[#1A1A1A]">{product.name}</div>
                                              <div className="text-[11px] text-[#757575]">
                                                ₹{product.price}
                                                {product.category && <span className="ml-2 text-[#9E8E7E]">in: {product.category}</span>}
                                              </div>
                                            </div>
                                          </div>
                                          <button
                                            onClick={() => handleAddProductToItem(product.id, item.id)}
                                            disabled={updatingProduct === product.id}
                                            className="flex items-center gap-1 px-2.5 py-1 bg-[#5C4B3D] text-white text-[11px] font-medium rounded-md hover:bg-[#4A3D31] transition-colors disabled:opacity-50"
                                          >
                                            <Plus size={12} />
                                            {updatingProduct === product.id ? "Adding..." : "Add"}
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              <div>
                                <h4 className="text-[12px] font-semibold text-[#757575] uppercase tracking-wider mb-3">
                                  Products in &quot;{item.title}&quot; ({productCount})
                                </h4>
                                {productCount === 0 ? (
                                  <p className="text-[12px] text-[#757575] italic">No products in this item yet.</p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {getProductsForItem(item).map((product) => (
                                      <div
                                        key={product.id}
                                        className="flex items-center justify-between p-2.5 bg-white border border-[#E8E4DE] rounded-lg"
                                      >
                                        <div className="flex items-center gap-3 min-w-0">
                                          {product.image ? (
                                            <div className="relative w-9 h-9 rounded border border-[#E8E4DE] overflow-hidden flex-shrink-0">
                                              <Image src={product.image} alt={product.name} fill className="object-cover" sizes="36px" />
                                            </div>
                                          ) : (
                                            <div className="w-9 h-9 rounded bg-[#F5F2ED] flex items-center justify-center flex-shrink-0">
                                              <Package size={14} className="text-[#C4B5A5]" />
                                            </div>
                                          )}
                                          <div className="min-w-0">
                                            <div className="text-[12px] font-medium text-[#1A1A1A] truncate">{product.name}</div>
                                            <div className="text-[11px] text-[#757575]">₹{product.price}</div>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => handleRemoveProductFromItem(product.id, item.id)}
                                          disabled={updatingProduct === product.id}
                                          className="flex-shrink-0 p-1.5 text-[#757575] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                          title="Remove from item"
                                        >
                                          {updatingProduct === product.id ? (
                                            <div className="w-3.5 h-3.5 border-2 border-[#757575] border-t-transparent rounded-full animate-spin" />
                                          ) : (
                                            <UserMinus size={14} />
                                          )}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <MediaPickerModal
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(url) => setForm({ ...form, imageUrl: url })}
      />
    </div>
  );
}
