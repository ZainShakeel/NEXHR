"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Building2, BarChart3, CreditCard, Settings,
  LogOut, ChevronRight, Menu, Shield, Globe, Receipt, Package
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
    <aside
      className={`h-screen bg-white border-r border-[#E5EDE9] flex flex-col transition-all duration-300 flex-shrink-0 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center border-b border-[#E5EDE9] h-16 ${collapsed ? "justify-center px-0" : "px-5 gap-3"}`}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-xl bg-[#16A34A] flex items-center justify-center">
            <span className="text-white font-black text-sm">N</span>
          </div>
        ) : (
          <>
            <div className="w-8 h-8 rounded-xl bg-[#16A34A] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-sm">N</span>
            </div>
            <div>
              <p className="text-[#0D1F15] font-bold text-sm leading-tight">NexHR</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Shield size={9} className="text-[#16A34A]" />
                <span className="text-[9px] text-[#16A34A] font-bold uppercase tracking-widest">Super Admin</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/super-admin/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-[#F0F9F3] text-[#16A34A]"
                  : "text-[#6B8C7A] hover:bg-[#F5F9F7] hover:text-[#0D1F15]"
              }`}
            >
              <item.icon size={16} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {active && <ChevronRight size={12} className="opacity-50" />}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[#E5EDE9] p-2">
        <button
          onClick={logout}
          title={collapsed ? "Logout" : undefined}
          className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-sm font-medium text-[#6B8C7A] hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/super-admin/login";
  const [collapsed, setCollapsed] = useState(false);

  if (isLogin) return <>{children}</>;

  const currentNav = NAV.find((n) => pathname === n.href || (n.href !== "/super-admin/dashboard" && pathname.startsWith(n.href)));

  return (
    <div className="flex h-screen bg-[#F4F8F6] overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-[#E5EDE9] flex items-center px-5 gap-4 flex-shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-[#6B8C7A] hover:text-[#0D1F15] transition-colors"
          >
            <Menu size={18} />
          </button>
          <div className="flex-1">
            <span className="text-sm font-semibold text-[#0D1F15]">
              {currentNav?.label ?? "Super Admin"}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-[#F4F8F6] border border-[#E5EDE9] rounded-full px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-[#16A34A] flex items-center justify-center">
              <span className="text-white text-[9px] font-bold">SA</span>
            </div>
            <span className="text-xs text-[#6B8C7A] font-medium">Super Admin</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
