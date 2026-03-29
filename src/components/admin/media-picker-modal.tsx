"use client";

import { useState, useEffect } from "react";
import { X, Upload, Check, ImageIcon } from "lucide-react";
import { uploadFile } from "@/lib/direct-upload";

interface MediaFile {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
}

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function MediaPickerModal({
  open,
  onClose,
  onSelect,
}: MediaPickerModalProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
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
    if (open) {
      fetchFiles();
      setSelected(null);
    }
  }, [open]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadFile(file);
        await fetchFiles();
    } catch (error) {
      console.error("Failed to upload:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      onClose();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DE] flex-shrink-0">
          <h2 className="text-[18px] font-serif font-semibold text-[#1A1A1A]">
            Media Library
          </h2>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 border border-[#E8E4DE] rounded-lg text-[13px] text-[#5C4B3D] hover:bg-[#F5F2ED] cursor-pointer transition-colors">
              <Upload size={14} />
              {uploading ? "Uploading..." : "Upload New"}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <button
              onClick={onClose}
              className="p-1 text-[#757575] hover:text-[#1A1A1A] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-[#F5F2ED] rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-16">
              <ImageIcon size={40} className="mx-auto text-[#C4B5A5] mb-3" />
              <p className="text-[#757575] text-[14px]">
                No images uploaded yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {files.map((file) => (
                <button
                  key={file.filename}
                  type="button"
                  onClick={() => setSelected(file.url)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all group ${
                    selected === file.url
                      ? "border-[#5C4B3D] ring-2 ring-[#5C4B3D]/20"
                      : "border-[#E8E4DE] hover:border-[#C4B5A5]"
                  }`}
                >
                  <img
                    src={file.url}
                    alt={file.filename}
                    className="w-full h-full object-cover"
                  />
                  {selected === file.url && (
                    <div className="absolute inset-0 bg-[#5C4B3D]/30 flex items-center justify-center">
                      <div className="w-7 h-7 bg-[#5C4B3D] rounded-full flex items-center justify-center">
                        <Check size={16} className="text-white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-[10px] truncate">
                      {file.filename}
                    </p>
                    <p className="text-white/70 text-[9px]">
                      {formatSize(file.size)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E8E4DE] flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-[13px] font-medium text-[#757575] hover:bg-[#F5F2ED] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selected}
            className="bg-[#5C4B3D] text-white px-5 py-2.5 rounded-lg text-[13px] font-medium hover:bg-[#4A3C31] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select Image
          </button>
        </div>
      </div>
    </div>
  );
}
