"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Building2, BarChart3, CreditCard, Settings,
  LogOut, Menu, Shield, Globe, Receipt, Package, ChevronRight, X,
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
      {!collapsed && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onToggle} />
      )}

      <aside
        className={`h-screen flex flex-col transition-all duration-300 flex-shrink-0 relative z-30 bg-white ${
          collapsed ? "w-[70px]" : "w-[240px]"
        }`}
        style={{ borderRight: "1px solid #E2E8F0", boxShadow: "2px 0 8px rgba(0,0,0,0.04)" }}
      >
        {/* Logo */}
        <div
          className={`flex items-center h-14 border-b flex-shrink-0 ${
            collapsed ? "justify-center px-0" : "px-5 gap-3"
          }`}
          style={{ borderColor: "#E2E8F0" }}
        >
          {collapsed ? (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#07845A" }}>
              <span className="text-white font-black text-sm">N</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full">
              <div className="relative w-[100px] h-[30px] flex-shrink-0">
                <Image src="/nexhr-logo.png" alt="NexHR" fill className="object-contain object-left" priority />
              </div>
              <div className="ml-auto">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#E3F6EB", color: "#07845A" }}>
                  Super Admin
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href ||
              (item.href !== "/super-admin/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active ? "text-[#07845A]" : "text-[#64748B] hover:text-[#172B24] hover:bg-[#F8FAFC]"
                }`}
                style={active ? { background: "#E3F6EB" } : {}}
              >
                <item.icon size={16} className="flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{item.label}</span>
                    {active && <ChevronRight size={11} style={{ color: "#07845A" }} />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t flex-shrink-0" style={{ borderColor: "#E2E8F0" }}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-1"
              style={{ background: "#F5F8F6" }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "#07845A" }}>
                <Shield size={12} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#172B24] truncate">Super Admin</p>
                <p className="text-[10px] text-[#94A3B8] truncate">Platform Owner</p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            title={collapsed ? "Logout" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#94A3B8] hover:bg-red-50 hover:text-red-500 transition-all"
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

  const currentNav = NAV.find((n) =>
    pathname === n.href || (n.href !== "/super-admin/dashboard" && pathname.startsWith(n.href))
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F5F8F6" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="h-14 flex items-center px-5 gap-4 flex-shrink-0 bg-white"
          style={{ borderBottom: "1px solid #E2E8F0" }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[#94A3B8] hover:text-[#172B24] transition-colors p-1.5 rounded-lg hover:bg-[#F5F8F6]"
          >
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>

          <div className="flex items-center gap-2 flex-1">
            <span className="text-xs text-[#94A3B8] font-medium">Super Admin</span>
            <ChevronRight size={12} className="text-[#CBD5E1]" />
            <span className="text-sm font-bold text-[#172B24]">
              {currentNav?.label ?? "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "#E3F6EB", border: "1px solid #C6EFDA" }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "#07845A" }}>
              <Shield size={11} className="text-white" />
            </div>
            <span className="text-xs font-semibold" style={{ color: "#07845A" }}>Super Admin</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
