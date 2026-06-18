"use client";

import { useState, useEffect } from "react";
import { Trash2, Upload, ImageIcon, Copy, Check, Search, Pencil, Save, X } from "lucide-react";
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

  const fetchFiles = async () => {
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
  };

  useEffect(() => {
    fetchFiles();
  }, []);

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
        setFiles(files.filter((f) => f.filename !== filename));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Failed to delete:", error);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-serif font-semibold text-[#1A1A1A]">
            Media Library
          </h1>
          <p className="text-[14px] text-[#757575] mt-1">
            {files.length} file{files.length !== 1 ? "s" : ""} uploaded
          </p>
        </div>
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
          {filteredFiles.map((file) => (
            <div
              key={file.filename}
              className="bg-white border border-[#E8E4DE] rounded-xl overflow-hidden group"
            >
              <div className="relative aspect-square">
                <img
                  src={file.url}
                  alt={file.filename}
                  className="w-full h-full object-cover"
                />
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
          ))}
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
