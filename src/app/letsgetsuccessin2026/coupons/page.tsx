"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, X, Ticket, Save } from "lucide-react";

interface Coupon {
  id: number;
  code: string;
  discountType: string;
  discountValue: string;
  minOrderValue: string | null;
  maxUsage: number | null;
  currentUsage: number;
  expiryDate: string | null;
  active: boolean;
  createdAt: string;
}

interface CouponFormData {
  code: string;
  discountType: string;
  discountValue: string;
  minOrderValue: string;
  maxUsage: string;
  expiryDate: string;
}

const emptyForm: CouponFormData = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderValue: "",
  maxUsage: "",
  expiryDate: "",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CouponFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/letsgetsuccessin2026/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleStartAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleStartEdit = (coupon: Coupon) => {
    setShowForm(true);
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue || "",
      maxUsage: coupon.maxUsage?.toString() || "",
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split("T")[0] : "",
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.code || !form.discountValue) return;
    setSaving(true);

    try {
      const body = {
        code: form.code,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrderValue: form.minOrderValue ? parseFloat(form.minOrderValue) : null,
        maxUsage: form.maxUsage ? parseInt(form.maxUsage) : null,
        expiryDate: form.expiryDate || null,
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/letsgetsuccessin2026/coupons/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/letsgetsuccessin2026/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        showSuccess(editingId ? "Coupon updated successfully" : "Coupon created successfully");
        handleCancel();
        fetchCoupons();
      }
    } catch (err) {
      console.error("Error saving coupon:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/letsgetsuccessin2026/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        showSuccess("Coupon deleted successfully");
        setDeleteConfirm(null);
        fetchCoupons();
      }
    } catch (err) {
      console.error("Error deleting coupon:", err);
    }
  };

  const isExpired = (date: string | null) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="bg-[#F5F2ED] py-10 md:py-14">
        <div className="container px-4 md:px-8">
          <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
            Coupons
          </h1>
          <p className="mt-2 text-[14px] text-[#757575]">
            Manage discount coupons
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
          <p className="text-[14px] text-[#757575]">{coupons.length} coupons</p>
          <button
            onClick={handleStartAdd}
            className="flex items-center gap-2 bg-[#5C4B3D] text-white px-5 py-2.5 rounded-sm text-[13px] font-medium uppercase tracking-wider hover:bg-[#4A3C31] transition-colors"
          >
            <Plus size={14} />
            Create Coupon
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-6 mb-6">
            <h2 className="text-[16px] font-semibold text-[#1A1A1A] mb-4">
              {editingId ? "Edit Coupon" : "Create New Coupon"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                  Code *
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white uppercase"
                  placeholder="e.g. SAVE20"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                  Discount Type
                </label>
                <select
                  value={form.discountType}
                  onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
                  className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (Rs.)</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                  Discount Value *
                </label>
                <input
                  type="number"
                  value={form.discountValue}
                  onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                  className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                  placeholder={form.discountType === "percentage" ? "20" : "500"}
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                  Min Order Value
                </label>
                <input
                  type="number"
                  value={form.minOrderValue}
                  onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
                  className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                  Max Usage
                </label>
                <input
                  type="number"
                  value={form.maxUsage}
                  onChange={(e) => setForm((f) => ({ ...f, maxUsage: e.target.value }))}
                  className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-1.5">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                  className="w-full h-[42px] px-3 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={!form.code || !form.discountValue || saving}
                className="flex items-center gap-2 bg-[#5C4B3D] text-white px-6 py-3 rounded-sm text-[13px] font-medium uppercase tracking-wider hover:bg-[#4A3C31] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save size={14} />
                {saving ? "Saving..." : editingId ? "Update Coupon" : "Create Coupon"}
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
          <div className="hidden md:grid grid-cols-[120px_100px_80px_100px_80px_80px_100px_80px_80px] gap-4 px-6 py-3 border-b border-[#E8E4DE] bg-[#FAFAF8]">
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Code</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Type</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Value</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Min Order</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Max Use</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Used</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Expiry</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Status</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider text-right">Actions</span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-[14px] text-[#757575]">Loading...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12">
              <Ticket size={40} className="text-[#D4C8BE] mx-auto mb-3" />
              <p className="text-[14px] text-[#757575]">No coupons yet</p>
            </div>
          ) : (
            coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="grid grid-cols-2 md:grid-cols-[120px_100px_80px_100px_80px_80px_100px_80px_80px] gap-2 md:gap-4 px-6 py-4 border-b border-[#F5F2ED] last:border-b-0 hover:bg-[#FAFAF8] transition-colors items-center"
              >
                <p className="text-[13px] font-semibold text-[#1A1A1A] font-mono">{coupon.code}</p>
                <p className="text-[12px] text-[#757575] capitalize">{coupon.discountType}</p>
                <p className="text-[13px] text-[#1A1A1A]">
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}%`
                    : `Rs. ${parseFloat(coupon.discountValue).toLocaleString("en-IN")}`}
                </p>
                <p className="hidden md:block text-[12px] text-[#757575]">
                  {coupon.minOrderValue ? `Rs. ${parseFloat(coupon.minOrderValue).toLocaleString("en-IN")}` : "—"}
                </p>
                <p className="hidden md:block text-[12px] text-[#757575]">
                  {coupon.maxUsage ?? "∞"}
                </p>
                <p className="hidden md:block text-[12px] text-[#757575]">{coupon.currentUsage}</p>
                <p className="hidden md:block text-[12px] text-[#757575]">
                  {coupon.expiryDate
                    ? new Date(coupon.expiryDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
                <div className="hidden md:block">
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-full ${
                      !coupon.active || isExpired(coupon.expiryDate)
                        ? "bg-red-50 text-red-700"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    {!coupon.active ? "Inactive" : isExpired(coupon.expiryDate) ? "Expired" : "Active"}
                  </span>
                </div>
                <div className="flex items-center gap-1 justify-end">
                  <button
                    onClick={() => handleStartEdit(coupon)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F2ED] text-[#757575] hover:text-[#5C4B3D] transition-colors"
                    title="Edit coupon"
                  >
                    <Pencil size={14} />
                  </button>
                  {deleteConfirm === coupon.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="px-2 py-1 text-[11px] bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F2ED] text-[#757575] transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(coupon.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#757575] hover:text-red-600 transition-colors"
                      title="Delete coupon"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
