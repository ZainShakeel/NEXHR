"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Leaf, Eye, EyeOff, Building2, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    domain: "",
    email: "",
    password: "",
    remember: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email:    form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.ok) {
      window.location.href = "/dashboard";
    } else {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[52%] bg-[#064E3B] flex-col relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#16A34A]/20 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full" />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#16A34A] rounded-xl flex items-center justify-center">
              <Leaf size={20} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-xl tracking-tight">NexHR</span>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Smarter People.<br />
              <span className="text-[#22c55e]">Stronger Business.</span>
            </h1>
            <p className="text-[#A7C5B9] text-base leading-relaxed mb-10">
              A complete HR management platform built for modern companies. Manage your entire workforce from one place.
            </p>

            {/* Feature list */}
            <div className="space-y-4">
              {[
                { icon: "👥", label: "Employee lifecycle management" },
                { icon: "📍", label: "GPS geofencing attendance" },
                { icon: "💰", label: "Payroll & salary slips" },
                { icon: "📊", label: "Real-time HR analytics" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-base">
                    {f.icon}
                  </div>
                  <span className="text-[#A7C5B9] text-sm">{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-6 pt-6 border-t border-white/10">
            <span className="text-white/30 text-xs">Web App</span>
            <span className="text-white/30 text-xs">Mobile App</span>
            <span className="text-white/30 text-xs">Multi-Company</span>
            <span className="text-white/30 text-xs">Cloud Ready</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F7F9F8]">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-[#064E3B] rounded-xl flex items-center justify-center">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="text-[#17211C] font-bold text-xl">NexHR</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#17211C] tracking-tight">Welcome back</h2>
            <p className="text-[#4A5E55] text-sm mt-1.5">Sign in to your NexHR account</p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Domain */}
            <div>
              <label className="block text-xs font-semibold text-[#4A5E55] uppercase tracking-wide mb-1.5">
                Company Domain
              </label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8AA398]" />
                <input
                  type="text"
                  placeholder="abc"
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value })}
                  className="w-full pl-10 pr-16 py-2.5 bg-white border border-[#E5EAE7] rounded-xl text-sm text-[#17211C] placeholder:text-[#8AA398] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/12 transition-all"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8AA398] text-xs font-mono">
                  .nexhr.com
                </span>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#4A5E55] uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8AA398]" />
                <input
                  type="email"
                  placeholder="sarah@abc.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5EAE7] rounded-xl text-sm text-[#17211C] placeholder:text-[#8AA398] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/12 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#4A5E55] uppercase tracking-wide">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-[#16A34A] hover:text-[#064E3B] font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8AA398]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E5EAE7] rounded-xl text-sm text-[#17211C] placeholder:text-[#8AA398] focus:outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/12 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8AA398] hover:text-[#4A5E55] transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="remember"
                checked={form.remember}
                onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                className="w-4 h-4 rounded border-[#C8D5CF] accent-[#16A34A] cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-[#4A5E55] cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#16A34A] hover:bg-[#064E3B] disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-sm mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Contact admin */}
          <p className="text-center text-xs text-[#8AA398] mt-6">
            Don&apos;t have an account?{" "}
            <span className="text-[#4A5E55] font-medium">Contact your administrator</span>
          </p>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-[#E5EAE7]">
            <div className="w-4 h-4 text-[#16A34A]">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
            </div>
            <span className="text-[#8AA398] text-xs">Secure & Encrypted</span>
          </div>

          <p className="text-center text-[10px] text-[#8AA398] mt-4">
            v1.0.0 · NexHR © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
