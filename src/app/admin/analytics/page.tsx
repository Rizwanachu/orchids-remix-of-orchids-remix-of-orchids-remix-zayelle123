"use client";

import { useState, useEffect } from "react";
import { DollarSign, ShoppingCart, TrendingUp, Crown } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  dailySales: { date: string; revenue: string; orders: number }[];
  monthlySales: { month: string; revenue: string; orders: number }[];
  bestSellingProducts: {
    productName: string;
    totalQuantity: number;
    totalRevenue: string;
  }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C4B3D]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-red-600">Failed to load analytics data.</p>
      </div>
    );
  }

  const dailyChartData = data.dailySales.map((d) => ({
    date: d.date.slice(5),
    revenue: parseFloat(d.revenue),
    orders: d.orders,
  }));

  const monthlyChartData = data.monthlySales.map((d) => ({
    month: d.month,
    revenue: parseFloat(d.revenue),
    orders: d.orders,
  }));

  const stats = [
    {
      label: "Total Revenue",
      value: `Rs. ${data.totalRevenue.toLocaleString("en-PK", { minimumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Total Orders",
      value: data.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Avg Order Value",
      value: `Rs. ${data.averageOrderValue.toLocaleString("en-PK", { minimumFractionDigits: 0 })}`,
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-[#1A1A1A]">Analytics</h1>
        <p className="text-sm text-[#757575] mt-1">Sales performance overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-[#E8E4DE] p-5 flex items-start gap-4"
          >
            <div className={`p-2.5 rounded-lg ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[12px] font-medium text-[#757575] uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="text-xl font-semibold text-[#1A1A1A] mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-[#E8E4DE] p-5">
          <h2 className="text-base font-serif font-semibold text-[#1A1A1A] mb-4">
            Daily Sales (Last 7 Days)
          </h2>
          {dailyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DE" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#757575" />
                <YAxis tick={{ fontSize: 12 }} stroke="#757575" />
                <Tooltip
                  formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, "Revenue"]}
                  contentStyle={{
                    border: "1px solid #E8E4DE",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="revenue" fill="#5C4B3D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-[#757575] text-sm">
              No sales data for the last 7 days
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#E8E4DE] p-5">
          <h2 className="text-base font-serif font-semibold text-[#1A1A1A] mb-4">
            Monthly Sales (Last 12 Months)
          </h2>
          {monthlyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DE" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#757575" />
                <YAxis tick={{ fontSize: 12 }} stroke="#757575" />
                <Tooltip
                  formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, "Revenue"]}
                  contentStyle={{
                    border: "1px solid #E8E4DE",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#5C4B3D"
                  fill="#5C4B3D"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-[#757575] text-sm">
              No monthly sales data
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8E4DE] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Crown size={18} className="text-[#5C4B3D]" />
          <h2 className="text-base font-serif font-semibold text-[#1A1A1A]">
            Best Selling Products
          </h2>
        </div>
        {data.bestSellingProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8E4DE]">
                  <th className="text-left py-3 px-3 text-[12px] font-medium text-[#757575] uppercase tracking-wide">
                    #
                  </th>
                  <th className="text-left py-3 px-3 text-[12px] font-medium text-[#757575] uppercase tracking-wide">
                    Product
                  </th>
                  <th className="text-right py-3 px-3 text-[12px] font-medium text-[#757575] uppercase tracking-wide">
                    Qty Sold
                  </th>
                  <th className="text-right py-3 px-3 text-[12px] font-medium text-[#757575] uppercase tracking-wide">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.bestSellingProducts.map((product, i) => (
                  <tr key={product.productName} className="border-b border-[#F5F2ED] last:border-0">
                    <td className="py-3 px-3 text-[#757575]">{i + 1}</td>
                    <td className="py-3 px-3 font-medium text-[#1A1A1A]">{product.productName}</td>
                    <td className="py-3 px-3 text-right text-[#1A1A1A]">{product.totalQuantity}</td>
                    <td className="py-3 px-3 text-right text-[#1A1A1A]">
                      Rs. {parseFloat(product.totalRevenue).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[#757575] py-8 text-center">No product sales data yet</p>
        )}
      </div>
    </div>
  );
}
