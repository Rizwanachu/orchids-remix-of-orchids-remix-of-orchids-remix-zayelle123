"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Users, ChevronLeft, ChevronRight } from "lucide-react";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  totalOrders: number;
  totalSpend: string;
  lastOrderDate: string | null;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/customers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers);
        setTotal(data.total);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="bg-[#F5F2ED] py-10 md:py-14">
        <div className="container px-4 md:px-8">
          <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
            Customers
          </h1>
          <p className="mt-2 text-[14px] text-[#757575]">
            {total} total customers
          </p>
        </div>
      </div>

      <div className="container px-4 md:px-8 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-[320px]">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-[40px] pl-10 pr-4 border border-[#E8E4DE] rounded-sm text-[13px] focus:outline-none focus:border-[#5C4B3D] bg-white"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
          </div>
        </div>

        <div className="bg-white border border-[#E8E4DE] rounded-[12px] overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_1fr_100px_120px_140px] gap-4 px-6 py-3 border-b border-[#E8E4DE] bg-[#FAFAF8]">
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Name</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Email</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Orders</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Total Spend</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Last Order</span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-[14px] text-[#757575]">Loading...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <Users size={40} className="text-[#D4C8BE] mx-auto mb-3" />
              <p className="text-[14px] text-[#757575]">No customers found</p>
            </div>
          ) : (
            customers.map((customer) => (
              <div
                key={customer.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_100px_120px_140px] gap-2 md:gap-4 px-6 py-4 border-b border-[#F5F2ED] last:border-b-0 hover:bg-[#FAFAF8] transition-colors"
              >
                <div>
                  <p className="text-[14px] font-medium text-[#1A1A1A]">{customer.name}</p>
                  <p className="md:hidden text-[12px] text-[#757575]">{customer.email}</p>
                </div>
                <p className="hidden md:block text-[13px] text-[#757575]">{customer.email}</p>
                <p className="text-[13px] text-[#1A1A1A]">{customer.totalOrders}</p>
                <p className="text-[13px] font-semibold text-[#1A1A1A]">
                  Rs. {parseFloat(customer.totalSpend).toLocaleString("en-IN")}
                </p>
                <p className="text-[12px] text-[#757575]">
                  {customer.lastOrderDate
                    ? new Date(customer.lastOrderDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-[13px] text-[#757575]">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-2 border border-[#E8E4DE] rounded-sm text-[13px] hover:border-[#5C4B3D] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-2 border border-[#E8E4DE] rounded-sm text-[13px] hover:border-[#5C4B3D] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
