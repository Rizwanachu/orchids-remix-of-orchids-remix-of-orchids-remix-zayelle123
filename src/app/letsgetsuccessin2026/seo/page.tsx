"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Save, X, ExternalLink } from "lucide-react";

interface SeoPage {
  id: number;
  pagePath: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  ogImage: string;
  updatedAt: string;
}

const DEFAULT_PAGES = [
  { path: "/", label: "Homepage" },
  { path: "/products", label: "All Products" },
  { path: "/collections", label: "Collections" },
  { path: "/new-arrivals", label: "New Arrivals" },
  { path: "/gift-hampers", label: "Gift Hampers" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
];

const emptyForm = { pagePath: "", metaTitle: "", metaDescription: "", keywords: "", canonicalUrl: "", ogImage: "" };

export default function SeoManagerPage() {
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customPath, setCustomPath] = useState("");

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo");
      const data = await res.json();
      setPages(data.pages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const startEdit = (path: string) => {
    const existing = pages.find(p => p.pagePath === path);
    setForm(existing ? {
      pagePath: existing.pagePath,
      metaTitle: existing.metaTitle,
      metaDescription: existing.metaDescription,
      keywords: existing.keywords,
      canonicalUrl: existing.canonicalUrl,
      ogImage: existing.ogImage,
    } : { ...emptyForm, pagePath: path });
    setEditing(path);
  };

  const save = async () => {
    if (!form.pagePath) return;
    setSaving(true);
    try {
      await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSuccess("SEO settings saved.");
      setTimeout(() => setSuccess(""), 3000);
      fetchPages();
      setEditing(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const titleLen = form.metaTitle.length;
  const descLen = form.metaDescription.length;

  const allPaths = [
    ...DEFAULT_PAGES,
    ...pages.filter(p => !DEFAULT_PAGES.find(d => d.path === p.pagePath)).map(p => ({ path: p.pagePath, label: p.pagePath })),
  ];

  return (
    <div className="p-4 md:p-8 max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[28px] font-serif text-[#1A1A1A] tracking-tight">SEO Manager</h1>
          <p className="mt-1 text-[14px] text-[#757575]">Set meta titles, descriptions, and keywords per page.</p>
        </div>
        <button
          onClick={() => { setShowCustomForm(!showCustomForm); setCustomPath(""); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#5C4B3D] text-white text-[13px] rounded-sm hover:bg-[#4A3B2F] transition-colors"
        >
          <Plus size={14} />
          Add Custom Page
        </button>
      </div>

      {success && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-[13px] rounded-md">{success}</div>
      )}

      {showCustomForm && (
        <div className="mb-6 p-4 border border-[#E8E4DE] rounded-lg bg-[#FDFCF8] flex items-center gap-3">
          <input
            type="text"
            value={customPath}
            onChange={e => setCustomPath(e.target.value)}
            placeholder="/custom-page-path"
            className="flex-1 h-[38px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] focus:outline-none focus:border-[#5C4B3D] bg-white"
          />
          <button
            onClick={() => { if (customPath) { startEdit(customPath); setShowCustomForm(false); } }}
            className="px-4 py-2 bg-[#5C4B3D] text-white text-[13px] rounded-sm hover:bg-[#4A3B2F] transition-colors"
          >
            Edit SEO
          </button>
          <button onClick={() => setShowCustomForm(false)} className="p-2 text-[#757575] hover:text-[#5C4B3D] transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {allPaths.map(({ path, label }) => {
          const existing = pages.find(p => p.pagePath === path);
          const isEditing = editing === path;
          return (
            <div key={path} className={`border rounded-lg overflow-hidden transition-all ${isEditing ? "border-[#5C4B3D] shadow-md" : "border-[#E8E4DE] bg-white"}`}>
              <div className="px-5 py-3 flex items-center justify-between bg-[#FAF9F6] border-b border-[#E8E4DE]">
                <div>
                  <div className="text-[14px] font-medium text-[#1A1A1A]">{label}</div>
                  <div className="text-[11px] text-[#A8A095] font-mono">{path}</div>
                </div>
                <div className="flex items-center gap-2">
                  {existing && (
                    <span className="text-[11px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Configured</span>
                  )}
                  <button
                    onClick={() => isEditing ? setEditing(null) : startEdit(path)}
                    className="px-3 py-1.5 text-[12px] border border-[#E8E4DE] rounded-sm text-[#5C4B3D] hover:bg-[#F5F2ED] transition-colors"
                  >
                    {isEditing ? "Cancel" : existing ? "Edit" : "Set Up"}
                  </button>
                </div>
              </div>

              {!isEditing && existing && (
                <div className="px-5 py-3 space-y-1">
                  <div className="text-[13px] text-[#1A1A1A] font-medium truncate">{existing.metaTitle || <span className="text-[#A8A095] italic">No title set</span>}</div>
                  <div className="text-[12px] text-[#757575] line-clamp-2">{existing.metaDescription || <span className="italic">No description set</span>}</div>
                  {existing.keywords && <div className="text-[11px] text-[#A8A095]">Keywords: {existing.keywords}</div>}
                </div>
              )}

              {isEditing && (
                <div className="px-5 py-4 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-[#757575] uppercase tracking-wider">Meta Title</label>
                      <span className={`text-[11px] ${titleLen > 60 ? "text-red-500" : titleLen > 50 ? "text-yellow-600" : "text-[#A8A095]"}`}>{titleLen}/60</span>
                    </div>
                    <input
                      type="text"
                      value={form.metaTitle}
                      onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))}
                      className="w-full h-[38px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                      placeholder="Page title for Google (50–60 chars ideal)"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-[#757575] uppercase tracking-wider">Meta Description</label>
                      <span className={`text-[11px] ${descLen > 160 ? "text-red-500" : descLen > 140 ? "text-yellow-600" : "text-[#A8A095]"}`}>{descLen}/160</span>
                    </div>
                    <textarea
                      value={form.metaDescription}
                      onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-[#E8E4DE] rounded-sm text-[13px] focus:outline-none focus:border-[#5C4B3D] bg-white resize-none"
                      placeholder="Description shown in search results (120–160 chars ideal)"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#757575] uppercase tracking-wider mb-1">Keywords</label>
                    <input
                      type="text"
                      value={form.keywords}
                      onChange={e => setForm(f => ({ ...f, keywords: e.target.value }))}
                      className="w-full h-[38px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                      placeholder="hijab, zayelle, premium hijab (comma separated)"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#757575] uppercase tracking-wider mb-1">Canonical URL (optional)</label>
                    <input
                      type="text"
                      value={form.canonicalUrl}
                      onChange={e => setForm(f => ({ ...f, canonicalUrl: e.target.value }))}
                      className="w-full h-[38px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                      placeholder="https://zayelle.com/products"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#757575] uppercase tracking-wider mb-1">OG Image URL (optional)</label>
                    <input
                      type="text"
                      value={form.ogImage}
                      onChange={e => setForm(f => ({ ...f, ogImage: e.target.value }))}
                      className="w-full h-[38px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                      placeholder="https://res.cloudinary.com/..."
                    />
                  </div>

                  {(form.metaTitle || form.metaDescription) && (
                    <div className="p-3 bg-[#FAF9F6] border border-[#E8E4DE] rounded-md">
                      <div className="text-[11px] font-medium text-[#A8A095] mb-2 uppercase tracking-wider">Search Preview</div>
                      <div className="text-[#1A0DAB] text-[14px] truncate">{form.metaTitle || "Page title"}</div>
                      <div className="text-[#006621] text-[12px]">zayelle.com{path}</div>
                      <div className="text-[#545454] text-[12px] mt-0.5 line-clamp-2">{form.metaDescription || "Page description..."}</div>
                    </div>
                  )}

                  <button
                    onClick={save}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#5C4B3D] text-white text-[13px] font-medium rounded-sm hover:bg-[#4A3B2F] transition-colors disabled:opacity-50"
                  >
                    <Save size={14} />
                    {saving ? "Saving..." : "Save SEO Settings"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
