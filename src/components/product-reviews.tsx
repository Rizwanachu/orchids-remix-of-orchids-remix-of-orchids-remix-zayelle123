"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Star, Camera, X, Loader2, CheckCircle, Eye } from "lucide-react";

interface Review {
  id: number;
  customerName: string;
  rating: number;
  comment: string;
  imageUrl: string | null;
  createdAt: string;
}

interface ReviewData {
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
}

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}
        />
      ))}
    </div>
  );
}

export function ProductReviewSummary({ productId }: { productId: string }) {
  const [data, setData] = useState<ReviewData | null>(null);

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, [productId]);

  if (!data || data.totalReviews === 0) return null;

  return (
    <div className="flex items-center gap-2 mt-2">
      <StarRating rating={Math.round(data.averageRating)} />
      <span className="text-[13px] text-[#757575]">
        {data.averageRating} ({data.totalReviews} {data.totalReviews === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
}

export default function ProductReviews({ productId, productName }: { productId: string; productName: string }) {
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    rating: 0,
    comment: "",
    imageUrl: "",
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setUploadingImage(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/reviews/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setFormData((prev) => ({ ...prev, imageUrl: url }));
      } else {
        const { error } = await res.json();
        setError(error || "Upload failed");
      }
    } catch {
      setError("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!formData.customerName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!formData.customerEmail.trim()) {
      setError("Please enter your email");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, productId }),
      });

      if (res.ok) {
        setSubmitted(true);
        setFormData({ customerName: "", customerEmail: "", rating: 0, comment: "", imageUrl: "" });
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit review");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const ratingDistribution = () => {
    if (!data || data.reviews.length === 0) return [];
    const dist = [0, 0, 0, 0, 0];
    data.reviews.forEach((r) => dist[r.rating - 1]++);
    return dist;
  };

  const dist = ratingDistribution();

  return (
    <div className="mt-16 border-t border-[#E8E4DE] pt-12">
      <h2 className="text-[24px] font-serif text-[#1A1A1A] text-center mb-8">Customer Reviews</h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-[#5C4B3D]" />
        </div>
      ) : (
        <>
          {data && data.totalReviews > 0 && (
            <div className="flex flex-col md:flex-row gap-8 mb-10 p-6 bg-white rounded-[12px] border border-[#E8E4DE]">
              <div className="flex flex-col items-center justify-center min-w-[160px]">
                <span className="text-[48px] font-bold text-[#1A1A1A] leading-none">{data.averageRating}</span>
                <StarRating rating={Math.round(data.averageRating)} />
                <span className="text-[13px] text-[#757575] mt-2">
                  Based on {data.totalReviews} {data.totalReviews === 1 ? "review" : "reviews"}
                </span>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = dist[star - 1] || 0;
                  const pct = data.totalReviews > 0 ? (count / data.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="text-[13px] text-[#757575] w-[50px] text-right">{star} star</span>
                      <div className="flex-1 h-[8px] bg-[#F5F2ED] rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[12px] text-[#757575] w-[30px]">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!showForm && !submitted && (
            <div className="text-center mb-10">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 bg-[#5C4B3D] text-white px-8 py-3 rounded-sm text-[13px] uppercase tracking-wider font-medium hover:bg-[#4A3C31] transition-colors"
              >
                <Star size={16} />
                Write a Review
              </button>
            </div>
          )}

          {submitted && (
            <div className="mb-10 p-6 bg-green-50 border border-green-200 rounded-[12px] text-center">
              <CheckCircle size={32} className="text-green-600 mx-auto mb-3" />
              <h3 className="text-[16px] font-semibold text-green-800">Thank you for your review!</h3>
              <p className="text-[13px] text-green-700 mt-1">
                Your review has been submitted and will be published once approved.
              </p>
              <button
                onClick={() => { setSubmitted(false); setShowForm(false); }}
                className="mt-4 text-[13px] text-green-700 underline hover:text-green-900"
              >
                Close
              </button>
            </div>
          )}

          {showForm && !submitted && (
            <form onSubmit={handleSubmit} className="mb-10 p-6 bg-white border border-[#E8E4DE] rounded-[12px]">
              <h3 className="text-[18px] font-serif text-[#1A1A1A] mb-5">
                Write a Review for {productName}
              </h3>

              <div className="mb-5">
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setFormData((prev) => ({ ...prev, rating: s }))}
                      className="p-0.5"
                    >
                      <Star
                        size={28}
                        className={`transition-colors ${
                          s <= (hoverRating || formData.rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1.5">Name</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, customerEmail: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors"
                    placeholder="Your email (not displayed publicly)"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1.5">Review</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-[#E8E4DE] rounded-lg text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors resize-none"
                  placeholder="Share your experience with this product..."
                />
              </div>

              <div className="mb-5">
                <label className="block text-[13px] font-medium text-[#1A1A1A] mb-1.5">
                  Upload Photo <span className="text-[#757575] font-normal">(optional)</span>
                </label>
                {formData.imageUrl ? (
                  <div className="flex items-center gap-3">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#E8E4DE]">
                      <Image src={formData.imageUrl} alt="Uploaded" fill className="object-cover" sizes="80px" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                      className="text-[12px] text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <X size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-[#D4C8BE] rounded-lg text-[13px] text-[#757575] hover:border-[#5C4B3D] hover:text-[#5C4B3D] transition-colors disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Camera size={16} />
                    )}
                    {uploadingImage ? "Uploading..." : "Add a photo of your purchase"}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {error && (
                <p className="text-[13px] text-red-600 mb-4">{error}</p>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#5C4B3D] text-white px-8 py-3 rounded-sm text-[13px] uppercase tracking-wider font-medium hover:bg-[#4A3C31] transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 text-[13px] text-[#757575] hover:text-[#1A1A1A] transition-colors"
                >
                  Cancel
                </button>
              </div>

              <p className="text-[11px] text-[#999] mt-3">
                Your email will not be displayed publicly. Reviews are moderated before publishing.
              </p>
            </form>
          )}

          {data && data.reviews.length > 0 && (
            <div className="space-y-6">
              {data.reviews.map((review) => (
                <div key={review.id} className="p-5 bg-white border border-[#E8E4DE] rounded-[12px]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-[#5C4B3D] text-white flex items-center justify-center text-[14px] font-semibold">
                      {review.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#1A1A1A]">{review.customerName}</p>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        <span className="text-[11px] text-[#999]">
                          {new Date(review.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-[14px] text-[#555] leading-relaxed mt-3">{review.comment}</p>
                  )}
                  {review.imageUrl && (
                    <button
                      onClick={() => setPreviewImage(review.imageUrl)}
                      className="mt-3 relative w-24 h-24 rounded-lg overflow-hidden border border-[#E8E4DE] hover:border-[#5C4B3D] transition-colors group"
                    >
                      <Image src={review.imageUrl} alt="Review" fill className="object-cover" sizes="96px" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Eye size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {data && data.reviews.length === 0 && !showForm && !submitted && (
            <p className="text-center text-[14px] text-[#757575]">No reviews yet. Be the first to review this product!</p>
          )}
        </>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-8" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-[600px] max-h-[80vh] w-full">
            <Image src={previewImage} alt="Review image" width={600} height={600} className="object-contain rounded-lg w-full h-auto max-h-[80vh]" />
          </div>
        </div>
      )}
    </div>
  );
}
