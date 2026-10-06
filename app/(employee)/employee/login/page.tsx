"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail, Globe } from "lucide-react";

export default function EmployeeLogin() {
  const router = useRouter();
  const [domain, setDomain] = useState("abc");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    if (email && password && domain) {
      router.push("/employee/dashboard");
    } else {
      setError("Please fill in all fields.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#064E3B] via-[#065F46] to-[#047857] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-white/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-60 h-60 bg-white/3 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-7">
          <Image src="/nexhr-logo.png" alt="NexHR" width={110} height={38} className="object-contain brightness-0 invert opacity-90 mx-auto mb-3" />
          <p className="text-[#86efac] text-xs font-semibold">Employee Self-Service Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-7">
          <h1 className="text-lg font-bold text-[#17211C] mb-0.5">Employee Login</h1>
          <p className="text-xs text-[#8AA398] mb-5">Access your attendance, leaves & payslips</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Company Domain</label>
              <div className="relative flex items-center border border-[#E5EAE7] rounded-xl focus-within:border-[#16A34A] overflow-hidden">
                <Globe size={14} className="absolute left-3 text-[#8AA398]" />
                <input type="text" value={domain} onChange={(e) => setDomain(e.target.value.toLowerCase())}
                  className="flex-1 pl-9 pr-2 py-2.5 text-sm focus:outline-none" placeholder="abc" />
                <span className="px-3 py-2.5 text-xs text-[#8AA398] bg-[#F7F9F8] border-l border-[#E5EAE7]">.nexhr.app</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Work Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8AA398]" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4A5E55] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8AA398]" />
                <input type={showPass ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-[#E5EAE7] rounded-xl focus:outline-none focus:border-[#16A34A]" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8AA398] hover:text-[#17211C]">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#16A34A] text-white font-semibold rounded-xl hover:bg-[#15803d] transition-colors disabled:opacity-50 text-sm">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-5 bg-[#F7F9F8] rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold text-[#8AA398] uppercase tracking-wide mb-1">Demo</p>
            <p className="text-xs text-[#4A5E55] font-mono">Domain: abc · any email + password</p>
          </div>
          <p className="text-center text-xs text-[#8AA398] mt-4">
            HR/Admin? <a href="/login" className="text-[#16A34A] font-semibold hover:underline">Company Login →</a>
          </p>
        </div>
      </div>
    </div>
  );
}
