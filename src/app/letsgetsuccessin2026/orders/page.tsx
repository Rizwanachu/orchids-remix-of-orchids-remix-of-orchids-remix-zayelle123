"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Package,
  RefreshCw,
  FileDown,
  Truck,
  Pencil,
  Save,
  Trash2,
  Plus,
  Instagram,
  ShoppingBag,
  MessageCircle,
  Store,
  MoreHorizontal,
} from "lucide-react";

interface OrderItem {
  id: number;
  orderId: number;
  productName: string;
  productHandle: string | null;
  quantity: number;
  price: string;
  image: string | null;
}

interface Order {
  id: number;
  orderId: string;
  userId: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: string | null;
  totalAmount: string;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  couponCode: string | null;
  discountAmount: string | null;
  source: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

interface NewOrderItem {
  productName: string;
  quantity: number;
  price: string;
}

const orderStatusColors: Record<string, string> = {
  processing: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  packed: "bg-purple-100 text-purple-800",
  shipped: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentStatusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-800",
  unpaid: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const sourceColors: Record<string, string> = {
  website: "bg-blue-50 text-blue-700",
  instagram: "bg-pink-50 text-pink-700",
  whatsapp: "bg-green-50 text-green-700",
  offline: "bg-amber-50 text-amber-700",
  other: "bg-gray-50 text-gray-600",
};

const sourceLabels: Record<string, string> = {
  website: "Website",
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  offline: "Offline",
  other: "Other",
};

const orderStatuses = ["processing", "confirmed", "packed", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["paid", "unpaid", "failed", "refunded"];
const sources = ["website", "instagram", "whatsapp", "offline", "other"];

const emptyNewItem = (): NewOrderItem => ({ productName: "", quantity: 1, price: "" });

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [orderFilter, setOrderFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingCarrier, setTrackingCarrier] = useState("");
  const [savingTracking, setSavingTracking] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editSource, setEditSource] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editItems, setEditItems] = useState<OrderItem[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newOrderForm, setNewOrderForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    paymentStatus: "paid",
    orderStatus: "confirmed",
    paymentMethod: "",
    source: "instagram",
    notes: "",
  });
  const [newOrderItems, setNewOrderItems] = useState<NewOrderItem[]>([emptyNewItem()]);

  const totalPages = Math.ceil(total / limit);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("search", search);
      if (paymentFilter) params.set("paymentStatus", paymentFilter);
      if (orderFilter) params.set("orderStatus", orderFilter);
      if (sourceFilter) params.set("source", sourceFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
    } catch {
      console.error("Error fetching orders");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, paymentFilter, orderFilter, sourceFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = () => {
    setPage(1);
    fetchOrders();
  };

  const handleStatusChange = async (orderId: number, field: "orderStatus" | "paymentStatus", newValue: string) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, [field]: newValue } : o))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, [field]: newValue } : null);
        }
      }
    } catch {
      console.error("Error updating status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setTrackingNumber(order.trackingNumber || "");
    setTrackingCarrier(order.trackingCarrier || "");
    setEditMode(false);
  };

  const enterEditMode = () => {
    if (!selectedOrder) return;
    setEditName(selectedOrder.customerName);
    setEditEmail(selectedOrder.customerEmail);
    setEditPhone(selectedOrder.customerPhone || "");
    setEditAddress(selectedOrder.shippingAddress || "");
    setEditSource(selectedOrder.source || "website");
    setEditNotes(selectedOrder.notes || "");
    setEditItems(selectedOrder.items.map((i) => ({ ...i })));
    setEditMode(true);
  };

  const editItemQuantity = (itemId: number, newQty: number) => {
    if (newQty < 1) return;
    setEditItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity: newQty } : i)));
  };

  const removeEditItem = (itemId: number) => {
    setEditItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const editSubtotal = editItems.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);
  const editDiscount = selectedOrder?.discountAmount ? parseFloat(selectedOrder.discountAmount) : 0;
  const editTotal = Math.max(0, editSubtotal - editDiscount);

  const handleSaveEdit = async () => {
    if (!selectedOrder) return;
    if (editItems.length === 0) {
      alert("Order must have at least one item.");
      return;
    }
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: editName,
          customerEmail: editEmail,
          customerPhone: editPhone,
          shippingAddress: editAddress,
          source: editSource,
          notes: editNotes,
          items: editItems.map((i) => ({ id: i.id, quantity: i.quantity, price: i.price })),
        }),
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        const merged = { ...selectedOrder, ...updatedOrder };
        setSelectedOrder(merged);
        setOrders((prev) => prev.map((o) => (o.id === selectedOrder.id ? merged : o)));
        setEditMode(false);
      }
    } catch {
      console.error("Error saving order edits");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    setSavingTracking(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber, trackingCarrier }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? { ...o, trackingNumber, trackingCarrier } : o))
        );
        setSelectedOrder((prev) => prev ? { ...prev, trackingNumber, trackingCarrier } : null);
      }
    } catch {
      console.error("Error saving tracking info");
    } finally {
      setSavingTracking(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    if (!confirm(`Delete order ${selectedOrder.orderId}? This cannot be undone.`)) return;
    setDeletingOrder(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, { method: "DELETE" });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== selectedOrder.id));
        setTotal((t) => t - 1);
        setSelectedOrder(null);
      }
    } catch {
      console.error("Error deleting order");
    } finally {
      setDeletingOrder(false);
    }
  };

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (paymentFilter) params.set("paymentStatus", paymentFilter);
    if (orderFilter) params.set("orderStatus", orderFilter);
    if (sourceFilter) params.set("source", sourceFilter);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    const res = await fetch(`/api/admin/orders/export?${params.toString()}`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch("");
    setPaymentFilter("");
    setOrderFilter("");
    setSourceFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const newOrderTotal = newOrderItems.reduce(
    (sum, i) => sum + (parseFloat(i.price) || 0) * (i.quantity || 1),
    0
  );

  const handleCreateOrder = async () => {
    setCreateError("");
    if (!newOrderForm.customerName.trim() || !newOrderForm.customerEmail.trim()) {
      setCreateError("Customer name and email are required.");
      return;
    }
    const validItems = newOrderItems.filter((i) => i.productName.trim() && parseFloat(i.price) > 0);
    if (validItems.length === 0) {
      setCreateError("Add at least one item with a name and price.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newOrderForm, items: validItems }),
      });
      if (res.ok) {
        const created = await res.json();
        setOrders((prev) => [created, ...prev]);
        setTotal((t) => t + 1);
        setShowCreateModal(false);
        setNewOrderForm({
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          shippingAddress: "",
          paymentStatus: "paid",
          orderStatus: "confirmed",
          paymentMethod: "",
          source: "instagram",
          notes: "",
        });
        setNewOrderItems([emptyNewItem()]);
      } else {
        const err = await res.json();
        setCreateError(err.error || "Failed to create order.");
      }
    } catch {
      setCreateError("Failed to create order.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-[#1A1A1A]">Orders</h1>
          <p className="text-sm text-[#757575] mt-1">
            {total} total order{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#5C4B3D] text-white text-sm font-medium rounded-lg hover:bg-[#4A3D31] transition-colors"
          >
            <Plus size={16} />
            Add Order
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#E8E4DE] text-sm font-medium rounded-lg hover:bg-[#F5F2ED] transition-colors text-[#757575]"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8E4DE] p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757575]" />
            <input
              type="text"
              placeholder="Search by order ID, name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-9 pr-3 py-2 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white"
            />
          </div>

          <select
            value={sourceFilter}
            onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white"
          >
            <option value="">All Sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>{sourceLabels[s]}</option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white"
          >
            <option value="">All Payments</option>
            {paymentStatuses.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>

          <select
            value={orderFilter}
            onChange={(e) => { setOrderFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white"
          >
            <option value="">All Statuses</option>
            {orderStatuses.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex gap-3 flex-1">
            <div className="flex-1">
              <label className="block text-xs text-[#757575] mb-1">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-[#757575] mb-1">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5C4B3D] text-white text-sm font-medium rounded-lg hover:bg-[#4A3D31] transition-colors"
            >
              <Filter size={14} />
              Apply
            </button>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#E8E4DE] text-sm font-medium rounded-lg hover:bg-[#F5F2ED] transition-colors text-[#757575]"
            >
              <RefreshCw size={14} />
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8E4DE] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FAF9F6] border-b border-[#E8E4DE]">
                <th className="text-left px-4 py-3 font-medium text-[#757575]">Order ID</th>
                <th className="text-left px-4 py-3 font-medium text-[#757575]">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-[#757575] hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-[#757575] hidden lg:table-cell">Source</th>
                <th className="text-right px-4 py-3 font-medium text-[#757575]">Total</th>
                <th className="text-center px-4 py-3 font-medium text-[#757575]">Payment</th>
                <th className="text-center px-4 py-3 font-medium text-[#757575]">Status</th>
                <th className="text-left px-4 py-3 font-medium text-[#757575] hidden lg:table-cell">Date</th>
                <th className="text-center px-4 py-3 font-medium text-[#757575]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-[#757575]">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-[#757575]">
                    <Package size={32} className="mx-auto mb-2 text-[#C4B5A5]" />
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#E8E4DE] last:border-0 hover:bg-[#FAF9F6] transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{order.orderId}</td>
                    <td className="px-4 py-3">{order.customerName}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-[#757575]">{order.customerEmail}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sourceColors[order.source] || "bg-gray-50 text-gray-600"}`}>
                        {sourceLabels[order.source] || order.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      Rs. {parseFloat(order.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => handleStatusChange(order.id, "paymentStatus", e.target.value)}
                        disabled={updatingStatus === order.id}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 ${paymentStatusColors[order.paymentStatus] || "bg-gray-100 text-gray-800"}`}
                      >
                        {paymentStatuses.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order.id, "orderStatus", e.target.value)}
                        disabled={updatingStatus === order.id}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 ${orderStatusColors[order.orderStatus] || "bg-gray-100 text-gray-800"}`}
                      >
                        {orderStatuses.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-[#757575] text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openOrderDetail(order)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#5C4B3D] hover:bg-[#F5F2ED] rounded transition-colors"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <a
                          href={`/api/orders/${order.orderId}/invoice`}
                          download
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#757575] hover:text-[#5C4B3D] hover:bg-[#F5F2ED] rounded transition-colors"
                          title="Download Invoice PDF"
                        >
                          <FileDown size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E8E4DE]">
            <p className="text-xs text-[#757575]">
              Page {page} of {totalPages} ({total} orders)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-[#E8E4DE] rounded-lg hover:bg-[#F5F2ED] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-[#E8E4DE] rounded-lg hover:bg-[#F5F2ED] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DE] sticky top-0 bg-white rounded-t-xl">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-serif font-semibold text-[#1A1A1A]">
                  Order {selectedOrder.orderId}
                </h2>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sourceColors[selectedOrder.source] || "bg-gray-50 text-gray-600"}`}>
                  {sourceLabels[selectedOrder.source] || selectedOrder.source}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!editMode ? (
                  <>
                    <button
                      onClick={enterEditMode}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#5C4B3D] border border-[#E8E4DE] rounded-lg hover:bg-[#F5F2ED] transition-colors"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteOrder}
                      disabled={deletingOrder}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
                    >
                      <Trash2 size={14} />
                      {deletingOrder ? "Deleting..." : "Delete"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      disabled={savingEdit}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#5C4B3D] rounded-lg hover:bg-[#4A3D31] transition-colors disabled:opacity-60"
                    >
                      <Save size={14} />
                      {savingEdit ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditMode(false)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#757575] border border-[#E8E4DE] rounded-lg hover:bg-[#F5F2ED] transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 text-[#757575] hover:text-[#1A1A1A] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#757575] mb-1">Customer</p>
                  {editMode ? (
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white" />
                  ) : (
                    <p className="text-sm font-medium">{selectedOrder.customerName}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-[#757575] mb-1">Email</p>
                  {editMode ? (
                    <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white" />
                  ) : (
                    <p className="text-sm">{selectedOrder.customerEmail}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-[#757575] mb-1">Phone</p>
                  {editMode ? (
                    <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white" />
                  ) : (
                    <p className="text-sm">{selectedOrder.customerPhone || "—"}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-[#757575] mb-1">Payment Method</p>
                  <p className="text-sm">{selectedOrder.paymentMethod || "—"}</p>
                </div>
                {selectedOrder.razorpayPaymentId && (
                  <div>
                    <p className="text-xs text-[#757575] mb-1">Razorpay Payment ID</p>
                    <p className="text-sm font-mono text-[#5C4B3D]">{selectedOrder.razorpayPaymentId}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-[#757575] mb-1">Payment Status</p>
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(e) => handleStatusChange(selectedOrder.id, "paymentStatus", e.target.value)}
                    disabled={updatingStatus === selectedOrder.id}
                    className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 ${paymentStatusColors[selectedOrder.paymentStatus] || "bg-gray-100 text-gray-800"}`}
                  >
                    {paymentStatuses.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-xs text-[#757575] mb-1">Order Status</p>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleStatusChange(selectedOrder.id, "orderStatus", e.target.value)}
                    disabled={updatingStatus === selectedOrder.id}
                    className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 ${orderStatusColors[selectedOrder.orderStatus] || "bg-gray-100 text-gray-800"}`}
                  >
                    {orderStatuses.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-xs text-[#757575] mb-1">Source</p>
                  {editMode ? (
                    <select
                      value={editSource}
                      onChange={(e) => setEditSource(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white"
                    >
                      {sources.map((s) => (
                        <option key={s} value={s}>{sourceLabels[s]}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sourceColors[selectedOrder.source] || "bg-gray-50 text-gray-600"}`}>
                      {sourceLabels[selectedOrder.source] || selectedOrder.source}
                    </span>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[#757575] mb-1">Shipping Address</p>
                  {editMode ? (
                    <textarea value={editAddress} onChange={(e) => setEditAddress(e.target.value)} rows={3} className="w-full px-3 py-1.5 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white resize-none" />
                  ) : (
                    <p className="text-sm">{selectedOrder.shippingAddress || "—"}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[#757575] mb-1">Notes</p>
                  {editMode ? (
                    <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2} placeholder="Internal notes about this order..." className="w-full px-3 py-1.5 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white resize-none" />
                  ) : (
                    <p className="text-sm text-[#757575]">{selectedOrder.notes || "—"}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-[#757575] mb-1">Date</p>
                  <p className="text-sm">
                    {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {selectedOrder.couponCode && (
                  <div>
                    <p className="text-xs text-[#757575] mb-1">Coupon</p>
                    <p className="text-sm font-mono">{selectedOrder.couponCode} (-Rs. {parseFloat(selectedOrder.discountAmount || "0").toLocaleString()})</p>
                  </div>
                )}
              </div>

              {(selectedOrder.orderStatus === "shipped" || selectedOrder.orderStatus === "delivered" || selectedOrder.trackingNumber) && (
                <div className="p-4 bg-[#FAF9F6] border border-[#E8E4DE] rounded-lg space-y-3">
                  <h3 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
                    <Truck size={16} />
                    Shipping & Tracking
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#757575] mb-1">Tracking Number</label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="e.g. AWB123456789"
                        className="w-full px-3 py-2 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#757575] mb-1">Carrier</label>
                      <input
                        type="text"
                        value={trackingCarrier}
                        onChange={(e) => setTrackingCarrier(e.target.value)}
                        placeholder="e.g. Delhivery, BlueDart"
                        className="w-full px-3 py-2 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSaveTracking}
                    disabled={savingTracking}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#5C4B3D] text-white text-xs font-medium rounded-lg hover:bg-[#4A3D31] transition-colors disabled:opacity-60"
                  >
                    {savingTracking ? "Saving..." : "Save Tracking Info"}
                  </button>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Order Items</h3>
                <div className="border border-[#E8E4DE] rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#FAF9F6] border-b border-[#E8E4DE]">
                        <th className="text-left px-4 py-2 text-xs font-medium text-[#757575]">Product</th>
                        <th className="text-center px-4 py-2 text-xs font-medium text-[#757575]">Qty</th>
                        <th className="text-right px-4 py-2 text-xs font-medium text-[#757575]">Price</th>
                        <th className="text-right px-4 py-2 text-xs font-medium text-[#757575]">Subtotal</th>
                        {editMode && <th className="text-center px-4 py-2 text-xs font-medium text-[#757575]">Remove</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {editMode ? (
                        editItems.map((item) => (
                          <tr key={item.id} className="border-b border-[#E8E4DE] last:border-0">
                            <td className="px-4 py-2.5 flex items-center gap-3">
                              {item.image && (
                                <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded" />
                              )}
                              <span className="text-sm">{item.productName}</span>
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => editItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                className="w-16 px-2 py-1 text-sm text-center border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white"
                              />
                            </td>
                            <td className="px-4 py-2.5 text-right">Rs. {parseFloat(item.price).toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-right font-medium">
                              Rs. {(parseFloat(item.price) * item.quantity).toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <button
                                onClick={() => removeEditItem(item.id)}
                                disabled={editItems.length <= 1}
                                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Remove item"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        selectedOrder.items.map((item) => (
                          <tr key={item.id} className="border-b border-[#E8E4DE] last:border-0">
                            <td className="px-4 py-2.5 flex items-center gap-3">
                              {item.image && (
                                <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded" />
                              )}
                              <span className="text-sm">{item.productName}</span>
                            </td>
                            <td className="px-4 py-2.5 text-center">{item.quantity}</td>
                            <td className="px-4 py-2.5 text-right">Rs. {parseFloat(item.price).toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-right font-medium">
                              Rs. {(parseFloat(item.price) * item.quantity).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div className="flex gap-2">
                  <a
                    href={`/api/orders/${selectedOrder.orderId}/invoice`}
                    download
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-[#E8E4DE] text-[#1A1A1A] rounded-sm hover:border-[#5C4B3D] transition-colors"
                  >
                    <FileDown size={14} />
                    Download PDF
                  </a>
                  <a
                    href={`/letsgetsuccessin2026/invoice/${selectedOrder.orderId}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#5C4B3D] text-white rounded-sm hover:bg-[#4A3C31] transition-colors"
                  >
                    <Eye size={14} />
                    View Invoice
                  </a>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#757575]">Total</p>
                  {editMode ? (
                    <p className="text-lg font-semibold text-[#1A1A1A]">Rs. {editTotal.toLocaleString()}</p>
                  ) : (
                    <p className="text-lg font-semibold text-[#1A1A1A]">Rs. {parseFloat(selectedOrder.totalAmount).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DE] sticky top-0 bg-white rounded-t-xl">
              <h2 className="text-lg font-serif font-semibold text-[#1A1A1A]">Add Outside Order</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-[#757575] hover:text-[#1A1A1A] transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Order Source</h3>
                <div className="grid grid-cols-5 gap-2">
                  {sources.map((s) => (
                    <button
                      key={s}
                      onClick={() => setNewOrderForm((f) => ({ ...f, source: s }))}
                      className={`flex flex-col items-center gap-1 px-2 py-3 rounded-lg border text-xs font-medium transition-colors ${
                        newOrderForm.source === s
                          ? "border-[#5C4B3D] bg-[#FAF9F6] text-[#5C4B3D]"
                          : "border-[#E8E4DE] text-[#757575] hover:border-[#5C4B3D]/40"
                      }`}
                    >
                      {s === "instagram" && <Instagram size={16} />}
                      {s === "whatsapp" && <MessageCircle size={16} />}
                      {s === "website" && <ShoppingBag size={16} />}
                      {s === "offline" && <Store size={16} />}
                      {s === "other" && <MoreHorizontal size={16} />}
                      {sourceLabels[s]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Customer Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[#757575] mb-1">Name *</label>
                    <input
                      type="text"
                      value={newOrderForm.customerName}
                      onChange={(e) => setNewOrderForm((f) => ({ ...f, customerName: e.target.value }))}
                      placeholder="Customer name"
                      className="w-full px-3 py-2 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#757575] mb-1">Email *</label>
                    <input
                      type="email"
                      value={newOrderForm.customerEmail}
                      onChange={(e) => setNewOrderForm((f) => ({ ...f, customerEmail: e.target.value }))}
                      placeholder="customer@email.com"
                      className="w-full px-3 py-2 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#757575] mb-1">Phone</label>
                    <input
                      type="text"
                      value={newOrderForm.customerPhone}
                      onChange={(e) => setNewOrderForm((f) => ({ ...f, customerPhone: e.target.value }))}
                      placeholder="+91 9999999999"
                      className="w-full px-3 py-2 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#757575] mb-1">Payment Method</label>
                    <input
                      type="text"
                      value={newOrderForm.paymentMethod}
                      onChange={(e) => setNewOrderForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                      placeholder="UPI, Cash, Bank Transfer..."
                      className="w-full px-3 py-2 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-[#757575] mb-1">Shipping Address</label>
                    <textarea
                      value={newOrderForm.shippingAddress}
                      onChange={(e) => setNewOrderForm((f) => ({ ...f, shippingAddress: e.target.value }))}
                      rows={2}
                      placeholder="Full delivery address"
                      className="w-full px-3 py-2 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white resize-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Order Items</h3>
                <div className="space-y-2">
                  {newOrderItems.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={item.productName}
                          onChange={(e) => setNewOrderItems((prev) => prev.map((i, j) => j === idx ? { ...i, productName: e.target.value } : i))}
                          placeholder="Product name"
                          className="w-full px-3 py-2 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => setNewOrderItems((prev) => prev.map((i, j) => j === idx ? { ...i, quantity: parseInt(e.target.value) || 1 } : i))}
                          placeholder="Qty"
                          className="w-full px-3 py-2 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="number"
                          min={0}
                          value={item.price}
                          onChange={(e) => setNewOrderItems((prev) => prev.map((i, j) => j === idx ? { ...i, price: e.target.value } : i))}
                          placeholder="Price (Rs.)"
                          className="w-full px-3 py-2 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => setNewOrderItems((prev) => prev.filter((_, j) => j !== idx))}
                          disabled={newOrderItems.length <= 1}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setNewOrderItems((prev) => [...prev, emptyNewItem()])}
                    className="inline-flex items-center gap-1.5 text-xs text-[#5C4B3D] hover:text-[#4A3D31] font-medium mt-1"
                  >
                    <Plus size={14} />
                    Add Item
                  </button>
                </div>
                {newOrderTotal > 0 && (
                  <div className="mt-3 text-right text-sm font-semibold text-[#1A1A1A]">
                    Total: Rs. {newOrderTotal.toLocaleString()}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#757575] mb-1">Payment Status</label>
                  <select
                    value={newOrderForm.paymentStatus}
                    onChange={(e) => setNewOrderForm((f) => ({ ...f, paymentStatus: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white"
                  >
                    {paymentStatuses.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#757575] mb-1">Order Status</label>
                  <select
                    value={newOrderForm.orderStatus}
                    onChange={(e) => setNewOrderForm((f) => ({ ...f, orderStatus: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white"
                  >
                    {orderStatuses.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-[#757575] mb-1">Notes (internal)</label>
                  <textarea
                    value={newOrderForm.notes}
                    onChange={(e) => setNewOrderForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    placeholder="e.g. Customer DM'd on Instagram, paid via UPI screenshot"
                    className="w-full px-3 py-2 text-sm border border-[#E8E4DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 focus:border-[#5C4B3D] bg-white resize-none"
                  />
                </div>
              </div>

              {createError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{createError}</p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm border border-[#E8E4DE] rounded-lg hover:bg-[#F5F2ED] transition-colors text-[#757575]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={creating}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-[#5C4B3D] text-white text-sm font-medium rounded-lg hover:bg-[#4A3D31] transition-colors disabled:opacity-60"
                >
                  <Plus size={16} />
                  {creating ? "Creating..." : "Create Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
