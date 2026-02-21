"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { login, signup } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      const result = login(email, password);
      if (result.success) {
        router.push("/account");
      } else {
        setError(result.error || "Login failed");
      }
    } else {
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }
      const result = signup(name, email, password);
      if (result.success) {
        router.push("/account");
      } else {
        setError(result.error || "Signup failed");
      }
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#FAF9F6] flex items-center justify-center py-12">
        <div className="w-full max-w-[440px] mx-4">
          <div className="text-center mb-8">
            <h1 className="text-[32px] font-serif text-[#1A1A1A] mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-[14px] text-[#757575]">
              {isLogin ? "Sign in to your Zayelle account" : "Join the Zayelle community"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-[13px] text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-[13px] font-medium text-[#1A1A1A] uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-[44px] px-4 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white"
                  placeholder="Your full name"
                />
              </div>
            )}
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
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[44px] px-4 border border-[#E8E4DE] rounded-sm text-[14px] focus:outline-none focus:border-[#5C4B3D] transition-colors bg-white"
                placeholder="Enter your password"
              />
            </div>

            {isLogin && (
              <div className="text-right">
                <a href="#" className="text-[13px] text-[#5C4B3D] hover:underline underline-offset-4">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#5C4B3D] text-white py-3.5 rounded-sm font-medium text-[13px] uppercase tracking-wider hover:bg-[#4A3C31] transition-colors"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[14px] text-[#757575]">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
                className="text-[#5C4B3D] font-medium hover:underline underline-offset-4"
              >
                {isLogin ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
