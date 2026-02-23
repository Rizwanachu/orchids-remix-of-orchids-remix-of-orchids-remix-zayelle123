"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Password reset failed");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6] flex items-center justify-center py-12">
        <div className="w-full max-w-[440px] mx-4">
          <div className="text-center mb-8">
            <h1 className="text-[32px] font-serif text-[#1A1A1A] mb-2">
              Reset Password
            </h1>
            <p className="text-[14px] text-[#757575]">
              Verify your identity to set a new password
            </p>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-sm text-[14px] text-green-700">
                Your password has been reset successfully.
              </div>
              <button
                onClick={() => router.push("/account/login")}
                className="w-full bg-[#5C4B3D] text-white py-3.5 rounded-sm font-medium text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors"
              >
                Sign In
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-[13px] text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#1A1A1A] uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[44px] px-4 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1A1A1A] uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-[44px] px-4 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white"
                    placeholder="Phone number linked to your account"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1A1A1A] uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-[44px] px-4 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white"
                    placeholder="At least 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1A1A1A] uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-[44px] px-4 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white"
                    placeholder="Re-enter your new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#5C4B3D] text-white py-3.5 rounded-sm font-medium text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors disabled:opacity-50"
                >
                  {submitting ? "Please wait..." : "Reset Password"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-[14px] text-[#757575]">
                  Remember your password?{" "}
                  <a
                    href="/account/login"
                    className="text-[#5C4B3D] font-medium hover:underline underline-offset-4"
                  >
                    Sign in
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
