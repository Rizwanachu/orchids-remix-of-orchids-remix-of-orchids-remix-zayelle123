"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { User, Package, Heart, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function AccountPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/account/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
          <p className="text-[14px] text-[#757575]">Loading...</p>
        </main>
        <Footer />
      </>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6]">
        <div className="bg-[#F5F2ED] py-10 md:py-14">
          <div className="container px-4 md:px-8">
            <h1 className="text-[32px] md:text-[40px] font-serif text-[#1A1A1A] tracking-tight">
              My Account
            </h1>
            <p className="mt-2 text-[14px] text-[#757575]">Welcome back, {user.name}</p>
          </div>
        </div>

        <div className="container px-4 md:px-8 py-12 md:py-16 max-w-[900px] mx-auto">
          <div className="bg-white border border-[#E8E4DE] rounded-[12px] p-6 md:p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#F5F2ED] flex items-center justify-center">
                <User size={28} className="text-[#5C4B3D]" />
              </div>
              <div>
                <h2 className="text-[18px] font-semibold text-[#1A1A1A]">{user.name}</h2>
                <p className="text-[14px] text-[#757575]">{user.email}</p>
                {user.isAdmin && (
                  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-[#5C4B3D] text-white text-[11px] uppercase tracking-wider rounded-full">
                    <Shield size={10} /> Admin
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#757575] uppercase tracking-wider mb-1">Full Name</label>
                <p className="text-[15px] text-[#1A1A1A]">{user.name}</p>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#757575] uppercase tracking-wider mb-1">Email</label>
                <p className="text-[15px] text-[#1A1A1A]">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.isAdmin && (
              <a
                href="/admin"
                className="flex items-center gap-4 p-5 bg-[#5C4B3D] border border-[#5C4B3D] rounded-[12px] hover:bg-[#4A3C31] transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Shield size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white">Admin Panel</p>
                  <p className="text-[12px] text-white/70">Manage products</p>
                </div>
              </a>
            )}
            <a
              href="/account/orders"
              className="flex items-center gap-4 p-5 bg-white border border-[#E8E4DE] rounded-[12px] hover:border-[#5C4B3D] hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-[#F5F2ED] flex items-center justify-center flex-shrink-0">
                <Package size={18} className="text-[#5C4B3D]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#1A1A1A]">My Orders</p>
                <p className="text-[12px] text-[#757575]">View order history</p>
              </div>
            </a>
            <a
              href="/wishlist"
              className="flex items-center gap-4 p-5 bg-white border border-[#E8E4DE] rounded-[12px] hover:border-[#5C4B3D] hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-[#F5F2ED] flex items-center justify-center flex-shrink-0">
                <Heart size={18} className="text-[#5C4B3D]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#1A1A1A]">Wishlist</p>
                <p className="text-[12px] text-[#757575]">Your saved items</p>
              </div>
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 p-5 bg-white border border-[#E8E4DE] rounded-[12px] hover:border-red-300 hover:shadow-sm transition-all text-left"
            >
              <div className="w-10 h-10 rounded-full bg-[#F5F2ED] flex items-center justify-center flex-shrink-0">
                <LogOut size={18} className="text-[#5C4B3D]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#1A1A1A]">Sign Out</p>
                <p className="text-[12px] text-[#757575]">Log out of your account</p>
              </div>
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
