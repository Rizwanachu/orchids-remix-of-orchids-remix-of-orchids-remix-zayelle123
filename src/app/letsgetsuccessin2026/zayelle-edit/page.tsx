"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Save, Upload, LayoutGrid, ImageIcon, Link2, ChevronDown } from "lucide-react";
import Image from "next/image";
import MediaPickerModal from "@/components/admin/media-picker-modal";

interface ZayelleEditItem {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  redirectLink: string;
  displayOrder: number;
  createdAt: string;
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

interface ProductItem {
  id: string;
  name: string;
  handle: string;
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

export default function AdminZayelleEditPage() {
  const [items, setItems] = useState<ZayelleEditItem[]>([]);
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
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [linkMode, setLinkMode] = useState<LinkMode>("picker");
  const [pickerType, setPickerType] = useState<"collection" | "product">("collection");
  const [showPickerDropdown, setShowPickerDropdown] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/zayelle-edit");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Error fetching zayelle edit items:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPickerData = useCallback(async () => {
    try {
      const [colRes, prodRes] = await Promise.all([
        fetch("/api/admin/collections"),
        fetch("/api/admin/products"),
      ]);
      if (colRes.ok) {
        const data = await colRes.json();
        setCollectionsList(data.collections || []);
      }
      if (prodRes.ok) {
        const data = await prodRes.json();
        setProductsList(data.products || data || []);
      }
    } catch (err) {
      console.error("Error fetching picker data:", err);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    fetchPickerData();
  }, [fetchItems, fetchPickerData]);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-[#5C4B3D]">Zayelle Edit</h1>
          <p className="text-[#8B7D6B] mt-1">Manage curated grid items on the homepage</p>
        </div>
        <button
          onClick={handleStartAdd}
          className="flex items-center gap-2 bg-[#5C4B3D] text-white px-5 py-2.5 rounded-lg hover:bg-[#4A3D32] transition-colors"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {showForm && (
        <div className="mb-8 bg-white rounded-xl border border-[#E8E4DE] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-[#5C4B3D]">
              {editingId ? "Edit Item" : "Add New Item"}
            </h2>
            <button onClick={handleCancel} className="text-[#8B7D6B] hover:text-[#5C4B3D]">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#5C4B3D] mb-1">Image</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-sm text-[#8B7D6B] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#FAF9F6] file:text-[#5C4B3D] hover:file:bg-[#E8E4DE]"
                />
                {uploading && <span className="text-sm text-[#8B7D6B]">Uploading...</span>}
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="flex items-center gap-2 px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] text-[#5C4B3D] hover:bg-[#F5F2ED] transition-colors"
                >
                  <ImageIcon size={14} />
                  Browse Media
                </button>
              </div>
              {form.imageUrl && (
                <div className="mt-2 relative w-40 h-24 rounded overflow-hidden">
                  <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
                </div>
              )}
              <input
                type="text"
                placeholder="Or paste image URL"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="mt-2 w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#5C4B3D] mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20"
                placeholder="e.g. Signature Satin Collection"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#5C4B3D] mb-1">Subtitle</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20"
                placeholder="Optional subtitle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#5C4B3D] mb-1">Button Text</label>
              <input
                type="text"
                value={form.buttonText}
                onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20"
                placeholder="Shop Now"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#5C4B3D] mb-1">Redirect Link</label>
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
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20"
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
                      Products ({productsList.length})
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={pickerSearch}
                      onChange={(e) => { setPickerSearch(e.target.value); setShowPickerDropdown(true); }}
                      onFocus={() => setShowPickerDropdown(true)}
                      className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20"
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
                                className="w-full text-left px-3 py-2 text-sm hover:bg-[#FAF9F6] flex items-center justify-between"
                              >
                                <span className="text-[#5C4B3D]">{c.title}</span>
                                <span className="text-xs text-[#8B7D6B]">/collections/{c.slug}</span>
                              </button>
                            ))
                        ) : (
                          productsList
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
                                className="w-full text-left px-3 py-2 text-sm hover:bg-[#FAF9F6] flex items-center justify-between"
                              >
                                <span className="text-[#5C4B3D]">{p.name}</span>
                                <span className="text-xs text-[#8B7D6B]">/products/{p.handle}</span>
                              </button>
                            ))
                        )}
                        {((pickerType === "collection" && collectionsList.filter((c) => c.title.toLowerCase().includes(pickerSearch.toLowerCase())).length === 0) ||
                          (pickerType === "product" && productsList.filter((p) => p.name.toLowerCase().includes(pickerSearch.toLowerCase())).length === 0)) && (
                          <div className="px-3 py-2 text-sm text-[#8B7D6B]">No results found</div>
                        )}
                      </div>
                    )}
                  </div>
                  {form.redirectLink && (
                    <div className="flex items-center gap-2 text-xs text-[#8B7D6B] bg-[#FAF9F6] px-3 py-2 rounded-lg">
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
            <div>
              <label className="block text-sm font-medium text-[#5C4B3D] mb-1">Display Order</label>
              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-[#8B7D6B] hover:text-[#5C4B3D] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.imageUrl || !form.title}
              className="flex items-center gap-2 bg-[#5C4B3D] text-white px-5 py-2 rounded-lg hover:bg-[#4A3D32] transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving..." : editingId ? "Update" : "Add Item"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-[#8B7D6B]">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#E8E4DE]">
          <LayoutGrid size={48} className="mx-auto text-[#C4B5A5] mb-4" />
          <h3 className="font-serif text-xl text-[#5C4B3D] mb-2">No Items Yet</h3>
          <p className="text-[#8B7D6B]">Add curated grid items to display on the homepage</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-[#E8E4DE] overflow-hidden">
              <div className="relative h-48">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#FAF9F6] flex items-center justify-center text-[#C4B5A5]">
                    No Image
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-[#5C4B3D] font-medium">
                  Order: {item.displayOrder}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-serif text-lg text-[#5C4B3D]">{item.title}</h3>
                {item.subtitle && (
                  <p className="text-sm text-[#8B7D6B] mt-1">{item.subtitle}</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-[#8B7D6B]">
                  <span className="bg-[#FAF9F6] px-2 py-1 rounded">{item.buttonText}</span>
                  <span className="truncate">{item.redirectLink}</span>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="p-2 text-[#8B7D6B] hover:text-[#5C4B3D] hover:bg-[#FAF9F6] rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  {deleteConfirm === item.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600">Delete?</span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs text-white bg-red-500 px-2 py-1 rounded hover:bg-red-600"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-xs text-[#8B7D6B] hover:text-[#5C4B3D]"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="p-2 text-[#8B7D6B] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
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
