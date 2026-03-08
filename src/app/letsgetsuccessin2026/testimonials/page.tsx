"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Save, Star, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  location: string;
  rating: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

interface FormData {
  quote: string;
  author: string;
  location: string;
  rating: string;
  displayOrder: string;
  isActive: boolean;
}

const emptyForm: FormData = {
  quote: "",
  author: "",
  location: "",
  rating: "5",
  displayOrder: "0",
  isActive: true,
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials");
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.testimonials);
      }
    } catch (err) {
      console.error("Error fetching testimonials:", err);
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
    setError("");
  };

  const handleStartEdit = (t: Testimonial) => {
    setShowForm(true);
    setEditingId(t.id);
    setForm({
      quote: t.quote,
      author: t.author,
      location: t.location,
      rating: t.rating.toString(),
      displayOrder: t.displayOrder.toString(),
      isActive: t.isActive,
    });
    setError("");
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSave = async () => {
    if (!form.quote.trim() || !form.author.trim()) {
      setError("Quote and author name are required.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const body = {
        quote: form.quote.trim(),
        author: form.author.trim(),
        location: form.location.trim(),
        rating: parseInt(form.rating) || 5,
        displayOrder: parseInt(form.displayOrder) || 0,
        isActive: form.isActive,
      };

      const res = editingId
        ? await fetch(`/api/admin/testimonials/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/admin/testimonials", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

      if (res.ok) {
        showSuccess(editingId ? "Testimonial updated." : "Testimonial added.");
        handleCancel();
        fetchTestimonials();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save.");
      }
    } catch {
      setError("Failed to save testimonial.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (res.ok) {
        showSuccess("Testimonial deleted.");
        setDeleteConfirm(null);
        fetchTestimonials();
      }
    } catch {
      console.error("Error deleting testimonial");
    }
  };

  const handleToggleActive = async (t: Testimonial) => {
    try {
      const res = await fetch(`/api/admin/testimonials/${t.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !t.isActive }),
      });
      if (res.ok) {
        showSuccess(`Testimonial ${t.isActive ? "deactivated" : "activated"}.`);
        fetchTestimonials();
      }
    } catch {
      console.error("Error toggling testimonial");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="bg-[#F5F2ED] py-10 md:py-14">
        <div className="container px-4 md:px-8">
          <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
            Community Testimonials
          </h1>
          <p className="mt-2 text-[14px] text-[#757575]">
            Manage the &ldquo;Our Community Speaks&rdquo; section on the homepage
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
          <p className="text-[14px] text-[#757575]">
            {testimonials.length} testimonial{testimonials.length !== 1 ? "s" : ""}
          </p>
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
            <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-5">
              {editingId ? "Edit Testimonial" : "Add New Testimonial"}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-[13px] text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                  Quote *
                </label>
                <textarea
                  value={form.quote}
                  onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white resize-none"
                  placeholder='e.g. "Finally found hijabs that feel light and look premium."'
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                  Author Name *
                </label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                  placeholder="e.g. Ayesha R."
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                  placeholder="e.g. Mumbai"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                  Star Rating (1–5)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, rating: star.toString() }))}
                      className="p-1"
                    >
                      <Star
                        size={22}
                        fill={star <= parseInt(form.rating) ? "#D4A574" : "transparent"}
                        stroke={star <= parseInt(form.rating) ? "#D4A574" : "#D4C8BE"}
                      />
                    </button>
                  ))}
                </div>
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
                  min="0"
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
                  <span className="text-[13px] text-[#1A1A1A]">{form.isActive ? "Visible on homepage" : "Hidden"}</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
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
            <div className="text-center py-16">
              <Quote size={40} className="text-[#D4C8BE] mx-auto mb-3" />
              <p className="text-[15px] font-medium text-[#1A1A1A] mb-1">No testimonials yet</p>
              <p className="text-[13px] text-[#757575]">Add your first customer testimonial to display on the homepage.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F2ED]">
              {testimonials.map((t) => (
                <div key={t.id} className="flex items-start gap-4 p-5 hover:bg-[#FDFCF8] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={13} fill="#D4A574" stroke="#D4A574" />
                      ))}
                    </div>
                    <blockquote className="font-serif italic text-[15px] text-[#1A1A1A] leading-relaxed mb-2">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-2 text-[13px]">
                      <span className="font-semibold text-[#1A1A1A] uppercase tracking-wider">{t.author}</span>
                      {t.location && (
                        <>
                          <span className="text-[#D4C8BE]">·</span>
                          <span className="text-[#757575]">{t.location}</span>
                        </>
                      )}
                      <span className="text-[#D4C8BE]">·</span>
                      <span className="text-[#AAAAAA]">Order: {t.displayOrder}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(t)}
                      className={`px-2.5 py-1 text-[11px] uppercase tracking-wider font-medium rounded-full cursor-pointer transition-colors ${
                        t.isActive
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-[#F5F2ED] text-[#757575] hover:bg-[#EDE8E0]"
                      }`}
                    >
                      {t.isActive ? "Active" : "Hidden"}
                    </button>
                    <button
                      onClick={() => handleStartEdit(t)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F2ED] text-[#757575] hover:text-[#5C4B3D] transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
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
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F2ED] text-[#757575] transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(t.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#757575] hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
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
