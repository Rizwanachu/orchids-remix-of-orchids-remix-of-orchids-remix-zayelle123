"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Package, ChevronRight, FileDown, Loader2, Truck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface DbOrderItem {
  id: number;
  orderId: number;
  productName: string;
  productHandle: string | null;
  quantity: number;
  price: string;
  image: string | null;
}

interface DbOrder {
  id: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: string | null;
  totalAmount: string;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string | null;
  trackingNumber: string | null;
  trackingCarrier: string | null;
  couponCode: string | null;
  discountAmount: string | null;
  createdAt: string;
  updatedAt: string;
  items: DbOrderItem[];
}

function statusStyle(status: string) {
  switch (status) {
    case "delivered":
      return "text-green-600 bg-green-50";
    case "shipped":
      return "text-blue-600 bg-blue-50";
    case "packed":
      return "text-amber-600 bg-amber-50";
    case "confirmed":
      return "text-purple-600 bg-purple-50";
    case "cancelled":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MyOrdersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/account/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user?.email) return;

    setLoadingOrders(true);
    setError(null);

    fetch(`/api/orders?email=${encodeURIComponent(user.email)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then((data) => {
        setOrders(data.orders || []);
      })
      .catch((err) => {
        setError(err.message || "Failed to load orders");
      })
      .finally(() => {
        setLoadingOrders(false);
      });
  }, [user?.email]);

  if (isLoading || !user) {
    return null;
  }

  const totalItems = (items: DbOrderItem[]) =>
    items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-10 md:py-14">
          <div className="container px-4 md:px-8">
            <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
              My Orders
            </h1>
            <nav className="mt-2 text-[13px] text-[#757575]">
              <a href="/account" className="hover:text-[#1A1A1A] transition-colors">Account</a>
              <span className="mx-2">&gt;</span>
              <span className="text-[#1A1A1A]">My Orders</span>
            </nav>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-16 max-w-[800px] mx-auto">
          {loadingOrders ? (
            <div className="text-center py-16">
              <Loader2 size={32} className="text-[#5C4B3D] mx-auto mb-4 animate-spin" />
              <p className="text-[14px] text-[#757575]">Loading your orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-[14px] text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center bg-[#5C4B3D] text-white px-6 py-2.5 rounded-sm font-medium text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-[#E8E4DE] rounded-[12px] p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[15px] font-semibold text-[#1A1A1A]">{order.orderId}</p>
                      <p className="text-[13px] text-[#757575]">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`text-[12px] font-medium px-3 py-1 rounded-full ${statusStyle(order.orderStatus)}`}>
                      {formatStatus(order.orderStatus)}
                    </span>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 text-[13px] text-[#757575]">
                          {item.image && (
                            <img src={item.image} alt={item.productName} className="w-10 h-10 object-cover rounded" />
                          )}
                          <span className="flex-1 truncate">{item.productName}</span>
                          <span>x{item.quantity}</span>
                          <span className="text-[#1A1A1A]">Rs. {Number(item.price).toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {order.trackingNumber && (
                    <div className="flex items-center gap-2 text-[13px] text-[#757575] mb-3 bg-blue-50 px-3 py-2 rounded">
                      <Truck size={14} className="text-blue-600" />
                      <span>Tracking: {order.trackingNumber}</span>
                      {order.trackingCarrier && (
                        <span className="text-[#1A1A1A] font-medium">({order.trackingCarrier})</span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-[#F5F2ED]">
                    <div className="flex items-center gap-2 text-[14px] text-[#757575]">
                      <Package size={16} />
                      <span>{totalItems(order.items || [])} item{totalItems(order.items || []) > 1 ? "s" : ""}</span>
                      <span className="mx-1">|</span>
                      <span className="font-medium text-[#1A1A1A]">Rs. {Number(order.totalAmount).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <a href={`/api/orders/${order.orderId}/invoice?email=${encodeURIComponent(user.email)}`} download className="flex items-center gap-1 text-[13px] text-[#757575] hover:text-[#5C4B3D] transition-colors">
                        <FileDown size={14} /> Invoice
                      </a>
                      <a href={`/pages/track-order?order=${order.orderId}`} className="flex items-center gap-1 text-[13px] text-[#5C4B3D] hover:underline underline-offset-4">
                        Track <ChevronRight size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package size={48} className="text-[#D4C8BE] mx-auto mb-4" />
              <h2 className="text-[20px] font-serif text-[#1A1A1A] mb-2">No orders yet</h2>
              <p className="text-[14px] text-[#757575] mb-6">Start shopping to see your orders here.</p>
              <a
                href="/collections/all"
                className="inline-flex items-center justify-center bg-[#5C4B3D] text-white px-8 py-3.5 rounded-sm font-medium text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors"
              >
                Shop Now
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
