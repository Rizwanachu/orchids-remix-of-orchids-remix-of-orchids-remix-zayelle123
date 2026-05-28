"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, Printer, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { getItemConfigLines, parseColorSelections, parseSelectedColor } from "@/lib/order-item-display";

interface OrderItem {
  id: number;
  productName: string;
  productHandle: string;
  quantity: number;
  price: string;
  image: string;
  colorSelections?: string | null;
  selectedColor?: string | null;
  selectedSize?: string | null;
  bundleType?: string | null;
}

interface OrderData {
  id: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: string;
  paymentStatus: string;
  orderStatus: string;
  paymentMethod: string;
  couponCode: string | null;
  discountAmount: string | null;
  createdAt: string;
  items: OrderItem[];
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function InvoiceContent({ order }: { order: OrderData }) {
  const subtotal = order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const discount = order.discountAmount ? Number(order.discountAmount) : 0;
  const total = Number(order.totalAmount);
  const invoiceDate = formatDate(order.createdAt);

  return (
    <div id="invoice-content" className="bg-white max-w-[800px] mx-auto">
      <div className="px-10 py-8">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-[32px] font-serif font-bold text-[#5C4B3D] tracking-tight">ZAYELLE</h1>
            <p className="text-[12px] text-[#757575] mt-1 uppercase tracking-widest">Premium Hijabs & Modest Accessories</p>
          </div>
          <div className="text-right">
            <h2 className="text-[24px] font-semibold text-[#1A1A1A] uppercase tracking-wider">Invoice</h2>
            <p className="text-[13px] text-[#757575] mt-1">#{order.orderId}</p>
          </div>
        </div>

        <div className="w-full h-[2px] bg-[#5C4B3D] mb-8" />

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-[11px] font-semibold text-[#757575] uppercase tracking-widest mb-3">Bill To</h3>
            <p className="text-[15px] font-semibold text-[#1A1A1A]">{order.customerName}</p>
            <p className="text-[13px] text-[#555] mt-1">{order.customerEmail}</p>
            {order.customerPhone && (
              <p className="text-[13px] text-[#555] mt-0.5">{order.customerPhone}</p>
            )}
            {order.shippingAddress && (
              <p className="text-[13px] text-[#555] mt-2 leading-relaxed max-w-[280px]">{order.shippingAddress}</p>
            )}
          </div>
          <div className="text-right">
            <h3 className="text-[11px] font-semibold text-[#757575] uppercase tracking-widest mb-3">Invoice Details</h3>
            <div className="space-y-1.5">
              <div className="flex justify-end gap-6">
                <span className="text-[13px] text-[#757575]">Invoice Date:</span>
                <span className="text-[13px] text-[#1A1A1A] font-medium w-[140px] text-right">{invoiceDate}</span>
              </div>
              <div className="flex justify-end gap-6">
                <span className="text-[13px] text-[#757575]">Order ID:</span>
                <span className="text-[13px] text-[#1A1A1A] font-medium w-[140px] text-right">{order.orderId}</span>
              </div>
              <div className="flex justify-end gap-6">
                <span className="text-[13px] text-[#757575]">Payment:</span>
                <span className={`text-[13px] font-medium w-[140px] text-right capitalize ${order.paymentStatus === "paid" ? "text-green-600" : "text-orange-600"}`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.paymentMethod && (
                <div className="flex justify-end gap-6">
                  <span className="text-[13px] text-[#757575]">Method:</span>
                  <span className="text-[13px] text-[#1A1A1A] font-medium w-[140px] text-right capitalize">{order.paymentMethod}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-[#E8E4DE] pt-5 mb-8">
          <p className="text-[11px] font-semibold text-[#757575] uppercase tracking-widest mb-2">
            If this product is not delivered, please return to:
          </p>
          <p className="text-[13px] font-semibold text-[#1A1A1A]">Zayelle</p>
          <p className="text-[13px] text-[#1A1A1A] mt-0.5">Thoppumpady Post Office, Kochi, Kerala – 682005</p>
          <p className="text-[13px] text-[#1A1A1A] mt-0.5">Contact at 8891485648</p>
          <p className="text-[13px] text-[#1A1A1A] mt-0.5">Email at zayelle.in@gmail.com</p>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-[#5C4B3D]">
              <th className="text-left text-[11px] font-semibold text-[#5C4B3D] uppercase tracking-widest py-3 pr-4">#</th>
              <th className="text-left text-[11px] font-semibold text-[#5C4B3D] uppercase tracking-widest py-3 pr-4">Product</th>
              <th className="text-center text-[11px] font-semibold text-[#5C4B3D] uppercase tracking-widest py-3 px-4">Qty</th>
              <th className="text-right text-[11px] font-semibold text-[#5C4B3D] uppercase tracking-widest py-3 px-4">Unit Price</th>
              <th className="text-right text-[11px] font-semibold text-[#5C4B3D] uppercase tracking-widest py-3 pl-4">Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => {
              const cs = parseColorSelections(item.colorSelections);
              const sc = parseSelectedColor(item.selectedColor);
              return (
              <tr key={item.id} className="border-b border-[#E8E4DE] align-top">
                <td className="py-4 pr-4 text-[13px] text-[#757575]">{index + 1}</td>
                <td className="py-4 pr-4">
                  <p className="text-[14px] font-medium text-[#1A1A1A]">{item.productName}</p>
                  {item.bundleType && (
                    <p className="text-[12px] text-[#5C4B3D] mt-1 font-semibold">{item.bundleType}</p>
                  )}
                  {cs && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {cs.map((c, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-[11px] text-[#1A1A1A] bg-[#F5F2ED] border border-[#E8E4DE] rounded-full px-2 py-0.5">
                          <span className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                          <span className="font-semibold">{c.quantity}×</span> {c.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {sc && !cs && (
                    <p className="text-[12px] text-[#1A1A1A] mt-1 inline-flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: sc.hex }} />
                      Color: <span className="font-semibold">{sc.name}</span>
                    </p>
                  )}
                  {item.selectedSize && (
                    <p className="text-[12px] text-[#1A1A1A] mt-1">Size: <span className="font-semibold">{item.selectedSize}</span></p>
                  )}
                </td>
                <td className="py-4 px-4 text-center text-[14px] text-[#1A1A1A]">{item.quantity}</td>
                <td className="py-4 px-4 text-right text-[14px] text-[#1A1A1A]">{formatCurrency(Number(item.price))}</td>
                <td className="py-4 pl-4 text-right text-[14px] font-medium text-[#1A1A1A]">
                  {formatCurrency(Number(item.price) * item.quantity)}
                </td>
              </tr>
            );})}
          </tbody>
        </table>

        <div className="flex justify-end mb-10">
          <div className="w-[300px]">
            <div className="flex justify-between py-2">
              <span className="text-[13px] text-[#757575]">Subtotal</span>
              <span className="text-[14px] text-[#1A1A1A]">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-[13px] text-[#757575]">
                  Discount {order.couponCode && <span className="text-[11px]">({order.couponCode})</span>}
                </span>
                <span className="text-[14px] text-green-600">-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-[13px] text-[#757575]">Shipping</span>
              <span className="text-[14px] text-[#1A1A1A]">Free</span>
            </div>
            <div className="border-t-2 border-[#5C4B3D] mt-2 pt-3 flex justify-between">
              <span className="text-[15px] font-bold text-[#1A1A1A] uppercase">Total</span>
              <span className="text-[18px] font-bold text-[#5C4B3D]">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E8E4DE] pt-6 mt-4">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-[11px] font-semibold text-[#757575] uppercase tracking-widest mb-2">Notes</h3>
              <p className="text-[12px] text-[#757575] leading-relaxed">
                Thank you for shopping with Zayelle. We hope you love your purchase!
                For any queries, please contact us at zayelle.in@gmail.com
              </p>
            </div>
            <div className="text-right">
              <h3 className="text-[11px] font-semibold text-[#757575] uppercase tracking-widest mb-2">Shipping Address</h3>
              <p className="text-[12px] text-[#555] leading-relaxed">
                {order.shippingAddress || "Same as billing address"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center border-t border-[#E8E4DE] pt-6">
          <p className="text-[11px] text-[#757575] uppercase tracking-widest">
            Zayelle — Premium Hijabs & Modest Accessories
          </p>
          <p className="text-[11px] text-[#999] mt-1">www.zayelle.in</p>
        </div>
      </div>
    </div>
  );
}

export default function InvoicePage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/admin/orders/${params.id}`);
        if (!res.ok) throw new Error("Order not found");
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 size={24} className="animate-spin text-[#5C4B3D]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
        <p className="text-[14px] text-red-500">{error || "Order not found"}</p>
        <Link href="/letsgetsuccessin2026/orders" className="text-[13px] text-[#5C4B3D] hover:underline flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-[800px] mx-auto">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href="/letsgetsuccessin2026/orders" className="text-[13px] text-[#757575] hover:text-[#1A1A1A] flex items-center gap-1 transition-colors">
            <ArrowLeft size={14} /> Back to Orders
          </Link>
          <div className="flex gap-3">
            <a
              href={`/api/orders/${order?.orderId}/invoice`}
              download
              className="flex items-center gap-2 bg-white border border-[#E8E4DE] text-[#1A1A1A] px-5 py-2.5 rounded-sm text-[13px] font-medium hover:border-[#5C4B3D] transition-colors"
            >
              <Download size={14} />
              Download PDF
            </a>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-[#5C4B3D] text-white px-5 py-2.5 rounded-sm text-[13px] font-medium hover:bg-[#4A3C31] transition-colors"
            >
              <Printer size={14} />
              Print Invoice
            </button>
          </div>
        </div>

        <div className="border border-[#E8E4DE] rounded-[12px] overflow-hidden shadow-sm print:border-none print:shadow-none print:rounded-none">
          <InvoiceContent order={order} />
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 18mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body * { visibility: hidden; }
          #invoice-content, #invoice-content * { visibility: visible; }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            font-size: 13px !important;
          }
          #invoice-content * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          nav, header, aside, .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
