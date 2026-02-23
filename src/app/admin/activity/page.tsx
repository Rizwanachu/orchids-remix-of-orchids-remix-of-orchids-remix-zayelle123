"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";

interface ActivityLog {
  id: number;
  adminEmail: string;
  action: string;
  details: string | null;
  createdAt: string;
}

export default function AdminActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const res = await fetch(`/api/admin/activity?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (err) {
      console.error("Error fetching activity logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / limit);

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="bg-[#F5F2ED] py-10 md:py-14">
        <div className="container px-4 md:px-8">
          <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
            Activity Log
          </h1>
          <p className="mt-2 text-[14px] text-[#757575]">
            {total} total entries
          </p>
        </div>
      </div>

      <div className="container px-4 md:px-8 py-8 md:py-12">
        <div className="bg-white border border-[#E8E4DE] rounded-[12px] overflow-hidden">
          <div className="hidden md:grid grid-cols-[200px_160px_1fr_160px] gap-4 px-6 py-3 border-b border-[#E8E4DE] bg-[#FAFAF8]">
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Admin</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Action</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Details</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Date</span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-[14px] text-[#757575]">Loading...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity size={40} className="text-[#D4C8BE] mx-auto mb-3" />
              <p className="text-[14px] text-[#757575]">No activity logs yet</p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-1 md:grid-cols-[200px_160px_1fr_160px] gap-2 md:gap-4 px-6 py-4 border-b border-[#F5F2ED] last:border-b-0 hover:bg-[#FAFAF8] transition-colors"
              >
                <p className="text-[13px] text-[#1A1A1A]">{log.adminEmail}</p>
                <div>
                  <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium rounded-full bg-[#F5F2ED] text-[#5C4B3D]">
                    {formatAction(log.action)}
                  </span>
                </div>
                <p className="text-[13px] text-[#757575]">{log.details || "—"}</p>
                <p className="text-[12px] text-[#757575]">
                  {new Date(log.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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
