"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingBag, Phone, Mail, User, Trash2, MessageCircle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

type CartStatus = "pending" | "contacted" | "recovered" | "lost";

interface CartProduct {
  name: string;
  qty: number;
  price: number;
  image?: string;
}

interface AbandonedCart {
  id: number;
  customerName: string;
  phone: string;
  email: string;
  products: CartProduct[];
  cartValue: number;
  status: CartStatus;
  notes: string;
  createdAt: string;
}

const STATUS_OPTIONS: { value: CartStatus; label: string; color: string; bg: string }[] = [
  { value: "pending", label: "Pending", color: "text-yellow-700", bg: "bg-yellow-50" },
  { value: "contacted", label: "Contacted", color: "text-blue-700", bg: "bg-blue-50" },
  { value: "recovered", label: "Recovered", color: "text-green-700", bg: "bg-green-50" },
  { value: "lost", label: "Lost", color: "text-red-700", bg: "bg-red-50" },
];

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ [id: number]: string }>({});
  const [savingNotes, setSavingNotes] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchCarts = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === "all" ? "/api/admin/abandoned-carts" : `/api/admin/abandoned-carts?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setCarts(data.carts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchCarts(); }, [fetchCarts]);

  const updateStatus = async (id: number, status: CartStatus) => {
    setUpdatingStatus(id);
    try {
      await fetch(`/api/admin/abandoned-carts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setCarts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } finally {
      setUpdatingStatus(null);
    }
  };

  const saveNotes = async (id: number) => {
    setSavingNotes(id);
    try {
      await fetch(`/api/admin/abandoned-carts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editingNotes[id] ?? "" }),
      });
      setCarts(prev => prev.map(c => c.id === id ? { ...c, notes: editingNotes[id] ?? c.notes } : c));
    } finally {
      setSavingNotes(null);
    }
  };

  const deleteCart = async (id: number) => {
    if (!confirm("Delete this abandoned cart record?")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/abandoned-carts/${id}`, { method: "DELETE" });
      setCarts(prev => prev.filter(c => c.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s.value] = carts.filter(c => c.status === s.value).length;
    return acc;
  }, {} as Record<string, number>);

  const statusStyle = (s: CartStatus) => STATUS_OPTIONS.find(o => o.value === s) ?? STATUS_OPTIONS[0];

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[28px] font-serif text-[#1A1A1A] tracking-tight">Abandoned Carts</h1>
          <p className="mt-1 text-[14px] text-[#757575]">Track and follow up on lost sales.</p>
        </div>
        <button onClick={fetchCarts} className="flex items-center gap-2 px-4 py-2 border border-[#E8E4DE] rounded-sm text-[13px] text-[#5C4B3D] hover:bg-[#F5F2ED] transition-colors">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {STATUS_OPTIONS.map(s => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`p-4 rounded-lg border text-left transition-all ${filter === s.value ? "border-[#5C4B3D] bg-[#F5F2ED]" : "border-[#E8E4DE] bg-white hover:bg-[#FAF9F6]"}`}
          >
            <div className={`text-[22px] font-bold ${s.color}`}>{counts[s.value] ?? 0}</div>
            <div className="text-[12px] text-[#757575] mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {["all", ...STATUS_OPTIONS.map(s => s.value)].map(v => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${filter === v ? "bg-[#5C4B3D] text-white" : "bg-[#F5F2ED] text-[#5C4B3D] hover:bg-[#E8E4DE]"}`}
          >
            {v === "all" ? `All (${carts.length})` : `${STATUS_OPTIONS.find(s => s.value === v)?.label} (${counts[v as CartStatus] ?? 0})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#757575]">Loading...</div>
      ) : carts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag size={40} className="text-[#D4C8BE] mb-3" />
          <div className="text-[16px] font-medium text-[#1A1A1A]">No abandoned carts yet</div>
          <div className="text-[13px] text-[#757575] mt-1">When customers abandon their cart, they&apos;ll appear here.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {carts.map(cart => {
            const s = statusStyle(cart.status);
            const isExpanded = expandedId === cart.id;
            return (
              <div key={cart.id} className="border border-[#E8E4DE] rounded-lg bg-white overflow-hidden">
                <div className="px-5 py-4 flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px] font-medium text-[#1A1A1A]">{cart.customerName || "Unknown"}</span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${s.color} ${s.bg}`}>{s.label}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-[12px] text-[#757575] flex-wrap">
                      {cart.phone && <span className="flex items-center gap-1"><Phone size={11} />{cart.phone}</span>}
                      {cart.email && <span className="flex items-center gap-1"><Mail size={11} />{cart.email}</span>}
                      <span>{cart.products?.length ?? 0} item(s)</span>
                      <span className="font-medium text-[#5C4B3D]">Rs. {cart.cartValue.toLocaleString()}</span>
                      <span>{new Date(cart.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {cart.phone && (
                      <a
                        href={`https://wa.me/${cart.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${cart.customerName || ""}, you left items in your Zayelle cart worth Rs. ${cart.cartValue}. Can we help you complete your order?`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-[12px] font-medium rounded-md hover:bg-green-700 transition-colors"
                      >
                        <MessageCircle size={13} />
                        WhatsApp
                      </a>
                    )}
                    <select
                      value={cart.status}
                      disabled={updatingStatus === cart.id}
                      onChange={e => updateStatus(cart.id, e.target.value as CartStatus)}
                      className="h-[32px] px-2 border border-[#E8E4DE] rounded text-[12px] focus:outline-none focus:border-[#5C4B3D] bg-white"
                    >
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button
                      onClick={() => { setExpandedId(isExpanded ? null : cart.id); if (!isExpanded) setEditingNotes(prev => ({ ...prev, [cart.id]: cart.notes })); }}
                      className="p-1.5 text-[#757575] hover:text-[#5C4B3D] hover:bg-[#F5F2ED] rounded transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    <button
                      onClick={() => deleteCart(cart.id)}
                      disabled={deletingId === cart.id}
                      className="p-1.5 text-[#757575] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-[#F5F2ED] px-5 py-4 bg-[#FDFCF8] space-y-4">
                    {(cart.products?.length ?? 0) > 0 && (
                      <div>
                        <div className="text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-2">Cart Items</div>
                        <div className="space-y-2">
                          {cart.products.map((p, i) => (
                            <div key={i} className="flex items-center gap-3 text-[13px]">
                              <div className="flex-1 text-[#1A1A1A]">{p.name}</div>
                              <div className="text-[#757575]">×{p.qty}</div>
                              <div className="text-[#5C4B3D] font-medium">Rs. {(p.price * p.qty).toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-[12px] font-medium text-[#757575] uppercase tracking-wider mb-2">Notes</div>
                      <textarea
                        value={editingNotes[cart.id] ?? cart.notes}
                        onChange={e => setEditingNotes(prev => ({ ...prev, [cart.id]: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-[#E8E4DE] rounded-sm text-[13px] focus:outline-none focus:border-[#5C4B3D] bg-white resize-none"
                        placeholder="Add notes about this lead..."
                      />
                      <button
                        onClick={() => saveNotes(cart.id)}
                        disabled={savingNotes === cart.id}
                        className="mt-2 px-4 py-1.5 bg-[#5C4B3D] text-white text-[12px] rounded-sm hover:bg-[#4A3B2F] transition-colors disabled:opacity-50"
                      >
                        {savingNotes === cart.id ? "Saving..." : "Save Notes"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
