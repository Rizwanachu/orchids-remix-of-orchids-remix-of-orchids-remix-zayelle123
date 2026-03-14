"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Save, FileText, Eye, EyeOff, Sparkles } from "lucide-react";

interface PageContent {
  id: number;
  slug: string;
  title: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  updatedAt: string;
}

interface FormData {
  slug: string;
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  isPublished: boolean;
}

const emptyForm: FormData = {
  slug: "",
  title: "",
  content: "",
  metaTitle: "",
  metaDescription: "",
  isPublished: true,
};

const defaultPages = [
  { slug: "about-us", title: "About Us" },
  { slug: "faq", title: "Frequently Asked Questions" },
  { slug: "shipping-policy", title: "Shipping Policy" },
  { slug: "returns-exchange", title: "Returns & Exchange" },
  { slug: "privacy-policy", title: "Privacy Policy" },
  { slug: "terms-of-service", title: "Terms of Service" },
  { slug: "contact", title: "Contact Us" },
];

export default function AdminPageContentsPage() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/page-contents");
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages || []);
      }
    } catch (err) {
      console.error("Error fetching pages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleStartAdd = () => {
    setShowForm(true);
    setEditingSlug(null);
    setForm(emptyForm);
  };

  const handleStartEdit = (page: PageContent) => {
    setShowForm(true);
    setEditingSlug(page.slug);
    setForm({
      slug: page.slug,
      title: page.title,
      content: page.content,
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      isPublished: page.isPublished,
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSlug(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.slug || !form.title) return;
    setSaving(true);
    try {
      if (editingSlug) {
        const res = await fetch(`/api/admin/page-contents/${editingSlug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            content: form.content,
            metaTitle: form.metaTitle,
            metaDescription: form.metaDescription,
            isPublished: form.isPublished,
          }),
        });
        if (res.ok) {
          showSuccess("Page updated successfully");
        }
      } else {
        const res = await fetch("/api/admin/page-contents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          showSuccess("Page created successfully");
        }
      }
      handleCancel();
      fetchPages();
    } catch (err) {
      console.error("Error saving page:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      const res = await fetch(`/api/admin/page-contents/${slug}`, { method: "DELETE" });
      if (res.ok) {
        showSuccess("Page deleted successfully");
        fetchPages();
      }
    } catch (err) {
      console.error("Error deleting page:", err);
    }
    setDeleteConfirm(null);
  };

  const handleSeedDefaults = async () => {
    setSeeding(true);
    try {
      const existingSlugs = pages.map((p) => p.slug);
      const toCreate = defaultPages.filter((dp) => !existingSlugs.includes(dp.slug));

      for (const page of toCreate) {
        await fetch("/api/admin/page-contents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: page.slug,
            title: page.title,
            content: "",
            metaTitle: page.title,
            metaDescription: "",
            isPublished: true,
          }),
        });
      }

      if (toCreate.length > 0) {
        showSuccess(`${toCreate.length} default page(s) created`);
        fetchPages();
      } else {
        showSuccess("All default pages already exist");
      }
    } catch (err) {
      console.error("Error seeding defaults:", err);
    } finally {
      setSeeding(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-[#5C4B3D]">Page Contents</h1>
          <p className="text-[#8B7D6B] mt-1">Manage content for website pages</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="flex items-center gap-2 border border-[#E8E4DE] text-[#5C4B3D] px-4 py-2.5 rounded-lg hover:bg-[#F5F2ED] transition-colors disabled:opacity-50"
          >
            <Sparkles size={16} />
            {seeding ? "Seeding..." : "Seed Defaults"}
          </button>
          <button
            onClick={handleStartAdd}
            className="flex items-center gap-2 bg-[#5C4B3D] text-white px-5 py-2.5 rounded-lg hover:bg-[#4A3D32] transition-colors"
          >
            <Plus size={18} />
            Add Page
          </button>
        </div>
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
              {editingSlug ? "Edit Page" : "Add New Page"}
            </h2>
            <button onClick={handleCancel} className="text-[#8B7D6B] hover:text-[#5C4B3D]">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#5C4B3D] mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  disabled={!!editingSlug}
                  placeholder="e.g. about-us"
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 disabled:bg-[#FAF9F6] disabled:text-[#8B7D6B]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5C4B3D] mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Page title"
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5C4B3D] mb-1">Content (HTML)</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Enter HTML content for this page..."
                rows={12}
                className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#5C4B3D] mb-1">Meta Title</label>
                <input
                  type="text"
                  value={form.metaTitle}
                  onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                  placeholder="SEO title"
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5C4B3D] mb-1">Meta Description</label>
                <input
                  type="text"
                  value={form.metaDescription}
                  onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  placeholder="SEO description"
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-[#5C4B3D]">Published</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, isPublished: !form.isPublished })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form.isPublished ? "bg-[#5C4B3D]" : "bg-[#E8E4DE]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    form.isPublished ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm text-[#8B7D6B]">
                {form.isPublished ? "Visible on website" : "Hidden from website"}
              </span>
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
              disabled={saving || !form.slug || !form.title}
              className="flex items-center gap-2 bg-[#5C4B3D] text-white px-5 py-2 rounded-lg hover:bg-[#4A3D32] transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving..." : editingSlug ? "Update Page" : "Create Page"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-[#8B7D6B]">Loading...</div>
      ) : pages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#E8E4DE]">
          <FileText size={48} className="mx-auto text-[#C4B5A5] mb-4" />
          <h3 className="font-serif text-xl text-[#5C4B3D] mb-2">No Pages Yet</h3>
          <p className="text-[#8B7D6B] mb-4">Create pages or seed default pages to get started</p>
          <button
            onClick={handleSeedDefaults}
            disabled={seeding}
            className="inline-flex items-center gap-2 bg-[#5C4B3D] text-white px-5 py-2.5 rounded-lg hover:bg-[#4A3D32] transition-colors disabled:opacity-50"
          >
            <Sparkles size={16} />
            {seeding ? "Seeding..." : "Seed Default Pages"}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E8E4DE] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E4DE] bg-[#FAF9F6]">
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#8B7D6B] uppercase tracking-wider">Slug</th>
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#8B7D6B] uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#8B7D6B] uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-[#8B7D6B] uppercase tracking-wider">Last Updated</th>
                <th className="text-right px-5 py-3 text-[12px] font-semibold text-[#8B7D6B] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.slug} className="border-b border-[#E8E4DE] last:border-b-0 hover:bg-[#FAF9F6] transition-colors">
                  <td className="px-5 py-4">
                    <code className="text-[13px] bg-[#F5F2ED] px-2 py-1 rounded text-[#5C4B3D]">{page.slug}</code>
                  </td>
                  <td className="px-5 py-4 text-[14px] text-[#1A1A1A] font-medium">{page.title}</td>
                  <td className="px-5 py-4">
                    {page.isPublished ? (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                        <Eye size={12} />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[#8B7D6B] bg-[#F5F2ED] px-2 py-1 rounded-full">
                        <EyeOff size={12} />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[13px] text-[#8B7D6B]">{formatDate(page.updatedAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleStartEdit(page)}
                        className="p-2 text-[#8B7D6B] hover:text-[#5C4B3D] hover:bg-[#FAF9F6] rounded-lg transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      {deleteConfirm === page.slug ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-600">Delete?</span>
                          <button
                            onClick={() => handleDelete(page.slug)}
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
                          onClick={() => setDeleteConfirm(page.slug)}
                          className="p-2 text-[#8B7D6B] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
