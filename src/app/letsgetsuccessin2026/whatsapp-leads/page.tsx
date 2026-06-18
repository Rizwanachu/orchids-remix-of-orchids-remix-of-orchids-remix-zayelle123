"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle, ExternalLink, Trash2, ChevronDown, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";

interface Lead {
  id: number;
  name: string;
  phone: string;
  sourcePage: string;
  productName: string;
  productHandle: string;
  message: string;
  status: string;
  notes: string;
  createdAt: string;
}

const STATUS_OPTIONS = ["new", "contacted", "interested", "ordered", "closed", "lost"];
const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  interested: "bg-purple-100 text-purple-700",
  ordered: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
  lost: "bg-red-100 text-red-600",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function WhatsappLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [notesMap, setNotesMap] = useState<Record<number, string>>({});
  const [savingNotes, setSavingNotes] = useState<number | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/whatsapp-leads");
      const data = await res.json();
      const list: Lead[] = data.leads || [];
      setLeads(list);
      const map: Record<number, string> = {};
      list.forEach((l) => { map[l.id] = l.notes; });
      setNotesMap(map);
    } catch {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetch(`/api/admin/whatsapp-leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
    } catch {
      toast.error("Failed to update status");
    }
  };

  const saveNotes = async (id: number) => {
    setSavingNotes(id);
    try {
      await fetch(`/api/admin/whatsapp-leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesMap[id] }),
      });
      setLeads((prev) => prev.map((l) => l.id === id ? { ...l, notes: notesMap[id] } : l));
      toast.success("Notes saved");
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(null);
    }
  };

  const deleteLead = async (id: number) => {
    if (!confirm("Delete this lead?")) return;
    try {
      await fetch(`/api/admin/whatsapp-leads/${id}`, { method: "DELETE" });
      setLeads((prev) => prev.filter((l) => l.id !== id));
      toast.success("Lead deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = filterStatus === "all" ? leads : leads.filter((l) => l.status === filterStatus);

  const counts = STATUS_OPTIONS.reduce<Record<string, number>>((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s).length;
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-serif font-semibold text-[#1A1A1A]">WhatsApp Leads</h1>
          <p className="text-[13px] text-[#757575] mt-0.5">
            {leads.length} total leads · {counts.new || 0} new
          </p>
        </div>
        <button onClick={fetchLeads} className="flex items-center gap-2 px-3 py-2 border border-[#E8E4DE] rounded-lg text-[12px] text-[#757575] hover:bg-[#F5F2ED] transition-colors">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${filterStatus === "all" ? "bg-[#5C4B3D] text-white" : "bg-white border border-[#E8E4DE] text-[#757575] hover:bg-[#F5F2ED]"}`}
        >
          All ({leads.length})
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors capitalize ${filterStatus === s ? "bg-[#5C4B3D] text-white" : "bg-white border border-[#E8E4DE] text-[#757575] hover:bg-[#F5F2ED]"}`}
          >
            {s} ({counts[s] || 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#757575]">Loading leads…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E8E4DE] rounded-xl">
          <MessageCircle size={40} className="text-[#E8E4DE] mx-auto mb-3" />
          <p className="text-[15px] font-medium text-[#1A1A1A]">
            {filterStatus === "all" ? "No WhatsApp leads yet" : `No "${filterStatus}" leads`}
          </p>
          <p className="text-[13px] text-[#757575] mt-1">
            Leads are captured when customers click the WhatsApp button on product pages
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => (
            <div key={lead.id} className="bg-white border border-[#E8E4DE] rounded-xl overflow-hidden">
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-[#FDFCF8] transition-colors"
                onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
              >
                <div className="w-9 h-9 rounded-full bg-[#F0FAF4] flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={16} className="text-[#25D366]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-semibold text-[#1A1A1A]">
                      {lead.name || "Anonymous"}
                    </span>
                    {lead.productName && (
                      <span className="text-[11px] text-[#757575] truncate max-w-[200px]">
                        re: {lead.productName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[lead.status] || "bg-gray-100 text-gray-600"}`}>
                      {lead.status}
                    </span>
                    <span className="text-[11px] text-[#999]">{timeAgo(lead.createdAt)}</span>
                    {lead.sourcePage && (
                      <span className="text-[11px] text-[#999] truncate">{lead.sourcePage}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {lead.productHandle && (
                    <a
                      href={`https://wa.me/918891485648?text=${encodeURIComponent(lead.message || `Hi, following up on WhatsApp lead for ${lead.productName}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-[11px] font-medium hover:bg-[#1EBC59] transition-colors"
                    >
                      <MessageCircle size={12} />
                      Chat
                    </a>
                  )}
                  <a
                    href={`/products/${lead.productHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-lg hover:bg-[#F5F2ED] transition-colors"
                    title="View product"
                  >
                    <ExternalLink size={14} className="text-[#757575]" />
                  </a>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteLead(lead.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                  <ChevronDown
                    size={16}
                    className={`text-[#999] transition-transform ${expandedId === lead.id ? "rotate-180" : ""}`}
                  />
                </div>
              </div>

              {expandedId === lead.id && (
                <div className="border-t border-[#F5F2ED] p-4 space-y-4 bg-[#FDFCF8]">
                  {lead.message && (
                    <div>
                      <p className="text-[11px] font-medium text-[#757575] uppercase tracking-wider mb-1">Message</p>
                      <p className="text-[13px] text-[#1A1A1A] bg-white border border-[#E8E4DE] rounded-lg px-3 py-2">
                        {lead.message}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium text-[#757575] uppercase tracking-wider mb-1">Status</label>
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8E4DE] rounded-lg text-[12px] focus:outline-none focus:border-[#5C4B3D] bg-white capitalize"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="capitalize">{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#757575] uppercase tracking-wider mb-1">Source</label>
                      <p className="text-[13px] text-[#1A1A1A] px-3 py-2 bg-white border border-[#E8E4DE] rounded-lg truncate">
                        {lead.sourcePage || "—"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#757575] uppercase tracking-wider mb-1">Notes</label>
                    <div className="flex gap-2">
                      <textarea
                        value={notesMap[lead.id] || ""}
                        onChange={(e) => setNotesMap((m) => ({ ...m, [lead.id]: e.target.value }))}
                        rows={2}
                        className="flex-1 px-3 py-2 border border-[#E8E4DE] rounded-lg text-[12px] focus:outline-none focus:border-[#5C4B3D] resize-none"
                        placeholder="Add notes about this lead…"
                      />
                      <button
                        onClick={() => saveNotes(lead.id)}
                        disabled={savingNotes === lead.id}
                        className="px-4 py-2 bg-[#5C4B3D] text-white rounded-lg text-[12px] font-medium hover:bg-[#4A3C31] disabled:opacity-60 transition-colors self-stretch"
                      >
                        {savingNotes === lead.id ? "…" : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
