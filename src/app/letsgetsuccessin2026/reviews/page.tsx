"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Star, CheckCircle, XCircle, Trash2, Loader2, Clock, Eye } from "lucide-react";

interface Review {
  id: number;
  productId: number;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  imageUrl: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  productName: string;
  productHandle: string;
  productImage: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/letsgetsuccessin2026/reviews?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setCounts(data.counts);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchReviews();
  }, [filter]);

  const updateStatus = async (id: number, status: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/letsgetsuccessin2026/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Failed to update review:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteReview = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/letsgetsuccessin2026/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Failed to delete review:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}
        />
      ))}
    </div>
  );

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      approved: "bg-green-50 text-green-700 border-green-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
    };
    return (
      <span className={`px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider rounded-full border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-serif text-[#1A1A1A]">Customer Reviews</h1>
          <p className="text-[13px] text-[#757575] mt-1">Manage and moderate customer reviews</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        {[
          { key: "all", label: "All", count: counts.pending + counts.approved + counts.rejected },
          { key: "pending", label: "Pending", count: counts.pending },
          { key: "approved", label: "Approved", count: counts.approved },
          { key: "rejected", label: "Rejected", count: counts.rejected },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
              filter === tab.key
                ? "bg-[#5C4B3D] text-white"
                : "bg-white border border-[#E8E4DE] text-[#757575] hover:border-[#5C4B3D] hover:text-[#5C4B3D]"
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 px-1.5 py-0.5 text-[11px] rounded-full ${
              filter === tab.key ? "bg-white/20" : "bg-[#F5F2ED]"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#5C4B3D]" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-[12px] border border-[#E8E4DE] p-12 text-center">
          <p className="text-[14px] text-[#757575]">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-[12px] border border-[#E8E4DE] p-5">
              <div className="flex flex-col lg:flex-row gap-5">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {review.productImage && (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#F5F2ED] flex-shrink-0">
                      <Image src={review.productImage} alt="" fill className="object-cover" sizes="56px" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[14px] font-semibold text-[#1A1A1A]">{review.customerName}</span>
                      {renderStars(review.rating)}
                      {statusBadge(review.status)}
                    </div>
                    <p className="text-[12px] text-[#757575] mt-0.5">
                      {review.customerEmail} &middot; on{" "}
                      <a href={`/products/${review.productHandle}`} className="text-[#5C4B3D] hover:underline" target="_blank">
                        {review.productName}
                      </a>
                      {" "}&middot; {new Date(review.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                    {review.comment && (
                      <p className="text-[13px] text-[#555] mt-2 leading-relaxed">{review.comment}</p>
                    )}
                    {review.imageUrl && (
                      <button
                        onClick={() => setPreviewImage(review.imageUrl)}
                        className="mt-3 relative w-20 h-20 rounded-lg overflow-hidden border border-[#E8E4DE] hover:border-[#5C4B3D] transition-colors group"
                      >
                        <Image src={review.imageUrl} alt="Review" fill className="object-cover" sizes="80px" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Eye size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2 flex-shrink-0">
                  {review.status !== "approved" && (
                    <button
                      onClick={() => updateStatus(review.id, "approved")}
                      disabled={actionLoading === review.id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-[12px] font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={14} />
                      Approve
                    </button>
                  )}
                  {review.status !== "rejected" && (
                    <button
                      onClick={() => updateStatus(review.id, "rejected")}
                      disabled={actionLoading === review.id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-[12px] font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review.id)}
                    disabled={actionLoading === review.id}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white text-[#757575] border border-[#E8E4DE] rounded-lg text-[12px] font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
