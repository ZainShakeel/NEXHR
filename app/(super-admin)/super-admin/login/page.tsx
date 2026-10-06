"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Shield, Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function SuperAdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid credentials.");
      } else {
        router.push("/super-admin/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#011a0f] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#16A34A]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#064E3B]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/nexhr-logo.png" alt="NexHR" width={110} height={38} className="object-contain brightness-0 invert opacity-90 mx-auto mb-4" />
          <div className="inline-flex items-center gap-2 bg-[#16A34A]/15 border border-[#16A34A]/30 rounded-full px-4 py-1.5">
            <Shield size={12} className="text-[#4ade80]" />
            <span className="text-xs font-bold text-[#4ade80] uppercase tracking-widest">Super Admin Access</span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7">
          <h1 className="text-xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-[#4a7a5e] mb-6">Sign in to your NexHR control panel</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#7aad8f] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a7a5e]" />
                <input
                  type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-white/8 border border-white/12 text-white placeholder-[#4a7a5e] text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#16A34A] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7aad8f] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a7a5e]" />
                <input
                  type={showPass ? "text" : "password"} required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/8 border border-white/12 text-white placeholder-[#4a7a5e] text-sm rounded-xl pl-9 pr-10 py-2.5 focus:outline-none focus:border-[#16A34A] transition-colors"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a7a5e] hover:text-white transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-[#16A34A] text-white font-semibold rounded-xl hover:bg-[#22c55e] transition-colors disabled:opacity-50 text-sm mt-2"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#2d5040] mt-5">
          This panel is restricted to NexHR staff only.
        </p>
      </div>
    </div>
  );
}
