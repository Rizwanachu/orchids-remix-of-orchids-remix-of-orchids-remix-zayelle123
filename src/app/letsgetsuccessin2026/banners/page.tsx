"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { uploadFile } from "@/lib/direct-upload";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  X,
  Eye,
  EyeOff,
  Package,
  Search,
  UserPlus,
  UserMinus,
} from "lucide-react";
import MediaPickerModal from "@/components/admin/media-picker-modal";

interface Product {
  id: string;
  handle: string;
  name: string;
  image: string;
  price: number;
  category: string;
}

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  imageUrl: string;
  position: "hero" | "mid-left" | "mid-right";
  isActive: boolean;
  titleFont: string;
  titleColor: string;
  subtitleColor: string;
  titleFontSizeDesktop: string;
  titleFontSizeMobile: string;
  createdAt: string;
  productIds: string[];
  bannerType: string;
  scheduleStart: string;
  scheduleEnd: string;
}

const emptyForm = {
  title: "",
  subtitle: "",
  buttonText: "Shop Now",
  buttonLink: "",
  imageUrl: "",
  position: "hero" as "hero" | "mid-left" | "mid-right",
  isActive: true,
  titleFont: "serif",
  titleColor: "#5C4B3D",
  subtitleColor: "#5C4B3D",
  titleFontSizeDesktop: "64px",
  titleFontSizeMobile: "32px",
  bannerType: "homepage",
  scheduleStart: "",
  scheduleEnd: "",
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [viewingBannerId, setViewingBannerId] = useState<number | null>(null);
  const [showAddProduct, setShowAddProduct] = useState<number | null>(null);
  const [updatingProduct, setUpdatingProduct] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setAllProducts(data);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/admin/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(
          data.map((b: any) => ({
            ...b,
            productIds: (() => {
              try {
                return JSON.parse(b.productIds || "[]");
              } catch {
                return [];
              }
            })(),
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchProducts();
  }, [fetchProducts]);

  const getBannerProducts = (bannerId: number) => {
    const banner = banners.find((b) => b.id === bannerId);
    if (!banner || !banner.productIds?.length) return [];
    return allProducts.filter((p) => banner.productIds.includes(p.id));
  };

  const getUnassignedProducts = (bannerId: number) => {
    const banner = banners.find((b) => b.id === bannerId);
    const ids = banner?.productIds || [];
    return allProducts.filter(
      (p) =>
        !ids.includes(p.id) &&
        (!productSearch ||
          p.name.toLowerCase().includes(productSearch.toLowerCase()))
    );
  };

  const handleAddProductToBanner = async (productId: string, bannerId: number) => {
    setUpdatingProduct(productId);
    const banner = banners.find((b) => b.id === bannerId);
    if (!banner) return;
    const newIds = [...(banner.productIds || []), productId];
    try {
      const res = await fetch(`/api/admin/banners/${bannerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: newIds }),
      });
      if (res.ok) {
        await fetchBanners();
      }
    } catch (err) {
      console.error("Failed to add product to banner:", err);
    } finally {
      setUpdatingProduct(null);
    }
  };

  const handleRemoveProductFromBanner = async (productId: string, bannerId: number) => {
    setUpdatingProduct(productId);
    const banner = banners.find((b) => b.id === bannerId);
    if (!banner) return;
    const newIds = (banner.productIds || []).filter((id) => id !== productId);
    try {
      const res = await fetch(`/api/admin/banners/${bannerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: newIds }),
      });
      if (res.ok) {
        await fetchBanners();
      }
    } catch (err) {
      console.error("Failed to remove product from banner:", err);
    } finally {
      setUpdatingProduct(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.imageUrl) {
      setErrorMessage("Please upload or select a banner image.");
      return;
    }

    setSaving(true);

    try {
      const url = editingId
        ? `/api/admin/banners/${editingId}`
        : "/api/admin/banners";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        setSuccessMessage(editingId ? "Banner updated successfully" : "Banner created successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchBanners();
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMessage(errData.error || "Failed to save banner. Please try again.");
      }
    } catch (error) {
      console.error("Failed to save banner:", error);
      setErrorMessage("Failed to save banner. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
      imageUrl: banner.imageUrl,
      position: banner.position,
      isActive: banner.isActive,
      titleFont: banner.titleFont || "serif",
      titleColor: banner.titleColor || "#5C4B3D",
      subtitleColor: banner.subtitleColor || "#5C4B3D",
      titleFontSizeDesktop: banner.titleFontSizeDesktop || "64px",
      titleFontSizeMobile: banner.titleFontSizeMobile || "32px",
      bannerType: banner.bannerType || "homepage",
      scheduleStart: banner.scheduleStart || "",
      scheduleEnd: banner.scheduleEnd || "",
    });
    setEditingId(banner.id);
    setErrorMessage("");
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBanners(banners.filter((b) => b.id !== id));
        setDeleteConfirm(null);
        if (viewingBannerId === id) setViewingBannerId(null);
        if (showAddProduct === id) setShowAddProduct(null);
      }
    } catch (error) {
      console.error("Failed to delete banner:", error);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      if (res.ok) {
        fetchBanners();
      }
    } catch (error) {
      console.error("Failed to toggle banner:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMessage("");
    try {
      const url = await uploadFile(file);
      setForm({ ...form, imageUrl: url });
    } catch (error) {
      const err = error as Error;
      setErrorMessage(err.message || "Failed to upload image. Make sure the file is under 10MB and is a valid image format (JPEG, PNG, WebP, GIF).");
    } finally {
      setUploading(false);
    }
  };

  const positionLabel = (pos: string) => {
    switch (pos) {
      case "hero":
        return "Hero";
      case "mid-left":
        return "Mid Left";
      case "mid-right":
        return "Mid Right";
      default:
        return pos;
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-[#E8E4DE] rounded" />
          <div className="h-64 bg-[#E8E4DE] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {successMessage && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-[13px] text-green-700">
          {successMessage}
        </div>
      )}

      {errorMessage && !showForm && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-serif font-semibold text-[#1A1A1A]">
            Banners
          </h1>
          <p className="text-[14px] text-[#757575] mt-1">
            Manage hero and promotional banners
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setErrorMessage("");
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-[#5C4B3D] text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#4A3C31] transition-colors self-start sm:self-auto"
        >
          <Plus size={16} />
          Add Banner
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-[#E8E4DE] rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-serif font-semibold text-[#1A1A1A]">
              {editingId ? "Edit Banner" : "Add New Banner"}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="p-1 text-[#757575] hover:text-[#1A1A1A] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-[13px] text-red-700">
                {errorMessage}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm({ ...form, subtitle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  value={form.buttonText}
                  onChange={(e) =>
                    setForm({ ...form, buttonText: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">
                  Button Link
                </label>
                <input
                  type="text"
                  value={form.buttonLink}
                  onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
                  placeholder="/products/my-product or any URL"
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">
                  Position
                </label>
                <select
                  value={form.position}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      position: e.target.value as
                        | "hero"
                        | "mid-left"
                        | "mid-right",
                    })
                  }
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                >
                  <option value="hero">Hero (Full Width Top)</option>
                  <option value="mid-left">Mid Left</option>
                  <option value="mid-right">Mid Right</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">
                  Title Font
                </label>
                <select
                  value={form.titleFont}
                  onChange={(e) =>
                    setForm({ ...form, titleFont: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                >
                  <option value="serif">Serif</option>
                  <option value="sans-serif">Sans Serif</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">
                  Title Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.titleColor}
                    onChange={(e) =>
                      setForm({ ...form, titleColor: e.target.value })
                    }
                    className="w-10 h-9 rounded cursor-pointer border border-[#E8E4DE]"
                  />
                  <input
                    type="text"
                    value={form.titleColor}
                    onChange={(e) =>
                      setForm({ ...form, titleColor: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">
                  Subtitle Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.subtitleColor}
                    onChange={(e) =>
                      setForm({ ...form, subtitleColor: e.target.value })
                    }
                    className="w-10 h-9 rounded cursor-pointer border border-[#E8E4DE]"
                  />
                  <input
                    type="text"
                    value={form.subtitleColor}
                    onChange={(e) =>
                      setForm({ ...form, subtitleColor: e.target.value })
                    }
                    className="flex-1 px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">
                  Title Size — Desktop
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="20"
                    max="120"
                    step="2"
                    value={parseInt(form.titleFontSizeDesktop) || 64}
                    onChange={(e) =>
                      setForm({ ...form, titleFontSizeDesktop: `${e.target.value}px` })
                    }
                    className="flex-1 accent-[#5C4B3D]"
                  />
                  <span className="w-14 text-center px-2 py-1 border border-[#E8E4DE] rounded-lg text-[13px] text-[#1A1A1A] font-medium">
                    {form.titleFontSizeDesktop}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">
                  Title Size — Mobile
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="16"
                    max="80"
                    step="2"
                    value={parseInt(form.titleFontSizeMobile) || 32}
                    onChange={(e) =>
                      setForm({ ...form, titleFontSizeMobile: `${e.target.value}px` })
                    }
                    className="flex-1 accent-[#5C4B3D]"
                  />
                  <span className="w-14 text-center px-2 py-1 border border-[#E8E4DE] rounded-lg text-[13px] text-[#1A1A1A] font-medium">
                    {form.titleFontSizeMobile}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">
                Banner Type
              </label>
              <select
                value={form.bannerType}
                onChange={(e) => setForm({ ...form, bannerType: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
              >
                <option value="homepage">Homepage</option>
                <option value="sale">Sale</option>
                <option value="new-arrivals">New Arrivals</option>
                <option value="collection">Collection</option>
                <option value="seasonal">Seasonal</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">
                  Schedule Start (optional)
                </label>
                <input
                  type="datetime-local"
                  value={form.scheduleStart}
                  onChange={(e) => setForm({ ...form, scheduleStart: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">
                  Schedule End (optional)
                </label>
                <input
                  type="datetime-local"
                  value={form.scheduleEnd}
                  onChange={(e) => setForm({ ...form, scheduleEnd: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">
                Active
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-[#E8E4DE] text-[#5C4B3D]"
                />
                <span className="text-[14px] text-[#757575]">
                  Show this banner on the site
                </span>
              </label>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1A1A1A] mb-2">
                Banner Image
              </label>
              <div className="flex items-start gap-3">
                {form.imageUrl && (
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-[#E8E4DE] flex-shrink-0">
                    <Image
                      src={form.imageUrl}
                      alt="Banner preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <label className="flex items-center gap-2 px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] text-[#5C4B3D] cursor-pointer hover:bg-[#F5F2ED] transition-colors">
                    <ImageIcon size={14} />
                    {uploading ? "Uploading..." : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="flex items-center gap-2 px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] text-[#5C4B3D] hover:bg-[#F5F2ED] transition-colors"
                  >
                    <ImageIcon size={14} />
                    Media Library
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#5C4B3D] text-white px-6 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#4A3C31] transition-colors disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Banner"
                    : "Create Banner"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="px-6 py-2.5 rounded-lg text-[13px] font-medium text-[#757575] hover:bg-[#F5F2ED] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {banners.length === 0 ? (
        <div className="bg-white border border-[#E8E4DE] rounded-xl p-12 text-center">
          <ImageIcon size={40} className="mx-auto text-[#C4B5A5] mb-3" />
          <p className="text-[#757575] text-[14px]">
            No banners yet. Add your first banner.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8E4DE] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E4DE] bg-[#FAF9F6]">
                  <th className="text-left px-5 py-3 text-[12px] font-medium text-[#757575] uppercase tracking-wider">
                    Image
                  </th>
                  <th className="text-left px-5 py-3 text-[12px] font-medium text-[#757575] uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left px-5 py-3 text-[12px] font-medium text-[#757575] uppercase tracking-wider">
                    Subtitle
                  </th>
                  <th className="text-left px-5 py-3 text-[12px] font-medium text-[#757575] uppercase tracking-wider">
                    Button
                  </th>
                  <th className="text-left px-5 py-3 text-[12px] font-medium text-[#757575] uppercase tracking-wider">
                    Position
                  </th>
                  <th className="text-center px-5 py-3 text-[12px] font-medium text-[#757575] uppercase tracking-wider">
                    Products
                  </th>
                  <th className="text-left px-5 py-3 text-[12px] font-medium text-[#757575] uppercase tracking-wider">
                    Active
                  </th>
                  <th className="text-right px-5 py-3 text-[12px] font-medium text-[#757575] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => {
                  const productCount = banner.productIds?.length ?? 0;
                  return (
                    <React.Fragment key={banner.id}>
                      <tr className="border-b border-[#E8E4DE] last:border-b-0 hover:bg-[#FAF9F6] transition-colors">
                        <td className="px-5 py-3">
                          {banner.imageUrl ? (
                            <div className="relative w-16 h-10 rounded overflow-hidden border border-[#E8E4DE]">
                              <Image
                                src={banner.imageUrl}
                                alt={banner.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-10 rounded bg-[#F5F2ED] flex items-center justify-center">
                              <ImageIcon size={16} className="text-[#C4B5A5]" />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3 text-[13px] font-medium text-[#1A1A1A]">
                          {banner.title}
                        </td>
                        <td className="px-5 py-3 text-[13px] text-[#757575] max-w-[200px] truncate">
                          {banner.subtitle}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-[12px] text-[#5C4B3D] bg-[#F5F2ED] px-2 py-1 rounded">
                            {banner.buttonText}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-[12px] font-medium text-[#5C4B3D] bg-[#F5F2ED] px-2 py-1 rounded">
                            {positionLabel(banner.position)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() =>
                              setViewingBannerId(
                                viewingBannerId === banner.id ? null : banner.id
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F5F2ED] text-[#5C4B3D] text-[12px] font-medium rounded-full hover:bg-[#E8E4DE] transition-colors"
                          >
                            <Package size={12} />
                            {productCount}
                            <Eye size={12} />
                          </button>
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => handleToggleActive(banner)}
                            className={`flex items-center gap-1 text-[12px] font-medium px-2 py-1 rounded transition-colors ${
                              banner.isActive
                                ? "text-green-700 bg-green-50"
                                : "text-[#757575] bg-[#F5F2ED]"
                            }`}
                          >
                            {banner.isActive ? (
                              <Eye size={12} />
                            ) : (
                              <EyeOff size={12} />
                            )}
                            {banner.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setShowAddProduct(
                                  showAddProduct === banner.id ? null : banner.id
                                );
                                setViewingBannerId(banner.id);
                                setProductSearch("");
                              }}
                              className="p-2 text-[#757575] hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Add product to banner"
                            >
                              <UserPlus size={14} />
                            </button>
                            <button
                              onClick={() => handleEdit(banner)}
                              className="p-2 text-[#757575] hover:text-[#5C4B3D] hover:bg-[#F5F2ED] rounded-lg transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            {deleteConfirm === banner.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(banner.id)}
                                  className="px-2 py-1 text-[11px] font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="px-2 py-1 text-[11px] font-medium text-[#757575] bg-[#F5F2ED] rounded hover:bg-[#E8E4DE] transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(banner.id)}
                                className="p-2 text-[#757575] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {viewingBannerId === banner.id && (
                        <tr>
                          <td colSpan={8} className="px-4 py-4 bg-[#FAFAF8] border-b border-[#E8E4DE]">
                            {showAddProduct === banner.id && (
                              <div className="mb-4 p-4 bg-white border border-[#E8E4DE] rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="text-[13px] font-semibold text-[#1A1A1A]">
                                    Add Product to &quot;{banner.title}&quot;
                                  </h4>
                                  <button
                                    onClick={() => setShowAddProduct(null)}
                                    className="p-1 text-[#757575] hover:text-[#1A1A1A] transition-colors"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                                <div className="mb-3">
                                  <div className="flex items-center gap-2 px-3 py-2 border border-[#E8E4DE] rounded-lg bg-[#FAFAF8]">
                                    <Search size={13} className="text-[#999] flex-shrink-0" />
                                    <input
                                      type="text"
                                      value={productSearch}
                                      onChange={(e) => setProductSearch(e.target.value)}
                                      placeholder="Search products..."
                                      className="flex-1 text-[13px] bg-transparent outline-none text-[#1A1A1A] placeholder-[#999]"
                                      autoFocus
                                    />
                                    {productSearch && (
                                      <button onClick={() => setProductSearch("")} className="text-[#999] hover:text-[#555]">
                                        <X size={13} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {getUnassignedProducts(banner.id).length === 0 ? (
                                  <p className="text-[12px] text-[#757575]">
                                    {productSearch
                                      ? "No products match your search."
                                      : "All products are already in this banner."}
                                  </p>
                                ) : (
                                  <div className="max-h-[240px] overflow-y-auto space-y-1">
                                    {getUnassignedProducts(banner.id).map((product) => (
                                      <div
                                        key={product.id}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F5F2ED] transition-colors"
                                      >
                                        <div className="flex items-center gap-3">
                                          {product.image ? (
                                            <div className="relative w-8 h-8 rounded border border-[#E8E4DE] overflow-hidden flex-shrink-0">
                                              <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                                sizes="32px"
                                              />
                                            </div>
                                          ) : (
                                            <div className="w-8 h-8 rounded bg-[#F5F2ED] flex items-center justify-center flex-shrink-0">
                                              <Package size={12} className="text-[#C4B5A5]" />
                                            </div>
                                          )}
                                          <div>
                                            <div className="text-[12px] font-medium text-[#1A1A1A]">
                                              {product.name}
                                            </div>
                                            <div className="text-[11px] text-[#757575]">
                                              ₹{product.price}
                                              {product.category && (
                                                <span className="ml-2 text-[#9E8E7E]">
                                                  in: {product.category}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() =>
                                            handleAddProductToBanner(product.id, banner.id)
                                          }
                                          disabled={updatingProduct === product.id}
                                          className="flex items-center gap-1 px-2.5 py-1 bg-[#5C4B3D] text-white text-[11px] font-medium rounded-md hover:bg-[#4A3D31] transition-colors disabled:opacity-50"
                                        >
                                          <Plus size={12} />
                                          {updatingProduct === product.id
                                            ? "Adding..."
                                            : "Add"}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            <div>
                              <h4 className="text-[12px] font-semibold text-[#757575] uppercase tracking-wider mb-3">
                                Products in &quot;{banner.title}&quot; ({productCount})
                              </h4>
                              {productCount === 0 ? (
                                <p className="text-[12px] text-[#757575] italic">
                                  No products in this banner yet.
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {getBannerProducts(banner.id).map((product) => (
                                    <div
                                      key={product.id}
                                      className="flex items-center justify-between p-2.5 bg-white border border-[#E8E4DE] rounded-lg"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        {product.image ? (
                                          <div className="relative w-9 h-9 rounded border border-[#E8E4DE] overflow-hidden flex-shrink-0">
                                            <Image
                                              src={product.image}
                                              alt={product.name}
                                              fill
                                              className="object-cover"
                                              sizes="36px"
                                            />
                                          </div>
                                        ) : (
                                          <div className="w-9 h-9 rounded bg-[#F5F2ED] flex items-center justify-center flex-shrink-0">
                                            <Package size={14} className="text-[#C4B5A5]" />
                                          </div>
                                        )}
                                        <div className="min-w-0">
                                          <div className="text-[12px] font-medium text-[#1A1A1A] truncate">
                                            {product.name}
                                          </div>
                                          <div className="text-[11px] text-[#757575]">
                                            ₹{product.price}
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleRemoveProductFromBanner(
                                            product.id,
                                            banner.id
                                          )
                                        }
                                        disabled={updatingProduct === product.id}
                                        className="flex-shrink-0 p-1.5 text-[#757575] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                        title="Remove from banner"
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
      )}
      <MediaPickerModal
        open={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(url) => setForm({ ...form, imageUrl: url })}
      />
    </div>
  );
}
