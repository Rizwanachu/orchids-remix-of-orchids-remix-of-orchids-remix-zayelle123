"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, FolderOpen, Save, Upload, Star, ImageIcon } from "lucide-react";
import MediaPickerModal from "@/components/letsgetsuccessin2026/media-picker-modal";

interface Collection {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
}

interface CollectionFormData {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  isFeatured: boolean;
  displayOrder: string;
}

const emptyForm: CollectionFormData = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  isFeatured: false,
  displayOrder: "0",
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CollectionFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/letsgetsuccessin2026/collections");
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections);
      }
    } catch (err) {
      console.error("Error fetching collections:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleStartAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleStartEdit = (collection: Collection) => {
    setShowForm(true);
    setEditingId(collection.id);
    setForm({
      title: collection.title,
      slug: collection.slug,
      subtitle: collection.subtitle,
      description: collection.description,
      imageUrl: collection.imageUrl,
      isFeatured: collection.isFeatured,
      displayOrder: String(collection.displayOrder),
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: editingId ? prev.slug : generateSlug(title),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/letsgetsuccessin2026/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setForm((prev) => ({ ...prev, imageUrl: data.url }));
      } else {
        console.error("Upload failed:", data.error);
        alert(`Upload failed: ${data.error}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) return;
    setSaving(true);

    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        subtitle: form.subtitle,
        description: form.description,
        imageUrl: form.imageUrl,
        isFeatured: form.isFeatured,
        displayOrder: parseInt(form.displayOrder) || 0,
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/letsgetsuccessin2026/collections/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/letsgetsuccessin2026/collections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        showSuccess(editingId ? "Collection updated!" : "Collection created!");
        handleCancel();
        fetchCollections();
      }
    } catch (err) {
      console.error("Error saving collection:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/letsgetsuccessin2026/collections/${id}`, { method: "DELETE" });
      if (res.ok) {
        showSuccess("Collection deleted!");
        setDeleteConfirm(null);
        fetchCollections();
      }
    } catch (err) {
      console.error("Error deleting collection:", err);
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5C4B3D] rounded-xl flex items-center justify-center">
            <FolderOpen size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-[22px] font-serif font-semibold text-[#1A1A1A]">Collections</h1>
            <p className="text-[13px] text-[#757575]">Manage your store collections</p>
          </div>
        </div>
        <button
          onClick={handleStartAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#5C4B3D] text-white text-[13px] font-medium rounded-lg hover:bg-[#4A3D31] transition-colors"
        >
          <Plus size={16} />
          Add Collection
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
              {editingId ? "Edit Collection" : "Add Collection"}
            </h2>
            <button onClick={handleCancel} className="p-1 text-[#757575] hover:text-[#1A1A1A] transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                placeholder="Collection title"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                placeholder="collection-slug"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">Subtitle</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                placeholder="Short subtitle"
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
              <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[13px] focus:outline-none focus:border-[#5C4B3D] resize-none"
                rows={3}
                placeholder="Collection description"
              />
            </div>
            <div>
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
            <div className="flex items-center gap-3 self-end pb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded border-[#E8E4DE] text-[#5C4B3D] focus:ring-[#5C4B3D]"
                />
                <span className="text-[13px] text-[#1A1A1A] font-medium">Featured Collection</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#E8E4DE]">
            <button
              onClick={handleSave}
              disabled={saving || !form.title || !form.slug}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#5C4B3D] text-white text-[13px] font-medium rounded-lg hover:bg-[#4A3D31] transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? "Saving..." : editingId ? "Update Collection" : "Create Collection"}
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
          <p className="text-[13px] text-[#757575]">Loading collections...</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-white border border-[#E8E4DE] rounded-xl p-12 text-center">
          <FolderOpen size={40} className="mx-auto text-[#C4B5A5] mb-3" />
          <p className="text-[15px] font-medium text-[#1A1A1A] mb-1">No collections yet</p>
          <p className="text-[13px] text-[#757575]">Create your first collection to get started.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8E4DE] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E4DE] bg-[#FAFAF8]">
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Image</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Slug</th>
                  <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Subtitle</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Featured</th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Order</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((collection) => (
                  <tr key={collection.id} className="border-b border-[#E8E4DE] last:border-b-0 hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-4 py-3">
                      {collection.imageUrl ? (
                        <div className="relative w-12 h-12 rounded-lg border border-[#E8E4DE] overflow-hidden">
                          <Image src={collection.imageUrl} alt={collection.title} fill className="object-cover" sizes="48px" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#F5F2ED] flex items-center justify-center">
                          <FolderOpen size={16} className="text-[#C4B5A5]" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[13px] font-medium text-[#1A1A1A]">{collection.title}</td>
                    <td className="px-4 py-3 text-[13px] text-[#757575] font-mono">{collection.slug}</td>
                    <td className="px-4 py-3 text-[13px] text-[#757575] max-w-[200px] truncate">{collection.subtitle}</td>
                    <td className="px-4 py-3 text-center">
                      {collection.isFeatured && <Star size={14} className="inline text-amber-500 fill-amber-500" />}
                    </td>
                    <td className="px-4 py-3 text-center text-[13px] text-[#757575]">{collection.displayOrder}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStartEdit(collection)}
                          className="p-2 text-[#757575] hover:text-[#5C4B3D] hover:bg-[#F5F2ED] rounded-lg transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        {deleteConfirm === collection.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(collection.id)}
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
                            onClick={() => setDeleteConfirm(collection.id)}
                            className="p-2 text-[#757575] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
