"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import MediaPickerModal from "@/components/letsgetsuccessin2026/media-picker-modal";

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
  createdAt: string;
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

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/letsgetsuccessin2026/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(data);
      }
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingId
        ? `/api/letsgetsuccessin2026/banners/${editingId}`
        : "/api/letsgetsuccessin2026/banners";
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
        fetchBanners();
      }
    } catch (error) {
      console.error("Failed to save banner:", error);
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
    });
    setEditingId(banner.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/letsgetsuccessin2026/banners/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBanners(banners.filter((b) => b.id !== id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Failed to delete banner:", error);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/letsgetsuccessin2026/banners/${banner.id}`, {
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
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/letsgetsuccessin2026/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setForm({ ...form, imageUrl: data.url });
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
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
      <div className="flex items-center justify-between mb-8">
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
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-[#5C4B3D] text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#4A3C31] transition-colors"
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
                  onChange={(e) =>
                    setForm({ ...form, buttonLink: e.target.value })
                  }
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
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                >
                  <option value="hero">Hero</option>
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
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                >
                  <option value="serif">Serif (Playfair)</option>
                  <option value="sans">Sans (Inter)</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">
                  Title Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.titleColor}
                    onChange={(e) =>
                      setForm({ ...form, titleColor: e.target.value })
                    }
                    className="h-9 w-12 border border-[#E8E4DE] rounded cursor-pointer"
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
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.subtitleColor}
                    onChange={(e) =>
                      setForm({ ...form, subtitleColor: e.target.value })
                    }
                    className="h-9 w-12 border border-[#E8E4DE] rounded cursor-pointer"
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
              <div className="flex items-center gap-3 pt-6">
                <label className="text-[13px] font-medium text-[#1A1A1A]">
                  Active
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, isActive: !form.isActive })
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.isActive ? "bg-[#5C4B3D]" : "bg-[#E8E4DE]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      form.isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1">
                Image
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                  placeholder="Image URL"
                  className="flex-1 px-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
                />
                <label className="flex items-center gap-2 px-4 py-2 border border-[#E8E4DE] rounded-lg text-[13px] text-[#5C4B3D] hover:bg-[#F5F2ED] cursor-pointer transition-colors">
                  <Upload size={14} />
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
                  className="flex items-center gap-2 px-4 py-2 border border-[#E8E4DE] rounded-lg text-[13px] text-[#5C4B3D] hover:bg-[#F5F2ED] transition-colors"
                >
                  <ImageIcon size={14} />
                  Browse Media
                </button>
              </div>
              {form.imageUrl && (
                <div className="mt-3 relative w-40 h-24 rounded-lg overflow-hidden border border-[#E8E4DE]">
                  <Image
                    src={form.imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
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
                  <th className="text-left px-5 py-3 text-[12px] font-medium text-[#757575] uppercase tracking-wider">
                    Active
                  </th>
                  <th className="text-right px-5 py-3 text-[12px] font-medium text-[#757575] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr
                    key={banner.id}
                    className="border-b border-[#E8E4DE] last:border-b-0 hover:bg-[#FAF9F6] transition-colors"
                  >
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
                ))}
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
