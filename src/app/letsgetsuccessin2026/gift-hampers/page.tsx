"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Gift, Save, Upload, Image as ImageIcon } from "lucide-react";
import MediaPickerModal from "@/components/letsgetsuccessin2026/media-picker-modal";

interface Product {
  id: number;
  name: string;
  image: string;
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
  includedProductIds: number[];
  displayOrder: string;
  isActive: boolean;
}

const emptyForm: HamperFormData = {
  title: "",
  description: "",
  imageUrl: "",
  price: "",
  comparePrice: "",
  includedProductIds: [],
  displayOrder: "0",
  isActive: true,
};

export default function AdminGiftHampersPage() {
  const [hampers, setHampers] = useState<GiftHamper[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<HamperFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchHampers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/letsgetsuccessin2026/gift-hampers");
      if (res.ok) {
        const data = await res.json();
        setHampers(data.hampers);
      }
    } catch (err) {
      console.error("Error fetching gift hampers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/letsgetsuccessin2026/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }, []);

  useEffect(() => {
    fetchHampers();
    fetchProducts();
  }, [fetchHampers, fetchProducts]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleStartAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleStartEdit = (hamper: GiftHamper) => {
    setShowForm(true);
    setEditingId(hamper.id);
    setForm({
      title: hamper.title,
      description: hamper.description,
      imageUrl: hamper.imageUrl,
      price: hamper.price,
      comparePrice: hamper.comparePrice || "",
      includedProductIds: hamper.includedProductIds || [],
      displayOrder: hamper.displayOrder.toString(),
      isActive: hamper.isActive,
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
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/letsgetsuccessin2026/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setForm((f) => ({ ...f, imageUrl: data.url }));
      }
    } catch (err) {
      console.error("Error uploading image:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleToggleProduct = (productId: number) => {
    setForm((f) => {
      const ids = f.includedProductIds.includes(productId)
        ? f.includedProductIds.filter((id) => id !== productId)
        : [...f.includedProductIds, productId];
      return { ...f, includedProductIds: ids };
    });
  };

  const handleSave = async () => {
    if (!form.title || !form.price) return;
    setSaving(true);

    try {
      const body = {
        title: form.title,
        description: form.description,
        imageUrl: form.imageUrl,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        includedProductIds: form.includedProductIds,
        displayOrder: parseInt(form.displayOrder) || 0,
        isActive: form.isActive,
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/letsgetsuccessin2026/gift-hampers/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/letsgetsuccessin2026/gift-hampers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        showSuccess(editingId ? "Gift hamper updated successfully" : "Gift hamper created successfully");
        handleCancel();
        fetchHampers();
      }
    } catch (err) {
      console.error("Error saving gift hamper:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/letsgetsuccessin2026/gift-hampers/${id}`, { method: "DELETE" });
      if (res.ok) {
        showSuccess("Gift hamper deleted successfully");
        setDeleteConfirm(null);
        fetchHampers();
      }
    } catch (err) {
      console.error("Error deleting gift hamper:", err);
    }
  };

  const handleToggleActive = async (hamper: GiftHamper) => {
    try {
      const res = await fetch(`/api/letsgetsuccessin2026/gift-hampers/${hamper.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !hamper.isActive }),
      });
      if (res.ok) {
        showSuccess(`Gift hamper ${hamper.isActive ? "deactivated" : "activated"}`);
        fetchHampers();
      }
    } catch (err) {
      console.error("Error toggling gift hamper:", err);
    }
  };

  const getProductName = (id: number) => {
    const product = products.find((p) => p.id === id);
    return product?.name || `Product #${id}`;
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="bg-[#F5F2ED] py-10 md:py-14">
        <div className="container px-4 md:px-8">
          <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
            Gift Hampers
          </h1>
          <p className="mt-2 text-[14px] text-[#757575]">
            Manage gift hamper bundles
          </p>
        </div>
      </div>

      <div className="container px-4 md:px-8 py-8 md:py-12">
        {successMessage && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-sm text-[13px] text-green-700">
            {successMessage}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <p className="text-[14px] text-[#757575]">{hampers.length} hampers</p>
          <button
            onClick={handleStartAdd}
            className="flex items-center gap-2 bg-[#5C4B3D] text-white px-5 py-2.5 rounded-sm text-[13px] font-medium uppercase tracking-wider hover:bg-[#4A3C31] transition-colors"
          >
            <Plus size={14} />
            Create Hamper
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-6 mb-6">
            <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">
              {editingId ? "Edit Gift Hamper" : "Create New Gift Hamper"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                  placeholder="e.g. Luxury Gift Set"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                  Price (Rs.) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                  placeholder="2999"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                  Compare Price (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  value={form.comparePrice}
                  onChange={(e) => setForm((f) => ({ ...f, comparePrice: e.target.value }))}
                  className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                  placeholder="3999"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white min-h-[80px]"
                  placeholder="Describe the gift hamper..."
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                  Image
                </label>
                <div className="flex items-center gap-3">
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded border border-[#E8E4DE]" />
                  )}
                  <label className="flex items-center gap-2 cursor-pointer bg-[#F5F2ED] px-4 py-2 rounded-sm text-[13px] text-[#5C4B3D] hover:bg-[#EDE8E0] transition-colors">
                    <Upload size={14} />
                    {uploading ? "Uploading..." : "Upload Image"}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="flex items-center gap-2 px-4 py-2 border border-[#E8E4DE] rounded-sm text-[13px] text-[#5C4B3D] hover:bg-[#F5F2ED] transition-colors"
                  >
                    <ImageIcon size={14} />
                    Browse Media
                  </button>
                </div>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white mt-2"
                  placeholder="Or paste image URL"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  value={form.displayOrder}
                  onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
                  className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                  placeholder="0"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    className={`w-10 h-5 rounded-full relative transition-colors ${form.isActive ? "bg-[#5C4B3D]" : "bg-[#D4C8BE]"}`}
                    onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "left-5" : "left-0.5"}`} />
                  </div>
                  <span className="text-[13px] text-[#1A1A1A]">{form.isActive ? "Active" : "Inactive"}</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                  Included Products
                </label>
                <div className="border border-[#E8E4DE] rounded-sm max-h-[200px] overflow-y-auto">
                  {products.length === 0 ? (
                    <p className="p-3 text-[13px] text-[#757575]">No products available</p>
                  ) : (
                    products.map((product) => (
                      <label
                        key={product.id}
                        className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-[#FAFAF8] border-b border-[#F5F2ED] last:border-b-0 ${
                          form.includedProductIds.includes(product.id) ? "bg-[#F5F2ED]" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.includedProductIds.includes(product.id)}
                          onChange={() => handleToggleProduct(product.id)}
                          className="accent-[#5C4B3D]"
                        />
                        {product.image && (
                          <img src={product.image} alt={product.name} className="w-8 h-8 object-cover rounded" />
                        )}
                        <span className="text-[13px] text-[#1A1A1A]">{product.name}</span>
                      </label>
                    ))
                  )}
                </div>
                {form.includedProductIds.length > 0 && (
                  <p className="mt-1 text-[12px] text-[#757575]">{form.includedProductIds.length} products selected</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={!form.title || !form.price || saving}
                className="flex items-center gap-2 bg-[#5C4B3D] text-white px-6 py-3 rounded-sm text-[13px] font-medium uppercase tracking-wider hover:bg-[#4A3C31] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save size={14} />
                {saving ? "Saving..." : editingId ? "Update Hamper" : "Create Hamper"}
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 border border-[#E8E4DE] text-[#757575] px-6 py-3 rounded-sm text-[13px] font-medium uppercase tracking-wider hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="bg-white border border-[#E8E4DE] rounded-[12px] overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-[14px] text-[#757575]">Loading...</p>
            </div>
          ) : hampers.length === 0 ? (
            <div className="text-center py-12">
              <Gift size={40} className="text-[#D4C8BE] mx-auto mb-3" />
              <p className="text-[14px] text-[#757575]">No gift hampers yet</p>
            </div>
          ) : (
            hampers.map((hamper) => (
              <div
                key={hamper.id}
                className="flex flex-col md:flex-row md:items-center gap-4 px-6 py-4 border-b border-[#F5F2ED] last:border-b-0 hover:bg-[#FAFAF8] transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {hamper.imageUrl ? (
                    <img src={hamper.imageUrl} alt={hamper.title} className="w-14 h-14 object-cover rounded border border-[#E8E4DE] flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 bg-[#F5F2ED] rounded border border-[#E8E4DE] flex items-center justify-center flex-shrink-0">
                      <ImageIcon size={20} className="text-[#D4C8BE]" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-[#1A1A1A] truncate">{hamper.title}</p>
                    {hamper.description && (
                      <p className="text-[12px] text-[#757575] truncate max-w-[300px]">{hamper.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-[11px] text-[#757575] uppercase tracking-wider">Price</p>
                    <p className="text-[14px] font-semibold text-[#1A1A1A]">
                      Rs. {parseFloat(hamper.price).toLocaleString("en-IN")}
                      {hamper.comparePrice && parseFloat(hamper.comparePrice) > parseFloat(hamper.price) && (
                        <span className="ml-2 text-[12px] text-[#757575] line-through font-normal">Rs. {parseFloat(hamper.comparePrice).toLocaleString("en-IN")}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] text-[#757575] uppercase tracking-wider">Products</p>
                    <p className="text-[14px] text-[#1A1A1A]">{hamper.includedProductIds?.length || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] text-[#757575] uppercase tracking-wider">Order</p>
                    <p className="text-[14px] text-[#1A1A1A]">{hamper.displayOrder}</p>
                  </div>
                  <div>
                    <button
                      onClick={() => handleToggleActive(hamper)}
                      className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-full cursor-pointer ${
                        hamper.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {hamper.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(hamper)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F2ED] text-[#757575] hover:text-[#5C4B3D] transition-colors"
                      title="Edit hamper"
                    >
                      <Pencil size={14} />
                    </button>
                    {deleteConfirm === hamper.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(hamper.id)}
                          className="px-2 py-1 text-[11px] bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Delete
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
                        onClick={() => setDeleteConfirm(hamper.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#757575] hover:text-red-600 transition-colors"
                        title="Delete hamper"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {hampers.length > 0 && hampers.some((h) => (h.includedProductIds?.length || 0) > 0) && (
          <div className="mt-6 bg-white border border-[#E8E4DE] rounded-[12px] p-6">
            <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-3">Included Products Detail</h3>
            {hampers
              .filter((h) => (h.includedProductIds?.length || 0) > 0)
              .map((hamper) => (
                <div key={hamper.id} className="mb-4 last:mb-0">
                  <p className="text-[13px] font-medium text-[#5C4B3D] mb-1">{hamper.title}</p>
                  <div className="flex flex-wrap gap-2">
                    {hamper.includedProductIds?.map((pid) => (
                      <span
                        key={pid}
                        className="inline-block px-2 py-0.5 bg-[#F5F2ED] text-[12px] text-[#1A1A1A] rounded"
                      >
                        {getProductName(pid)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
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
