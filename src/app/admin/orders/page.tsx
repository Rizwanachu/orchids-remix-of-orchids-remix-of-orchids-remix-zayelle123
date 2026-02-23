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
  couponCode: string | null;
  discountAmount: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
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

const orderStatuses = ["processing", "confirmed", "packed", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["paid", "unpaid", "failed", "refunded"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [orderFilter, setOrderFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

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
  }, [page, limit, search, paymentFilter, orderFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = () => {
    setPage(1);
    fetchOrders();
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, orderStatus: newStatus } : null);
        }
      }
    } catch {
      console.error("Error updating status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleExport = async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (paymentFilter) params.set("paymentStatus", paymentFilter);
    if (orderFilter) params.set("orderStatus", orderFilter);
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
    setDateFrom("");
    setDateTo("");
    setPage(1);
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
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#5C4B3D] text-white text-sm font-medium rounded-lg hover:bg-[#4A3D31] transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
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
                  <td colSpan={8} className="text-center py-12 text-[#757575]">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#757575]">
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
                    <td className="px-4 py-3 text-right font-medium">
                      Rs. {parseFloat(order.totalAmount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[order.paymentStatus] || "bg-gray-100 text-gray-800"}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingStatus === order.id}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 ${orderStatusColors[order.orderStatus] || "bg-gray-100 text-gray-800"}`}
                      >
                        {orderStatuses.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-[#757575] text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#5C4B3D] hover:bg-[#F5F2ED] rounded transition-colors"
                      >
                        <Eye size={14} />
                        View
                      </button>
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
              <h2 className="text-lg font-serif font-semibold text-[#1A1A1A]">
                Order {selectedOrder.orderId}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-[#757575] hover:text-[#1A1A1A] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#757575] mb-1">Customer</p>
                  <p className="text-sm font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-[#757575] mb-1">Email</p>
                  <p className="text-sm">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-[#757575] mb-1">Phone</p>
                  <p className="text-sm">{selectedOrder.customerPhone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#757575] mb-1">Payment Method</p>
                  <p className="text-sm">{selectedOrder.paymentMethod || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#757575] mb-1">Payment Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[selectedOrder.paymentStatus] || "bg-gray-100 text-gray-800"}`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-[#757575] mb-1">Order Status</p>
                  <select
                    value={selectedOrder.orderStatus}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    disabled={updatingStatus === selectedOrder.id}
                    className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#5C4B3D]/20 ${orderStatusColors[selectedOrder.orderStatus] || "bg-gray-100 text-gray-800"}`}
                  >
                    {orderStatuses.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[#757575] mb-1">Shipping Address</p>
                  <p className="text-sm">{selectedOrder.shippingAddress || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-[#757575] mb-1">Date</p>
                  <p className="text-sm">
                    {new Date(selectedOrder.createdAt).toLocaleDateString("en-PK", {
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
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item) => (
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-[#757575]">Total</p>
                  <p className="text-xl font-serif font-semibold text-[#1A1A1A]">
                    Rs. {parseFloat(selectedOrder.totalAmount).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
