"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Save, Upload, Image as ImageIcon, MessageSquare } from "lucide-react";
import { uploadFile } from "@/lib/direct-upload";
import { optimizeCloudinaryUrl } from "@/lib/optimize-cloudinary";

interface DmTestimonial {
  id: number;
  imageUrl: string;
  alt: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface FormData {
  imageUrl: string;
  alt: string;
  displayOrder: string;
  isActive: boolean;
}

const emptyForm: FormData = {
  imageUrl: "",
  alt: "",
  displayOrder: "0",
  isActive: true,
};

export default function AdminDmTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<DmTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dm-testimonials");
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.testimonials);
      }
    } catch (err) {
      console.error("Error fetching DM testimonials:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleStartAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleStartEdit = (t: DmTestimonial) => {
    setShowForm(true);
    setEditingId(t.id);
    setForm({
      imageUrl: t.imageUrl,
      alt: t.alt,
      displayOrder: t.displayOrder.toString(),
      isActive: t.isActive,
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
      const url = await uploadFile(file);
        setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      console.error("Error uploading image:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.imageUrl) return;
    setSaving(true);

    try {
      const body = {
        imageUrl: form.imageUrl,
        alt: form.alt,
        displayOrder: parseInt(form.displayOrder) || 0,
        isActive: form.isActive,
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/admin/dm-testimonials/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/admin/dm-testimonials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        showSuccess(editingId ? "Testimonial updated successfully" : "Testimonial created successfully");
        handleCancel();
        fetchTestimonials();
      }
    } catch (err) {
      console.error("Error saving testimonial:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/dm-testimonials/${id}`, { method: "DELETE" });
      if (res.ok) {
        showSuccess("Testimonial deleted successfully");
        setDeleteConfirm(null);
        fetchTestimonials();
      }
    } catch (err) {
      console.error("Error deleting testimonial:", err);
    }
  };

  const handleToggleActive = async (t: DmTestimonial) => {
    try {
      const res = await fetch(`/api/admin/dm-testimonials/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !t.isActive }),
      });
      if (res.ok) {
        showSuccess(`Testimonial ${t.isActive ? "deactivated" : "activated"}`);
        fetchTestimonials();
      }
    } catch (err) {
      console.error("Error toggling testimonial:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="bg-[#F5F2ED] py-10 md:py-14">
        <div className="container px-4 md:px-8">
          <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
            DM Testimonials
          </h1>
          <p className="mt-2 text-[14px] text-[#757575]">
            Manage customer DM screenshots for &quot;Our DMs Say It All&quot; section
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
          <p className="text-[14px] text-[#757575]">{testimonials.length} testimonials</p>
          <button
            onClick={handleStartAdd}
            className="flex items-center gap-2 bg-[#5C4B3D] text-white px-5 py-2.5 rounded-sm text-[13px] font-medium uppercase tracking-wider hover:bg-[#4A3C31] transition-colors"
          >
            <Plus size={14} />
            Add Testimonial
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-6 mb-6">
            <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">
              {editingId ? "Edit Testimonial" : "Add New Testimonial"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                  Image *
                </label>
                <div className="flex items-center gap-3">
                  {form.imageUrl && (
                    <img src={optimizeCloudinaryUrl(form.imageUrl, { width: 160 })} alt="Preview" className="w-16 h-20 object-cover rounded border border-[#E8E4DE]" />
                  )}
                  <label className="flex items-center gap-2 cursor-pointer bg-[#F5F2ED] px-4 py-2 rounded-sm text-[13px] text-[#5C4B3D] hover:bg-[#EDE8E0] transition-colors">
                    <Upload size={14} />
                    {uploading ? "Uploading..." : "Upload Image"}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
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
                  Alt Text
                </label>
                <input
                  type="text"
                  value={form.alt}
                  onChange={(e) => setForm((f) => ({ ...f, alt: e.target.value }))}
                  className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                  placeholder="e.g. Customer DM screenshot"
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
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={!form.imageUrl || saving}
                className="flex items-center gap-2 bg-[#5C4B3D] text-white px-6 py-3 rounded-sm text-[13px] font-medium uppercase tracking-wider hover:bg-[#4A3C31] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save size={14} />
                {saving ? "Saving..." : editingId ? "Update Testimonial" : "Add Testimonial"}
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
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare size={40} className="text-[#D4C8BE] mx-auto mb-3" />
              <p className="text-[14px] text-[#757575]">No DM testimonials yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#FAFAF8] border border-[#E8E4DE] rounded-[12px] overflow-hidden group relative"
                >
                  {t.imageUrl ? (
                    <div className="aspect-[3/4] relative">
                      <img src={optimizeCloudinaryUrl(t.imageUrl, { width: 320 })} alt={t.alt} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] bg-[#F5F2ED] flex items-center justify-center">
                      <ImageIcon size={32} className="text-[#D4C8BE]" />
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-[#757575]">Order: {t.displayOrder}</span>
                      <button
                        onClick={() => handleToggleActive(t)}
                        className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-full cursor-pointer ${
                          t.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}
                      >
                        {t.isActive ? "Active" : "Inactive"}
                      </button>
                    </div>
                    {t.alt && (
                      <p className="text-[12px] text-[#757575] truncate">{t.alt}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2">
                      <button
                        onClick={() => handleStartEdit(t)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F5F2ED] text-[#757575] hover:text-[#5C4B3D] transition-colors"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      {deleteConfirm === t.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="px-2 py-1 text-[11px] bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F5F2ED] text-[#757575] transition-colors"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(t.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#757575] hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
