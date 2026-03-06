"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  ArrowRight,
  BarChart3,
  Package,
  Ticket,
  Loader2,
} from "lucide-react";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

interface Order {
  id: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  totalAmount: string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  processing: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  packed: "bg-purple-100 text-purple-800",
  shipped: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const paymentColors: Record<string, string> = {
  paid: "bg-green-100 text-green-800",
  unpaid: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-600",
};

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [analyticsRes, ordersRes, customersRes] = await Promise.all([
          fetch("/api/letsgetsuccessin2026/analytics"),
          fetch("/api/letsgetsuccessin2026/orders?limit=5"),
          fetch("/api/letsgetsuccessin2026/customers?limit=1"),
        ]);

        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics({
            totalRevenue: data.totalRevenue,
            totalOrders: data.totalOrders,
            averageOrderValue: data.averageOrderValue,
          });
        }

        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setRecentOrders(data.orders || []);
        }

        if (customersRes.ok) {
          const data = await customersRes.json();
          setTotalCustomers(data.total || 0);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 size={24} className="animate-spin text-[#5C4B3D]" />
      </div>
    );
  }

  const statsCards = [
    {
      label: "Total Revenue",
      value: analytics ? formatCurrency(analytics.totalRevenue) : "Rs. 0",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Total Orders",
      value: analytics?.totalOrders?.toString() || "0",
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Avg Order Value",
      value: analytics ? formatCurrency(analytics.averageOrderValue) : "Rs. 0",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Total Customers",
      value: totalCustomers.toString(),
      icon: Users,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  const quickActions = [
    { label: "View All Orders", href: "/letsgetsuccessin2026/orders", icon: ShoppingCart },
    { label: "View Analytics", href: "/letsgetsuccessin2026/analytics", icon: BarChart3 },
    { label: "Manage Products", href: "/letsgetsuccessin2026/products", icon: Package },
    { label: "Manage Coupons", href: "/letsgetsuccessin2026/coupons", icon: Ticket },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="text-[28px] md:text-[32px] font-serif text-[#1A1A1A] tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-[14px] text-[#757575]">
          Welcome back. Here&apos;s an overview of your store.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-[#E8E4DE] rounded-[12px] p-5 flex items-start gap-4"
          >
            <div className={`${card.bg} p-2.5 rounded-lg flex-shrink-0`}>
              <card.icon size={20} className={card.color} />
            </div>
            <div>
              <p className="text-[12px] font-medium text-[#757575] uppercase tracking-wider">
                {card.label}
              </p>
              <p className="text-[22px] font-semibold text-[#1A1A1A] mt-0.5">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E8E4DE] rounded-[12px] overflow-hidden mb-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E4DE]">
          <h2 className="text-[16px] font-serif font-semibold text-[#1A1A1A]">
            Recent Orders
          </h2>
          <Link
            href="/letsgetsuccessin2026/orders"
            className="text-[13px] text-[#5C4B3D] hover:underline flex items-center gap-1"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-[14px] text-[#757575]">
            No orders yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E8E4DE] bg-[#FAFAF8]">
                  <th className="px-6 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-[#757575] uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#E8E4DE] last:border-b-0 hover:bg-[#FAFAF8] transition-colors"
                  >
                    <td className="px-6 py-3.5 text-[13px] font-medium text-[#1A1A1A]">
                      {order.orderId}
                    </td>
                    <td className="px-6 py-3.5 text-[13px] text-[#1A1A1A]">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-3.5 text-[13px] text-[#1A1A1A]">
                      {formatCurrency(parseFloat(order.totalAmount))}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-medium capitalize ${
                          statusColors[order.orderStatus] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[13px] text-[#757575]">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-[16px] font-serif font-semibold text-[#1A1A1A] mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 bg-white border border-[#E8E4DE] rounded-[12px] p-4 hover:border-[#5C4B3D] hover:shadow-sm transition-all group"
            >
              <action.icon
                size={20}
                className="text-[#757575] group-hover:text-[#5C4B3D] transition-colors"
              />
              <span className="text-[13px] font-medium text-[#1A1A1A]">
                {action.label}
              </span>
              <ArrowRight
                size={14}
                className="ml-auto text-[#757575] group-hover:text-[#5C4B3D] transition-colors"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
