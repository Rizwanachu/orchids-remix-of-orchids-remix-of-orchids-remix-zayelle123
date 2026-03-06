"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Users, ChevronLeft, ChevronRight, Pencil, Trash2, X, ShoppingBag, Eye } from "lucide-react";

interface Customer {
  userId: number | null;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
  totalOrders: number;
  totalSpend: string;
  lastOrderDate: string | null;
  hasAccount: boolean;
}

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: string;
  image: string | null;
}

interface OrderRecord {
  id: number;
  orderId: string;
  totalAmount: string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", address: "" });
  const [editSaving, setEditSaving] = useState(false);

  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

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

  const openEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setEditForm({
      name: customer.name,
      phone: customer.phone || "",
      address: customer.address || "",
    });
  };

  const saveEdit = async () => {
    if (!editCustomer?.userId) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/admin/customers/${editCustomer.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditCustomer(null);
        fetchCustomers();
      }
    } catch (err) {
      console.error("Error saving customer:", err);
    } finally {
      setEditSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteCustomer?.userId) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${deleteCustomer.userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteCustomer(null);
        fetchCustomers();
      }
    } catch (err) {
      console.error("Error deleting customer:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const viewOrderHistory = async (customer: Customer) => {
    if (!customer.userId) return;
    setViewCustomer(customer);
    setOrdersLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${customer.userId}`);
      if (res.ok) {
        const data = await res.json();
        setCustomerOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Error fetching order history:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      processing: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      packed: "bg-indigo-100 text-indigo-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      paid: "bg-green-100 text-green-800",
      unpaid: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

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
          <div className="hidden md:grid grid-cols-[1fr_1fr_100px_120px_140px_120px] gap-4 px-6 py-3 border-b border-[#E8E4DE] bg-[#FAFAF8]">
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Name</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Email</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Orders</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Total Spend</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Last Order</span>
            <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">Actions</span>
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
                key={customer.email}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_100px_120px_140px_120px] gap-2 md:gap-4 px-6 py-4 border-b border-[#F5F2ED] last:border-b-0 hover:bg-[#FAFAF8] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-medium text-[#1A1A1A]">{customer.name}</p>
                    {customer.hasAccount && (
                      <span className="text-[10px] bg-[#E8F5E9] text-[#2E7D32] px-1.5 py-0.5 rounded-sm font-medium">Account</span>
                    )}
                  </div>
                  <p className="md:hidden text-[12px] text-[#757575]">{customer.email}</p>
                  {customer.phone && <p className="md:hidden text-[12px] text-[#757575]">{customer.phone}</p>}
                </div>
                <p className="hidden md:block text-[13px] text-[#757575]">{customer.email}</p>
                <p className="text-[13px] text-[#1A1A1A]">{customer.totalOrders}</p>
                <p className="text-[13px] font-semibold text-[#1A1A1A]">
                  ₹{parseFloat(customer.totalSpend).toLocaleString("en-IN")}
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
                <div className="flex items-center gap-1">
                  {customer.hasAccount && customer.userId && (
                    <>
                      <button
                        onClick={() => viewOrderHistory(customer)}
                        className="p-1.5 rounded hover:bg-[#F5F2ED] transition-colors"
                        title="View Order History"
                      >
                        <Eye size={14} className="text-[#757575]" />
                      </button>
                      <button
                        onClick={() => openEdit(customer)}
                        className="p-1.5 rounded hover:bg-[#F5F2ED] transition-colors"
                        title="Edit Customer"
                      >
                        <Pencil size={14} className="text-[#757575]" />
                      </button>
                      <button
                        onClick={() => setDeleteCustomer(customer)}
                        className="p-1.5 rounded hover:bg-red-50 transition-colors"
                        title="Delete Customer"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </>
                  )}
                  {!customer.hasAccount && (
                    <span className="text-[11px] text-[#999]">Guest</span>
                  )}
                </div>
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

      {editCustomer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] max-w-[480px] w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[18px] font-serif text-[#1A1A1A]">Edit Customer</h2>
              <button onClick={() => setEditCustomer(null)} className="p-1 hover:bg-[#F5F2ED] rounded">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#757575] mb-1">Email</label>
                <p className="text-[13px] text-[#999] bg-[#F5F2ED] px-3 py-2 rounded-sm">{editCustomer.email}</p>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#757575] mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full h-[40px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#757575] mb-1">Phone</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full h-[40px] px-3 border border-[#E8E4DE] rounded-sm text-[13px] focus:outline-none focus:border-[#5C4B3D]"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#757575] mb-1">Address</label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#E8E4DE] rounded-sm text-[13px] focus:outline-none focus:border-[#5C4B3D] resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditCustomer(null)}
                className="px-4 py-2 border border-[#E8E4DE] rounded-sm text-[13px] hover:border-[#5C4B3D] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={editSaving || !editForm.name.trim()}
                className="px-4 py-2 bg-[#1A1A1A] text-white rounded-sm text-[13px] hover:bg-[#333] transition-colors disabled:opacity-40"
              >
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteCustomer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] max-w-[400px] w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-serif text-[#1A1A1A]">Delete Customer</h2>
              <button onClick={() => setDeleteCustomer(null)} className="p-1 hover:bg-[#F5F2ED] rounded">
                <X size={18} />
              </button>
            </div>
            <p className="text-[14px] text-[#757575] mb-2">
              Are you sure you want to delete this customer account?
            </p>
            <div className="bg-[#FFF3F3] border border-red-200 rounded-sm p-3 mb-4">
              <p className="text-[13px] font-medium text-[#1A1A1A]">{deleteCustomer.name}</p>
              <p className="text-[12px] text-[#757575]">{deleteCustomer.email}</p>
            </div>
            <p className="text-[12px] text-[#999] mb-6">
              This will permanently remove the user account. Order history will be preserved.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteCustomer(null)}
                className="px-4 py-2 border border-[#E8E4DE] rounded-sm text-[13px] hover:border-[#5C4B3D] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-sm text-[13px] hover:bg-red-700 transition-colors disabled:opacity-40"
              >
                {deleteLoading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewCustomer && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] max-w-[640px] w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-[#E8E4DE]">
              <div>
                <h2 className="text-[18px] font-serif text-[#1A1A1A]">{viewCustomer.name}</h2>
                <p className="text-[13px] text-[#757575]">{viewCustomer.email}</p>
              </div>
              <button onClick={() => setViewCustomer(null)} className="p-1 hover:bg-[#F5F2ED] rounded">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              {ordersLoading ? (
                <p className="text-center text-[14px] text-[#757575] py-8">Loading orders...</p>
              ) : customerOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag size={32} className="text-[#D4C8BE] mx-auto mb-2" />
                  <p className="text-[14px] text-[#757575]">No orders found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-[13px] text-[#757575]">{customerOrders.length} order(s)</p>
                  {customerOrders.map((order) => (
                    <div key={order.id} className="border border-[#E8E4DE] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-[14px] font-medium text-[#1A1A1A]">#{order.orderId}</p>
                          <p className="text-[12px] text-[#757575]">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(order.orderStatus)}`}>
                            {order.orderStatus}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(order.paymentStatus)}`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-[13px]">
                            <span className="text-[#1A1A1A]">
                              {item.productName} × {item.quantity}
                            </span>
                            <span className="text-[#757575]">₹{parseFloat(item.price).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-2 border-t border-[#F5F2ED] flex justify-end">
                        <p className="text-[14px] font-semibold text-[#1A1A1A]">
                          Total: ₹{parseFloat(order.totalAmount).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
