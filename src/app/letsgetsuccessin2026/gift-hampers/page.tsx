"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, Gift, Save, Upload, ImageIcon, Eye, Package, UserPlus, UserMinus } from "lucide-react";
import MediaPickerModal from "@/components/admin/media-picker-modal";

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<HamperFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [viewingHamperId, setViewingHamperId] = useState<number | null>(null);
  const [showAddProduct, setShowAddProduct] = useState<number | null>(null);
  const [updatingProduct, setUpdatingProduct] = useState<string | null>(null);

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
        setAllProducts(list.map((p: { id: string | number; name: string; image: string; price: number }) => ({
          id: Number(p.id),
          name: p.name,
          image: p.image,
          price: p.price,
        })));
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchHampers(), fetchProducts()]);
      setLoading(false);
    };
    loadData();
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
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
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
        showSuccess(editingId ? "Gift hamper updated!" : "Gift hamper created!");
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
      const res = await fetch(`/api/admin/gift-hampers/${id}`, { method: "DELETE" });
      if (res.ok) {
        showSuccess("Gift hamper deleted!");
        setDeleteConfirm(null);
        if (viewingHamperId === id) setViewingHamperId(null);
        fetchHampers();
      }
    } catch (err) {
      console.error("Error deleting gift hamper:", err);
    }
  };

  const getProductsInHamper = (hamper: GiftHamper) => {
    const ids = hamper.includedProductIds || [];
    return allProducts.filter((p) => ids.includes(p.id));
  };

  const getProductsNotInHamper = (hamper: GiftHamper) => {
    const ids = hamper.includedProductIds || [];
    return allProducts.filter((p) => !ids.includes(p.id));
  };

  const handleAddProductToHamper = async (hamper: GiftHamper, productId: number) => {
    setUpdatingProduct(`${hamper.id}-${productId}`);
    try {
      const currentIds = hamper.includedProductIds || [];
      const newIds = [...currentIds, productId];
      const res = await fetch(`/api/admin/gift-hampers/${hamper.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includedProductIds: newIds }),
      });
      if (res.ok) {
        await fetchHampers();
        showSuccess("Product added to hamper!");
      }
    } catch (err) {
      console.error("Error adding product to hamper:", err);
    } finally {
      setUpdatingProduct(null);
    }
  };

  const handleRemoveProductFromHamper = async (hamper: GiftHamper, productId: number) => {
    setUpdatingProduct(`${hamper.id}-${productId}`);
    try {
      const newIds = (hamper.includedProductIds || []).filter((id) => id !== productId);
      const res = await fetch(`/api/admin/gift-hampers/${hamper.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includedProductIds: newIds }),
      });
      if (res.ok) {
        await fetchHampers();
        showSuccess("Product removed from hamper!");
      }
    } catch (err) {
      console.error("Error removing product from hamper:", err);
    } finally {
      setUpdatingProduct(null);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5C4B3D] rounded-xl flex items-center justify-center">
            <Gift size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-serif font-semibold text-[#1A1A1A]">Gift Hampers</h1>
            <p className="text-[13px] text-[#757575]">Manage your gift hamper bundles</p>
          </div>
        </div>
        <button
          onClick={handleStartAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5C4B3D] text-white text-[13px] font-medium rounded-lg hover:bg-[#4A3D31] transition-colors"
        >
          <Plus size={16} />
          Add Hamper
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
              {editingId ? "Edit Gift Hamper" : "Add Gift Hamper"}
            </h2>
            <button onClick={handleCancel} className="p-1 text-[#757575] hover:text-[#1A1A1A] transition-colors">
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
              onClick={handleSave}
              disabled={saving || !form.title || !form.price}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#5C4B3D] text-white text-[13px] font-medium rounded-lg hover:bg-[#4A3D31] transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? "Saving..." : editingId ? "Update Hamper" : "Create Hamper"}
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
          <p className="text-[13px] text-[#757575]">Loading gift hampers...</p>
        </div>
      ) : hampers.length === 0 ? (
        <div className="bg-white border border-[#E8E4DE] rounded-xl p-12 text-center">
          <Gift size={40} className="mx-auto text-[#C4B5A5] mb-3" />
          <p className="text-[15px] font-medium text-[#1A1A1A] mb-1">No gift hampers yet</p>
          <p className="text-[13px] text-[#757575]">Create your first hamper to get started.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8E4DE] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E4DE] bg-[#FAFAF8]">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Image</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Price</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Products</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Order</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hampers.map((hamper) => {
                  const productCount = (hamper.includedProductIds || []).length;
                  const isViewing = viewingHamperId === hamper.id;
                  return (
                    <React.Fragment key={hamper.id}>
                      <tr className="border-b border-[#E8E4DE] last:border-b-0 hover:bg-[#FAFAF8] transition-colors">
                        <td className="px-4 py-3">
                          {hamper.imageUrl ? (
                            <div className="relative w-12 h-12 rounded-lg border border-[#E8E4DE] overflow-hidden">
                              <Image src={hamper.imageUrl} alt={hamper.title} fill className="object-cover" sizes="48px" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-[#F5F2ED] flex items-center justify-center">
                              <Gift size={16} className="text-[#C4B5A5]" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[13px] font-medium text-[#1A1A1A]">{hamper.title}</div>
                          {hamper.description && (
                            <div className="text-[11px] text-[#757575] mt-0.5 truncate max-w-[200px]">{hamper.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[13px] font-medium text-[#1A1A1A]">
                            ₹{parseFloat(hamper.price).toLocaleString("en-IN")}
                          </div>
                          {hamper.comparePrice && parseFloat(hamper.comparePrice) > parseFloat(hamper.price) && (
                            <div className="text-[11px] text-[#757575] line-through">
                              ₹{parseFloat(hamper.comparePrice).toLocaleString("en-IN")}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setViewingHamperId(isViewing ? null : hamper.id)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F2ED] text-[#5C4B3D] text-[12px] font-medium rounded-full hover:bg-[#E8E4DE] transition-colors"
                          >
                            <Package size={12} />
                            {productCount}
                            <Eye size={12} />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center text-[13px] text-[#757575]">{hamper.displayOrder}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-full ${
                            hamper.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                          }`}>
                            {hamper.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setShowAddProduct(showAddProduct === hamper.id ? null : hamper.id);
                                setViewingHamperId(hamper.id);
                              }}
                              className="p-2 text-[#757575] hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Add product to hamper"
                            >
                              <UserPlus size={14} />
                            </button>
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
                                  onClick={() => handleDelete(hamper.id)}
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
                          </div>
                        </td>
                      </tr>

                      {isViewing && (
                        <tr>
                          <td colSpan={7} className="px-4 py-4 bg-[#FAFAF8] border-b border-[#E8E4DE]">
                            {showAddProduct === hamper.id && (
                              <div className="mb-4 p-4 bg-white border border-[#E8E4DE] rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-[13px] font-semibold text-[#1A1A1A]">Add Product to &quot;{hamper.title}&quot;</h4>
                                  <button
                                    onClick={() => setShowAddProduct(null)}
                                    className="p-1 text-[#757575] hover:text-[#1A1A1A] transition-colors"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                                {getProductsNotInHamper(hamper).length === 0 ? (
                                  <p className="text-[12px] text-[#757575]">All products are already in this hamper.</p>
                                ) : (
                                  <div className="max-h-[240px] overflow-y-auto space-y-1">
                                    {getProductsNotInHamper(hamper).map((product) => (
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
                                            <div className="text-[11px] text-[#757575]">₹{product.price}</div>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => handleAddProductToHamper(hamper, product.id)}
                                          disabled={updatingProduct === `${hamper.id}-${product.id}`}
                                          className="flex items-center gap-1 px-2.5 py-1 bg-[#5C4B3D] text-white text-[11px] font-medium rounded-md hover:bg-[#4A3D31] transition-colors disabled:opacity-50"
                                        >
                                          <Plus size={12} />
                                          {updatingProduct === `${hamper.id}-${product.id}` ? "Adding..." : "Add"}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            <div>
                              <h4 className="text-[12px] font-semibold text-[#757575] uppercase tracking-wider mb-3">
                                Products in &quot;{hamper.title}&quot; ({productCount})
                              </h4>
                              {productCount === 0 ? (
                                <p className="text-[12px] text-[#757575] italic">No products in this hamper yet.</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {getProductsInHamper(hamper).map((product) => (
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
                                        onClick={() => handleRemoveProductFromHamper(hamper, product.id)}
                                        disabled={updatingProduct === `${hamper.id}-${product.id}`}
                                        className="flex-shrink-0 p-1.5 text-[#757575] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                        title="Remove from hamper"
                                      >
                                        {updatingProduct === `${hamper.id}-${product.id}` ? (
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
      )}

      <MediaPickerModal
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
      />
    </div>
  );
}
