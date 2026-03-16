"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop, convertToPixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, CropIcon, Upload } from "lucide-react";

type AspectOption = {
  label: string;
  value: number | undefined;
};

const ASPECT_OPTIONS: AspectOption[] = [
  { label: "Square 1:1", value: 1 },
  { label: "4:5", value: 4 / 5 },
  { label: "3:4", value: 3 / 4 },
  { label: "Custom", value: undefined },
];

interface ImageCropModalProps {
  file: File;
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function ImageCropModal({ file, onConfirm, onCancel }: ImageCropModalProps) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [selectedAspect, setSelectedAspect] = useState<AspectOption>(ASPECT_OPTIONS[0]);
  const [processing, setProcessing] = useState(false);
  const [cropError, setCropError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setImgSrc(reader.result as string);
    reader.readAsDataURL(file);
  }, [file]);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth, naturalHeight, width, height } = e.currentTarget;
      if (!width || !height) return;
      const aspect = selectedAspect.value;
      const initialCrop: Crop = aspect
        ? centerAspectCrop(naturalWidth, naturalHeight, aspect)
        : { unit: "%", x: 5, y: 5, width: 90, height: 90 };
      setCrop(initialCrop);
      setCompletedCrop(convertToPixelCrop(initialCrop, width, height));
    },
    [selectedAspect]
  );

  const handleAspectChange = (option: AspectOption) => {
    setSelectedAspect(option);
    if (!imgRef.current) return;
    const { naturalWidth, naturalHeight, width, height } = imgRef.current;
    if (!width || !height) return;
    const newCrop: Crop = option.value
      ? centerAspectCrop(naturalWidth, naturalHeight, option.value)
      : { unit: "%", x: 5, y: 5, width: 90, height: 90 };
    setCrop(newCrop);
    setCompletedCrop(convertToPixelCrop(newCrop, width, height));
  };

  const getCroppedBlob = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!completedCrop || !imgRef.current) return reject("No crop data");
      const image = imgRef.current;
      if (!image.naturalWidth || !image.naturalHeight) return reject("Image not loaded");

      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / (image.width || 1);
      const scaleY = image.naturalHeight / (image.height || 1);

      const cropW = Math.max(1, Math.floor(completedCrop.width * scaleX));
      const cropH = Math.max(1, Math.floor(completedCrop.height * scaleY));
      canvas.width = cropW;
      canvas.height = cropH;

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas context unavailable");

      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        cropW,
        cropH
      );

      const mimeType = file.type === "image/jpeg" ? "image/jpeg" : "image/png";
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject("Canvas produced empty blob");
        },
        mimeType,
        0.95
      );
    });
  };

  const handleConfirm = async () => {
    if (!completedCrop) return;
    setCropError(null);
    setProcessing(true);
    try {
      const blob = await getCroppedBlob();
      const croppedFile = new File([blob], file.name, { type: blob.type });
      onConfirm(croppedFile);
    } catch (err) {
      console.error("Crop failed:", err);
      setCropError("Crop failed — try 'Upload as-is' to skip cropping.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSkipCrop = () => {
    onConfirm(file);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0EDE8]">
          <div className="flex items-center gap-2">
            <CropIcon size={18} className="text-[#5C4B3D]" />
            <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Crop Image</h2>
          </div>
          <button onClick={onCancel} className="text-[#757575] hover:text-[#1A1A1A] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-2 px-5 py-3 border-b border-[#F0EDE8] bg-[#FAFAF8]">
          {ASPECT_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleAspectChange(opt)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors border ${
                selectedAspect.label === opt.label
                  ? "bg-[#5C4B3D] text-white border-[#5C4B3D]"
                  : "bg-white text-[#757575] border-[#E8E4DE] hover:border-[#5C4B3D] hover:text-[#5C4B3D]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-5 flex items-center justify-center bg-[#F5F2ED] min-h-0">
          {imgSrc ? (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={selectedAspect.value}
              className="max-h-[50vh]"
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                className="max-h-[50vh] max-w-full object-contain"
              />
            </ReactCrop>
          ) : (
            <div className="text-[13px] text-[#757575]">Loading image…</div>
          )}
        </div>

        {cropError && (
          <div className="px-5 py-2 bg-red-50 border-t border-red-100">
            <p className="text-[12px] text-red-600">{cropError}</p>
          </div>
        )}

        <div className="flex items-center justify-between px-5 py-4 border-t border-[#F0EDE8]">
          <button
            onClick={handleSkipCrop}
            disabled={processing}
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] text-[#5C4B3D] border border-[#5C4B3D] rounded-sm hover:bg-[#F5F2ED] transition-colors disabled:opacity-50"
          >
            <Upload size={13} /> Upload as-is
          </button>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-[13px] text-[#757575] border border-[#E8E4DE] rounded-sm hover:border-[#5C4B3D] hover:text-[#5C4B3D] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!completedCrop || processing}
              className="px-5 py-2 text-[13px] font-medium bg-[#5C4B3D] text-white rounded-sm hover:bg-[#4A3D32] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? "Processing…" : "Crop & Upload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
