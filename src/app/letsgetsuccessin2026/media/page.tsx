"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Upload, ImageIcon, Copy, Check, Search, Pencil, Save, X, CheckSquare, Square } from "lucide-react";
import { uploadFile } from "@/lib/direct-upload";

interface MediaFile {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
  altText: string;
  seoTitle: string;
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editingAlt, setEditingAlt] = useState<string | null>(null);
  const [altDraft, setAltDraft] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loadingUnused, setLoadingUnused] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < fileList.length; i++) {
        await uploadFile(fileList[i]);
      }
      await fetchFiles();
    } catch (error) {
      console.error("Failed to upload:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (filename: string) => {
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.filename !== filename));
        setSelected((prev) => { const s = new Set(prev); s.delete(filename); return s; });
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    setBulkDeleting(true);
    try {
      for (const filename of Array.from(selected)) {
        await fetch("/api/admin/media", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename }),
        });
      }
      setFiles((prev) => prev.filter((f) => !selected.has(f.filename)));
      setSelected(new Set());
    } catch (error) {
      console.error("Failed to bulk delete:", error);
    } finally {
      setBulkDeleting(false);
      setBulkDeleteConfirm(false);
    }
  };

  const handleSelectUnused = async () => {
    setLoadingUnused(true);
    try {
      const res = await fetch("/api/admin/media/unused");
      if (res.ok) {
        const data = await res.json();
        setSelected(new Set(data.unused));
      }
    } catch (error) {
      console.error("Failed to find unused media:", error);
    } finally {
      setLoadingUnused(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleStartEditAlt = (file: MediaFile) => {
    setEditingAlt(file.filename);
    setAltDraft(file.altText);
  };

  const handleSaveAlt = async (filename: string) => {
    try {
      await fetch("/api/admin/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, altText: altDraft }),
      });
      setFiles((prev) => prev.map((f) => f.filename === filename ? { ...f, altText: altDraft } : f));
    } catch (err) {
      console.error("Failed to save alt text:", err);
    } finally {
      setEditingAlt(null);
    }
  };

  const toggleSelect = (filename: string) => {
    setSelected((prev) => {
      const s = new Set(prev);
      if (s.has(filename)) s.delete(filename); else s.add(filename);
      return s;
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredFiles = files.filter((f) =>
    f.filename.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-serif font-semibold text-[#1A1A1A]">
            Media Library
          </h1>
          <p className="text-[14px] text-[#757575] mt-1">
            {files.length} file{files.length !== 1 ? "s" : ""} uploaded
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSelectUnused}
            disabled={loadingUnused}
            className="flex items-center gap-2 border border-[#E8E4DE] text-[#757575] px-4 py-2.5 rounded-lg text-[13px] font-medium hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50"
          >
            {loadingUnused ? (
              <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckSquare size={15} />
            )}
            Select Unused
          </button>
          {selected.size > 0 && (
            <>
              <button
                onClick={() => setSelected(new Set())}
                className="text-[12px] text-[#757575] hover:text-[#1A1A1A] px-2 py-2.5 transition-colors"
              >
                Clear ({selected.size})
              </button>
              {bulkDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkDeleting}
                    className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2.5 rounded-lg text-[13px] font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    {bulkDeleting ? "Deleting..." : `Confirm Delete ${selected.size}`}
                  </button>
                  <button
                    onClick={() => setBulkDeleteConfirm(false)}
                    className="px-3 py-2.5 text-[13px] text-[#757575] hover:text-[#1A1A1A] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setBulkDeleteConfirm(true)}
                  className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-[13px] font-medium hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete {selected.size} selected
                </button>
              )}
            </>
          )}
          <label className="flex items-center gap-2 bg-[#5C4B3D] text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#4A3C31] cursor-pointer transition-colors">
            <Upload size={16} />
            {uploading ? "Uploading..." : "Upload Images"}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-9 pr-3 py-2 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D]"
          />
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="bg-white border border-[#E8E4DE] rounded-xl p-12 text-center">
          <ImageIcon size={40} className="mx-auto text-[#C4B5A5] mb-3" />
          <p className="text-[#757575] text-[14px]">
            {search ? "No files match your search" : "No images uploaded yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredFiles.map((file) => {
            const isSelected = selected.has(file.filename);
            return (
              <div
                key={file.filename}
                className={`bg-white border rounded-xl overflow-hidden group transition-all ${isSelected ? "border-[#5C4B3D] ring-2 ring-[#5C4B3D]/20" : "border-[#E8E4DE]"}`}
              >
                <div className="relative aspect-square">
                  <img
                    src={file.url}
                    alt={file.altText || file.filename}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => toggleSelect(file.filename)}
                    className="absolute top-1.5 left-1.5 z-10 p-0.5 rounded bg-white/90 shadow-sm"
                    title={isSelected ? "Deselect" : "Select"}
                  >
                    {isSelected
                      ? <CheckSquare size={14} className="text-[#5C4B3D]" />
                      : <Square size={14} className="text-[#9E8E7E]" />
                    }
                  </button>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyUrl(file.url)}
                        className="p-2 bg-white rounded-lg text-[#1A1A1A] hover:bg-[#F5F2ED] transition-colors"
                        title="Copy URL"
                      >
                        {copiedUrl === file.url ? (
                          <Check size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(file.filename)}
                        className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-[11px] text-[#1A1A1A] truncate font-medium">
                    {file.filename}
                  </p>
                  <p className="text-[10px] text-[#757575] mt-0.5">
                    {formatSize(file.size)}
                  </p>
                  {editingAlt === file.filename ? (
                    <div className="mt-1.5 flex gap-1">
                      <input
                        type="text"
                        value={altDraft}
                        onChange={(e) => setAltDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveAlt(file.filename); if (e.key === "Escape") setEditingAlt(null); }}
                        autoFocus
                        className="flex-1 min-w-0 text-[10px] px-1.5 py-1 border border-[#5C4B3D] rounded bg-white focus:outline-none"
                        placeholder="Alt text..."
                      />
                      <button onClick={() => handleSaveAlt(file.filename)} className="p-1 text-[#5C4B3D] hover:bg-[#F5F2ED] rounded" title="Save">
                        <Save size={10} />
                      </button>
                      <button onClick={() => setEditingAlt(null)} className="p-1 text-[#757575] hover:bg-[#F5F2ED] rounded" title="Cancel">
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartEditAlt(file)}
                      className="mt-1 flex items-center gap-1 text-[10px] text-[#9E8E7E] hover:text-[#5C4B3D] transition-colors"
                      title="Edit alt text"
                    >
                      <Pencil size={9} />
                      {file.altText ? <span className="truncate max-w-[80px]">{file.altText}</span> : <span className="italic">Add alt text</span>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-[16px] font-serif font-semibold text-[#1A1A1A] mb-2">
              Delete Image?
            </h3>
            <p className="text-[13px] text-[#757575] mb-4">
              Are you sure you want to delete &quot;{deleteConfirm}&quot;? This
              action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-[#757575] hover:bg-[#F5F2ED] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
