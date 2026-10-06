"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, Users, CreditCard,
  BarChart3, Settings, LogOut, Shield, ChevronRight,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",    href: "/super-admin/dashboard",  icon: LayoutDashboard },
  { label: "Companies",    href: "/super-admin/companies",  icon: Building2 },
  { label: "Plans",        href: "/super-admin/plans",      icon: CreditCard },
  { label: "Analytics",    href: "/super-admin/analytics",  icon: BarChart3 },
  { label: "Settings",     href: "/super-admin/settings",   icon: Settings },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#011a0f] flex flex-col z-40 border-r border-white/8">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/8">
        <div className="flex items-center gap-2.5 mb-1">
          <Image src="/nexhr-logo.png" alt="NexHR" width={90} height={30} className="object-contain brightness-0 invert opacity-90" />
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <Shield size={11} className="text-[#4ade80]" />
          <span className="text-[10px] font-bold text-[#4ade80] uppercase tracking-widest">Super Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? "bg-[#16A34A] text-white shadow-lg shadow-[#16A34A]/25"
                  : "text-[#7aad8f] hover:bg-white/8 hover:text-white"
              }`}
            >
              <item.icon size={16} className={active ? "text-white" : "text-[#4a7a5e] group-hover:text-white transition-colors"} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={13} className="text-white/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/8">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
          <div className="w-8 h-8 bg-[#16A34A] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            SA
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">Super Admin</p>
            <p className="text-[10px] text-[#4a7a5e] truncate">admin@nexhr.com</p>
          </div>
        </div>
        <Link href="/super-admin/login" className="flex items-center gap-2.5 px-3 py-2 text-[#7aad8f] hover:text-white hover:bg-white/8 rounded-xl text-sm transition-all">
          <LogOut size={15} />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
