"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Building2, BarChart3, CreditCard, Settings,
  LogOut, Menu, Shield, Globe, Receipt, Package, ChevronRight, X
} from "lucide-react";

const NAV = [
  { label: "Dashboard",             href: "/super-admin/dashboard",     icon: LayoutDashboard },
  { label: "Companies",             href: "/super-admin/companies",      icon: Building2 },
  { label: "Subscriptions",         href: "/super-admin/subscriptions",  icon: Receipt },
  { label: "Packages",              href: "/super-admin/packages",       icon: Package },
  { label: "Domain",                href: "/super-admin/domain",         icon: Globe },
  { label: "Purchase Transactions", href: "/super-admin/transactions",   icon: CreditCard },
  { label: "Analytics",             href: "/super-admin/analytics",      icon: BarChart3 },
  { label: "Settings",              href: "/super-admin/settings",       icon: Settings },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/super-admin/auth", { method: "DELETE" });
    router.push("/super-admin/login");
  };

  return (
    <>
      {/* Overlay for mobile */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        style={{
          background: "linear-gradient(180deg, #0A2A1A 0%, #0D3520 40%, #0A2A1A 100%)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.35)",
        }}
        className={`h-screen flex flex-col transition-all duration-300 flex-shrink-0 relative z-30 ${
          collapsed ? "w-[70px]" : "w-[240px]"
        }`}
      >
        {/* Logo area */}
        <div
          className={`flex items-center h-[70px] border-b flex-shrink-0 ${
            collapsed ? "justify-center px-0" : "px-5 gap-3"
          }`}
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          {collapsed ? (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #16A34A, #22c55e)" }}
            >
              <span className="text-white font-black text-base">N</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full">
              <div className="relative w-[110px] h-[34px] flex-shrink-0">
                <Image
                  src="/nexhr-logo.png"
                  alt="NexHR"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
              <div className="ml-auto">
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(22,163,74,0.18)", border: "1px solid rgba(22,163,74,0.35)" }}
                >
                  <Shield size={8} className="text-green-400" />
                  <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest">SA</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-0.5">
          {NAV.map((item, idx) => {
            const active = pathname === item.href || (item.href !== "/super-admin/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                style={{
                  animationDelay: `${idx * 40}ms`,
                  background: active
                    ? "linear-gradient(90deg, rgba(22,163,74,0.22) 0%, rgba(22,163,74,0.08) 100%)"
                    : "transparent",
                  borderLeft: active ? "3px solid #22c55e" : "3px solid transparent",
                }}
                className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group animate-fadeSlideIn ${
                  active
                    ? "text-green-400"
                    : "text-white/55 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon size={16} className="flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {active && <ChevronRight size={11} className="opacity-60" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-2.5 border-t flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          {!collapsed && (
            <div
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl mb-1"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #16A34A, #22c55e)" }}
              >
                <span className="text-white text-[9px] font-black">SA</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">Super Admin</p>
                <p className="text-[10px] text-white/40 truncate">Platform Owner</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            title={collapsed ? "Logout" : undefined}
            className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:bg-red-500/15 hover:text-red-400 transition-all"
          >
            <LogOut size={15} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/super-admin/login";
  const [collapsed, setCollapsed] = useState(false);

  if (isLogin) return <>{children}</>;

  const currentNav = NAV.find((n) => pathname === n.href || (n.href !== "/super-admin/dashboard" && pathname.startsWith(n.href)));

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F0F4F2" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="h-[70px] flex items-center px-5 gap-4 flex-shrink-0"
          style={{
            background: "white",
            borderBottom: "1px solid #E2ECE7",
            boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
          }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[#5A7A68] hover:text-[#0D1F15] transition-colors p-1.5 rounded-lg hover:bg-[#F0F4F2]"
          >
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs text-[#9BB8A8] font-medium">Super Admin</span>
            <ChevronRight size={12} className="text-[#C5D9CE]" />
            <span className="text-sm font-bold text-[#0D1F15]">
              {currentNav?.label ?? "Dashboard"}
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: "linear-gradient(135deg, #0A2A1A, #0D3520)",
                boxShadow: "0 2px 8px rgba(10,42,26,0.25)",
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #16A34A, #22c55e)" }}
              >
                <span className="text-white text-[9px] font-black">SA</span>
              </div>
              <span className="text-xs text-white/80 font-medium">Super Admin</span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <style jsx global>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-fadeSlideIn { animation: fadeSlideIn 0.3s ease both; }
        .animate-fadeUp { animation: fadeUp 0.4s ease both; }
        .animate-scaleIn { animation: scaleIn 0.35s ease both; }
      `}</style>
    </div>
  );
}
