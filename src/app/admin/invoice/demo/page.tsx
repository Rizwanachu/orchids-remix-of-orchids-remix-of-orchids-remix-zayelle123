"use client";

import React from "react";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

const demoOrder = {
  id: 1,
  orderId: "ZAY-10042",
  customerName: "Ayesha Khan",
  customerEmail: "ayesha.khan@gmail.com",
  customerPhone: "+91 98765 43210",
  shippingAddress: "Flat 302, Rose Apartments, MG Road, Bandra West, Mumbai 400050, Maharashtra",
  totalAmount: "3847.00",
  paymentStatus: "paid",
  orderStatus: "confirmed",
  paymentMethod: "UPI",
  couponCode: "WELCOME10",
  discountAmount: "450.00",
  createdAt: new Date().toISOString(),
  items: [
    { id: 1, productName: "The Noor Premium Chiffon Hijab — Dusty Rose", productHandle: "noor-chiffon-dusty-rose", quantity: 2, price: "1299.00", image: "" },
    { id: 2, productName: "Satin Silk Classic Hijab — Champagne Gold", productHandle: "satin-silk-champagne", quantity: 1, price: "1499.00", image: "" },
    { id: 3, productName: "Magnetic Hijab Pin Set — Rose Gold (6pcs)", productHandle: "magnetic-pin-set-rosegold", quantity: 1, price: "499.00", image: "" },
  ],
};

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

export default function InvoiceDemoPage() {
  const order = demoOrder;
  const subtotal = order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const discount = order.discountAmount ? Number(order.discountAmount) : 0;
  const total = Number(order.totalAmount);
  const invoiceDate = formatDate(order.createdAt);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-[800px] mx-auto">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link href="/admin/orders" className="text-[13px] text-[#757575] hover:text-[#1A1A1A] flex items-center gap-1 transition-colors">
            <ArrowLeft size={14} /> Back to Orders
          </Link>
          <div className="flex gap-3">
            <span className="flex items-center px-3 py-1.5 bg-amber-50 border border-amber-200 rounded text-[12px] text-amber-700 font-medium">
              Demo Invoice
            </span>
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

              <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                  <h3 className="text-[11px] font-semibold text-[#757575] uppercase tracking-widest mb-3">Bill To</h3>
                  <p className="text-[15px] font-semibold text-[#1A1A1A]">{order.customerName}</p>
                  <p className="text-[13px] text-[#555] mt-1">{order.customerEmail}</p>
                  <p className="text-[13px] text-[#555] mt-0.5">{order.customerPhone}</p>
                  <p className="text-[13px] text-[#555] mt-2 leading-relaxed max-w-[280px]">{order.shippingAddress}</p>
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
                      <span className="text-[13px] font-medium w-[140px] text-right capitalize text-green-600">
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-end gap-6">
                      <span className="text-[13px] text-[#757575]">Method:</span>
                      <span className="text-[13px] text-[#1A1A1A] font-medium w-[140px] text-right capitalize">{order.paymentMethod}</span>
                    </div>
                    <div className="flex justify-end gap-6">
                      <span className="text-[13px] text-[#757575]">Status:</span>
                      <span className="text-[13px] text-blue-600 font-medium w-[140px] text-right capitalize">{order.orderStatus}</span>
                    </div>
                  </div>
                </div>
              </div>

              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2 border-[#5C4B3D]">
                    <th className="text-left text-[11px] font-semibold text-[#5C4B3D] uppercase tracking-widest py-3 pr-4 w-[40px]">#</th>
                    <th className="text-left text-[11px] font-semibold text-[#5C4B3D] uppercase tracking-widest py-3 pr-4">Product</th>
                    <th className="text-center text-[11px] font-semibold text-[#5C4B3D] uppercase tracking-widest py-3 px-4 w-[60px]">Qty</th>
                    <th className="text-right text-[11px] font-semibold text-[#5C4B3D] uppercase tracking-widest py-3 px-4 w-[120px]">Unit Price</th>
                    <th className="text-right text-[11px] font-semibold text-[#5C4B3D] uppercase tracking-widest py-3 pl-4 w-[120px]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={item.id} className="border-b border-[#E8E4DE]">
                      <td className="py-4 pr-4 text-[13px] text-[#757575]">{index + 1}</td>
                      <td className="py-4 pr-4">
                        <p className="text-[14px] font-medium text-[#1A1A1A]">{item.productName}</p>
                      </td>
                      <td className="py-4 px-4 text-center text-[14px] text-[#1A1A1A]">{item.quantity}</td>
                      <td className="py-4 px-4 text-right text-[14px] text-[#1A1A1A]">{formatCurrency(Number(item.price))}</td>
                      <td className="py-4 pl-4 text-right text-[14px] font-medium text-[#1A1A1A]">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </td>
                    </tr>
                  ))}
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
                        Discount <span className="text-[11px]">({order.couponCode})</span>
                      </span>
                      <span className="text-[14px] text-green-600">-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-[13px] text-[#757575]">Shipping</span>
                    <span className="text-[14px] text-green-600">Free</span>
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
                      For any queries, please contact us at support@zayelle.in
                    </p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-[11px] font-semibold text-[#757575] uppercase tracking-widest mb-2">Shipping Address</h3>
                    <p className="text-[12px] text-[#555] leading-relaxed">
                      {order.shippingAddress}
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
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-content, #invoice-content * { visibility: visible; }
          #invoice-content { position: absolute; left: 0; top: 0; width: 100%; }
          nav, header, aside, .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
