"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit2, ToggleLeft, ToggleRight, Package, X, GripVertical, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { optimizeCloudinaryUrl } from "@/lib/optimize-cloudinary";

interface BundleItem {
  productId: number;
  productName: string;
  productImage: string;
  productHandle: string;
  quantity: number;
  label: string;
}

interface Bundle {
  id: number;
  name: string;
  description: string;
  bundleType: string;
  items: string;
  price: string;
  comparePrice: string | null;
  badge: string | null;
  imageUrl: string;
  isActive: number;
  displayOrder: number;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  image: string;
  handle: string;
  price: string;
}

const BUNDLE_TYPES = ["starter", "styling", "complete", "gift", "custom"];
const BADGE_OPTIONS = ["Popular", "Best Value", "New", "Limited", "Bestseller"];
const STATUS_COLORS: Record<string, string> = {
  1: "bg-green-100 text-green-700",
  0: "bg-gray-100 text-gray-500",
};

const EMPTY_FORM = {
  name: "",
  description: "",
  bundleType: "custom",
  items: [] as BundleItem[],
  price: "",
  comparePrice: "",
  badge: "",
  imageUrl: "",
  isActive: true,
  displayOrder: 0,
};

export default function BundlesAdminPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchBundles = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/bundles");
      const data = await res.json();
      setBundles(data.bundles || []);
    } catch {
      toast.error("Failed to load bundles");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchBundles();
    fetchProducts();
  }, [fetchBundles, fetchProducts]);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (b: Bundle) => {
    setEditId(b.id);
    setForm({
      name: b.name,
      description: b.description,
      bundleType: b.bundleType,
      items: (() => { try { return JSON.parse(b.items); } catch { return []; } })(),
      price: b.price,
      comparePrice: b.comparePrice || "",
      badge: b.badge || "",
      imageUrl: b.imageUrl,
      isActive: b.isActive === 1,
      displayOrder: b.displayOrder,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        items: JSON.stringify(form.items),
        price: form.price,
        comparePrice: form.comparePrice || null,
        badge: form.badge || null,
      };
      const url = editId ? `/api/admin/bundles/${editId}` : "/api/admin/bundles";
      const method = editId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success(editId ? "Bundle updated" : "Bundle created");
      setShowForm(false);
      fetchBundles();
    } catch {
      toast.error("Failed to save bundle");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete bundle "${name}"?`)) return;
    try {
      await fetch(`/api/admin/bundles/${id}`, { method: "DELETE" });
      toast.success("Bundle deleted");
      fetchBundles();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleActive = async (b: Bundle) => {
    try {
      await fetch(`/api/admin/bundles/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: b.isActive === 0 }),
      });
      fetchBundles();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setForm((f) => ({ ...f, imageUrl: data.url }));
        toast.success("Image uploaded");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addProductToBundle = (product: Product) => {
    if (form.items.some((i) => i.productId === product.id)) return;
    setForm((f) => ({
      ...f,
      items: [...f.items, {
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        productHandle: product.handle,
        quantity: 1,
        label: product.name,
      }],
    }));
    setProductSearch("");
  };

  const removeItem = (idx: number) => {
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
      !form.items.some((i) => i.productId === p.id)
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-serif font-semibold text-[#1A1A1A]">Product Bundles</h1>
          <p className="text-[13px] text-[#757575] mt-0.5">Create and manage bundle offers shown on the homepage</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#5C4B3D] text-white px-4 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#4A3C31] transition-colors"
        >
          <Plus size={16} />
          New Bundle
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#757575]">Loading bundles…</div>
      ) : bundles.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E8E4DE] rounded-xl">
          <Package size={40} className="text-[#E8E4DE] mx-auto mb-3" />
          <p className="text-[15px] font-medium text-[#1A1A1A]">No bundles yet</p>
          <p className="text-[13px] text-[#757575] mt-1 mb-4">Create your first bundle offer to display on the homepage</p>
          <button onClick={openCreate} className="bg-[#5C4B3D] text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#4A3C31] transition-colors">
            Create Bundle
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {bundles.map((b) => {
            const items: BundleItem[] = (() => { try { return JSON.parse(b.items); } catch { return []; } })();
            return (
              <div key={b.id} className="bg-white border border-[#E8E4DE] rounded-xl p-4 flex items-center gap-4">
                <GripVertical size={16} className="text-[#C5BFB8] flex-shrink-0" />
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F5F2ED] flex-shrink-0">
                  {b.imageUrl ? (
                    <Image
                      src={optimizeCloudinaryUrl(b.imageUrl, { width: 112 }) || b.imageUrl}
                      alt={b.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={20} className="text-[#C5BFB8]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-semibold text-[#1A1A1A]">{b.name}</span>
                    {b.badge && (
                      <span className="text-[10px] font-semibold bg-[#5C4B3D] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {b.badge}
                      </span>
                    )}
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[String(b.isActive)]}`}>
                      {b.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#757575] mt-0.5">
                    {items.length} item{items.length !== 1 ? "s" : ""} · ₹{b.price}
                    {b.comparePrice ? ` (was ₹${b.comparePrice})` : ""}
                  </p>
                  {items.length > 0 && (
                    <p className="text-[11px] text-[#999] mt-0.5 truncate">
                      {items.map((i) => i.label || i.productName).join(" + ")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(b)} className="p-2 rounded-lg hover:bg-[#F5F2ED] transition-colors" title={b.isActive ? "Deactivate" : "Activate"}>
                    {b.isActive ? <ToggleRight size={20} className="text-green-600" /> : <ToggleLeft size={20} className="text-[#999]" />}
                  </button>
                  <button onClick={() => openEdit(b)} className="p-2 rounded-lg hover:bg-[#F5F2ED] transition-colors">
                    <Edit2 size={16} className="text-[#5C4B3D]" />
                  </button>
                  <button onClick={() => handleDelete(b.id, b.name)} className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[#E8E4DE]">
              <h2 className="text-[18px] font-serif font-semibold text-[#1A1A1A]">
                {editId ? "Edit Bundle" : "New Bundle"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-[#F5F2ED] rounded-lg transition-colors">
                <X size={18} className="text-[#757575]" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#1A1A1A] uppercase tracking-wider mb-1.5">Bundle Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                    placeholder="e.g. Starter Bundle"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#1A1A1A] uppercase tracking-wider mb-1.5">Type</label>
                  <select
                    value={form.bundleType}
                    onChange={(e) => setForm((f) => ({ ...f, bundleType: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                  >
                    {BUNDLE_TYPES.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#1A1A1A] uppercase tracking-wider mb-1.5">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                  placeholder="Short description"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#1A1A1A] uppercase tracking-wider mb-1.5">Price *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                    placeholder="₹349"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#1A1A1A] uppercase tracking-wider mb-1.5">Compare At</label>
                  <input
                    type="number"
                    value={form.comparePrice}
                    onChange={(e) => setForm((f) => ({ ...f, comparePrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                    placeholder="₹499"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#1A1A1A] uppercase tracking-wider mb-1.5">Badge</label>
                  <select
                    value={form.badge}
                    onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                  >
                    <option value="">None</option>
                    {BADGE_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#1A1A1A] uppercase tracking-wider mb-1.5">Bundle Image</label>
                <div className="flex items-center gap-3">
                  {form.imageUrl && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#E8E4DE] flex-shrink-0">
                      <Image src={form.imageUrl} alt="Bundle" width={64} height={64} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="flex items-center gap-2 px-4 py-2 border border-[#E8E4DE] rounded-lg text-[12px] text-[#5C4B3D] cursor-pointer hover:bg-[#F5F2ED] transition-colors">
                    <ImageIcon size={14} />
                    {uploading ? "Uploading…" : "Upload Image"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                  {form.imageUrl && (
                    <button onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))} className="text-[12px] text-red-500 hover:underline">
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#1A1A1A] uppercase tracking-wider mb-1.5">Products in Bundle</label>
                {form.items.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {form.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-[#F5F2ED] rounded-lg px-3 py-2">
                        {item.productImage && (
                          <Image src={optimizeCloudinaryUrl(item.productImage, { width: 48 }) || item.productImage} alt={item.productName} width={32} height={32} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-[#1A1A1A] truncate">{item.productName}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-[#757575]">Qty:</span>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 1;
                              setForm((f) => ({
                                ...f,
                                items: f.items.map((it, i) => i === idx ? { ...it, quantity: qty } : it),
                              }));
                            }}
                            className="w-12 px-1 py-0.5 border border-[#E8E4DE] rounded text-[12px] text-center focus:outline-none"
                          />
                        </div>
                        <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                  placeholder="Search products to add…"
                />
                {productSearch && filteredProducts.length > 0 && (
                  <div className="mt-1 border border-[#E8E4DE] rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                    {filteredProducts.slice(0, 8).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addProductToBundle(p)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#F5F2ED] transition-colors border-b border-[#F5F2ED] last:border-0"
                      >
                        {p.image && (
                          <Image src={optimizeCloudinaryUrl(p.image, { width: 48 }) || p.image} alt={p.name} width={32} height={32} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                        )}
                        <span className="text-[13px] text-[#1A1A1A] truncate">{p.name}</span>
                        <span className="text-[12px] text-[#757575] ml-auto flex-shrink-0">₹{p.price}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="bundleActive"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-[#5C4B3D]"
                />
                <label htmlFor="bundleActive" className="text-[13px] text-[#1A1A1A]">Active (visible on homepage)</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-[#E8E4DE]">
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border border-[#E8E4DE] rounded-lg text-[13px] font-medium text-[#757575] hover:bg-[#F5F2ED] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-[#5C4B3D] text-white rounded-lg text-[13px] font-medium hover:bg-[#4A3C31] disabled:opacity-60 transition-colors"
              >
                {saving ? "Saving…" : editId ? "Update Bundle" : "Create Bundle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
